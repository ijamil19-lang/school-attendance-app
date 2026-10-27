#!/usr/bin/env node
// SchoolFlow static release smoke checks. Run: node tests/release-smoke.mjs
// Requires Node 18+; no dependencies, network calls or real student data.
import {readFileSync} from 'node:fs';
import {strict as assert} from 'node:assert';
const admin=readFileSync(new URL('../admin.html',import.meta.url),'utf8');
const platform=readFileSync(new URL('../platform.html',import.meta.url),'utf8');
const home=readFileSync(new URL('../index.html',import.meta.url),'utf8');
let checks=0;
function check(label,fn){fn();console.log('PASS '+label);checks++;}
check('School Settings appears first in grouped navigation',()=>{
  assert.match(admin,/const groups=\[\['Settings',\['settings'\]\]/);
});
check('All three report options are grouped',()=>{
  assert.match(admin,/\['Reports',\['reports','teacherclock','reportexams'\]\]/);
  for(const tab of ['reports','teacherclock','reportexams'])assert.ok(admin.includes('data-tab="'+tab+'"'));
});
check('Each reports tab maps to an existing panel',()=>{
  for(const id of ['reportsPanel','teacherclockPanel','financePanel'])assert.ok(admin.includes('id="'+id+'"'));
  assert.ok(admin.includes("reportExams=active==='reportexams'"));
});
check('Admin uses authenticated school membership and school-scoped queries',()=>{
  assert.ok(admin.includes("client.auth.getUser()"));
  assert.ok(admin.includes(".eq('user_id',user.id).eq('role','admin')"));
  assert.ok(admin.includes(".eq('school_id',schoolId)"));
});
check('No Supabase service-role or secret keys embedded in public HTML',()=>{
  for(const [name,source] of [['admin',admin],['platform',platform],['home',home]]){
    assert.doesNotMatch(source,/sb_secret_[A-Za-z0-9_-]+|SUPABASE_SERVICE_ROLE_KEY|service_role\s*[:=]\s*['\"]/i,name);
  }
});
check('Reports include school branding helpers and PDF capability',()=>{
  assert.ok(admin.includes('function reportSchoolName()'));
  assert.ok(admin.includes('async function reportPdfLogo(doc)'));
  assert.ok(admin.includes('async function downloadAttendancePdf()'));
});
console.log('Completed '+checks+' static smoke checks. These do not verify RLS, authorization, runtime behaviour or PDF output.');
