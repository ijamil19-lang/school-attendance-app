/* SchoolAssistant Realtime voice connection.
 * This first milestone verifies natural Urdu/English speech. It intentionally
 * has no access to student or school records yet.
 */
(() => {
  const $ = (id) => document.getElementById(id);
  const mic = $("schoolAssistantMic");
  const ask = $("schoolAssistantAsk");
  const stop = $("schoolAssistantStop");
  const input = $("schoolAssistantInput");
  const status = $("schoolAssistantStatus");
  const answer = $("schoolAssistantAnswer");
  if (!mic || !ask || !stop || !input || !status || !answer) return;

  let peer = null;
  let channel = null;
  let localStream = null;
  let audioElement = null;
  let connecting = false;
  let responseText = "";

  const setStatus = (message) => { status.textContent = message; };
  const showAnswer = (message) => {
    answer.textContent = message;
    answer.classList.remove("hidden");
  };

  function closeConnection() {
    if (channel) { try { channel.close(); } catch {} channel = null; }
    if (peer) { try { peer.close(); } catch {} peer = null; }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      localStream = null;
    }
    if (audioElement) {
      audioElement.srcObject = null;
      audioElement.remove();
      audioElement = null;
    }
    connecting = false;
    mic.disabled = false;
    ask.disabled = false;
    stop.disabled = true;
  }

  function handleRealtimeEvent(event) {
    if ((event.type === "response.output_audio_transcript.delta" || event.type === "response.audio_transcript.delta") && event.delta) {
      responseText += event.delta;
      showAnswer(responseText);
    } else if ((event.type === "response.output_audio_transcript.done" || event.type === "response.audio_transcript.done") && event.transcript) {
      responseText = event.transcript;
      showAnswer(responseText);
    } else if (event.type === "response.output_text.delta" && event.delta) {
      responseText += event.delta;
      showAnswer(responseText);
    } else if (event.type === "conversation.item.input_audio_transcription.completed" && event.transcript) {
      setStatus("آپ نے کہا: " + event.transcript);
    } else if (event.type === "response.done") {
      if (responseText.trim()) showAnswer(responseText.trim());
      responseText = "";
      setStatus("Connected · You can continue speaking naturally.");
    } else if (event.type === "error") {
      setStatus(event.error?.message || "Voice service reported an error.");
    }
  }

  async function connectVoice() {
    if (connecting || peer) return;
    connecting = true;
    mic.disabled = true;
    ask.disabled = true;
    setStatus("Connecting to SchoolAssistant…");
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
        throw new Error("Please use an up-to-date browser with microphone access (Chrome or Edge recommended).");
      }
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) throw new Error("Your session has expired. Please sign in again.");

      const tokenResponse = await fetch("https://ufddjrebwqfqaqppdgxj.supabase.co/functions/v1/schoolassistant-realtime-token", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + sessionData.session.access_token,
          "apikey": "sb_publishable_T5jKK_iqiCVr0lXBmciGQA_L83zO1ZG",
          "Content-Type": "application/json",
        },
        body: "{}",
      });
      const tokenBody = await tokenResponse.json().catch(() => ({}));
      if (!tokenResponse.ok) throw new Error(tokenBody.error || "Could not authenticate SchoolAssistant.");

      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      peer = new RTCPeerConnection();
      audioElement = document.createElement("audio");
      audioElement.autoplay = true;
      audioElement.style.display = "none";
      document.body.appendChild(audioElement);
      peer.ontrack = (event) => { audioElement.srcObject = event.streams[0]; };
      localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));

      channel = peer.createDataChannel("oai-events");
      channel.onopen = () => {
        setStatus("Connected · بات کریں، میں سن رہا ہوں۔");
        stop.disabled = false;
      };
      channel.onmessage = (message) => {
        try { handleRealtimeEvent(JSON.parse(message.data)); } catch {}
      };
      channel.onclose = () => {
        if (peer) setStatus("Voice connection closed.");
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      // Wait for ICE gathering so the SDP sent to OpenAI includes browser candidates.
      if (peer.iceGatheringState !== "complete") {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            peer.removeEventListener("icegatheringstatechange", onIceGatheringStateChange);
            reject(new Error("Timed out preparing the secure voice connection. Please try again."));
          }, 10000);
          function onIceGatheringStateChange() {
            if (peer.iceGatheringState !== "complete") return;
            clearTimeout(timeout);
            peer.removeEventListener("icegatheringstatechange", onIceGatheringStateChange);
            resolve();
          }
          peer.addEventListener("icegatheringstatechange", onIceGatheringStateChange);
          onIceGatheringStateChange();
        });
      }

      const completeOfferSdp = peer.localDescription?.sdp;
      if (!completeOfferSdp) throw new Error("Could not prepare the voice connection. Please try again.");
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: completeOfferSdp,
        headers: {
          "Authorization": "Bearer " + tokenBody.client_secret,
          "Content-Type": "application/sdp",
        },
      });
      if (!sdpResponse.ok) {
        const detail = await sdpResponse.text();
        throw new Error("OpenAI connection failed (" + sdpResponse.status + "). " + detail.slice(0, 220));
      }
      await peer.setRemoteDescription({ type: "answer", sdp: await sdpResponse.text() });
      connecting = false;
      mic.disabled = true;
      ask.disabled = false;
      stop.disabled = false;
    } catch (error) {
      closeConnection();
      setStatus(error?.message || "Could not start voice. Please try again.");
    }
  }

  function sendTextQuestion() {
    const question = input.value.trim();
    if (!question) { setStatus("Please type a question first."); return; }
    if (!channel || channel.readyState !== "open") {
      setStatus("Please start the microphone connection first.");
      return;
    }
    responseText = "";
    channel.send(JSON.stringify({
      type: "conversation.item.create",
      item: { type: "message", role: "user", content: [{ type: "input_text", text: question }] },
    }));
    channel.send(JSON.stringify({ type: "response.create" }));
    input.value = "";
    setStatus("SchoolAssistant is replying…");
  }

  mic.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    connectVoice();
  }, true);
  ask.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    sendTextQuestion();
  }, true);
  stop.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    closeConnection();
    setStatus("Voice stopped.");
  }, true);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      sendTextQuestion();
    }
  });
  stop.disabled = true;
  setStatus("Ready · Press “Speak Urdu” to start a natural voice conversation.");
  window.addEventListener("beforeunload", closeConnection);
})();
