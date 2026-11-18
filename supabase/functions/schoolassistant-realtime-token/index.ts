import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://schoolflow.skylightbusiness.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const origin = req.headers.get("Origin") ?? "";
    const allowedOrigins = new Set([
      "https://schoolflow.skylightbusiness.com",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
    ]);
    if (!allowedOrigins.has(origin)) return json({ error: "Origin not allowed" }, 403);

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return json({ error: "Please sign in again." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!supabaseUrl || !supabaseAnonKey || !openAiKey) {
      console.error("Required server configuration is missing.");
      return json({ error: "SchoolAssistant is not configured yet." }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return json({ error: "Your session is invalid. Please sign in again." }, 401);

    // Require an administrator membership. School identity is resolved on the server;
    // never accept a browser-supplied school_id.
    const { data: memberships, error: membershipError } = await supabase
      .from("school_members")
      .select("school_id, role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .limit(2);

    if (membershipError) {
      console.error("School membership lookup failed:", membershipError.message);
      return json({ error: "Could not verify your school administrator access." }, 403);
    }
    if (!memberships?.length) return json({ error: "School administrator access is required." }, 403);
    if (memberships.length > 1) return json({ error: "This account is linked to more than one school. Please contact support before using voice assistance." }, 403);

    const openAiResponse = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: "gpt-realtime-2.1",
          instructions: [
            "You are SchoolAssistant, a warm, professional assistant inside a school administration dashboard.",
            "Speak naturally and conversationally. Support Urdu, Roman Urdu, and English.",
            "Reply in the same language and style the user uses. If the user speaks Urdu, use clear, respectful Pakistani Urdu.",
            "Keep answers concise, friendly, and easy to understand. Ask a short follow-up question when the request is unclear.",
            "You are currently in a voice-connection test. You do not have access to school records or student data yet.",
            "Never claim to have checked attendance, fees, student records, or school data. Explain that live school-data access will be enabled after the voice test.",
            "Do not ask the user to share student personal data in this voice test.",
          ].join(" "),
          audio: {
            output: { voice: "marin" },
          },
        },
      }),
    });

    const openAiBody = await openAiResponse.json().catch(() => ({}));
    if (!openAiResponse.ok) {
      console.error("OpenAI Realtime client secret request failed:", openAiResponse.status, openAiBody?.error?.message ?? "Unknown error");
      return json({ error: "Could not start the voice service. Please try again shortly." }, 502);
    }

    const value = openAiBody?.value ?? openAiBody?.client_secret?.value;
    if (!value) {
      console.error("OpenAI Realtime response did not contain a client secret.");
      return json({ error: "Voice service returned an unexpected response." }, 502);
    }

    return json({ client_secret: value, expires_at: openAiBody?.expires_at ?? openAiBody?.client_secret?.expires_at ?? null });
  } catch (error) {
    console.error("SchoolAssistant token error:", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "Unable to start SchoolAssistant. Please try again." }, 500);
  }
});
