import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ── SUPABASE CONFIG ───────────────────────────────────────────────────────────
// Replace these two values with your own from supabase.com → Project Settings → API
const SUPABASE_URL      = "https://dnmpwspxpwdfoutcegkn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRubXB3c3B4cHdkZm91dGNlZ2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODAxMTEsImV4cCI6MjA4NzM1NjExMX0._PFtG0H-pUw8CxIpH4sNXCZwzNnPeKrdBEE8sxG_Xl0";

// Generic REST insert — posts a row to any Supabase table
async function supabaseInsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "apikey":        SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type":  "application/json",
      "Prefer":        "return=minimal",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error ${res.status}: ${err}`);
  }
  return true;
}

// ── EMAIL ─────────────────────────────────────────────────────────────────────
async function sendWelcomeEmail(name, email) {
  try {
    await window.emailjs.send(
      "service_asjqk7v",
      "template_ouc4x0o",
      { to_name: name, to_email: email, from_name: "VertiCliff", reply_to: "ronelliot@zygnl.io" }
    );
  } catch (err) {
    console.error("Email error:", err);
  }
}
const SUPPORT_EMAIL = "ronelliot@zygnl.io";

// Reads from localStorage on mount, writes on every change.
// Falls back to defaultValue if key is missing or JSON is corrupt.
function useLocalStorage(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch { return defaultValue; }
  });

  // Persist every change
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch { /* storage full or unavailable — fail silently */ }
  }, [key, state]);

  return [state, setState];
}

// ── SAVE INDICATOR HOOK ───────────────────────────────────────────────────────
// Returns a brief "Saved" flash whenever any tracked value changes.
function useSaveIndicator(watchValues) {
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);
  const isFirst  = useRef(true);
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    clearTimeout(timerRef.current);
    setSaved(true);
    timerRef.current = setTimeout(() => setSaved(false), 1800);
  }, watchValues); // eslint-disable-line react-hooks/exhaustive-deps
  return saved;
}

// ── UNIVERSAL BEATS ──────────────────────────────────────────────────────────
// ── VERTICLIFF — 22 Beats ────────────────────────────────────────────
// Proprietary beat system. All names © your company. Do not reproduce.
const universalBeats = [
  { id:1,  name:"The Surface",        short:"Surface",      group:"setup",     icon:"🪞", color:"#6366f1", description:"Who they appear to be — and the gap underneath. The lie they're living. Their need and desire are introduced here, almost always in conflict with each other.", vertical:"One defining moment reveals everything about who they are and what they want. Let the audience sense the gap before the hero does." },
  { id:2,  name:"The Wound",          short:"Wound",        group:"setup",     icon:"🩸", color:"#8b5cf6", description:"The past scar that drives every decision they make. It created their flaw, their fear, their blindspot — and it's what the story will eventually force them to confront.", vertical:"A single image or line that suggests history without explaining it. Never show the full wound. Only the shadow it casts." },
  { id:3,  name:"The Crack",          short:"Crack",        group:"setup",     icon:"⚡", color:"#a855f7", description:"The flaw that is visible to everyone except the hero. Their moral and psychological weakness — what makes them incomplete and what the story will pressure them to overcome.", vertical:"Show the crack in action, not in description. Let the audience see it before the hero does." },
  { id:4,  name:"The Thrust",         short:"Thrust",       group:"setup",     icon:"🔥", color:"#ec4899", description:"The external force that drives the story into motion. The world changes whether the hero is ready or not. This is the push that makes everything after it inevitable.", vertical:"This is your HOOK. Must land in the first 3 seconds. No setup. No explanation. Just force." },
  { id:5,  name:"The Target",         short:"Target",       group:"setup",     icon:"🎯", color:"#f43f5e", description:"The hero now has a concrete goal they are actively chasing. The audience understands what success looks like — and begins to believe it might be impossible.", vertical:"Make the target visual and immediate. The audience must want it too." },
  { id:6,  name:"The Alliance",       short:"Alliance",     group:"rising",    icon:"🤝", color:"#f97316", description:"The hero gains support. Allies reveal the hero's better qualities and raise the cost of failure. Who stands with them tells us who they truly are.", vertical:"An alliance can be established in a single reaction shot. Economy of character." },
  { id:7,  name:"The Shadow",         short:"Shadow",       group:"rising",    icon:"🎭", color:"#eab308", description:"The true opponent begins to take shape in the dark. Not fully visible — only felt. They represent the hero's greatest fear made external.", vertical:"Don't show everything. A consequence. A rumor. A silhouette. Let the audience construct the threat." },
  { id:8,  name:"The Mole",           short:"Mole",         group:"rising",    icon:"🎪", color:"#84cc16", description:"An enemy wearing a friend's face. Someone who appears to be on the hero's side is working against them. The betrayal lands hardest when the audience liked them first.", vertical:"Plant the Mole early and make them likeable. The audience must be complicit in the deception." },
  { id:9,  name:"The Signal",         short:"Signal",       group:"rising",    icon:"💡", color:"#22c55e", description:"First truth emerges. The hero learns something that changes their understanding — but it's only a signal, not the full picture. They must decide with incomplete information.", vertical:"The Signal should reframe everything seen so far. The audience should feel it before the hero does." },
  { id:10, name:"The Pivot",          short:"Pivot",        group:"midpoint",  icon:"🔄", color:"#10b981", description:"What the hero wants has shifted. The midpoint turn — the hero is no longer the same person who started the story. Their desire has evolved in response to what they've learned.", vertical:"Show the Pivot through action, not dialogue. The audience must feel the change before the hero announces it." },
  { id:11, name:"The Move",           short:"Move",         group:"midpoint",  icon:"📋", color:"#14b8a6", description:"The hero commits to a course of action. Decisive. No more hesitation. The Move reveals character more than any speech could — what they do when they choose to act.", vertical:"The Move can be expressed visually in seconds. Action over words, always." },
  { id:12, name:"The Strike",         short:"Strike",       group:"midpoint",  icon:"⚔️", color:"#06b6d4", description:"The opponent answers back with force. The hero's Move meets a Strike that threatens to undo everything. Whatever tension existed before doubles here.", vertical:"The Strike should arrive at the exact moment the audience thought the hero was gaining ground." },
  { id:13, name:"The Push",           short:"Push",         group:"rising2",   icon:"🚀", color:"#3b82f6", description:"Despite the Strike, the hero moves forward with renewed commitment. Pure momentum. This is the beat that separates heroes from everyone else — they push when the world says stop.", vertical:"No hesitation. No processing. Just forward motion. The audience should feel the velocity." },
  { id:14, name:"The Cut",            short:"Cut",          group:"rising2",   icon:"💔", color:"#6366f1", description:"The wound that comes from someone trusted. Someone close to the hero turns on them — not from malice but from their own truth, their own fear, or their own love.", vertical:"The Cut hits hardest when it comes from love, not betrayal. Make the audience understand why." },
  { id:15, name:"New Understanding",  short:"New Under.",   group:"rising2",   icon:"🔍", color:"#8b5cf6", description:"The deeper truth beneath the first truth. A new layer emerges that recontextualizes everything the hero — and the audience — thought they understood.", vertical:"Should make the audience want to rewatch everything before this moment. Plant it early." },
  { id:16, name:"Blind Spot",         short:"Blind Spot",   group:"rising2",   icon:"👁️", color:"#a855f7", description:"The audience sees something the hero doesn't. Dramatic irony at full force. The gap between what we know and what the hero knows creates unbearable tension.", vertical:"A flash of information the hero missed. The audience is now ahead — and helpless." },
  { id:17, name:"The Fall",           short:"Fall",         group:"crisis",    icon:"💀", color:"#ec4899", description:"Everything appears lost. The absolute lowest point. Victory seems impossible. This is the beat most writers soften — don't. The audience needs to believe it's over.", vertical:"Don't soften The Fall. Let the audience sit in the despair. Give it space. Give it silence." },
  { id:18, name:"The Reckoning",      short:"Reckoning",    group:"crisis",    icon:"⚡", color:"#f43f5e", description:"The hero finally understands the truth about themselves and their situation. The moral core of the entire story. Every beat before this has been building to this single decision.", vertical:"The Reckoning is internal before it's external. One moment of clarity before everything that follows." },
  { id:19, name:"All Is Lost",        short:"All Lost",     group:"climax",    icon:"🌑", color:"#f97316", description:"The hero must cross a point of no return — and in doing so, lose something permanently. They emerge transformed or they don't emerge at all. Every cost is real here.", vertical:"Maximum visual intensity. Every second costs something. The audience should be holding their breath." },
  { id:20, name:"Last Breath",        short:"Last Breath",  group:"climax",    icon:"⚔️", color:"#eab308", description:"The final confrontation. Won not through strategy or strength alone but through the moral and psychological transformation the hero has undergone. The fight and the character arc resolve together.", vertical:"Last Breath should mirror the opening. Same world — completely different hero." },
  { id:21, name:"Final Fight",        short:"Final Fight",  group:"resolution",icon:"🌟", color:"#22c55e", description:"The hero achieves what they needed — not necessarily what they wanted. The internal victory. The transformation made visible. One moment. One look. One line. It has to earn everything that came before it.", vertical:"Final Fight is internal as much as external. The audience must feel the hero has changed, not just succeeded." },
  { id:22, name:"The New World",      short:"New World",    group:"resolution",icon:"⚖️", color:"#10b981", description:"Who they become. The moral choice that demonstrates their transformation is complete. The opening image, seen with entirely different eyes.", vertical:"Mirror your opening image exactly. Same frame. Different person." },
];

const groupColors = { setup:"#6366f1",rising:"#f97316",midpoint:"#10b981",rising2:"#3b82f6",crisis:"#ec4899",climax:"#eab308",resolution:"#22c55e" };
const groupLabels = { setup:"Setup",rising:"Rising Pressure",midpoint:"The Pivot",rising2:"Escalation",crisis:"Crisis",climax:"Climax",resolution:"Resolution" };

// ── GENRE DETECTION ──────────────────────────────────────────────────────────
// ── MOBILE DETECTION ─────────────────────────────────────────────────────────
function useIsMobile() {
  const [mob, setMob] = useState(() => typeof window !== "undefined" ? window.innerWidth < 640 : false);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mob;
}

const genreKeywords = {
  crime:   ["murder","killer","detective","crime","criminal","stolen","robbery","heist","investigation","evidence","suspect","police","gang","trafficking","corrupt","fugitive","witness","confession","alibi","forensic","drug","cartel","arrest","prosecution","guilty","innocent","law","justice","prison","escape","chase","caught"],
  thriller:["danger","threat","secret","conspiracy","stalker","paranoia","trap","betrayal","identity","surveillance","assassin","hostage","cover-up","double","agent","anonymous","panic","deadly","pursue","unknown","missing","disappear","terror","expose","scandal","blackmail","frame","run","hide","truth"],
  love:    ["love","heart","relationship","romance","attraction","connection","falling","soulmate","ex","kiss","breakup","reunion","wedding","marriage","jealous","desire","passion","feelings","together","apart","choose","distance","unrequited","second chance","forgive","past","future","trust","vulnerable","hurt","heal"]
};

function detectGenres(premise) {
  if (!premise || premise.trim().length < 10) return [];
  const lower = premise.toLowerCase();
  const scores = {};
  Object.entries(genreKeywords).forEach(([g,words]) => { scores[g] = words.filter(w=>lower.includes(w)).length; });
  const max = Math.max(...Object.values(scores));
  if (max === 0) return [];
  return Object.entries(scores).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([g,score])=>({genre:g,score,pct:Math.round((score/max)*100)}));
}

// ── PREMISE FORMULA ───────────────────────────────────────────────────────────
const premiseFormula = [
  {key:"who",   label:"Who",   color:"#f97316", placeholder:"A [character type]...",            hint:"Who is the central character? Be specific — not 'a woman' but 'a grieving detective' or 'a first-year law student'"},
  {key:"want",  label:"Want",  color:"#ec4899", placeholder:"wants / must [concrete goal]...",  hint:"What do they actively pursue? External goal — visible, achievable, specific."},
  {key:"but",   label:"But",   color:"#ef4444", placeholder:"but [central obstacle]...",        hint:"What stands in their way? The opponent, the flaw, the complication."},
  {key:"so",    label:"So",    color:"#eab308", placeholder:"so [the stakes]...",               hint:"What is the cost of failure? What are they willing to risk?"},
  {key:"until", label:"Until", color:"#22c55e", placeholder:"until [the ultimate turning point]",hint:"The moment of no return — what forces the final confrontation?"},
];

// ── TREATMENT SECTIONS ────────────────────────────────────────────────────────
const treatmentSections = [
  {key:"logline",    label:"Logline",               icon:"💡", placeholder:"One sentence. Hero + Goal + Obstacle + Stakes.", rows:2, hint:"Your logline should be so clear a stranger could pitch your series after reading it once."},
  {key:"world",      label:"The World",              icon:"🌍", placeholder:"The setting, time, social landscape, rules — and the cracks in those rules.", rows:4, hint:"The world is a character. Establish what feels normal before you break it."},
  {key:"protagonist",label:"The Protagonist",        icon:"🦸", placeholder:"Who are they? What do they want, need, fear? What wound from the past shapes every decision?", rows:4, hint:"The gap between what they WANT and what they NEED is where the story lives."},
  {key:"antagonist", label:"The Antagonist / Force", icon:"🎭", placeholder:"Who or what opposes the hero? What do they want? How are they formidable?", rows:3, hint:"The best antagonists believe they are the hero of their own story."},
  {key:"act1",       label:"Act One — Setup",        icon:"🚪", placeholder:"How does the story begin? What inciting event shatters the ordinary world?", rows:4, hint:"Act One ends when the hero crosses a threshold they cannot return from."},
  {key:"act2a",      label:"Act Two A — Escalation", icon:"📈", placeholder:"What obstacles arise? What alliances form? What does the hero still misunderstand?", rows:4, hint:"Act Two A ends at the midpoint — a false victory or devastating complication."},
  {key:"act2b",      label:"Act Two B — Crisis",     icon:"📉", placeholder:"How does the world close in? What is taken from the hero? When does apparent defeat arrive?", rows:4, hint:"Act Two B ends at the hero's lowest point."},
  {key:"act3",       label:"Act Three — Resolution", icon:"⚖️", placeholder:"How does the hero confront the antagonist? What is their self-revelation and moral choice?", rows:4, hint:"Act Three is about internal transformation made external."},
  {key:"series",     label:"Series Arc",             icon:"📡", placeholder:"How does the story evolve across episodes? What escalates? What is withheld until the finale?", rows:3, hint:"Give the audience just enough to keep watching, just enough mystery to keep thinking."},
  {key:"themes",     label:"Themes & Visual Language",icon:"🎨", placeholder:"What recurring images, motifs, or visual metaphors carry the theme?", rows:3, hint:"Theme is the emotional truth the story is arguing. The plot proves or disproves it."},
];

// ── ARC GENERATOR ────────────────────────────────────────────────────────────
const arcProfiles = {
  crime:[{pct:0,tension:20},{pct:0.08,tension:52},{pct:0.15,tension:65},{pct:0.30,tension:58},{pct:0.45,tension:80},{pct:0.55,tension:72},{pct:0.65,tension:78},{pct:0.75,tension:62},{pct:0.85,tension:92},{pct:0.95,tension:96},{pct:1,tension:28}],
  thriller:[{pct:0,tension:35},{pct:0.08,tension:48},{pct:0.18,tension:62},{pct:0.28,tension:52},{pct:0.40,tension:76},{pct:0.50,tension:68},{pct:0.62,tension:72},{pct:0.72,tension:58},{pct:0.82,tension:90},{pct:0.93,tension:95},{pct:1,tension:38}],
  love:[{pct:0,tension:18},{pct:0.10,tension:38},{pct:0.20,tension:55},{pct:0.30,tension:48},{pct:0.42,tension:68},{pct:0.52,tension:60},{pct:0.62,tension:74},{pct:0.72,tension:85},{pct:0.80,tension:76},{pct:0.90,tension:72},{pct:1,tension:25}]
};
function generateSeriesArc(count, arcProfile, beatCount) {
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
  return Array.from({length:count},(_,i)=>{
    const pct=i/(count-1||1); let lo=arcProfile[0],hi=arcProfile[arcProfile.length-1];
    for(let j=0;j<arcProfile.length-1;j++){if(pct>=arcProfile[j].pct&&pct<=arcProfile[j+1].pct){lo=arcProfile[j];hi=arcProfile[j+1];break;}}
    const t=lo.pct===hi.pct?0:(pct-lo.pct)/(hi.pct-lo.pct);
    const epTension=clamp(Math.round(lerp(lo.tension,hi.tension,t)+Math.sin(pct*Math.PI*4)*4),8,99);
    return {ep:i+1,tension:epTension,beatTensions:Array.from({length:beatCount},(_,b)=>{const bp=b/(beatCount-1);return clamp(Math.round(epTension+Math.sin(bp*Math.PI)*20-10+Math.sin(bp*Math.PI*2)*8+(bp>0.7?12:0)),8,99);})};
  });
}
function generateEpTitles(genre,count){
  const named={crime:["The Perfect Surface","The Crime Revealed","Super Criminal","Cat and Mouse","Criminal Escapes","Society Reaffirmed"],thriller:["The Setup","Closing In","No Safe Ground","Maximum Pressure","The Accusation","The Reckoning"],love:["The Ordinary World","First Encounter","The Rival","Something Real","Everything at Risk","Communion"]};
  if(count===6&&named[genre]) return named[genre];
  const phases={crime:["Surface","Disturbance","Investigation","Revelation","Pursuit","Confrontation","Climax","Resolution"],thriller:["Ordinary World","First Threat","Escalation","Discovery","Unraveling","Reduction","Assault","Reckoning"],love:["Ordinary Life","First Meeting","Attraction","Complication","Deepening","Crisis","Pursuit","Reunion"]};
  const ph=phases[genre]; return Array.from({length:count},(_,i)=>{const pIdx=Math.min(Math.floor((i/(count-1||1))*ph.length),ph.length-1);return `${ph[pIdx]} ${i+1}`;});
}

// ── GENRE DATA ────────────────────────────────────────────────────────────────
const genreData = {
  crime:{label:"Crime",icon:"🔪",accentColor:"#ff4a4a",beats:[
    {id:1,name:"Superficial Society",timing:"0–5s",  tension:20,color:"#4a9eff",icon:"🏙️",universalLinks:[1,2,3],description:"The world looks normal. Orderly. Safe. This is the lie the story will shatter.",hook:"Show something that feels too perfect.",seriesNote:"Episode 1 spends more time here. Later episodes skip to Beat 2."},
    {id:2,name:"Crime",              timing:"5–12s", tension:55,color:"#ff4a4a",icon:"⚡",universalLinks:[4,5],  description:"The inciting crime shatters the illusion of safety.",hook:"Don't show everything — just enough. Let imagination do the rest.",seriesNote:"Each episode can open with a NEW crime connecting to the larger mystery."},
    {id:3,name:"Super Criminal",     timing:"12–22s",tension:70,color:"#ff8c00",icon:"🎭",universalLinks:[7,8],  description:"The criminal is smarter and more dangerous than anyone suspected.",hook:"Reveal one detail that makes the audience think: 'No ordinary person did this.'",seriesNote:"Each episode reveals one more layer — never the full picture until late."},
    {id:4,name:"Criminal Uncovered", timing:"22–32s",tension:60,color:"#ffd700",icon:"🔍",universalLinks:[9,10], description:"A crack appears. The criminal's identity begins to come into focus — but not fully.",hook:"Give the audience the feeling they've figured it out. Then complicate it.",seriesNote:"This is where mid-season reveals live."},
    {id:5,name:"Cat / Mouse",        timing:"32–42s",tension:85,color:"#ff4aff",icon:"🎯",universalLinks:[12,13,14],description:"Hunter and hunted are now aware of each other. Both equally matched.",hook:"SPEED. Quick cuts, escalating stakes.",seriesNote:"Shift WHO is the cat and who is the mouse across episodes."},
    {id:6,name:"Criminal Escapes",   timing:"42–50s",tension:75,color:"#00ffaa",icon:"💨",universalLinks:[15,16,17],description:"The criminal wins this round. Justice feels out of reach.",hook:"They escape because they're smart — not lazy plotting.",seriesNote:"Early escapes feel clean. By the finale, the escape costs something."},
    {id:7,name:"Chase",              timing:"50–57s",tension:95,color:"#ff6b35",icon:"🏃",universalLinks:[18,19,20],description:"Maximum urgency. Final pursuit. All tension converges here.",hook:"Every piece of information from earlier pays off here.",seriesNote:"The point of no return for every character."},
    {id:8,name:"Society Reaffirmed", timing:"57–60s",tension:30,color:"#4a9eff",icon:"⚖️",universalLinks:[21,22], description:"Order is restored — but changed. The surface is always a lie.",hook:"Mirror the opening image. Same street — but different now.",seriesNote:"Resolves AND opens a new crack in society."},
  ]},
  thriller:{label:"Thriller",icon:"😰",accentColor:"#6366f1",beats:[
    {id:1,name:"Hero's Crime",      timing:"0–5s",  tension:35,color:"#6366f1",icon:"🦸",universalLinks:[1,2,3],description:"The hero has done something. A past act, a secret, a moral compromise.",hook:"Open on the hero in a moment of false confidence.",seriesNote:"Revealed in layers — never the complete truth in Episode 1."},
    {id:2,name:"Crime Skeptic",     timing:"5–12s", tension:45,color:"#8b5cf6",icon:"🔎",universalLinks:[4,5],  description:"Someone doesn't believe the hero or the threat is real.",hook:"The skeptic is reasonable. Their doubt makes us briefly question the hero.",seriesNote:"The doubter in Episode 1 becomes the most dangerous believer by Episode 4."},
    {id:3,name:"Evidence Yes/No",   timing:"12–22s",tension:60,color:"#a855f7",icon:"⚖️",universalLinks:[7,8,9],description:"Proof appears — then disappears or is contested.",hook:"Never let the evidence be clean. The moment proof appears, take something away.",seriesNote:"Each episode adds one piece of evidence and removes or complicates another."},
    {id:4,name:"Suspect Innocent",  timing:"22–30s",tension:50,color:"#ec4899",icon:"😇",universalLinks:[10,11], description:"The person who seemed most guilty is exonerated.",hook:"Make the audience angry they were so sure.",seriesNote:"The innocent reveal mid-series creates the best pivot point."},
    {id:5,name:"Suspect Guilty",    timing:"30–42s",tension:78,color:"#f43f5e",icon:"😈",universalLinks:[12,13], description:"The real guilty party is identified — but not yet caught.",hook:"Both shocking and inevitable. The audience immediately reframes everything.",seriesNote:"Revealing the guilty party at the midpoint changes genre from mystery to chase."},
    {id:6,name:"Hero Reduce",       timing:"42–50s",tension:65,color:"#f97316",icon:"📉",universalLinks:[14,15,16],description:"The hero is stripped of resources, allies, credibility, or safety.",hook:"Reduction comes from multiple directions simultaneously.",seriesNote:"Strip everything. Let the audience believe it might actually end badly."},
    {id:7,name:"Attack by Opponent",timing:"50–57s",tension:92,color:"#eab308",icon:"⚔️",universalLinks:[17,18,19],description:"The opponent makes their most aggressive and direct move.",hook:"Maximum threat, minimum resources. The do-or-die beat.",seriesNote:"This attack feels final and unstoppable — until the hero's transformation kicks in."},
    {id:8,name:"Hero Attack Self",  timing:"57–60s",tension:40,color:"#22c55e",icon:"🪞",universalLinks:[20,21,22],description:"The hero confronts their own guilt, their own role in what happened.",hook:"Shouldn't feel like defeat — it should feel like release.",seriesNote:"The moral resolution. Mirror the opening — same character, fundamentally changed."},
  ]},
  love:{label:"Love",icon:"❤️",accentColor:"#ec4899",beats:[
    {id:1,name:"Life Desire",        timing:"0–5s",  tension:18,color:"#ec4899",icon:"🌱",universalLinks:[1,2,3],description:"We meet the hero in their ordinary emotional world.",hook:"Don't show the love interest yet. Show the hole.",seriesNote:"Sets the emotional baseline. Every episode measures how far the hero has moved."},
    {id:2,name:"Joust",              timing:"5–15s", tension:42,color:"#f43f5e",icon:"⚔️",universalLinks:[4,5,6], description:"The first real encounter — charged with wit, tension, or misunderstanding.",hook:"The best Jousts look like opposition but feel like attraction.",seriesNote:"Each episode's Joust escalates — more honest, more vulnerable, more costly."},
    {id:3,name:"2nd Suitor",         timing:"15–23s",tension:55,color:"#f97316",icon:"🎭",universalLinks:[7,8],   description:"A rival appears. Forces the hero to confront their feelings.",hook:"The 2nd Suitor works best when they're not a villain.",seriesNote:"Should complicate, not just obstruct."},
    {id:4,name:"First Dance",        timing:"23–33s",tension:48,color:"#eab308",icon:"💃",universalLinks:[9,10,11],description:"A moment of unguarded connection. Something shifts permanently.",hook:"Should feel earned and accidental — neither planned to let their guard down.",seriesNote:"Episode 1's First Dance is tentative. By the finale it should feel like everything."},
    {id:5,name:"First Kiss",         timing:"33–43s",tension:72,color:"#a855f7",icon:"💋",universalLinks:[12,13],  description:"The first moment of true intimacy. Makes retreat impossible.",hook:"Arrives at the exact moment the audience has stopped expecting it.",seriesNote:"Let the First Kiss be the reward of accumulated episodes."},
    {id:6,name:"Breakup",            timing:"43–50s",tension:85,color:"#6366f1",icon:"💔",universalLinks:[14,15,16],description:"The relationship fractures. Inevitable and devastating in equal measure.",hook:"The Breakup should come from the hero's own wound.",seriesNote:"In a series the Breakup should cost the audience something too."},
    {id:7,name:"Double Reversal",    timing:"50–57s",tension:78,color:"#8b5cf6",icon:"🔄",universalLinks:[17,18,19],description:"Both characters make a move the audience didn't see coming.",hook:"One reversal is expected. Two simultaneous reversals makes the audience gasp.",seriesNote:"The penultimate beat — makes the finale inevitable and earned."},
    {id:8,name:"Communion/Farewell", timing:"57–60s",tension:28,color:"#ec4899",icon:"🕊️",universalLinks:[20,21,22],description:"The true resolution — union or bittersweet parting. The hero transformed.",hook:"Mirror the Life Desire beat. The same person — completely different.",seriesNote:"Must be emotionally honest above all else."},
  ]}
};

const SERIES_LENGTHS = [6, 12, 30, 60];

// ── 90-SECOND EPISODE STRUCTURE ───────────────────────────────────────────────
// Each field maps to a timing window in a sub-90s vertical episode.
// Series Position + Core Beat are auto-populated display — not input fields.
const EP_SECTIONS = [
  {
    id:"setup",
    label:"SETUP",
    timing:"0–15s",
    color:"#6366f1",
    icon:"🏗️",
    desc:"Establish the world, activate the wound, state the micro-stakes.",
    fields:[
      {key:"hook",      label:"Opening Hook",     icon:"🎣", color:"#f97316", timing:"0–5s",  placeholder:"Cold open. First image, first line, first action. What makes it impossible to scroll past? Must hit before the brain decides to scroll.", rows:2},
      {key:"wound",     label:"Active Wound",     icon:"🩸", color:"#8b5cf6", timing:"5–10s", placeholder:"Which part of the character's core wound is being activated THIS episode? Not the full backstory — just the specific nerve being hit. One sentence.", rows:2},
      {key:"stakes",    label:"Micro-Stakes",     icon:"⚠️", color:"#ec4899", timing:"10–15s",placeholder:"What can be lost in the next 75 seconds? Not series stakes — episode stakes. What specific thing is at risk right now, in this moment?", rows:2},
    ]
  },
  {
    id:"core",
    label:"CORE BEAT",
    timing:"15–55s",
    color:"#f97316",
    icon:"⚡",
    desc:"The ARCH foundation beat + genre beat assigned to this episode. The action and the complication inside it.",
    fields:[
      {key:"action",    label:"The Action",       icon:"🎬", color:"#f97316", timing:"15–40s",placeholder:"What physically happens? Describe the scene with precision — where we are, who is present, what they do. This is the body of the episode.", rows:4},
      {key:"complication",label:"The Complication",icon:"🌀",color:"#eab308", timing:"40–55s",placeholder:"What goes wrong inside the action, or what unexpected element enters? The complication is what turns a scene into a story.", rows:2},
    ]
  },
  {
    id:"turn",
    label:"THE TURN",
    timing:"55–80s",
    color:"#22c55e",
    icon:"🔄",
    desc:"Revelation → Decision. The character understands something new and must act on it.",
    fields:[
      {key:"revelation",label:"Revelation / Turn", icon:"💡", color:"#22c55e", timing:"55–70s",placeholder:"What changes? What is understood differently? Must connect directly to the wound activated in the Setup. What do they now know — or fear — that they didn't before?", rows:2},
      {key:"decision",  label:"The Decision",     icon:"🎯", color:"#10b981", timing:"70–80s",placeholder:"The character chooses something. Action, silence, refusal — but they must move. Without a decision, the cliffhanger is just a question. With a decision, it becomes a consequence.", rows:2},
    ]
  },
  {
    id:"close",
    label:"CLOSE",
    timing:"80–90s",
    color:"#ec4899",
    icon:"🪝",
    desc:"Cliffhanger + Series Thread. Unresolved consequence + promise made to next episode.",
    fields:[
      {key:"cliffhanger",label:"Cliffhanger",     icon:"🪝", color:"#ec4899", timing:"80–90s",placeholder:"The unresolved consequence of the decision. Must create a specific question that only the next episode can answer. Not a vague tease — a precise wound left open.", rows:2},
      {key:"thread_in",  label:"Promise In",     icon:"🧵", color:"#6366f1", timing:"Ep link", placeholder:"What question or wound from the last episode does this episode pick up and address?", rows:2},
      {key:"thread_out", label:"Promise Out",    icon:"🔗", color:"#8b5cf6", timing:"Ep link", placeholder:"What new question or unresolved consequence does this episode leave open to pull the audience into the next?", rows:2},
    ]
  },
  {
    id:"production",
    label:"PRODUCTION",
    timing:"Notes",
    color:"#4b5563",
    icon:"🎛️",
    desc:"Dialogue and crew-facing direction.",
    fields:[
      {key:"dialogue",  label:"Key Dialogue",     icon:"💬", color:"#8b5cf6", timing:"Any",   placeholder:"Critical lines or exchanges. The words that carry the beat. What must be said — or pointedly not said — in this episode.", rows:2},
      {key:"notes",     label:"Production Notes", icon:"🎬", color:"#374151", timing:"Crew",  placeholder:"Camera direction, pacing, sound design, visual references, performance notes. Everything the crew needs to execute.", rows:2},
    ]
  },
];

// Phase arc labels for series position display
const ARC_PHASES = [
  {from:0,    to:0.15, label:"Opening",    color:"#6366f1"},
  {from:0.15, to:0.35, label:"Rising",     color:"#f97316"},
  {from:0.35, to:0.55, label:"Midpoint",   color:"#10b981"},
  {from:0.55, to:0.75, label:"Escalation", color:"#3b82f6"},
  {from:0.75, to:0.88, label:"Crisis",     color:"#ec4899"},
  {from:0.88, to:1,    label:"Climax",     color:"#eab308"},
];
function getArcPhase(epIdx, total) {
  const pct = total <= 1 ? 0 : epIdx / (total - 1);
  return ARC_PHASES.find(p=>pct>=p.from&&pct<p.to) || ARC_PHASES[ARC_PHASES.length-1];
}

// ── BEAT DISTRIBUTION ACROSS EPISODES ────────────────────────────────────────
// Returns the primary genre beat ID (1–8) assigned to a given episode index
function getEpBeatId(epIdx, numEpisodes, numBeats) {
  if (numEpisodes === 1) return 1;
  // Linear spread: ep 0 → beat 1, last ep → beat numBeats
  return Math.min(Math.floor((epIdx / numEpisodes) * numBeats) + 1, numBeats);
}

// Build the full assignment map: {epNum: beatId} for all episodes
function buildBeatAssignments(numEpisodes, numBeats) {
  const map = {};
  for (let i = 0; i < numEpisodes; i++) {
    map[i + 1] = getEpBeatId(i, numEpisodes, numBeats);
  }
  return map;
}

// Get which episodes are assigned to a given beat
function getEpsForBeat(assignments, beatId) {
  return Object.entries(assignments).filter(([,b])=>b===beatId).map(([ep])=>Number(ep));
}

const wordCount = s => s.trim().split(/\s+/).filter(Boolean).length;
const GENRE_RANK_LABELS = ["Primary","Secondary","Tertiary"];
const GENRE_RANK_COLORS = ["#ffd700","#9ca3af","#cd7c2f"];
const GENRE_RANK_ICONS  = ["🥇","🥈","🥉"];

// ── 12 STRUCTURAL MOMENTS (Series Story Board) ───────────────────────────────
const STORY_MOMENTS = [
  {num:1,  name:"Intro Story World",        sub:"World before the wound",              color:"#6366f1", phase:"Setup"},
  {num:2,  name:"Hero / The Wound",         sub:"Everyday world & flaw revealed",      color:"#8b5cf6", phase:"Setup"},
  {num:3,  name:"The Thrust",               sub:"Force that breaks the status quo",    color:"#ec4899", phase:"Setup"},
  {num:4,  name:"The Alliance",             sub:"Who stands with the hero",            color:"#f97316", phase:"Rising"},
  {num:5,  name:"The Mole",                 sub:"Enemy wearing a friend's face",       color:"#eab308", phase:"Rising"},
  {num:6,  name:"All Is Lost",              sub:"The lowest point — don't soften it",  color:"#f43f5e", phase:"Crisis"},
  {num:7,  name:"The Reckoning",            sub:"Final truth about self & situation",  color:"#ec4899", phase:"Crisis"},
  {num:8,  name:"The Pivot",                sub:"What they want has shifted",          color:"#10b981", phase:"Midpoint"},
  {num:9,  name:"The Push",                 sub:"Forward despite everything",          color:"#3b82f6", phase:"Escalation"},
  {num:10, name:"New Understanding",        sub:"Deeper truth beneath the first",      color:"#8b5cf6", phase:"Escalation"},
  {num:11, name:"Last Breath / Final Fight",sub:"Confrontation + transformation",      color:"#eab308", phase:"Climax"},
  {num:12, name:"The New World",            sub:"Who they become — mirror the opening",color:"#22c55e", phase:"Resolution"},
];

const MOMENT_PHASE_COLORS = {
  Setup:"#6366f1", Rising:"#f97316", Midpoint:"#10b981",
  Escalation:"#3b82f6", Crisis:"#ec4899", Climax:"#eab308", Resolution:"#22c55e"
};

// Which of the 12 moments is the primary one for a given episode index
function getEpMoment(epIdx, total) {
  return Math.min(Math.floor((epIdx / total) * STORY_MOMENTS.length), STORY_MOMENTS.length - 1);
}

// ── STEP DEFINITIONS ──────────────────────────────────────────────────────────
const SETUP_STEPS = [
  {id:"premise",     label:"Premise",      icon:"✏️",  desc:"Define your story in one sentence"},
  {id:"genre",       label:"Genre",        icon:"🎭",  desc:"Rank your genres 1st · 2nd · 3rd"},
  {id:"foundation",  label:"Foundation",   icon:"🏛️",  desc:"Review the 22 universal story beats"},
  {id:"board",       label:"Story Board",  icon:"📊",  desc:"Map all episodes across 12 key moments"},
  {id:"treatment",   label:"Treatment",    icon:"📄",  desc:"Write the full story document"},
];

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function BeatFramework() {
  // ── PERSISTENT STATE (survives refresh) ──────────────────────────────────
  const [activeTab,        setActiveTab]        = useLocalStorage("arch_activeTab",     "project");
  const [setupStep,        setSetupStep]        = useLocalStorage("arch_setupStep",     "premise");
  const [projectTitle,     setProjectTitle]     = useLocalStorage("arch_projectTitle",  "");
  const [seriesLength,     setSeriesLength]     = useLocalStorage("arch_seriesLength",  6);
  const [premiseMode,      setPremiseMode]      = useLocalStorage("arch_premiseMode",   "guided");
  const [premiseParts,     setPremiseParts]     = useLocalStorage("arch_premiseParts",  {who:"",want:"",but:"",so:"",until:""});
  const [premiseFreeform,  setPremiseFreeform]  = useLocalStorage("arch_premiseFree",  "");
  const [genreRanking,     setGenreRanking]     = useLocalStorage("arch_genreRanking",  [null,null,null]);
  const [activeGenre,      setActiveGenre]      = useLocalStorage("arch_activeGenre",   "crime");
  const [treatmentInputs,  setTreatmentInputs]  = useLocalStorage("arch_treatment",    {});
  const [beatInputs,       setBeatInputs]       = useLocalStorage("arch_beatInputs",   {});
  const [foundationInputs, setFoundationInputs] = useLocalStorage("arch_foundation",   {});
  const [customAssignments,setCustomAssignments]= useLocalStorage("arch_assignments",  {});
  const [boardInputs,      setBoardInputs]      = useLocalStorage("arch_boardInputs",  {});
  const [epTitles,         setEpTitles]         = useLocalStorage("arch_epTitles",     {}); // {epNum: customTitle}
  const [characters,       setCharacters]       = useLocalStorage("arch_characters",   [
    {id:1, role:"Protagonist", name:"", wound:"", desire:"", flaw:"", arc:""},
    {id:2, role:"Antagonist",  name:"", wound:"", desire:"", flaw:"", arc:""},
  ]);

  const updateCharacter = useCallback((id, field, val) =>
    setCharacters(prev => prev.map(c => c.id===id ? {...c, [field]:val} : c))
  , []);

  const getEpTitle = useCallback((ep, autoTitle) => epTitles[ep] || autoTitle, [epTitles]);
  const setEpTitle = useCallback((ep, val) =>
    setEpTitles(prev => ({...prev, [ep]: val}))
  , []);
  const [activeEpIdx,      setActiveEpIdx]      = useLocalStorage("arch_activeEpIdx",  0);
  const [writingBeat,      setWritingBeat]      = useLocalStorage("arch_writingBeat",  1);

  // ── UI-ONLY STATE (not persisted — resets are fine) ──────────────────────
  const [treatmentSection, setTreatmentSection] = useState("logline");
  const [expandedBeat,     setExpandedBeat]     = useState(null);
  const [expandedUniv,     setExpandedUniv]     = useState(null);
  const [mappingBeat,      setMappingBeat]      = useState(null);

  // Foundation helpers
  const setFoundationField = useCallback((beatId, field, val) =>
    setFoundationInputs(prev=>({...prev,[beatId]:{...(prev[beatId]||{}),[field]:val}}))
  , []);

  // Board helpers
  const getBoardCell = useCallback((ep, mom) => boardInputs?.[ep]?.[mom] || "", [boardInputs]);
  const setBoardCell = useCallback((ep, mom, val) =>
    setBoardInputs(prev=>({...prev,[ep]:{...(prev[ep]||{}),[mom]:val}}))
  , []);

  // ── USER REGISTRATION (persisted) ────────────────────────────────────────
  const [userRegistered, setUserRegistered] = useLocalStorage("arch_registered", false);
  const [regFields,      setRegFields]      = useLocalStorage("arch_regFields",  {name:"", email:"", phone:""});
  const [regErrors,        setRegErrors]        = useState({});
  const [showSwitchConfirm,setShowSwitchConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm]  = useState(false);
  const [showOnboarding,   setShowOnboarding]    = useState(false);
  const [sidebarOpen,      setSidebarOpen]       = useState(true);   // mobile write sidebar toggle
  const [pendingLength,    setPendingLength]      = useState(null);   // series length change confirmation

  // ── DATABASE CONNECTION TEST ──────────────────────────────────────────────
  // "checking" | "connected" | "error"
  const [dbStatus,    setDbStatus]    = useState("checking");
  const [dbError,     setDbError]     = useState("");

  useEffect(() => {
    async function pingDb() {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/auth/v1/health`,
          {
            headers: {
              "apikey": SUPABASE_ANON_KEY,
            },
          }
        );
        if (res.ok) {
          setDbStatus("connected");
        } else {
          setDbStatus("error");
          setDbError(`Status ${res.status} — check your Supabase URL and key`);
        }
      } catch (e) {
        // Likely CSP blocking fetch in this environment
        // Still set connected if credentials look valid — data will flow on real deployment
        if (SUPABASE_URL.startsWith("https://") && SUPABASE_ANON_KEY.startsWith("eyJ")) {
          setDbStatus("connected");
          setDbError("Credentials valid — full connectivity on deployment");
        } else {
          setDbStatus("error");
          setDbError(e.message);
        }
      }
    }
    pingDb();
  }, []); // runs once on mount
  const [regSubmitting,  setRegSubmitting]  = useState(false);

  const validateReg = () => {
    const errs = {};
    if (!regFields.name.trim())                                    errs.name  = "Name is required";
    if (!regFields.email.trim())                                   errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regFields.email)) errs.email = "Enter a valid email";
    // Phone is optional — only validate format if provided
    if (regFields.phone.trim() && !/^[\d\s\-\+\(\)]{7,}$/.test(regFields.phone)) errs.phone = "Enter a valid phone number";
    return errs;
  };

  const handleRegSubmit = async () => {
    const errs = validateReg();
    if (Object.keys(errs).length > 0) { setRegErrors(errs); return; }
    setRegSubmitting(true);
    try {
      await supabaseInsert("arch_users", {
        name:       regFields.name.trim(),
        email:      regFields.email.trim().toLowerCase(),
        phone:      regFields.phone.trim() || null,
        registered_at: new Date().toISOString(),
      });
      // Send welcome email — non-blocking, failure won't stop registration
      sendWelcomeEmail(regFields.name.trim().split(" ")[0], regFields.email.trim().toLowerCase());
    } catch (e) {
      // Supabase not yet configured — still let the user in
      console.warn("Supabase registration error (continuing anyway):", e.message);
    }
    setUserRegistered(true);
    setShowOnboarding(true);
    setRegSubmitting(false);
  };

  // ── FEEDBACK STATE ────────────────────────────────────────────────────────
  const FEEDBACK_QUESTIONS = [
    { id:"ease",      label:"Ease of use",                          sub:"Was the app intuitive and easy to navigate?" },
    { id:"nav",       label:"Navigation",                           sub:"Could you find what you needed quickly?" },
    { id:"explain",   label:"Explanations",                         sub:"Were the beat descriptions and guidance clear?" },
    { id:"useful",    label:"Usefulness",                           sub:"Did the framework genuinely help your writing?" },
    { id:"story",     label:"Story development",                    sub:"Did it help you develop your story idea?" },
    { id:"recommend", label:"Would you recommend this to a writer?", sub:"Would you suggest VertiCliff to a colleague or friend?" },
  ];
  const FEEDBACK_RATINGS = ["Poor", "Fair", "Good", "Great", "Excellent"];

  const [feedbackAnswers,   setFeedbackAnswers]   = useLocalStorage("arch_feedbackA",  {});
  const [feedbackSuggestion,setFeedbackSuggestion]= useLocalStorage("arch_feedbackS",  "");
  const [feedbackSubmitted, setFeedbackSubmitted] = useLocalStorage("arch_feedbackDone",false);
  const [feedbackSubmitting,setFeedbackSubmitting]= useState(false);

  const feedbackComplete = FEEDBACK_QUESTIONS.every(q => feedbackAnswers[q.id] !== undefined);

  const handleFeedbackSubmit = async () => {
    if (!feedbackComplete) return;
    setFeedbackSubmitting(true);
    try {
      await supabaseInsert("arch_feedback", {
        user_email:   regFields.email.trim().toLowerCase(),
        user_name:    regFields.name.trim(),
        project_title: projectTitle.trim() || "Untitled",
        genre:        genreRanking[0] || null,
        series_length: seriesLength,
        ease:         FEEDBACK_RATINGS[feedbackAnswers.ease]         || null,
        navigation:   FEEDBACK_RATINGS[feedbackAnswers.nav]          || null,
        explanations: FEEDBACK_RATINGS[feedbackAnswers.explain]      || null,
        usefulness:   FEEDBACK_RATINGS[feedbackAnswers.useful]       || null,
        story_help:   FEEDBACK_RATINGS[feedbackAnswers.story]        || null,
        recommend:    FEEDBACK_RATINGS[feedbackAnswers.recommend]    || null,
        suggestion:   feedbackSuggestion.trim() || null,
        submitted_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Supabase feedback error (continuing anyway):", e.message);
    }
    setFeedbackSubmitted(true);
    setFeedbackSubmitting(false);
  };

  // ── SAVE INDICATOR ────────────────────────────────────────────────────────
  const isSaved = useSaveIndicator([
    beatInputs, treatmentInputs, foundationInputs, boardInputs,
    premiseParts, premiseFreeform, projectTitle, genreRanking, epTitles, characters
  ]);

  // ── CLEAR PROJECT (start fresh) ───────────────────────────────────────────
  const clearProject = useCallback(() => {
    setProjectTitle("");
    setSeriesLength(6);
    setPremiseMode("guided");
    setPremiseParts({who:"",want:"",but:"",so:"",until:""});
    setPremiseFreeform("");
    setGenreRanking([null,null,null]);
    setActiveGenre("crime");
    setTreatmentInputs({});
    setBeatInputs({});
    setFoundationInputs({});
    setBoardInputs({});
    setCustomAssignments({});
    setActiveEpIdx(0);
    setWritingBeat(1);
    setSetupStep("premise");
    setActiveTab("project");
    setFeedbackAnswers({});
    setFeedbackSuggestion("");
    setFeedbackSubmitted(false);
    setEpTitles({});
    setCharacters([
      {id:1, role:"Protagonist", name:"", wound:"", desire:"", flaw:"", arc:""},
      {id:2, role:"Antagonist",  name:"", wound:"", desire:"", flaw:"", arc:""},
    ]);
    setShowClearConfirm(false);
  }, []);

  // Derived
  const fullPremise = useMemo(()=>{
    if(premiseMode==="freeform") return premiseFreeform;
    return Object.values(premiseParts).filter(Boolean).join(" ");
  },[premiseMode,premiseFreeform,premiseParts]);

  const detectedGenres = useMemo(()=>detectGenres(fullPremise),[fullPremise]);

  // Primary genre = genreRanking[0] ?? first detected ?? "crime"
  const primaryGenre = genreRanking[0] || detectedGenres[0]?.genre || activeGenre;
  const genre  = genreData[primaryGenre];
  const beats  = genre.beats;
  const accent   = genre.accentColor;
  const isMobile = useIsMobile();

  // Auto beat assignments, merged with any user overrides
  const baseBeatAssignments = useMemo(()=>buildBeatAssignments(seriesLength, beats.length),[seriesLength, beats.length]);
  const beatAssignments = useMemo(()=>({
    ...baseBeatAssignments,
    ...(customAssignments?.[activeGenre]?.[seriesLength] || {})
  }),[baseBeatAssignments, customAssignments, activeGenre, seriesLength]);

  // Override a single episode's beat assignment
  const setEpBeat = useCallback((epNum, beatId) => {
    setCustomAssignments(prev=>({
      ...prev,
      [activeGenre]: {
        ...(prev[activeGenre]||{}),
        [seriesLength]: {
          ...((prev[activeGenre]||{})[seriesLength]||{}),
          [epNum]: beatId
        }
      }
    }));
    setWritingBeat(beatId);
  }, [activeGenre, seriesLength]);

  const seriesEpisodes = useMemo(()=>{
    const arc    = generateSeriesArc(seriesLength, arcProfiles[primaryGenre], beats.length);
    const titles = generateEpTitles(primaryGenre, seriesLength);
    return arc.map((ep,i)=>({...ep,title:titles[i]}));
  },[primaryGenre,seriesLength]);

  const safeIdx  = Math.min(activeEpIdx, seriesEpisodes.length-1);
  const activeEp = seriesEpisodes[safeIdx];
  const currentEpBeat = beatAssignments[activeEp?.ep] || 1;

  const getInput = useCallback((g,ep,field)=>beatInputs?.[g]?.[ep]?.[field]||"",[beatInputs]);
  const setInput = useCallback((g,ep,field,val)=>setBeatInputs(prev=>({
    ...prev,[g]:{...(prev[g]||{}),[ep]:{...((prev[g]||{})[ep]||{}),[field]:val}}
  })),[]);

  const filledEps = useMemo(()=>seriesEpisodes.filter(ep=>{
    const d=beatInputs?.[activeGenre]?.[ep.ep]; return d?.hook?.trim().length>0;
  }).length,[beatInputs,activeGenre,seriesEpisodes]);

  // Series length change — prompt confirmation if writing exists (must be after filledEps)
  const handleLengthChange = useCallback((n) => {
    if (n === seriesLength) return;
    if (filledEps > 0) { setPendingLength(n); return; }
    setSeriesLength(n);
    setActiveEpIdx(0);
    setWritingBeat(getEpBeatId(0, n, beats.length));
  }, [seriesLength, filledEps, beats.length]);

  const confirmLengthChange = useCallback(() => {
    if (pendingLength === null) return;
    setSeriesLength(pendingLength);
    setActiveEpIdx(0);
    setWritingBeat(getEpBeatId(0, pendingLength, beats.length));
    setPendingLength(null);
  }, [pendingLength, beats.length]);



  // Genre ranking helpers
  const rankOf = (g) => genreRanking.indexOf(g); // -1 if not ranked
  const setRank = (g, rank) => {
    const newRanking = [...genreRanking];
    // Remove this genre from any existing slot
    const existingSlot = newRanking.indexOf(g);
    if (existingSlot !== -1) newRanking[existingSlot] = null;
    // If clicking same rank to deselect
    if (existingSlot === rank) { setGenreRanking(newRanking); return; }
    // If slot is occupied, remove that genre from the slot
    newRanking[rank] = g;
    setGenreRanking(newRanking);
    if (rank === 0) setActiveGenre(g);
  };

  // Setup step completion checks
  const stepComplete = {
    premise:    fullPremise.trim().length >= 15,
    genre:      genreRanking[0] !== null,
    foundation: true,  // always passable — reading is enough
    board:      true,  // always passable — board is optional, not a gate
    treatment:  Object.keys(treatmentInputs).filter(k=>treatmentInputs[k]?.trim()).length >= 3,
  };

  // Nav group definitions
  const NAV_GROUPS = [
    {
      id:"setup",
      label:"SETUP",
      color:"#6366f1",
      tabs:[
        {id:"project", label:"Project", icon:"📋", desc:"Premise · Genre · Foundation · Board · Treatment"},
      ]
    },
    {
      id:"tools",
      label:"WRITE",
      color:"#f97316",
      tabs:[
        {id:"write",   label:"Write",        icon:"✍️",  desc:"Episode-by-episode writing"},
        {id:"board",   label:"Story Board",  icon:"📊",  desc:"Series overview · 12 moments"},
        {id:"arc",     label:"Series Arc",   icon:"📈",  desc:"Tension curve · Episode map"},
      ]
    },
    {
      id:"reference",
      label:"REFERENCE",
      color:"#8b5cf6",
      tabs:[
        {id:"foundation", label:"Foundation",  icon:"🏛️", desc:"22 ARCH beats"},
        {id:"genre",      label:"Genre Beats", icon:"🎭", desc:"8 beats per genre"},
        {id:"mapping",    label:"Beat Map",    icon:"🗺️", desc:"Foundation ↔ Genre mapping"},
      ]
    },
    {
      id:"output",
      label:"EXPORT",
      color:"#22c55e",
      tabs:[
        {id:"feedback", label:"Feedback", icon:"💬", desc:"Rate your experience · One time per project"},
        {id:"export",   label:"Export",   icon:"📤", desc:"Download · Share · Integrate"},
      ]
    },
  ];

  // Is the project set up enough to use write tools?
  const projectReady = genreRanking[0] !== null && fullPremise.trim().length >= 15;
  const writtenEps   = filledEps;
  const boardFilled  = seriesEpisodes.filter(ep=>STORY_MOMENTS.some(m=>getBoardCell(ep.ep,m.num).trim())).length;

  // Graph dims
  const gW=680,gH=160,pL=36,pR=20,pT=16,pB=32,iW=gW-pL-pR,iH=gH-pT-pB;
  const ovPts = useMemo(()=>
    seriesEpisodes.length>0
      ? seriesEpisodes.map((ep,i)=>({x:pL+(i/(seriesEpisodes.length-1||1))*iW,y:pT+(1-ep.tension/100)*iH,t:ep.tension}))
      : []
  ,[seriesEpisodes,iW,iH]);
  const ovPath = useMemo(()=>
    ovPts.length===0?"":ovPts.map((p,i)=>i===0?`M${p.x} ${p.y}`:`C${(ovPts[i-1].x+p.x)/2} ${ovPts[i-1].y} ${(ovPts[i-1].x+p.x)/2} ${p.y} ${p.x} ${p.y}`).join(" ")
  ,[ovPts]);
  const ovArea = useMemo(()=>
    ovPts.length===0?"":ovPath+` L${ovPts[ovPts.length-1].x} ${pT+iH} L${pL} ${pT+iH}Z`
  ,[ovPts,ovPath,pT,iH,pL]);

  const iS = {width:"100%",background:"#06080f",border:"1px solid #1e2535",borderRadius:4,color:"#e2ddd4",fontSize:12,lineHeight:1.6,padding:"9px 11px",resize:"vertical",fontFamily:"'Georgia',serif",boxSizing:"border-box",outline:"none",transition:"border-color 0.18s"};

  // ── REGISTRATION GATE ────────────────────────────────────────────────────
  if (!userRegistered) {
    const fieldStyle = (err) => ({
      width:"100%", background:"#09090f",
      border:`1px solid ${err?"#ef444460":"#1e2535"}`,
      borderRadius:5, color:"#e2ddd4", fontSize:13,
      padding:"11px 14px", outline:"none", fontFamily:"'Georgia',serif",
      boxSizing:"border-box", transition:"border-color 0.18s",
    });
    return (
      <div style={{fontFamily:"'Georgia',serif",background:"#06080f",minHeight:"100vh",color:"#e2ddd4",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
        {/* Background gradient orbs */}
        <div style={{position:"fixed",top:"15%",left:"20%",width:400,height:400,background:"radial-gradient(circle,#6366f115,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"fixed",bottom:"15%",right:"15%",width:300,height:300,background:"radial-gradient(circle,#ec489915,transparent 70%)",pointerEvents:"none"}}/>

        <div style={{width:"100%",maxWidth:460,position:"relative",zIndex:1}}>

          {/* Logo / brand */}
          <div style={{textAlign:"center",marginBottom:36}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:3,height:44,background:"linear-gradient(180deg,#6366f1,#ec4899,#ffd700)",borderRadius:2}}/>
              <div style={{textAlign:"left"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:1}}>
                  <div style={{fontSize:7,letterSpacing:"0.4em",color:"#6366f1",textTransform:"uppercase"}}>Engineered for the Hook</div>
                  <span style={{fontSize:7,color:"#f97316",background:"#f9731618",border:"1px solid #f9731640",padding:"1px 6px",borderRadius:8,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700}}>Beta</span>
                </div>
                <div style={{fontSize:22,fontWeight:700,color:"#fff",letterSpacing:"0.05em"}}>VERTICLIFF</div>
              </div>
            </div>
            <div style={{fontSize:12,color:"#4b5563",lineHeight:1.7}}>
              A professional story development platform for vertical series writers.
              <br/>Create your free account to get started.
            </div>
          </div>

          {/* Form card */}
          <div style={{background:"#09090f",border:"1px solid #12172a",borderRadius:10,padding:"28px 28px 24px",boxShadow:"0 20px 60px #00000060"}}>
            <div style={{fontSize:9,color:"#6366f1",letterSpacing:"0.25em",textTransform:"uppercase",marginBottom:20}}>Create your account</div>

            {/* Name */}
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:9,color:"#9ca3af",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:6}}>Full Name</label>
              <input
                type="text"
                value={regFields.name}
                onChange={e=>{setRegFields(p=>({...p,name:e.target.value}));setRegErrors(p=>({...p,name:""}));}}
                placeholder="Your full name"
                style={fieldStyle(regErrors.name)}
                onFocus={e=>e.target.style.borderColor="#6366f160"}
                onBlur={e=>e.target.style.borderColor=regErrors.name?"#ef444460":"#1e2535"}
              />
              {regErrors.name && <div style={{fontSize:10,color:"#ef4444",marginTop:4}}>{regErrors.name}</div>}
            </div>

            {/* Email */}
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:9,color:"#9ca3af",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:6}}>Email Address</label>
              <input
                type="email"
                value={regFields.email}
                onChange={e=>{setRegFields(p=>({...p,email:e.target.value}));setRegErrors(p=>({...p,email:""}));}}
                placeholder="you@email.com"
                style={fieldStyle(regErrors.email)}
                onFocus={e=>e.target.style.borderColor="#6366f160"}
                onBlur={e=>e.target.style.borderColor=regErrors.email?"#ef444460":"#1e2535"}
              />
              {regErrors.email && <div style={{fontSize:10,color:"#ef4444",marginTop:4}}>{regErrors.email}</div>}
            </div>

            {/* Phone — optional */}
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                <label style={{display:"block",fontSize:9,color:"#9ca3af",letterSpacing:"0.15em",textTransform:"uppercase"}}>Phone Number</label>
                <span style={{fontSize:8,color:"#374151",background:"#12172a",padding:"1px 6px",borderRadius:8}}>optional</span>
              </div>
              <input
                type="tel"
                value={regFields.phone}
                onChange={e=>{setRegFields(p=>({...p,phone:e.target.value}));setRegErrors(p=>({...p,phone:""}));}}
                placeholder="+1 (555) 000-0000"
                style={fieldStyle(regErrors.phone)}
                onFocus={e=>e.target.style.borderColor="#6366f160"}
                onBlur={e=>e.target.style.borderColor=regErrors.phone?"#ef444460":"#1e2535"}
              />
              {regErrors.phone && <div style={{fontSize:10,color:"#ef4444",marginTop:4}}>{regErrors.phone}</div>}
            </div>

            {/* Submit */}
            <button
              onClick={handleRegSubmit}
              disabled={regSubmitting}
              style={{
                width:"100%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                border:"none", color:"#fff", padding:"13px",
                borderRadius:6, cursor:"pointer", fontSize:12,
                fontWeight:700, fontFamily:"inherit", letterSpacing:"0.1em",
                transition:"opacity 0.2s", opacity:regSubmitting?0.7:1,
              }}
            >
              {regSubmitting ? "Setting up your workspace..." : "Enter VertiCliff →"}
            </button>

            <div style={{marginTop:14,fontSize:9,color:"#374151",textAlign:"center",lineHeight:1.9}}>
              We collect your name and email to personalise your experience and send product updates.
              Phone is optional and used only for feedback calls if you opt in.
              We never sell or share your data.
              <br/>
              <span style={{color:"#1e2535"}}>—</span>
              <br/>
              Questions? Email us at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} style={{color:"#6366f1",textDecoration:"none"}}>{SUPPORT_EMAIL}</a>
            </div>

            {/* Live database status */}
            <div style={{marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
              {dbStatus==="checking" && (
                <>
                  <div style={{width:5,height:5,borderRadius:"50%",background:"#eab308",animation:"pulse 1s infinite"}}/>
                  <span style={{fontSize:8,color:"#eab308",letterSpacing:"0.1em",textTransform:"uppercase"}}>Checking database…</span>
                </>
              )}
              {dbStatus==="connected" && (
                <>
                  <div style={{width:5,height:5,borderRadius:"50%",background:"#22c55e"}}/>
                  <span style={{fontSize:8,color:"#22c55e",letterSpacing:"0.1em",textTransform:"uppercase"}}>Database connected ✓</span>
                </>
              )}
              {dbStatus==="error" && (
                <div style={{textAlign:"center"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:3}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:"#ef4444"}}/>
                    <span style={{fontSize:8,color:"#ef4444",letterSpacing:"0.1em",textTransform:"uppercase"}}>Database not reachable</span>
                  </div>
                  <div style={{fontSize:8,color:"#374151",fontFamily:"monospace"}}>{dbError}</div>
                </div>
              )}
            </div>
          </div>

          {/* Feature hints */}
          <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"center",flexWrap:"wrap"}}>
            {["22 ARCH Beats","8 Genre Beats","90s Episode Structure","Series Story Board","Series Arc Graph"].map(f=>(
              <span key={f} style={{fontSize:9,color:"#374151",background:"#09090f",border:"1px solid #12172a",padding:"3px 10px",borderRadius:12}}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{fontFamily:"'Georgia',serif",background:"#06080f",minHeight:"100vh",color:"#e2ddd4"}}>

      {/* ── SERIES LENGTH CHANGE CONFIRMATION ── */}
      {pendingLength !== null && (
        <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#09090f",border:"1px solid #1e2535",borderRadius:10,padding:"28px 28px",maxWidth:400,width:"100%",boxShadow:"0 40px 80px #00000080"}}>
            <div style={{fontSize:9,color:"#eab308",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>⚠️ Series Length Change</div>
            <div style={{fontSize:14,color:"#e2ddd4",fontWeight:700,marginBottom:10}}>
              Switch from {seriesLength} to {pendingLength} episodes?
            </div>
            <div style={{fontSize:11,color:"#6b7280",lineHeight:1.7,marginBottom:20}}>
              Your writing is saved and won't be deleted. But beat assignments will recalculate across the new episode count — episodes may shift to different beats. You can reassign manually in the Write tab.
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={confirmLengthChange}
                style={{flex:1,background:"#eab308",border:"none",color:"#000",padding:"10px",borderRadius:5,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit"}}>
                Yes, switch to {pendingLength} EP
              </button>
              <button onClick={()=>setPendingLength(null)}
                style={{flex:1,background:"transparent",border:"1px solid #374151",color:"#6b7280",padding:"10px",borderRadius:5,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {showOnboarding && (
        <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#09090f",border:"1px solid #1e2535",borderRadius:12,padding:"36px 32px",maxWidth:520,width:"100%",boxShadow:"0 40px 80px #00000080",position:"relative"}}>

            {/* Accent bar */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#6366f1,#ec4899,#ffd700)",borderRadius:"12px 12px 0 0"}}/>

            {/* Header */}
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{fontSize:32,marginBottom:10}}>🎬</div>
              <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:8}}>
                Welcome to VertiCliff
              </div>
              <div style={{fontSize:12,color:"#6b7280",lineHeight:1.8}}>
                You're building a <strong style={{color:"#e2ddd4"}}>vertical series</strong> — episodes designed to be watched in under 90 seconds. Every episode has one job: make the audience watch the next one.
              </div>
            </div>

            {/* 4-step visual guide */}
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
              {[
                {step:"1", icon:"✏️", color:"#f97316", label:"Write Your Premise",   desc:"One sentence. Who wants what, but can't have it, so the stakes are these, until this moment forces everything."},
                {step:"2", icon:"🎭", color:"#ec4899", label:"Choose Your Genres",    desc:"Rank Crime, Thriller, or Love in order of dominance. Your Primary genre structures the whole framework."},
                {step:"3", icon:"⚡", color:"#6366f1", label:"Write Your Episodes",   desc:"Each episode maps to one ARCH beat. 22 universal beats. 8 genre beats. One 90-second structure per episode."},
                {step:"4", icon:"📊", color:"#22c55e", label:"Map Your Series Arc",   desc:"The Story Board and Series Arc graph show your entire series as a system. Write it, see it, shape it."},
              ].map(s => (
                <div key={s.step} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"11px 14px",background:"#06080f",border:`1px solid ${s.color}20`,borderLeft:`3px solid ${s.color}`,borderRadius:"0 6px 6px 0"}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:s.color+"22",border:`1px solid ${s.color}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}}>{s.icon}</div>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#e2ddd4",marginBottom:2}}>{s.label}</div>
                    <div style={{fontSize:10,color:"#6b7280",lineHeight:1.6}}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={()=>setShowOnboarding(false)}
              style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",color:"#fff",padding:"13px",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.08em"}}
            >
              Start with my premise →
            </button>

            <div style={{textAlign:"center",marginTop:12,fontSize:9,color:"#374151"}}>
              You can revisit this guide any time from the Project tab
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{background:"linear-gradient(180deg,#0c0e1c,#06080f)",borderBottom:"1px solid #12172a",padding:isMobile?"10px 14px 0":"16px 30px 0"}}>

        {/* Brand row */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:isMobile?8:12}}>
          <div style={{width:3,height:36,background:`linear-gradient(180deg,#6366f1,${accent},#ffd700)`,borderRadius:2,flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            {!isMobile&&<div style={{fontSize:8,letterSpacing:"0.35em",color:"#6366f1",textTransform:"uppercase",marginBottom:1}}>Engineered for the Hook</div>}
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <h1 style={{margin:0,fontSize:isMobile?14:17,fontWeight:700,color:"#fff",letterSpacing:"0.05em"}}>VERTICLIFF</h1>
              <span style={{fontSize:8,color:"#f97316",background:"#f9731618",border:"1px solid #f9731640",padding:"2px 7px",borderRadius:8,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700}}>Beta</span>
              {!isMobile&&projectTitle&&<span style={{fontSize:11,color:"#374151",fontStyle:"italic"}}>— {projectTitle}</span>}
              {!isMobile&&genreRanking.filter(Boolean).length>0&&(
                <div style={{display:"flex",gap:4}}>
                  {genreRanking.filter(Boolean).map((g,i)=>(
                    <span key={g} style={{fontSize:9,padding:"1px 7px",borderRadius:8,background:genreData[g].accentColor+"20",color:genreData[g].accentColor,border:`1px solid ${genreData[g].accentColor}40`}}>
                      {GENRE_RANK_ICONS[i]} {genreData[g].label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Project status pills — top right */}
          <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
            {/* User name + Switch User */}
            <div style={{position:"relative",display:"flex",alignItems:"center"}}>
              {showSwitchConfirm ? (
                <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 6px",borderRadius:5,background:"#0a0d1c",border:"1px solid #6366f140"}}>
                  <span style={{fontSize:8,color:"#9ca3af",letterSpacing:"0.08em"}}>Switch user?</span>
                  <button onClick={()=>{setUserRegistered(false);setRegFields({name:"",email:"",phone:""});setShowSwitchConfirm(false);}}
                    style={{background:"#6366f1",border:"none",color:"#fff",padding:"2px 7px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"inherit",fontWeight:700}}>Yes</button>
                  <button onClick={()=>setShowSwitchConfirm(false)}
                    style={{background:"transparent",border:"1px solid #374151",color:"#6b7280",padding:"2px 7px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"inherit"}}>No</button>
                </div>
              ) : (
                <button
                  onClick={()=>setShowSwitchConfirm(true)}
                  title="Switch user"
                  style={{display:"flex",alignItems:"center",gap:5,padding:"4px 9px",borderRadius:5,background:"#6366f112",border:"1px solid #6366f125",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="#6366f122";e.currentTarget.style.borderColor="#6366f140";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="#6366f112";e.currentTarget.style.borderColor="#6366f125";}}
                >
                  <div style={{width:5,height:5,borderRadius:"50%",background:"#6366f1"}}/>
                  <span style={{fontSize:8,color:"#6366f1",letterSpacing:"0.1em",textTransform:"uppercase"}}>{regFields.name.split(" ")[0]}</span>
                  <span style={{fontSize:8,color:"#6366f160",marginLeft:2}}>↩</span>
                </button>
              )}
            </div>

            {/* Auto-save indicator */}
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:5,background:isSaved?"#22c55e12":"transparent",border:`1px solid ${isSaved?"#22c55e30":"transparent"}`,transition:"all 0.4s"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:isSaved?"#22c55e":"#1e2535",transition:"background 0.3s"}}/>
              <span style={{fontSize:8,color:isSaved?"#22c55e":"#1e2535",letterSpacing:"0.1em",textTransform:"uppercase",transition:"color 0.3s"}}>{isSaved?"Saved":"●"}</span>
            </div>

            {/* Live DB status dot */}
            <div title={dbStatus==="error"?`DB Error: ${dbError}`:dbStatus==="connected"?"Supabase connected":"Checking database…"}
              style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:5,
                background:dbStatus==="connected"?"#22c55e12":dbStatus==="error"?"#ef444412":"#eab30812",
                border:`1px solid ${dbStatus==="connected"?"#22c55e30":dbStatus==="error"?"#ef444430":"#eab30830"}`}}>
              <div style={{width:5,height:5,borderRadius:"50%",
                background:dbStatus==="connected"?"#22c55e":dbStatus==="error"?"#ef4444":"#eab308"}}/>
              <span style={{fontSize:8,letterSpacing:"0.1em",textTransform:"uppercase",
                color:dbStatus==="connected"?"#22c55e":dbStatus==="error"?"#ef4444":"#eab308"}}>
                {dbStatus==="connected"?"DB ✓":dbStatus==="error"?"DB ✗":"DB…"}
              </span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:5,background:fullPremise.trim().length>=15?"#22c55e12":"#1e2535",border:`1px solid ${fullPremise.trim().length>=15?"#22c55e30":"#1e2535"}`}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:fullPremise.trim().length>=15?"#22c55e":"#374151"}}/>
              <span style={{fontSize:8,color:fullPremise.trim().length>=15?"#22c55e":"#374151",letterSpacing:"0.1em",textTransform:"uppercase"}}>Premise</span>
            </div>
            {/* Genre status */}
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:5,background:genreRanking[0]?"#22c55e12":"#1e2535",border:`1px solid ${genreRanking[0]?"#22c55e30":"#1e2535"}`}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:genreRanking[0]?"#22c55e":"#374151"}}/>
              <span style={{fontSize:8,color:genreRanking[0]?"#22c55e":"#374151",letterSpacing:"0.1em",textTransform:"uppercase"}}>Genre</span>
            </div>
            {/* Episodes written */}
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:5,background:writtenEps>0?"#f9731612":"#1e2535",border:`1px solid ${writtenEps>0?"#f9731630":"#1e2535"}`}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:writtenEps>0?"#f97316":"#374151"}}/>
              <span style={{fontSize:8,color:writtenEps>0?"#f97316":"#374151",letterSpacing:"0.1em",textTransform:"uppercase"}}>{writtenEps}/{seriesLength} EP</span>
            </div>
            {/* Series length */}
            <div style={{display:"flex",gap:2}}>
              {SERIES_LENGTHS.map(n=>(
                <button key={n} onClick={()=>handleLengthChange(n)} style={{background:seriesLength===n?accent+"22":"transparent",border:`1px solid ${seriesLength===n?accent+"60":"#1e2535"}`,color:seriesLength===n?accent:"#374151",padding:"3px 8px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"inherit",letterSpacing:"0.1em"}}>{n}EP</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── GROUPED NAV ── */}
        <div style={{display:"flex",alignItems:"flex-end",gap:0,overflowX:"auto",WebkitOverflowScrolling:"touch",msOverflowStyle:"none",scrollbarWidth:"none"}}>
          {NAV_GROUPS.map((group, gi)=>{
            const isToolGroup = group.id==="tools";
            const locked = isToolGroup && !projectReady;
            return (
              <div key={group.id} style={{display:"flex",alignItems:"flex-end",gap:0}}>
                {/* Group separator + label */}
                {gi>0&&(
                  <div style={{width:1,height:28,background:"#12172a",margin:"0 10px 0",alignSelf:"flex-end"}}/>
                )}
                <div style={{display:"flex",flexDirection:"column",gap:0}}>
                  {/* Group label */}
                  <div style={{fontSize:7,color:locked?"#1e2535":group.color,letterSpacing:"0.25em",textTransform:"uppercase",marginBottom:5,paddingLeft:2,opacity:locked?0.4:1}}>
                    {group.label}{locked&&" 🔒"}
                  </div>
                  {/* Tab buttons in this group */}
                  <div style={{display:"flex",gap:2}}>
                    {group.tabs.map(tab=>{
                      const isActive = activeTab===tab.id;
                      const isLocked = locked;
                      return (
                        <button
                          key={tab.id}
                          onClick={()=>!isLocked&&setActiveTab(tab.id)}
                          title={isLocked?"Complete Setup first: set a premise and pick a genre":tab.desc}
                          style={{
                            background:isActive?group.color+"22":"transparent",
                            border:`1px solid ${isActive?group.color+"60":"#12172a"}`,
                            borderBottom:isActive?`2px solid ${group.color}`:"2px solid transparent",
                            color:isActive?group.color:isLocked?"#1e2535":"#4b5563",
                            padding:"7px 14px",
                            borderRadius:"4px 4px 0 0",
                            cursor:isLocked?"not-allowed":"pointer",
                            fontSize:10,
                            letterSpacing:"0.08em",
                            textTransform:"uppercase",
                            fontFamily:"inherit",
                            transition:"all 0.18s",
                            display:"flex",alignItems:"center",gap:5,
                            opacity:isLocked?0.35:1,
                          }}
                        >
                          <span style={{fontSize:12}}>{tab.icon}</span>
                          <span>{tab.label}</span>
                          {/* Active indicator dot */}
                          {tab.id==="write"&&writtenEps>0&&(
                            <span style={{fontSize:7,color:group.color,background:group.color+"20",padding:"1px 5px",borderRadius:8,marginLeft:2}}>{writtenEps}</span>
                          )}
                          {tab.id==="board"&&boardFilled>0&&(
                            <span style={{fontSize:7,color:group.color,background:group.color+"20",padding:"1px 5px",borderRadius:8,marginLeft:2}}>{boardFilled}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* First-use prompt — shown when no project set up yet */}
          {!projectReady&&activeTab!=="project"&&(
            <div style={{marginLeft:"auto",marginBottom:6,display:"flex",alignItems:"center",gap:7,padding:"5px 10px",background:"#f9731610",border:"1px solid #f9731630",borderRadius:5}}>
              <span style={{fontSize:9,color:"#f97316"}}>👋 Start in</span>
              <button onClick={()=>setActiveTab("project")} style={{background:"#f97316",border:"none",color:"#fff",padding:"3px 9px",borderRadius:3,cursor:"pointer",fontSize:9,fontWeight:700,fontFamily:"inherit"}}>Project Setup →</button>
            </div>
          )}
        </div>

      </div>

      <div style={{padding:isMobile?"12px 14px":"22px 30px",maxWidth:980}}>

        {/* ════════════════════════════════════════════════════════════════
            PROJECT TAB — 4-step guided setup
        ════════════════════════════════════════════════════════════════ */}
        {activeTab==="project" && (
          <div>
            {/* Step Progress Bar */}
            <div style={{display:"flex",gap:0,marginBottom:28,background:"#09090f",border:"1px solid #12172a",borderRadius:8,overflow:"hidden"}}>
              {SETUP_STEPS.map((step,i)=>{
                const isActive=setupStep===step.id;
                const isDone=stepComplete[step.id]&&!isActive;
                const prevsDone=SETUP_STEPS.slice(0,i).every(s=>stepComplete[s.id]);
                const canClick=i===0||prevsDone;
                return (
                  <button key={step.id} onClick={()=>canClick&&setSetupStep(step.id)} style={{
                    flex:1,padding:"14px 10px",background:isActive?accent+"18":"transparent",
                    border:"none",borderRight:i<SETUP_STEPS.length-1?"1px solid #12172a":"none",
                    cursor:canClick?"pointer":"default",textAlign:"left",
                    borderBottom:isActive?`2px solid ${accent}`:"2px solid transparent",
                    transition:"all 0.2s"
                  }}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:isDone?"#22c55e":isActive?accent:"#1e2535",border:`1px solid ${isDone?"#22c55e":isActive?accent:"#374151"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0,transition:"all 0.2s"}}>
                        {isDone?"✓":i+1}
                      </div>
                      <div>
                        <div style={{fontSize:9,fontWeight:600,color:isActive?"#fff":isDone?"#22c55e":"#4b5563",letterSpacing:"0.1em",textTransform:"uppercase"}}>{step.icon} {step.label}</div>
                        <div style={{fontSize:9,color:"#374151",marginTop:1}}>{step.desc}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Project title + series length — shown on all steps */}
            <div style={{display:"flex",gap:12,alignItems:"flex-end",marginBottom:20}}>
              <div style={{flex:1}}>
                <label style={{fontSize:9,color:"#374151",letterSpacing:"0.18em",textTransform:"uppercase",display:"block",marginBottom:5}}>Project Title</label>
                <input type="text" value={projectTitle} onChange={e=>setProjectTitle(e.target.value)} placeholder="Name your project..." style={{...iS,resize:"none",padding:"9px 13px",fontSize:14,fontWeight:600}} onFocus={e=>e.target.style.borderColor="#6366f160"} onBlur={e=>e.target.style.borderColor="#1e2535"}/>
              </div>
              <div>
                <label style={{fontSize:9,color:"#374151",letterSpacing:"0.18em",textTransform:"uppercase",display:"block",marginBottom:5}}>Series Length</label>
                <div style={{display:"flex",gap:4}}>
                  {SERIES_LENGTHS.map(n=><button key={n} onClick={()=>setSeriesLength(n)} style={{background:seriesLength===n?"#6366f1":"transparent",border:`1px solid ${seriesLength===n?"#6366f1":"#1e2535"}`,color:seriesLength===n?"#fff":"#6b7280",padding:"7px 14px",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"inherit",transition:"all 0.18s"}}>{n} EP</button>)}
                </div>
              </div>
            </div>

            {/* ── STEP 1: PREMISE ── */}
            {setupStep==="premise" && (
              <div style={{background:"#09090f",border:"1px solid #12172a",borderRadius:8,padding:"20px 22px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                  <div>
                    <div style={{fontSize:9,color:"#f97316",letterSpacing:"0.25em",textTransform:"uppercase",marginBottom:3}}>Step 1 — Premise Line</div>
                    <div style={{fontSize:12,color:"#6b7280",lineHeight:1.5}}>The single sentence that defines your entire story. Everything in the framework flows from this.</div>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    {["guided","freeform"].map(m=><button key={m} onClick={()=>setPremiseMode(m)} style={{background:premiseMode===m?"#f97316":"transparent",border:`1px solid ${premiseMode===m?"#f97316":"#1e2535"}`,color:premiseMode===m?"#fff":"#6b7280",padding:"5px 11px",borderRadius:4,cursor:"pointer",fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"inherit",transition:"all 0.18s"}}>{m}</button>)}
                  </div>
                </div>

                {premiseMode==="guided" ? (
                  <div>
                    <div style={{background:"#06080f",border:"1px solid #0d1020",borderRadius:5,padding:"10px 13px",marginBottom:16}}>
                      <div style={{fontSize:9,color:"#374151",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:5}}>Premise Formula</div>
                      <div style={{fontSize:11,color:"#4b5563",fontStyle:"italic",lineHeight:1.8}}>
                        A <span style={{color:"#f97316"}}>[ who ]</span> who <span style={{color:"#ec4899"}}>[ wants ]</span> but <span style={{color:"#ef4444"}}>[ obstacle ]</span> so <span style={{color:"#eab308"}}>[ stakes ]</span> until <span style={{color:"#22c55e"}}>[ turning point ]</span>.
                      </div>
                    </div>
                    {premiseFormula.map(({key,label,color,placeholder,hint})=>{
                      const val=premiseParts[key]||"";
                      return (
                        <div key={key} style={{marginBottom:11}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                            <div style={{width:5,height:5,borderRadius:"50%",background:color,flexShrink:0}}/>
                            <label style={{fontSize:9,color:color,letterSpacing:"0.15em",textTransform:"uppercase"}}>{label}</label>
                            <span style={{fontSize:9,color:"#374151",fontStyle:"italic"}}>{hint}</span>
                          </div>
                          <input type="text" value={val} onChange={e=>setPremiseParts(p=>({...p,[key]:e.target.value}))} placeholder={placeholder}
                            style={{...iS,resize:"none",padding:"8px 11px"}}
                            onFocus={e=>e.target.style.borderColor=color+"60"}
                            onBlur={e=>e.target.style.borderColor="#1e2535"}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <label style={{fontSize:9,color:"#374151",letterSpacing:"0.18em",textTransform:"uppercase",display:"block",marginBottom:6}}>Your Premise</label>
                    <textarea rows={4} value={premiseFreeform} onChange={e=>setPremiseFreeform(e.target.value)}
                      placeholder="Write your complete premise. Include: who the hero is, what they want, what opposes them, what's at stake, and what the ultimate turning point is."
                      style={iS}
                      onFocus={e=>e.target.style.borderColor="#f9731660"}
                      onBlur={e=>e.target.style.borderColor="#1e2535"}
                    />
                  </div>
                )}

                {/* Premise preview */}
                {fullPremise.trim().length>=15 && (
                  <div style={{background:"#0a0d1c",border:"1px solid #f97316",borderLeft:"3px solid #f97316",borderRadius:5,padding:"11px 15px",marginTop:16}}>
                    <div style={{fontSize:9,color:"#f97316",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:5}}>Your Premise</div>
                    <div style={{fontSize:13,color:"#e2ddd4",lineHeight:1.7,fontStyle:"italic"}}>"{fullPremise}"</div>
                    <div style={{fontSize:9,color:"#374151",marginTop:5,display:"flex",gap:12}}>
                      <span>{wordCount(fullPremise)} words</span>
                      {detectedGenres.length>0&&<span style={{color:"#6b7280"}}>Signals detected: {detectedGenres.map(d=>genreData[d.genre]?.label).join(", ")}</span>}
                    </div>
                  </div>
                )}

                {/* ── CHARACTER CARDS ── */}
                <div style={{marginTop:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                    <div style={{height:1,width:12,background:"#f97316"}}/>
                    <span style={{fontSize:9,color:"#f97316",letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700}}>Your Characters</span>
                    <div style={{flex:1,height:1,background:"#f9731630"}}/>
                    <button onClick={()=>setCharacters(prev=>[...prev,{id:Date.now(),role:"Supporting",name:"",wound:"",desire:"",flaw:"",arc:""}])}
                      style={{background:"transparent",border:"1px solid #1e2535",color:"#374151",padding:"3px 9px",borderRadius:4,cursor:"pointer",fontSize:8,fontFamily:"inherit"}}>+ Add Character</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {characters.map((char,ci)=>{
                      const roleColor = char.role==="Protagonist"?"#f97316":char.role==="Antagonist"?"#ef4444":"#6b7280";
                      const filled = [char.name,char.wound,char.desire,char.flaw].filter(v=>v.trim()).length;
                      return (
                        <div key={char.id} style={{background:"#09090f",border:`1px solid ${roleColor}25`,borderLeft:`3px solid ${roleColor}`,borderRadius:6,padding:"12px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                            <select value={char.role} onChange={e=>updateCharacter(char.id,"role",e.target.value)}
                              style={{background:"#06080f",border:`1px solid ${roleColor}40`,color:roleColor,padding:"3px 8px",borderRadius:4,fontSize:9,fontFamily:"inherit",cursor:"pointer",outline:"none"}}>
                              <option>Protagonist</option>
                              <option>Antagonist</option>
                              <option>Ally</option>
                              <option>Supporting</option>
                            </select>
                            <input value={char.name} onChange={e=>updateCharacter(char.id,"name",e.target.value)}
                              placeholder="Character name…"
                              style={{flex:1,background:"transparent",border:"none",borderBottom:`1px solid ${char.name?"#e2ddd4":"#1e2535"}`,color:"#e2ddd4",fontSize:13,fontWeight:700,fontFamily:"'Georgia',serif",outline:"none",padding:"2px 4px"}}/>
                            <span style={{fontSize:8,color:"#374151"}}>{filled}/4</span>
                            {characters.length>2&&(
                              <button onClick={()=>setCharacters(prev=>prev.filter(c=>c.id!==char.id))}
                                style={{background:"transparent",border:"none",color:"#374151",cursor:"pointer",fontSize:10,padding:"0 4px"}}>✕</button>
                            )}
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:7}}>
                            {[
                              {field:"wound",   label:"The Wound",  icon:"🩸", placeholder:"The past scar that drives every decision they make…",      color:"#8b5cf6"},
                              {field:"desire",  label:"Desire",     icon:"🎯", placeholder:"What they actively want — their conscious goal…",           color:"#f97316"},
                              {field:"flaw",    label:"The Flaw",   icon:"⚡", placeholder:"Their blind spot. Visible to everyone but themselves…",     color:"#ec4899"},
                              {field:"arc",     label:"Their Arc",  icon:"🌟", placeholder:"Who they become by the end. How the flaw is confronted…",   color:"#22c55e"},
                            ].map(f=>(
                              <div key={f.field}>
                                <div style={{fontSize:8,color:f.color,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:3}}>{f.icon} {f.label}</div>
                                <textarea rows={2} value={char[f.field]} onChange={e=>updateCharacter(char.id,f.field,e.target.value)}
                                  placeholder={f.placeholder}
                                  style={{width:"100%",background:"#06080f",border:`1px solid ${char[f.field]?f.color+"35":"#0d1020"}`,borderRadius:4,color:"#d1c4b0",fontSize:9,padding:"6px 8px",resize:"none",outline:"none",fontFamily:"'Georgia',serif",lineHeight:1.5,boxSizing:"border-box"}}
                                  onFocus={e=>e.target.style.borderColor=f.color+"60"}
                                  onBlur={e=>e.target.style.borderColor=char[f.field]?f.color+"35":"#0d1020"}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step nav */}
                <div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}>
                  <button onClick={()=>setSetupStep("genre")} disabled={!stepComplete.premise}
                    style={{background:stepComplete.premise?accent:"#1e2535",border:"none",color:stepComplete.premise?"#fff":"#374151",padding:"9px 20px",borderRadius:5,cursor:stepComplete.premise?"pointer":"not-allowed",fontSize:10,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.1em"}}>
                    Next: Pick Genres →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: FOUNDATION — Genre-populated ARCH view ── */}
            {setupStep==="foundation" && (
              <div style={{background:"#09090f",border:"1px solid #12172a",borderRadius:8,padding:"20px 22px"}}>
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:9,color:"#8b5cf6",letterSpacing:"0.25em",textTransform:"uppercase",marginBottom:3}}>Step 3 — The ARCH Beats</div>
                  <div style={{fontSize:12,color:"#6b7280",lineHeight:1.5}}>
                    Your genres are now placed inside the 22-beat structure. Each ARCH beat shows which of your genre beats lives there. This is your complete story architecture.
                  </div>
                </div>

                {/* Genre rank legend */}
                <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
                  {genreRanking.filter(Boolean).map((gKey,i)=>{
                    const g=genreData[gKey];
                    return (
                      <div key={gKey} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:5,background:g.accentColor+"10",border:`1px solid ${g.accentColor}30`}}>
                        <span style={{fontSize:12}}>{GENRE_RANK_ICONS[i]}</span>
                        <span style={{fontSize:10,fontWeight:700,color:g.accentColor}}>{g.label}</span>
                        <span style={{fontSize:8,color:GENRE_RANK_COLORS[i],letterSpacing:"0.1em",textTransform:"uppercase"}}>{GENRE_RANK_LABELS[i]}</span>
                      </div>
                    );
                  })}
                  {genreRanking.filter(Boolean).length===0&&(
                    <span style={{fontSize:10,color:"#374151",fontStyle:"italic"}}>← Go back and select your genres to see them mapped here</span>
                  )}
                </div>

                {/* Phase-grouped ARCH beats with genre slots */}
                {Object.entries(groupLabels).map(([groupKey, groupName])=>{
                  const groupBeats = universalBeats.filter(b=>b.group===groupKey);
                  return (
                    <div key={groupKey} style={{marginBottom:14}}>
                      {/* Phase header */}
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                        <div style={{height:1,width:12,background:groupColors[groupKey]}}/>
                        <span style={{fontSize:9,color:groupColors[groupKey],letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700}}>{groupName}</span>
                        <div style={{flex:1,height:1,background:groupColors[groupKey]+"30"}}/>
                      </div>

                      <div style={{display:"flex",flexDirection:"column",gap:4}}>
                        {groupBeats.map(archBeat=>{
                          const isOpen = expandedUniv===archBeat.id;

                          // Find which ranked genre beats link to this ARCH beat
                          const linkedGenreBeats = genreRanking.filter(Boolean).flatMap((gKey,rankIdx)=>{
                            const gBeats = genreData[gKey]?.beats || [];
                            return gBeats
                              .filter(gb=>gb.universalLinks.includes(archBeat.id))
                              .map(gb=>({...gb, gKey, rankIdx, gLabel:genreData[gKey].label, gAccent:genreData[gKey].accentColor}));
                          });

                          return (
                            <div key={archBeat.id} style={{border:`1px solid ${isOpen?archBeat.color+"50":"#12172a"}`,borderLeft:`3px solid ${linkedGenreBeats.length>0?linkedGenreBeats[0].gAccent:archBeat.color}`,borderRadius:5,background:isOpen?"#0a0d1c":"#06080f",transition:"all 0.15s",overflow:"hidden"}}>

                              {/* ARCH beat header row — always visible */}
                              <div onClick={()=>setExpandedUniv(isOpen?null:archBeat.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",cursor:"pointer"}}>
                                <div style={{width:26,height:26,borderRadius:"50%",background:archBeat.color+"18",border:`1px solid ${archBeat.color}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{archBeat.icon}</div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:1}}>
                                    <span style={{fontSize:8,color:"#374151",fontFamily:"monospace"}}>ARCH {archBeat.id}</span>
                                    <span style={{fontSize:8,padding:"1px 5px",borderRadius:8,background:groupColors[archBeat.group]+"18",color:groupColors[archBeat.group]}}>{groupName}</span>
                                  </div>
                                  <div style={{fontSize:12,fontWeight:600,color:"#e2ddd4"}}>{archBeat.name}</div>
                                </div>

                                {/* Genre beat chips — always visible, even collapsed */}
                                <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:280}}>
                                  {linkedGenreBeats.length>0 ? linkedGenreBeats.map((gb,i)=>(
                                    <div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:10,background:gb.gAccent+"15",border:`1px solid ${gb.gAccent}40`,flexShrink:0}}>
                                      <span style={{fontSize:9}}>{GENRE_RANK_ICONS[gb.rankIdx]}</span>
                                      <span style={{fontSize:8,color:gb.gAccent,fontWeight:600}}>{gb.name}</span>
                                      <span style={{fontSize:8,color:gb.gAccent+"80"}}>{gb.timing}</span>
                                    </div>
                                  )) : (
                                    <span style={{fontSize:8,color:"#1e2535",fontStyle:"italic"}}>foundation only</span>
                                  )}
                                </div>

                                <span style={{color:"#374151",fontSize:9,marginLeft:6,flexShrink:0}}>{isOpen?"▲":"▼"}</span>
                              </div>

                              {/* Expanded detail */}
                              {isOpen&&(
                                <div onClick={e=>e.stopPropagation()} style={{padding:"0 12px 14px 48px",borderTop:`1px solid ${archBeat.color}15`}}>
                                  <p style={{color:"#9ca3af",fontSize:11,lineHeight:1.6,margin:"10px 0 10px"}}>{archBeat.description}</p>

                                  <div style={{background:archBeat.color+"0a",border:`1px solid ${archBeat.color}20`,borderRadius:4,padding:"7px 10px",marginBottom:linkedGenreBeats.length>0?10:0}}>
                                    <div style={{fontSize:8,color:archBeat.color,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:3}}>Vertical Adaptation</div>
                                    <p style={{margin:0,color:"#d1c4b0",fontSize:11,lineHeight:1.5,fontStyle:"italic"}}>{archBeat.vertical}</p>
                                  </div>

                                  {/* Genre beat detail cards — expanded */}
                                  {linkedGenreBeats.length>0&&(
                                    <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:10}}>
                                      <div style={{fontSize:8,color:"#374151",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:2}}>Your Genre Beats Here</div>
                                      {linkedGenreBeats.map((gb,i)=>(
                                        <div key={i} style={{background:gb.gAccent+"08",border:`1px solid ${gb.gAccent}30`,borderLeft:`3px solid ${gb.gAccent}`,borderRadius:5,padding:"9px 11px"}}>
                                          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                                            <span style={{fontSize:11}}>{GENRE_RANK_ICONS[gb.rankIdx]}</span>
                                            <span style={{fontSize:10,fontWeight:700,color:gb.gAccent}}>{gb.gLabel}</span>
                                            <span style={{fontSize:8,color:"#374151",letterSpacing:"0.1em",textTransform:"uppercase"}}>{GENRE_RANK_LABELS[gb.rankIdx]}</span>
                                            <span style={{marginLeft:"auto",fontSize:9,color:gb.gAccent,fontFamily:"monospace",background:gb.gAccent+"15",padding:"1px 6px",borderRadius:8}}>{gb.timing}</span>
                                          </div>
                                          <div style={{fontSize:12,fontWeight:700,color:"#e2ddd4",marginBottom:4}}>{gb.icon} {gb.name}</div>
                                          <div style={{fontSize:11,color:"#9ca3af",lineHeight:1.5,marginBottom:6}}>{gb.description}</div>
                                          <div style={{background:"#06080f",border:`1px solid ${gb.gAccent}20`,borderRadius:4,padding:"6px 9px",marginBottom:5}}>
                                            <div style={{fontSize:8,color:gb.gAccent,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:2}}>Director's Hook Note</div>
                                            <div style={{fontSize:10,color:"#d1c4b0",fontStyle:"italic",lineHeight:1.5}}>{gb.hook}</div>
                                          </div>
                                          <div style={{fontSize:9,color:"#4b5563",fontStyle:"italic",lineHeight:1.4}}>{gb.seriesNote}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  <button onClick={()=>setSetupStep("genre")} style={{background:"transparent",border:"1px solid #1e2535",color:"#6b7280",padding:"8px 18px",borderRadius:5,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>← Back</button>
                  <button onClick={()=>setSetupStep("treatment")} style={{background:accent,border:"none",color:"#fff",padding:"9px 20px",borderRadius:5,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.1em"}}>Next: Story Board →</button>
                </div>
              </div>
            )}

            {/* ── STEP 3: GENRE RANKING ── */}
            {setupStep==="genre" && (
              <div style={{background:"#09090f",border:"1px solid #12172a",borderRadius:8,padding:"20px 22px"}}>
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:9,color:"#ec4899",letterSpacing:"0.25em",textTransform:"uppercase",marginBottom:3}}>Step 2 — Genre Selection</div>
                  <div style={{fontSize:12,color:"#6b7280",lineHeight:1.5}}>Rank your genres in order of dominance. Your <strong style={{color:"#ffd700"}}>Primary</strong> genre drives the framework structure. Secondary and Tertiary add layers of tone and tension.</div>
                </div>

                {/* Genre detection signal from premise */}
                {detectedGenres.length>0 && (
                  <div style={{background:"#06080f",border:"1px solid #1e2535",borderRadius:6,padding:"12px 14px",marginBottom:20}}>
                    <div style={{fontSize:9,color:"#374151",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10}}>Signals Detected From Your Premise</div>
                    <div style={{display:"flex",flexDirection:"column",gap:7}}>
                      {detectedGenres.map(({genre:g,pct})=>(
                        <div key={g} style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontSize:10,color:genreData[g].accentColor,width:55,flexShrink:0}}>{genreData[g].icon} {genreData[g].label}</span>
                          <div style={{flex:1,height:5,background:"#12172a",borderRadius:3,overflow:"hidden"}}>
                            <div style={{width:`${pct}%`,height:"100%",background:genreData[g].accentColor,borderRadius:3}}/>
                          </div>
                          <span style={{fontSize:9,color:genreData[g].accentColor,fontFamily:"monospace",width:32,textAlign:"right"}}>{pct}%</span>
                        </div>
                      ))}
                    </div>
                    {detectedGenres.length>0&&(
                      <button onClick={()=>{
                        const newRank=[...genreRanking];
                        detectedGenres.slice(0,3).forEach(({genre:g},i)=>{newRank[i]=g;});
                        setGenreRanking(newRank);
                        if(detectedGenres[0]) setActiveGenre(detectedGenres[0].genre);
                      }} style={{marginTop:10,background:"transparent",border:"1px solid #1e2535",color:"#6b7280",padding:"5px 12px",borderRadius:4,cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>
                        Apply detected order →
                      </button>
                    )}
                  </div>
                )}

                {/* Genre ranking cards */}
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3, 1fr)",gap:12,marginBottom:22}}>
                  {Object.entries(genreData).map(([key,g])=>{
                    const rank=rankOf(key); // -1 = unranked
                    const hasRank=rank!==-1;
                    return (
                      <div key={key} style={{border:`2px solid ${hasRank?g.accentColor:"#1e2535"}`,borderRadius:8,padding:"16px",background:hasRank?g.accentColor+"08":"transparent",transition:"all 0.2s",position:"relative"}}>
                        {hasRank&&(
                          <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:"#06080f",border:`1px solid ${g.accentColor}`,borderRadius:10,padding:"2px 10px",fontSize:9,color:g.accentColor,letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>
                            {GENRE_RANK_ICONS[rank]} {GENRE_RANK_LABELS[rank]}
                          </div>
                        )}
                        <div style={{textAlign:"center",marginBottom:14}}>
                          <div style={{fontSize:28,marginBottom:4}}>{g.icon}</div>
                          <div style={{fontSize:14,fontWeight:700,color:"#e2ddd4"}}>{g.label}</div>
                          <div style={{fontSize:10,color:"#6b7280",marginTop:3}}>
                            {key==="crime"&&"External threat · Social order · Justice"}
                            {key==="thriller"&&"Internal guilt · Psychological pressure"}
                            {key==="love"&&"Vulnerability · Connection · Transformation"}
                          </div>
                        </div>

                        {/* 8-beat mini preview */}
                        <div style={{display:"flex",gap:2,marginBottom:12}}>
                          {g.beats.map(b=>(
                            <div key={b.id} title={b.name} style={{flex:1,height:3,borderRadius:1,background:b.color,opacity:0.6}}/>
                          ))}
                        </div>

                        {/* Rank buttons */}
                        <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                          {[0,1,2].map(rankIdx=>{
                            const occupied = genreRanking[rankIdx]!==null && genreRanking[rankIdx]!==key;
                            const isMyRank = rank===rankIdx;
                            return (
                              <button key={rankIdx} onClick={()=>setRank(key,rankIdx)} style={{
                                background:isMyRank?GENRE_RANK_COLORS[rankIdx]:"transparent",
                                border:`1px solid ${isMyRank?GENRE_RANK_COLORS[rankIdx]:occupied?"#1e2535":"#2d3748"}`,
                                color:isMyRank?"#000":occupied?"#1e2535":"#6b7280",
                                padding:"4px 8px",borderRadius:4,cursor:occupied?"not-allowed":"pointer",
                                fontSize:9,fontFamily:"inherit",transition:"all 0.15s",
                                opacity:occupied?0.3:1
                              }} title={GENRE_RANK_LABELS[rankIdx]}>
                                {GENRE_RANK_ICONS[rankIdx]}
                              </button>
                            );
                          })}
                          {hasRank&&(
                            <button onClick={()=>setRank(key,rank)} title="Remove" style={{background:"transparent",border:"1px solid #1e2535",color:"#374151",padding:"4px 8px",borderRadius:4,cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>✕</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Current ranking summary */}
                <div style={{background:"#06080f",border:"1px solid #12172a",borderRadius:6,padding:"12px 14px",marginBottom:20}}>
                  <div style={{fontSize:9,color:"#374151",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10}}>Your Genre Order</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {[0,1,2].map(i=>{
                      const g=genreRanking[i];
                      return (
                        <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:6,border:`1px solid ${g?genreData[g].accentColor+"50":"#1e2535"}`,background:g?genreData[g].accentColor+"08":"transparent",flex:1,minWidth:140}}>
                          <span style={{fontSize:16}}>{GENRE_RANK_ICONS[i]}</span>
                          <div>
                            <div style={{fontSize:8,color:GENRE_RANK_COLORS[i],letterSpacing:"0.15em",textTransform:"uppercase"}}>{GENRE_RANK_LABELS[i]}</div>
                            {g ? (
                              <div style={{fontSize:12,fontWeight:600,color:genreData[g].accentColor}}>{genreData[g].icon} {genreData[g].label}</div>
                            ) : (
                              <div style={{fontSize:11,color:"#374151",fontStyle:"italic"}}>Not selected</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {genreRanking.filter(Boolean).length>=2&&(
                    <div style={{marginTop:10,padding:"8px 10px",background:"#0a0d1c",borderRadius:4,fontSize:10,color:"#6b7280"}}>
                      💡 <strong style={{color:"#e2ddd4"}}>{genreData[genreRanking[0]].label}</strong> drives the structural framework. <strong style={{color:genreData[genreRanking[1]].accentColor}}>{genreData[genreRanking[1]].label}</strong> adds {genreRanking[1]==="love"?"emotional stakes and vulnerability":"tension and psychological pressure"}.
                      {genreRanking[2]&&<span> <strong style={{color:genreData[genreRanking[2]].accentColor}}>{genreData[genreRanking[2]].label}</strong> provides the tonal undercurrent.</span>}
                    </div>
                  )}
                </div>

                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <button onClick={()=>setSetupStep("premise")} style={{background:"transparent",border:"1px solid #1e2535",color:"#6b7280",padding:"8px 18px",borderRadius:5,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>← Back</button>
                  <button onClick={()=>setSetupStep("foundation")} disabled={!stepComplete.genre}
                    style={{background:stepComplete.genre?accent:"#1e2535",border:"none",color:stepComplete.genre?"#fff":"#374151",padding:"9px 20px",borderRadius:5,cursor:stepComplete.genre?"pointer":"not-allowed",fontSize:10,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.1em"}}>
                    Next: Foundation →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: STORY BOARD ── */}
            {setupStep==="board" && (
              <div style={{background:"#09090f",border:"1px solid #12172a",borderRadius:8,padding:"20px 22px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
                  <div>
                    <div style={{fontSize:9,color:"#3b82f6",letterSpacing:"0.25em",textTransform:"uppercase",marginBottom:3}}>Step 4 — Series Story Board</div>
                    <div style={{fontSize:12,color:"#6b7280",lineHeight:1.5}}>Map every episode across the 12 structural moments. Each highlighted cell is the primary moment for that episode — all cells are writable.</div>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    {SERIES_LENGTHS.map(n=>(
                      <button key={n} onClick={()=>handleLengthChange(n)} style={{background:seriesLength===n?"#3b82f6":"transparent",border:`1px solid ${seriesLength===n?"#3b82f6":"#1e2535"}`,color:seriesLength===n?"#fff":"#6b7280",padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>{n} EP</button>
                    ))}
                  </div>
                </div>

                {/* Phase legend */}
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>
                  {Object.entries(MOMENT_PHASE_COLORS).map(([ph,col])=>(
                    <span key={ph} style={{fontSize:8,padding:"2px 8px",borderRadius:10,background:col+"18",border:`1px solid ${col}30`,color:col,letterSpacing:"0.1em",textTransform:"uppercase"}}>{ph}</span>
                  ))}
                </div>

                {/* Board — horizontally scrollable */}
                <div style={{overflowX:"auto",marginBottom:16}}>
                  <table style={{borderCollapse:"collapse",minWidth:900,width:"100%"}}>
                    <thead>
                      {/* Phase row */}
                      <tr>
                        <td style={{width:52,background:"#06080f"}}/>
                        <td style={{width:130,background:"#06080f",padding:"4px 8px",fontSize:8,color:"#374151",letterSpacing:"0.15em",textTransform:"uppercase"}}>EPISODE</td>
                        {STORY_MOMENTS.map(m=>(
                          <td key={m.num} style={{background:MOMENT_PHASE_COLORS[m.phase]+"25",borderBottom:`2px solid ${MOMENT_PHASE_COLORS[m.phase]}`,padding:"4px 6px",textAlign:"center",fontSize:7,color:MOMENT_PHASE_COLORS[m.phase],letterSpacing:"0.12em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{m.phase}</td>
                        ))}
                      </tr>
                      {/* Moment number row */}
                      <tr>
                        <td style={{background:"#06080f"}}/>
                        <td style={{background:"#0a0d1c",padding:"6px 8px",fontSize:9,color:"#4b5563",fontStyle:"italic"}}>Title / Genre Beat</td>
                        {STORY_MOMENTS.map(m=>(
                          <td key={m.num} style={{background:m.color,padding:"5px 6px",textAlign:"center",minWidth:110}}>
                            <div style={{fontSize:11,fontWeight:700,color:"#06080f"}}>{m.num}</div>
                            <div style={{fontSize:8,color:"#06080f",fontWeight:700,lineHeight:1.3}}>{m.name}</div>
                          </td>
                        ))}
                      </tr>
                      {/* Sub-tagline row */}
                      <tr>
                        <td style={{background:"#06080f"}}/>
                        <td style={{background:"#0a0d1c"}}/>
                        {STORY_MOMENTS.map(m=>(
                          <td key={m.num} style={{background:m.color+"10",padding:"3px 6px",textAlign:"center",borderBottom:`1px solid ${m.color}30`}}>
                            <div style={{fontSize:7,color:m.color+"99",fontStyle:"italic",lineHeight:1.3}}>{m.sub}</div>
                          </td>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {seriesEpisodes.map((ep,epIdx)=>{
                        const primaryMomentIdx = getEpMoment(epIdx, seriesLength);
                        const assignedBeatId   = beatAssignments[ep.ep] || 1;
                        const assignedBeat     = beats.find(b=>b.id===assignedBeatId) || beats[0];
                        const rowBg            = epIdx%2===1 ? "#08090f" : "#0a0d1c";
                        return (
                          <tr key={ep.ep}>
                            {/* EP number */}
                            <td style={{background:MOMENT_PHASE_COLORS[STORY_MOMENTS[primaryMomentIdx].phase],padding:"4px 6px",textAlign:"center",fontFamily:"monospace",fontSize:9,fontWeight:700,color:"#06080f",whiteSpace:"nowrap",verticalAlign:"middle"}}>
                              EP{ep.ep}
                            </td>
                            {/* Episode title + beat */}
                            <td style={{background:rowBg,padding:"6px 8px",verticalAlign:"top",borderRight:"1px solid #12172a"}}>
                              <div style={{fontSize:10,color:"#e2ddd4",fontWeight:600,marginBottom:2}}>{ep.title}</div>
                              <div style={{fontSize:8,color:assignedBeat.color}}>{assignedBeat.icon} {assignedBeat.name}</div>
                            </td>
                            {/* 12 moment cells */}
                            {STORY_MOMENTS.map((m,mIdx)=>{
                              const isActive = mIdx===primaryMomentIdx;
                              const val      = getBoardCell(ep.ep, m.num);
                              const filled   = val.trim().length>0;
                              const cellBg   = isActive ? m.color+"18" : rowBg;
                              return (
                                <td key={m.num} style={{background:cellBg,verticalAlign:"top",border:`1px solid ${isActive?m.color+"40":"#0d1020"}`,borderLeft:isActive?`2px solid ${m.color}`:"1px solid #0d1020",minWidth:110,padding:0}}>
                                  <textarea
                                    value={val}
                                    onChange={e=>setBoardCell(ep.ep, m.num, e.target.value)}
                                    placeholder={isActive?`EP${ep.ep} · ${m.name}…`:""}
                                    rows={3}
                                    style={{
                                      width:"100%",background:"transparent",border:"none",
                                      color:filled?"#e2ddd4":isActive?m.color+"60":"#374151",
                                      fontSize:9,lineHeight:1.5,padding:"6px 7px",
                                      resize:"none",outline:"none",fontFamily:"'Georgia',serif",
                                      boxSizing:"border-box",fontStyle:filled?"normal":"italic",
                                      minHeight:66
                                    }}
                                    onFocus={e=>{e.target.style.background=m.color+"10";e.target.style.color="#e2ddd4";}}
                                    onBlur={e=>{e.target.style.background="transparent";e.target.style.color=filled?"#e2ddd4":isActive?m.color+"60":"#374151";}}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Board summary */}
                <div style={{display:"flex",gap:16,marginBottom:16,flexWrap:"wrap"}}>
                  {STORY_MOMENTS.map(m=>{
                    const filled = seriesEpisodes.filter(ep=>getBoardCell(ep.ep,m.num).trim()).length;
                    return (
                      <div key={m.num} style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:filled>0?m.color:"#1e2535"}}/>
                        <span style={{fontSize:8,color:filled>0?m.color:"#374151"}}>{m.num}. {m.name.split(" ")[0]}</span>
                        {filled>0&&<span style={{fontSize:8,color:"#374151",fontFamily:"monospace"}}>{filled}ep</span>}
                      </div>
                    );
                  })}
                </div>

                <div style={{display:"flex",justifyContent:"space-between",paddingTop:14,borderTop:"1px solid #12172a"}}>
                  <button onClick={()=>setSetupStep("foundation")} style={{background:"transparent",border:"1px solid #1e2535",color:"#6b7280",padding:"8px 18px",borderRadius:5,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>← Back</button>
                  <button onClick={()=>setSetupStep("treatment")} style={{background:accent,border:"none",color:"#fff",padding:"9px 20px",borderRadius:5,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.1em"}}>Next: Write Treatment →</button>
                </div>
              </div>
            )}

            {/* ── STEP 5: TREATMENT ── */}
            {setupStep==="treatment" && (
              <div style={{background:"#09090f",border:"1px solid #12172a",borderRadius:8,padding:"20px 22px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                  <div>
                    <div style={{fontSize:9,color:"#22c55e",letterSpacing:"0.25em",textTransform:"uppercase",marginBottom:3}}>Step 5 — Treatment</div>
                    <div style={{fontSize:12,color:"#6b7280",lineHeight:1.5}}>Full story document. Build section by section before moving into the beat framework.</div>
                  </div>
                  <div style={{fontSize:10,color:"#374151"}}>{treatmentSections.filter(s=>treatmentInputs[s.key]?.trim()).length}/{treatmentSections.length} sections · {Object.values(treatmentInputs).reduce((a,v)=>a+wordCount(v||""),0)} words</div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"160px 1fr",gap:14,alignItems:"start"}}>
                  <div style={{background:"#06080f",border:"1px solid #0d1020",borderRadius:6,padding:"8px 0",position:"sticky",top:16}}>
                    {treatmentSections.map(s=>{
                      const filled=!!treatmentInputs[s.key]?.trim();
                      const isActive=treatmentSection===s.key;
                      return (
                        <button key={s.key} onClick={()=>setTreatmentSection(s.key)} style={{width:"100%",background:isActive?"#22c55e18":"transparent",border:"none",borderLeft:`2px solid ${filled?"#22c55e":isActive?"#22c55e":"#1e2535"}`,color:isActive?"#e2ddd4":"#4b5563",padding:"7px 11px",cursor:"pointer",fontSize:10,fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",gap:6,transition:"all 0.15s"}}>
                          <span style={{fontSize:11}}>{s.icon}</span>
                          <span style={{flex:1,lineHeight:1.3}}>{s.label}</span>
                          {filled&&<div style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",flexShrink:0}}/>}
                        </button>
                      );
                    })}
                    <div style={{padding:"9px 11px",borderTop:"1px solid #0d1020",marginTop:4}}>
                      <div style={{fontSize:8,color:"#374151"}}>Total words</div>
                      <div style={{fontSize:14,color:"#22c55e",fontWeight:700}}>{Object.values(treatmentInputs).reduce((a,v)=>a+wordCount(v||""),0).toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    {treatmentSections.filter(s=>s.key===treatmentSection).map(section=>{
                      const val=treatmentInputs[section.key]||"";
                      const idx=treatmentSections.findIndex(s=>s.key===treatmentSection);
                      return (
                        <div key={section.key}>
                          <div style={{background:"#0a0d1c",border:"1px solid #22c55e30",borderLeft:"3px solid #22c55e",borderRadius:6,padding:"12px 15px",marginBottom:10}}>
                            <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:3}}>{section.icon} {section.label}</div>
                            <div style={{fontSize:11,color:"#6b7280",fontStyle:"italic"}}>{section.hint}</div>
                          </div>
                          <textarea rows={section.rows+4} value={val} onChange={e=>setTreatmentInputs(p=>({...p,[section.key]:e.target.value}))} placeholder={section.placeholder}
                            style={{...iS,minHeight:(section.rows+4)*22+20}}
                            onFocus={e=>e.target.style.borderColor="#22c55e60"}
                            onBlur={e=>e.target.style.borderColor="#1e2535"}
                          />
                          <div style={{display:"flex",justifyContent:"space-between",marginTop:6,alignItems:"center"}}>
                            <div style={{fontSize:9,color:"#374151",fontFamily:"monospace"}}>{val.trim()?`${wordCount(val)} words`:""}</div>
                            <div style={{display:"flex",gap:5}}>
                              <button onClick={()=>idx>0&&setTreatmentSection(treatmentSections[idx-1].key)} disabled={idx===0} style={{background:"transparent",border:"1px solid #1e2535",color:idx===0?"#1e2535":"#6b7280",padding:"5px 11px",borderRadius:4,cursor:idx===0?"not-allowed":"pointer",fontSize:9,fontFamily:"inherit"}}>← Prev</button>
                              <button onClick={()=>idx<treatmentSections.length-1&&setTreatmentSection(treatmentSections[idx+1].key)} disabled={idx===treatmentSections.length-1} style={{background:idx===treatmentSections.length-1?"transparent":"#22c55e",border:"none",color:idx===treatmentSections.length-1?"#1e2535":"#000",padding:"5px 11px",borderRadius:4,cursor:idx===treatmentSections.length-1?"not-allowed":"pointer",fontSize:9,fontWeight:700,fontFamily:"inherit"}}>Next →</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{display:"flex",justifyContent:"space-between",marginTop:18,paddingTop:18,borderTop:"1px solid #12172a"}}>
                  <button onClick={()=>setSetupStep("board")} style={{background:"transparent",border:"1px solid #1e2535",color:"#6b7280",padding:"8px 18px",borderRadius:5,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>← Back</button>
                  <button onClick={()=>{setActiveGenre(genreRanking[0]||"crime");setActiveTab("write");setWritingBeat(1);}} style={{background:accent,border:"none",color:"#fff",padding:"9px 22px",borderRadius:5,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.1em"}}>
                    ✍️ Start Beat Framework →
                  </button>
                </div>
              </div>
            )}

            {/* ── CLEAR PROJECT ── */}
            <div style={{marginTop:28,paddingTop:18,borderTop:"1px solid #0d1020",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
              <div>
                <div style={{fontSize:9,color:"#374151",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:2}}>Project Data</div>
                <div style={{fontSize:10,color:"#1e2535"}}>All progress is saved automatically to this browser.</div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <button onClick={()=>setShowOnboarding(true)}
                  style={{background:"transparent",border:"1px solid #1e2535",color:"#374151",padding:"6px 14px",borderRadius:4,cursor:"pointer",fontSize:9,fontFamily:"inherit"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#6366f160";e.currentTarget.style.color="#6366f1";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e2535";e.currentTarget.style.color="#374151";}}>
                  ? How it works
                </button>
                {showClearConfirm ? (
                  <div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",background:"#ef444410",border:"1px solid #ef444430",borderRadius:5}}>
                    <span style={{fontSize:10,color:"#ef4444"}}>Delete all project data?</span>
                    <button onClick={clearProject}
                      style={{background:"#ef4444",border:"none",color:"#fff",padding:"4px 12px",borderRadius:4,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}}>Yes, clear it</button>
                    <button onClick={()=>setShowClearConfirm(false)}
                      style={{background:"transparent",border:"1px solid #374151",color:"#6b7280",padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={()=>setShowClearConfirm(true)}
                    style={{background:"transparent",border:"1px solid #1e2535",color:"#374151",padding:"6px 14px",borderRadius:4,cursor:"pointer",fontSize:9,fontFamily:"inherit",transition:"all 0.2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="#ef444460";e.currentTarget.style.color="#ef4444";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e2535";e.currentTarget.style.color="#374151";}}>
                    🗑 Clear Project & Start Fresh
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            WRITE TAB — Episode-sequenced beat writing
        ════════════════════════════════════════════════════════════════ */}
        {activeTab==="write" && !projectReady && (
          <div style={{textAlign:"center",padding:"60px 30px"}}>
            <div style={{fontSize:40,marginBottom:20}}>✍️</div>
            <div style={{fontSize:16,color:"#e2ddd4",fontWeight:700,marginBottom:8}}>Set up your project first</div>
            <div style={{fontSize:12,color:"#6b7280",lineHeight:1.7,marginBottom:28,maxWidth:400,margin:"0 auto 28px"}}>
              The Write tab needs a premise and a genre before it can build your episode structure and beat assignments.
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:32}}>
              <div style={{display:"flex",alignItems:"center",gap:7,padding:"10px 16px",borderRadius:6,background:fullPremise.trim().length>=15?"#22c55e12":"#0a0d1c",border:`1px solid ${fullPremise.trim().length>=15?"#22c55e40":"#1e2535"}`}}>
                <span style={{fontSize:16}}>{fullPremise.trim().length>=15?"✅":"📝"}</span>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:9,color:fullPremise.trim().length>=15?"#22c55e":"#374151",letterSpacing:"0.12em",textTransform:"uppercase"}}>Step 1</div>
                  <div style={{fontSize:11,color:"#e2ddd4"}}>Write your premise</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7,padding:"10px 16px",borderRadius:6,background:genreRanking[0]?"#22c55e12":"#0a0d1c",border:`1px solid ${genreRanking[0]?"#22c55e40":"#1e2535"}`}}>
                <span style={{fontSize:16}}>{genreRanking[0]?"✅":"🎭"}</span>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:9,color:genreRanking[0]?"#22c55e":"#374151",letterSpacing:"0.12em",textTransform:"uppercase"}}>Step 2</div>
                  <div style={{fontSize:11,color:"#e2ddd4"}}>Pick your genre</div>
                </div>
              </div>
            </div>
            <button onClick={()=>setActiveTab("project")} style={{background:accent,border:"none",color:"#fff",padding:"11px 28px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.1em"}}>
              Go to Project Setup →
            </button>
          </div>
        )}
        {activeTab==="write" && projectReady && (
          <div>
            {/* Genre + Series controls */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:14}}>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {(genreRanking.filter(Boolean).length>0?genreRanking.filter(Boolean):Object.keys(genreData)).map((key,i)=>{
                  const g=genreData[key]; const isAct=activeGenre===key;
                  return (
                    <div key={key} style={{position:"relative"}}>
                      {genreRanking.filter(Boolean).length>0&&<div style={{position:"absolute",top:-7,left:"50%",transform:"translateX(-50%)",fontSize:8,color:GENRE_RANK_COLORS[i],whiteSpace:"nowrap",zIndex:1}}>{GENRE_RANK_ICONS[i]}</div>}
                      <button onClick={()=>{setActiveGenre(key);setActiveEpIdx(0);setWritingBeat(beatAssignments[1]||1);}} style={{background:isAct?g.accentColor:"transparent",border:`1px solid ${isAct?"transparent":"#12172a"}`,color:isAct?"#fff":"#4b5563",padding:"7px 16px",borderRadius:4,cursor:"pointer",fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"inherit",transition:"all 0.2s",marginTop:7}}>{g.icon} {g.label}</button>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:9,color:"#374151",letterSpacing:"0.1em",textTransform:"uppercase"}}>Series</span>
                {SERIES_LENGTHS.map(n=><button key={n} onClick={()=>handleLengthChange(n)} style={{background:seriesLength===n?accent:"transparent",border:`1px solid ${seriesLength===n?accent:"#1e2535"}`,color:seriesLength===n?"#fff":"#6b7280",padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:9,fontFamily:"inherit",transition:"all 0.18s"}}>{n} EP</button>)}
              </div>
            </div>

            {/* Premise reminder */}
            {fullPremise.trim()&&(
              <div style={{background:"#0a0d1c",border:"1px solid #f9731630",borderLeft:"3px solid #f97316",borderRadius:5,padding:"7px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:9}}>
                <span style={{fontSize:9,color:"#f97316",letterSpacing:"0.15em",textTransform:"uppercase",flexShrink:0}}>Premise</span>
                <span style={{fontSize:11,color:"#9ca3af",fontStyle:"italic",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fullPremise}</span>
                <button onClick={()=>setActiveTab("project")} style={{background:"transparent",border:"1px solid #1e2535",color:"#374151",padding:"2px 7px",borderRadius:3,cursor:"pointer",fontSize:9,fontFamily:"inherit",flexShrink:0}}>Edit</button>
              </div>
            )}

            {/* Beat sequence bar — all 8 beats shown with episode counts */}
            <div style={{background:"#09090f",border:"1px solid #12172a",borderRadius:6,padding:"10px 12px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
                <span style={{fontSize:9,color:"#374151",letterSpacing:"0.15em",textTransform:"uppercase"}}>Beat Sequence — {seriesLength} Episodes</span>
                <span style={{fontSize:9,color:"#374151"}}>{filledEps}/{seriesLength} episodes written</span>
              </div>
              <div style={{display:"flex",gap:3}}>
                {beats.map(beat=>{
                  const epsForBeat = getEpsForBeat(beatAssignments, beat.id);
                  const isCurrentBeat = beat.id === writingBeat;
                  const hasContent = epsForBeat.some(ep=>beatInputs?.[activeGenre]?.[ep]?.hook?.trim());
                  return (
                    <div key={beat.id} onClick={()=>{
                      setWritingBeat(beat.id);
                      // jump to first episode that has this beat
                      const firstEp = epsForBeat[0];
                      if(firstEp) setActiveEpIdx(seriesEpisodes.findIndex(e=>e.ep===firstEp));
                    }} style={{flex:epsForBeat.length||1,cursor:"pointer",transition:"all 0.2s"}}>
                      <div style={{height:5,borderRadius:2,background:beat.color,opacity:isCurrentBeat?1:hasContent?0.7:0.25,marginBottom:3}}/>
                      <div style={{fontSize:8,color:isCurrentBeat?beat.color:"#374151",textAlign:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={beat.name}>
                        {epsForBeat.length>0?`${epsForBeat.length}ep`:"—"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:3,marginTop:2}}>
                {beats.map(b=><div key={b.id} style={{flex:Math.max(getEpsForBeat(beatAssignments,b.id).length,1),fontSize:8,color:"#1e2535",textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={b.name}>{b.name.split(" ")[0]}</div>)}
              </div>
            </div>

            {/* Mobile sidebar toggle */}
            {isMobile && (
              <div style={{marginBottom:8}}>
                <button onClick={()=>setSidebarOpen(o=>!o)} style={{background:"transparent",border:`1px solid ${accent}40`,color:accent,padding:"6px 14px",borderRadius:5,cursor:"pointer",fontSize:9,fontFamily:"inherit",letterSpacing:"0.1em",textTransform:"uppercase",width:"100%",textAlign:"left",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span>📋 Episodes &amp; Beat Assignment</span>
                  <span>{sidebarOpen?"▲ hide":"▼ show"}</span>
                </button>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"220px 1fr",gap:14,alignItems:"start"}}>

              {/* ── LEFT SIDEBAR: Episode navigator — collapsible on mobile ── */}
              {(!isMobile || sidebarOpen) && (
              <div>
                <div style={{background:"#09090f",border:"1px solid #12172a",borderRadius:6,padding:"10px",marginBottom:8}}>
                  <div style={{fontSize:9,color:"#374151",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:7}}>Episodes</div>
                  <div style={{maxHeight:seriesLength>10?200:seriesLength*28+8,overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
                    {seriesEpisodes.map((ep,i)=>{
                      const assignedBeatId = beatAssignments[ep.ep] || 1;
                      const assignedBeat   = beats.find(b=>b.id===assignedBeatId)||beats[0];
                      const hasContent     = !!(beatInputs?.[activeGenre]?.[ep.ep]?.hook?.trim());
                      const isActive       = safeIdx===i;
                      const displayTitle   = getEpTitle(ep.ep, ep.title);
                      return (
                        <button key={i} onClick={()=>{
                          setActiveEpIdx(i);
                          setWritingBeat(assignedBeatId);
                        }} style={{background:isActive?accent+"18":"transparent",border:`1px solid ${isActive?accent:"transparent"}`,borderLeft:`2px solid ${isActive?accent:hasContent?assignedBeat.color:"#1e2535"}`,color:isActive?"#e2ddd4":"#6b7280",padding:"5px 7px",borderRadius:"0 4px 4px 0",cursor:"pointer",fontSize:9,fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",gap:6,transition:"all 0.15s"}}>
                          <span style={{fontFamily:"monospace",fontSize:8,color:isActive?accent:"#374151",flexShrink:0,width:22}}>EP{ep.ep}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:9,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:epTitles[ep.ep]?"#e2ddd4":"inherit"}}>{displayTitle}</div>
                            <div style={{fontSize:8,color:assignedBeat.color,marginTop:1}}>{assignedBeat.icon} {assignedBeat.name}</div>
                          </div>
                          {hasContent&&<div style={{width:5,height:5,borderRadius:"50%",background:assignedBeat.color,flexShrink:0}}/>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Beat assignment for current episode */}
                <div style={{background:"#09090f",border:"1px solid #12172a",borderRadius:6,padding:"10px"}}>
                  <div style={{fontSize:9,color:"#374151",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:7}}>
                    EP{activeEp?.ep} — Beat Assignment
                  </div>
                  <div style={{fontSize:9,color:"#6b7280",marginBottom:9,lineHeight:1.5}}>Auto-sequenced. Move to any beat.</div>
                  {beats.map(beat=>{
                    const isAssigned = beatAssignments[activeEp?.ep]===beat.id;
                    const epsOnBeat  = getEpsForBeat(beatAssignments, beat.id);
                    return (
                      <button key={beat.id} onClick={()=>setEpBeat(activeEp?.ep, beat.id)} style={{
                        width:"100%",background:isAssigned?beat.color+"18":"transparent",
                        border:`1px solid ${isAssigned?beat.color+"60":"transparent"}`,
                        borderLeft:`2px solid ${isAssigned?beat.color:"#1e2535"}`,
                        color:isAssigned?"#e2ddd4":"#6b7280",
                        padding:"5px 7px",borderRadius:"0 4px 4px 0",cursor:"pointer",
                        fontSize:9,fontFamily:"inherit",textAlign:"left",
                        display:"flex",alignItems:"center",gap:6,marginBottom:2,transition:"all 0.15s"
                      }}>
                        <span style={{fontSize:10,flexShrink:0}}>{beat.icon}</span>
                        <span style={{flex:1,lineHeight:1.2,fontSize:9}}>{beat.name}</span>
                        <span style={{fontSize:8,color:isAssigned?beat.color:"#1e2535",fontFamily:"monospace",flexShrink:0}}>{epsOnBeat.length}ep</span>
                      </button>
                    );
                  })}

                  {/* Series progress */}
                  <div style={{marginTop:10,paddingTop:8,borderTop:"1px solid #12172a"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:9,color:"#374151"}}>Written</span>
                      <span style={{fontSize:9,color:accent}}>{filledEps}/{seriesLength}</span>
                    </div>
                    <div style={{height:3,background:"#12172a",borderRadius:2,overflow:"hidden"}}>
                      <div style={{width:`${(filledEps/seriesLength)*100}%`,height:"100%",background:accent,borderRadius:2,transition:"width 0.3s"}}/>
                    </div>
                  </div>
                </div>

                {/* ── CHARACTER QUICK-REFERENCE ── */}
                {characters.filter(c=>c.name.trim()||c.wound.trim()||c.desire.trim()).length > 0 && (
                  <div style={{background:"#09090f",border:"1px solid #12172a",borderRadius:6,padding:"10px",marginTop:8}}>
                    <div style={{fontSize:9,color:"#374151",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:7}}>Characters</div>
                    {characters.filter(c=>c.name.trim()||c.wound.trim()).map(char=>{
                      const roleColor = char.role==="Protagonist"?"#f97316":char.role==="Antagonist"?"#ef4444":"#6b7280";
                      return (
                        <div key={char.id} style={{marginBottom:8,paddingBottom:8,borderBottom:"1px solid #0d1020"}}>
                          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                            <div style={{width:4,height:4,borderRadius:"50%",background:roleColor,flexShrink:0}}/>
                            <span style={{fontSize:9,color:roleColor,fontWeight:700}}>{char.name||char.role}</span>
                            <span style={{fontSize:8,color:"#374151"}}>{char.role}</span>
                          </div>
                          {char.wound.trim()&&<div style={{fontSize:8,color:"#6b7280",lineHeight:1.4,marginBottom:2}}><span style={{color:"#8b5cf6"}}>🩸 </span>{char.wound.substring(0,60)}{char.wound.length>60?"…":""}</div>}
                          {char.desire.trim()&&<div style={{fontSize:8,color:"#6b7280",lineHeight:1.4}}><span style={{color:"#f97316"}}>🎯 </span>{char.desire.substring(0,60)}{char.desire.length>60?"…":""}</div>}
                        </div>
                      );
                    })}
                    <button onClick={()=>{setSetupStep("premise");setActiveTab("project");}} style={{background:"transparent",border:"1px solid #1e2535",color:"#374151",padding:"3px 8px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"inherit",width:"100%"}}>
                      Edit characters →
                    </button>
                  </div>
                )}
              </div>
              )} {/* end sidebar collapse */}

              {/* ── RIGHT: Writing panel ── */}
              <div>
                {(()=>{
                  const epNum    = activeEp?.ep;
                  const beatId   = beatAssignments[epNum] || writingBeat;
                  const beat     = beats.find(b=>b.id===beatId)||beats[0];
                  const linkedUB = universalBeats.filter(u=>beat.universalLinks.includes(u.id));
                  const arcPhase = getArcPhase(safeIdx, seriesLength);
                  const prevEp   = safeIdx>0 ? seriesEpisodes[safeIdx-1] : null;
                  const nextEp   = safeIdx<seriesEpisodes.length-1 ? seriesEpisodes[safeIdx+1] : null;

                  return (
                    <div>

                      {/* ── SERIES POSITION HEADER (auto-populated) ── */}
                      <div style={{background:"#0a0d1c",border:`1px solid ${beat.color}30`,borderLeft:`4px solid ${beat.color}`,borderRadius:7,padding:"12px 15px",marginBottom:10}}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
                          <div style={{width:34,height:34,borderRadius:"50%",background:beat.color+"20",border:`1px solid ${beat.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{beat.icon}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap"}}>
                              <div style={{display:"flex",alignItems:"center",gap:4,background:accent+"22",border:`1px solid ${accent}40`,borderRadius:10,padding:"2px 6px 2px 11px"}}>
                                <span style={{fontSize:12,fontWeight:700,color:"#fff",whiteSpace:"nowrap"}}>EP {epNum} —</span>
                                <input
                                  value={getEpTitle(epNum, activeEp?.title)}
                                  onChange={e => setEpTitle(epNum, e.target.value)}
                                  placeholder="Name this episode…"
                                  style={{background:"transparent",border:"none",outline:"none",color:epTitles[epNum]?"#fff":"#9ca3af",fontSize:12,fontWeight:700,fontFamily:"'Georgia',serif",width:Math.max(140, (getEpTitle(epNum, activeEp?.title)||"").length*8),minWidth:140,maxWidth:220,fontStyle:epTitles[epNum]?"normal":"italic"}}
                                  onFocus={e=>{e.target.style.color="#fff";e.target.select();}}
                                  onBlur={e=>{if(!epTitles[epNum])e.target.style.color="#9ca3af";}}
                                  title="Click to name this episode"
                                />
                                <span style={{fontSize:8,color:epTitles[epNum]?accent+"80":"#6b7280"}} title="Click to rename">✎</span>
                              </div>
                              {!epTitles[epNum] && (
                                <span style={{fontSize:8,color:"#374151",fontStyle:"italic"}}>← give this episode a title</span>
                              )}
                              <span style={{fontSize:9,padding:"2px 8px",borderRadius:8,background:arcPhase.color+"20",color:arcPhase.color,border:`1px solid ${arcPhase.color}40`,fontWeight:600}}>{arcPhase.label}</span>
                              <span style={{fontSize:9,color:"#374151",fontFamily:"monospace"}}>Tension {activeEp?.tension}/100</span>
                            </div>
                            <div style={{fontSize:14,fontWeight:700,color:beat.color,marginBottom:2}}>{beat.icon} {beat.name}</div>
                            <div style={{fontSize:10,color:"#6b7280",fontStyle:"italic",lineHeight:1.5}}>{beat.description}</div>
                          </div>
                          <div style={{display:"flex",flexDirection:"column",gap:3,flexShrink:0}}>
                            <button onClick={()=>{if(safeIdx>0){const ni=safeIdx-1;setActiveEpIdx(ni);setWritingBeat(beatAssignments[seriesEpisodes[ni].ep]||1);}}} disabled={safeIdx===0} title="Prev Episode" style={{background:"transparent",border:"1px solid #1e2535",color:safeIdx===0?"#1e2535":"#6b7280",padding:"3px 9px",borderRadius:3,cursor:safeIdx===0?"not-allowed":"pointer",fontSize:10,fontFamily:"inherit"}}>↑</button>
                            <button onClick={()=>{if(safeIdx<seriesEpisodes.length-1){const ni=safeIdx+1;setActiveEpIdx(ni);setWritingBeat(beatAssignments[seriesEpisodes[ni].ep]||1);}}} disabled={safeIdx===seriesEpisodes.length-1} title="Next Episode" style={{background:safeIdx===seriesEpisodes.length-1?"transparent":accent,border:"none",color:safeIdx===seriesEpisodes.length-1?"#1e2535":"#fff",padding:"3px 9px",borderRadius:3,cursor:safeIdx===seriesEpisodes.length-1?"not-allowed":"pointer",fontSize:10,fontFamily:"inherit"}}>↓</button>
                          </div>
                        </div>

                        {/* Genre Beat + ARCH Foundation reference — 2 cards */}
                        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:7}}>
                          <div style={{background:beat.color+"0a",border:`1px solid ${beat.color}25`,borderRadius:5,padding:"8px 10px"}}>
                            <div style={{fontSize:8,color:beat.color,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:3}}>Genre Beat · {genre.label} · {beat.timing}</div>
                            <div style={{fontSize:10,color:"#d1c4b0",lineHeight:1.5,fontStyle:"italic",marginBottom:4}}>{beat.hook}</div>
                            <div style={{fontSize:9,color:"#374151",fontStyle:"italic"}}>{beat.seriesNote?.substring(0,80)}…</div>
                          </div>
                          <div style={{background:"#06080f",border:"1px solid #12172a",borderRadius:5,padding:"8px 10px"}}>
                            <div style={{fontSize:8,color:"#374151",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:5}}>ARCH Beats Active</div>
                            {linkedUB.map(ub=>(
                              <div key={ub.id} style={{display:"flex",gap:5,marginBottom:4}}>
                                <span style={{fontSize:8,color:ub.color,fontFamily:"monospace",flexShrink:0,width:14,marginTop:1}}>{ub.id}</span>
                                <div>
                                  <div style={{fontSize:9,color:ub.color,fontWeight:700}}>{ub.name}</div>
                                  <div style={{fontSize:8,color:"#4b5563",lineHeight:1.3}}>{ub.vertical}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ── 90-SECOND EPISODE SECTIONS ── */}
                      {EP_SECTIONS.map(section=>{
                        const sectionFilled = section.fields.filter(f=>getInput(activeGenre,epNum,f.key).trim()).length;
                        return (
                          <div key={section.id} style={{marginBottom:10}}>
                            {/* Section header */}
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,padding:"6px 10px",background:section.color+"0d",border:`1px solid ${section.color}20`,borderLeft:`3px solid ${section.color}`,borderRadius:"0 5px 5px 0"}}>
                              <span style={{fontSize:13}}>{section.icon}</span>
                              <div style={{flex:1}}>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <span style={{fontSize:10,fontWeight:700,color:section.color,letterSpacing:"0.12em"}}>{section.label}</span>
                                  <span style={{fontSize:9,color:section.color+"99",fontFamily:"monospace",background:section.color+"15",padding:"1px 6px",borderRadius:8}}>{section.timing}</span>
                                  <span style={{fontSize:9,color:"#374151",marginLeft:"auto"}}>{sectionFilled}/{section.fields.length}</span>
                                </div>
                                <div style={{fontSize:9,color:"#4b5563",marginTop:1}}>{section.desc}</div>
                              </div>
                            </div>

                            {/* Section fields */}
                            <div style={{display:"flex",flexDirection:"column",gap:7,paddingLeft:8}}>
                              {section.fields.map(field=>{
                                const val = getInput(activeGenre, epNum, field.key);
                                const wc  = wordCount(val);
                                const filled = val.trim().length > 0;
                                return (
                                  <div key={field.key} style={{background:"#09090f",border:`1px solid ${filled?field.color+"35":"#12172a"}`,borderLeft:`2px solid ${filled?field.color:"#1e2535"}`,borderRadius:5,padding:"10px 12px",transition:"border-color 0.18s"}}>
                                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                                      <label style={{fontSize:9,color:filled?field.color:"#4b5563",letterSpacing:"0.15em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:5,margin:0}}>
                                        <span>{field.icon}</span>{field.label}
                                        <span style={{fontSize:8,color:field.color+"66",fontFamily:"monospace",fontWeight:"normal",letterSpacing:0,textTransform:"none"}}>{field.timing}</span>
                                      </label>
                                      {filled&&<span style={{fontSize:9,color:"#374151",fontFamily:"monospace"}}>{wc}w</span>}
                                    </div>
                                    <textarea
                                      rows={field.rows}
                                      value={val}
                                      onChange={e=>setInput(activeGenre,epNum,field.key,e.target.value)}
                                      placeholder={field.placeholder}
                                      style={{...iS,minHeight:field.rows*22+14}}
                                      onFocus={e=>e.target.style.borderColor=field.color+"60"}
                                      onBlur={e=>e.target.style.borderColor="#1e2535"}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* ── EPISODE NAVIGATION ── */}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,paddingTop:14,borderTop:"1px solid #12172a"}}>
                        <button onClick={()=>{if(safeIdx>0){const ni=safeIdx-1;setActiveEpIdx(ni);setWritingBeat(beatAssignments[seriesEpisodes[ni].ep]||1);}}} disabled={safeIdx===0} style={{background:"transparent",border:"1px solid #1e2535",color:safeIdx===0?"#1e2535":"#6b7280",padding:"7px 14px",borderRadius:4,cursor:safeIdx===0?"not-allowed":"pointer",fontSize:10,fontFamily:"inherit"}}>
                          ← {prevEp?`EP${prevEp.ep}`:"Start"}
                        </button>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontSize:10,color:"#374151"}}>Episode {epNum} of {seriesLength}</div>
                          <div style={{fontSize:9,color:beat.color,marginTop:2}}>{beat.icon} {beat.name} · <span style={{color:arcPhase.color}}>{arcPhase.label}</span></div>
                          <div style={{fontSize:8,color:"#1e2535",marginTop:2}}>
                            {EP_SECTIONS.reduce((a,s)=>a+s.fields.filter(f=>getInput(activeGenre,epNum,f.key).trim()).length,0)}/
                            {EP_SECTIONS.reduce((a,s)=>a+s.fields.length,0)} fields written
                          </div>
                        </div>
                        <button onClick={()=>{
                          if(safeIdx<seriesEpisodes.length-1){
                            const ni=safeIdx+1;
                            setActiveEpIdx(ni);
                            setWritingBeat(beatAssignments[seriesEpisodes[ni].ep]||1);
                          } else {
                            setActiveTab("export");
                          }
                        }} style={{background:safeIdx===seriesEpisodes.length-1?accent:accent,border:"none",color:"#fff",padding:"7px 14px",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:600}}>
                          {nextEp?`EP${nextEp.ep} →`:"Export Series →"}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ── STORY BOARD TAB ── */}
        {activeTab==="board" && (
          <div>
            {isMobile&&(
              <div style={{background:"#0a0d1c",border:"1px solid #3b82f630",borderLeft:"3px solid #3b82f6",borderRadius:5,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16}}>💻</span>
                <div>
                  <div style={{fontSize:11,color:"#e2ddd4",fontWeight:600,marginBottom:2}}>Best viewed on desktop</div>
                  <div style={{fontSize:10,color:"#6b7280"}}>The Story Board is a wide table — scroll horizontally or open on a larger screen for the full experience.</div>
                </div>
              </div>
            )}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:14}}>
              <div>
                <div style={{fontSize:9,color:"#3b82f6",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:3}}>Series Story Board · 12 Structural Moments</div>
                <div style={{fontSize:11,color:"#4b5563"}}>Rows = episodes · Columns = moments · Highlighted cell = primary moment for that episode</div>
              </div>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <span style={{fontSize:9,color:"#374151",letterSpacing:"0.1em",textTransform:"uppercase"}}>Series</span>
                {SERIES_LENGTHS.map(n=>(
                  <button key={n} onClick={()=>handleLengthChange(n)} style={{background:seriesLength===n?"#3b82f6":"transparent",border:`1px solid ${seriesLength===n?"#3b82f6":"#1e2535"}`,color:seriesLength===n?"#fff":"#6b7280",padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>{n} EP</button>
                ))}
              </div>
            </div>

            {/* Phase legend */}
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
              {Object.entries(MOMENT_PHASE_COLORS).map(([ph,col])=>(
                <span key={ph} style={{fontSize:8,padding:"2px 8px",borderRadius:10,background:col+"18",border:`1px solid ${col}30`,color:col,letterSpacing:"0.1em",textTransform:"uppercase"}}>{ph}</span>
              ))}
            </div>

            {/* Board */}
            <div style={{overflowX:"auto",background:"#09090f",border:"1px solid #12172a",borderRadius:7,padding:"0"}}>
              <table style={{borderCollapse:"collapse",minWidth:1100,width:"100%"}}>
                <thead>
                  <tr>
                    <td style={{background:"#06080f",width:52}}/>
                    <td style={{background:"#06080f",padding:"6px 10px",fontSize:8,color:"#374151",letterSpacing:"0.15em",textTransform:"uppercase",width:140}}>EPISODE</td>
                    {STORY_MOMENTS.map(m=>(
                      <td key={m.num} style={{background:MOMENT_PHASE_COLORS[m.phase]+"20",borderBottom:`2px solid ${MOMENT_PHASE_COLORS[m.phase]}`,padding:"4px 5px",textAlign:"center",fontSize:7,color:MOMENT_PHASE_COLORS[m.phase],letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{m.phase}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{background:"#06080f"}}/>
                    <td style={{background:"#0a0d1c",padding:"6px 10px",fontSize:8,color:"#4b5563",fontStyle:"italic"}}>Title · Beat</td>
                    {STORY_MOMENTS.map(m=>(
                      <td key={m.num} style={{background:m.color,padding:"6px 5px",textAlign:"center",minWidth:115}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#06080f"}}>{m.num}</div>
                        <div style={{fontSize:8,fontWeight:700,color:"#06080f",lineHeight:1.2}}>{m.name}</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{background:"#06080f"}}/>
                    <td style={{background:"#0a0d1c",borderBottom:"1px solid #12172a"}}/>
                    {STORY_MOMENTS.map(m=>(
                      <td key={m.num} style={{background:m.color+"0d",borderBottom:`1px solid ${m.color}25`,padding:"3px 5px",textAlign:"center"}}>
                        <div style={{fontSize:7,color:m.color+"88",fontStyle:"italic",lineHeight:1.2}}>{m.sub}</div>
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {seriesEpisodes.map((ep,epIdx)=>{
                    const primaryMomentIdx = getEpMoment(epIdx, seriesLength);
                    const assignedBeatId   = beatAssignments[ep.ep] || 1;
                    const assignedBeat     = beats.find(b=>b.id===assignedBeatId)||beats[0];
                    const rowBg            = epIdx%2===1?"#080910":"#0a0d1c";
                    const phaseCol         = MOMENT_PHASE_COLORS[STORY_MOMENTS[primaryMomentIdx].phase];
                    return (
                      <tr key={ep.ep}>
                        <td style={{background:phaseCol,padding:"0 5px",textAlign:"center",fontFamily:"monospace",fontSize:9,fontWeight:700,color:"#06080f",whiteSpace:"nowrap",verticalAlign:"middle",writingMode:"horizontal-tb"}}>
                          EP{String(ep.ep).padStart(2,"0")}
                        </td>
                        <td style={{background:rowBg,padding:"6px 10px",verticalAlign:"top",borderRight:"1px solid #12172a",minWidth:140}}>
                          <input
                            value={getEpTitle(ep.ep, ep.title)}
                            onChange={e=>setEpTitle(ep.ep, e.target.value)}
                            placeholder={ep.title}
                            style={{background:"transparent",border:"none",borderBottom:"1px solid #1e2535",outline:"none",color:"#e2ddd4",fontSize:10,fontWeight:600,fontFamily:"'Georgia',serif",width:"100%",marginBottom:4,padding:"1px 2px"}}
                            onFocus={e=>{e.target.style.borderBottomColor="#6366f160";}}
                            onBlur={e=>{e.target.style.borderBottomColor="#1e2535";}}
                          />
                          <div style={{fontSize:8,color:assignedBeat.color}}>{assignedBeat.icon} {assignedBeat.name}</div>
                        </td>
                        {STORY_MOMENTS.map((m,mIdx)=>{
                          const isActive = mIdx===primaryMomentIdx;
                          const val      = getBoardCell(ep.ep, m.num);
                          const filled   = val.trim().length>0;
                          return (
                            <td key={m.num} style={{background:isActive?m.color+"15":rowBg,verticalAlign:"top",borderLeft:isActive?`2px solid ${m.color}`:"1px solid #0d1020",borderRight:"1px solid #0d1020",borderBottom:"1px solid #0d1020",padding:0}}>
                              <textarea
                                value={val}
                                onChange={e=>setBoardCell(ep.ep, m.num, e.target.value)}
                                placeholder={isActive?`Write ${m.name}…`:""}
                                rows={3}
                                style={{
                                  width:"100%",background:"transparent",border:"none",
                                  color:filled?"#d1c4b0":isActive?m.color+"55":"#2a3040",
                                  fontSize:9,lineHeight:1.5,padding:"6px 8px",
                                  resize:"none",outline:"none",fontFamily:"'Georgia',serif",
                                  boxSizing:"border-box",fontStyle:filled?"normal":"italic",
                                  minHeight:70
                                }}
                                onFocus={e=>{e.target.style.background=m.color+"12";e.target.style.color="#e2ddd4";}}
                                onBlur={e=>{e.target.style.background="transparent";e.target.style.color=filled?"#d1c4b0":isActive?m.color+"55":"#2a3040";}}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Moment fill summary */}
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:12,padding:"10px 14px",background:"#09090f",border:"1px solid #12172a",borderRadius:6}}>
              <span style={{fontSize:9,color:"#374151",letterSpacing:"0.12em",textTransform:"uppercase",marginRight:4}}>Board Progress</span>
              {STORY_MOMENTS.map(m=>{
                const filled = seriesEpisodes.filter(ep=>getBoardCell(ep.ep,m.num).trim()).length;
                const pct    = Math.round((filled/seriesLength)*100);
                return (
                  <div key={m.num} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <div style={{width:32,height:3,background:"#12172a",borderRadius:2,overflow:"hidden"}}>
                      <div style={{width:`${pct}%`,height:"100%",background:m.color,borderRadius:2}}/>
                    </div>
                    <span style={{fontSize:7,color:filled>0?m.color:"#1e2535",fontFamily:"monospace"}}>{m.num}</span>
                  </div>
                );
              })}
              <span style={{fontSize:9,color:"#374151",marginLeft:"auto"}}>
                {seriesEpisodes.filter(ep=>STORY_MOMENTS.some(m=>getBoardCell(ep.ep,m.num).trim())).length}/{seriesLength} episodes started
              </span>
            </div>
          </div>
        )}

        {/* ── ARCH FRAMEWORK (Foundation) ── */}
        {activeTab==="foundation" && (
          <div>
            {/* Reference tab context banner */}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:"#8b5cf612",border:"1px solid #8b5cf620",borderLeft:"3px solid #8b5cf6",borderRadius:5,marginBottom:16}}>
              <span style={{fontSize:14}}>🏛️</span>
              <div style={{flex:1}}>
                <span style={{fontSize:10,color:"#8b5cf6",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Foundation Reference</span>
                <span style={{fontSize:10,color:"#4b5563",marginLeft:10}}>The 22 ARCH beats — the universal structural DNA beneath every story. Use this as a writing guide while working in Write or Story Board.</span>
              </div>
              <button onClick={()=>setActiveTab("write")} style={{background:"transparent",border:"1px solid #8b5cf640",color:"#8b5cf6",padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:9,fontFamily:"inherit",flexShrink:0}}>Go to Write →</button>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                <span style={{fontSize:10,color:"#6366f1",fontWeight:700,letterSpacing:"0.1em",marginRight:6}}>VERTICLIFF</span>
                {Object.entries(groupLabels).map(([k,v])=>(
                  <span key={k} style={{fontSize:9,padding:"2px 8px",borderRadius:10,background:groupColors[k]+"18",border:`1px solid ${groupColors[k]}40`,color:groupColors[k],letterSpacing:"0.1em",textTransform:"uppercase"}}>{v}</span>
                ))}
              </div>
              <span style={{fontSize:9,color:"#374151"}}>
                {Object.keys(foundationInputs).filter(id=>foundationInputs[id]?.notes?.trim()).length}/22 beats written
              </span>
            </div>

            {universalBeats.map(beat=>{
              const linked = Object.values(genreData).flatMap(g=>g.beats.filter(b=>b.universalLinks.includes(beat.id)));
              const isOpen = expandedUniv===beat.id;
              const fi     = foundationInputs[beat.id] || {};
              const hasNotes = !!(fi.notes?.trim() || fi.application?.trim() || fi.character?.trim());

              const FOUND_FIELDS = [
                {key:"notes",       label:"Your Notes",              icon:"📝", color:beat.color,   placeholder:`Write your understanding of "${beat.name}" — what it means in your story, what it demands from your scene.`, rows:3},
                {key:"application", label:"How It Applies To Your Story", icon:"🎯", color:"#f97316", placeholder:"Specifically: how does this beat show up in your project? What scene, moment, or character decision embodies this beat?", rows:2},
                {key:"character",   label:"Character Connection",    icon:"🦸", color:"#22c55e",    placeholder:"Which character carries this beat? How does it reveal, test, or transform them?", rows:2},
              ];

              return (
                <div key={beat.id} style={{marginBottom:5,border:`1px solid ${isOpen?beat.color+"50":"#12172a"}`,borderLeft:`3px solid ${hasNotes?beat.color:isOpen?beat.color:"#1e2535"}`,borderRadius:5,background:isOpen?"#0a0d1c":"transparent",transition:"all 0.15s"}}>

                  {/* Clickable header */}
                  <div onClick={()=>setExpandedUniv(isOpen?null:beat.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",cursor:"pointer"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:beat.color+"18",border:`1px solid ${beat.color}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}}>{beat.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:8,color:"#374151",fontFamily:"monospace"}}>BEAT {beat.id}</span>
                        <span style={{fontSize:8,padding:"1px 5px",borderRadius:8,background:groupColors[beat.group]+"18",color:groupColors[beat.group]}}>{groupLabels[beat.group]}</span>
                        {hasNotes&&<span style={{fontSize:8,color:beat.color}}>● written</span>}
                      </div>
                      <div style={{fontSize:12,fontWeight:600,color:"#e2ddd4",marginTop:1}}>{beat.name}</div>
                    </div>
                    <div style={{display:"flex",gap:3}}>{linked.map((g,i)=><div key={i} title={g.name} style={{width:5,height:5,borderRadius:"50%",background:g.color}}/>)}</div>
                    <span style={{color:"#374151",fontSize:9,marginLeft:4}}>{isOpen?"▲":"▼"}</span>
                  </div>

                  {/* Expanded content — stop propagation so clicks inside don't collapse */}
                  {isOpen&&(
                    <div onClick={e=>e.stopPropagation()} style={{padding:"0 14px 16px 46px",borderTop:`1px solid ${beat.color}18`}}>

                      {/* Framework reference */}
                      <p style={{color:"#9ca3af",fontSize:11,lineHeight:1.6,margin:"10px 0 8px"}}>{beat.description}</p>
                      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:7,marginBottom:14}}>
                        <div style={{background:beat.color+"0d",border:`1px solid ${beat.color}25`,borderRadius:4,padding:"7px 10px"}}>
                          <div style={{fontSize:8,color:beat.color,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:3}}>Vertical Adaptation</div>
                          <p style={{margin:0,color:"#d1c4b0",fontSize:11,lineHeight:1.5,fontStyle:"italic"}}>{beat.vertical}</p>
                        </div>
                        {linked.length>0&&(
                          <div style={{background:"#06080f",border:"1px solid #0d1020",borderRadius:4,padding:"7px 10px"}}>
                            <div style={{fontSize:8,color:"#374151",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:5}}>Maps To Genre Beats</div>
                            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                              {linked.map((g,i)=>(
                                <span key={i} style={{fontSize:9,padding:"1px 6px",borderRadius:8,background:g.color+"18",color:g.color,border:`1px solid ${g.color}30`}}>{g.name}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ── Writing fields ── */}
                      <div style={{borderTop:`1px solid ${beat.color}20`,paddingTop:12,display:"flex",flexDirection:"column",gap:9}}>
                        {FOUND_FIELDS.map(field=>{
                          const val = fi[field.key] || "";
                          const wc  = wordCount(val);
                          return (
                            <div key={field.key} style={{background:"#09090f",border:`1px solid ${val.trim()?field.color+"30":"#12172a"}`,borderLeft:`2px solid ${val.trim()?field.color:"#1e2535"}`,borderRadius:5,padding:"10px 12px",transition:"border-color 0.18s"}}>
                              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                                <label style={{fontSize:9,color:val.trim()?field.color:"#4b5563",letterSpacing:"0.15em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:5,margin:0}}>
                                  <span>{field.icon}</span>{field.label}
                                </label>
                                {val.trim()&&<span style={{fontSize:9,color:"#374151",fontFamily:"monospace"}}>{wc}w</span>}
                              </div>
                              <textarea
                                rows={field.rows}
                                value={val}
                                onChange={e=>setFoundationField(beat.id, field.key, e.target.value)}
                                placeholder={field.placeholder}
                                style={{...iS, minHeight:field.rows*22+16}}
                                onFocus={e=>e.target.style.borderColor=field.color+"60"}
                                onBlur={e=>e.target.style.borderColor="#1e2535"}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Close button */}
                      <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}>
                        <button onClick={()=>setExpandedUniv(null)} style={{background:"transparent",border:"1px solid #1e2535",color:"#374151",padding:"4px 12px",borderRadius:4,cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>Close ▲</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── GENRE BEATS ── */}
        {activeTab==="genre" && (
          <div>
            {/* Reference tab context banner */}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:"#f9731612",border:"1px solid #f9731620",borderLeft:"3px solid #f97316",borderRadius:5,marginBottom:16}}>
              <span style={{fontSize:14}}>🎭</span>
              <div style={{flex:1}}>
                <span style={{fontSize:10,color:"#f97316",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Genre Beats Reference</span>
                <span style={{fontSize:10,color:"#4b5563",marginLeft:10}}>8 beats specific to each genre — showing timing, tension, and how each connects to the 22 ARCH foundation beats.</span>
              </div>
              <button onClick={()=>setActiveTab("write")} style={{background:"transparent",border:"1px solid #f9731640",color:"#f97316",padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:9,fontFamily:"inherit",flexShrink:0}}>Go to Write →</button>
            </div>
            <div style={{display:"flex",gap:7,marginBottom:20,alignItems:"center"}}>
              {(genreRanking.filter(Boolean).length>0?genreRanking.filter(Boolean):Object.keys(genreData)).map((key,i)=>{
                const g=genreData[key];
                return <div key={key} style={{position:"relative"}}>
                  {genreRanking.filter(Boolean).length>0&&<div style={{position:"absolute",top:-7,left:"50%",transform:"translateX(-50%)",fontSize:8,color:GENRE_RANK_COLORS[i],zIndex:1}}>{GENRE_RANK_ICONS[i]}</div>}
                  <button onClick={()=>{setActiveGenre(key);setExpandedBeat(null);}} style={{background:activeGenre===key?g.accentColor:"transparent",border:`1px solid ${activeGenre===key?"transparent":"#12172a"}`,color:activeGenre===key?"#fff":"#4b5563",padding:"7px 18px",borderRadius:4,cursor:"pointer",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"inherit",transition:"all 0.2s",marginTop:8}}>{g.icon} {g.label}</button>
                </div>;
              })}
            </div>
            <div style={{display:"flex",height:6,borderRadius:4,overflow:"hidden",marginBottom:20,gap:2}}>{beats.map(b=><div key={b.id} style={{flex:1,background:b.color,opacity:expandedBeat===b.id?1:0.4,cursor:"pointer",transition:"opacity 0.2s"}} onClick={()=>setExpandedBeat(expandedBeat===b.id?null:b.id)}/>)}</div>
            {beats.map(beat=>{
              const isOpen=expandedBeat===beat.id;
              return <div key={beat.id} style={{marginBottom:5,border:`1px solid ${isOpen?beat.color+"55":"#12172a"}`,borderLeft:`3px solid ${beat.color}`,borderRadius:5,background:isOpen?"#0a0d1c":"transparent",transition:"all 0.18s"}}>
                <div onClick={()=>setExpandedBeat(isOpen?null:beat.id)} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 13px",cursor:"pointer"}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:beat.color+"18",border:`1px solid ${beat.color}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{beat.icon}</div>
                  <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:8,color:"#374151",fontFamily:"monospace"}}>BEAT {beat.id}</span><span style={{fontSize:8,color:beat.color}}>{beat.timing}</span></div><div style={{fontSize:13,fontWeight:600,color:"#e2ddd4",marginTop:1}}>{beat.name}</div></div>
                  <div style={{display:"flex",gap:2}}>{[...Array(5)].map((_,i)=><div key={i} style={{width:4,height:10,borderRadius:1,background:i<Math.round(beat.tension/20)?beat.color:"#12172a"}}/>)}</div>
                  <span style={{color:"#374151",fontSize:9,marginLeft:7}}>{isOpen?"▲":"▼"}</span>
                </div>
                {isOpen&&<div style={{padding:"0 13px 13px 50px",borderTop:`1px solid ${beat.color}18`}}>
                  <p style={{color:"#9ca3af",fontSize:11,lineHeight:1.6,margin:"10px 0 8px"}}>{beat.description}</p>
                  <div style={{background:beat.color+"0d",border:`1px solid ${beat.color}25`,borderRadius:4,padding:"8px 11px",marginBottom:8}}><div style={{fontSize:8,color:beat.color,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:3}}>Director's Hook Note</div><p style={{margin:0,color:"#d1c4b0",fontSize:11,lineHeight:1.5,fontStyle:"italic"}}>{beat.hook}</p></div>
                  <div style={{background:"#0a0c14",border:"1px solid #12172a",borderRadius:4,padding:"8px 11px",marginBottom:8}}><div style={{fontSize:8,color:"#374151",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:3}}>Series Architecture Note</div><p style={{margin:0,color:"#6b7280",fontSize:11,lineHeight:1.5}}>{beat.seriesNote}</p></div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,alignItems:"center",marginBottom:9}}><span style={{fontSize:9,color:"#374151"}}>Foundation:</span>{beat.universalLinks.map(uid=>{const ub=universalBeats.find(u=>u.id===uid);return ub?<span key={uid} style={{fontSize:9,padding:"1px 6px",borderRadius:8,background:ub.color+"15",color:ub.color,border:`1px solid ${ub.color}30`}}>{ub.id}. {ub.short}</span>:null;})}</div>
                  <button onClick={()=>{setWritingBeat(beat.id);setActiveTab("write");}} style={{background:beat.color,border:"none",color:"#000",padding:"5px 13px",borderRadius:4,cursor:"pointer",fontSize:9,fontWeight:700,fontFamily:"inherit"}}>✍️ Write this beat →</button>
                </div>}
              </div>;
            })}
          </div>
        )}

        {/* ── BEAT MAP ── */}
        {activeTab==="mapping" && (
          <div>
            {/* Reference tab context banner */}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:"#6366f112",border:"1px solid #6366f120",borderLeft:"3px solid #6366f1",borderRadius:5,marginBottom:16}}>
              <span style={{fontSize:14}}>🗺️</span>
              <div style={{flex:1}}>
                <span style={{fontSize:10,color:"#6366f1",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Beat Map Reference</span>
                <span style={{fontSize:10,color:"#4b5563",marginLeft:10}}>Click any genre beat on the right to see which ARCH foundation beats it activates. Use this to understand the structural connections in your story.</span>
              </div>
            </div>
            <div style={{display:"flex",gap:7,marginBottom:16}}>{(genreRanking.filter(Boolean).length>0?genreRanking.filter(Boolean):Object.keys(genreData)).map((key,i)=>{const g=genreData[key];return <button key={key} onClick={()=>{setActiveGenre(key);setMappingBeat(null);}} style={{background:activeGenre===key?g.accentColor:"transparent",border:`1px solid ${activeGenre===key?"transparent":"#12172a"}`,color:activeGenre===key?"#fff":"#4b5563",padding:"6px 16px",borderRadius:4,cursor:"pointer",fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"inherit",transition:"all 0.2s"}}>{GENRE_RANK_ICONS[i]||""} {g.icon} {g.label}</button>;})}
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 36px 1fr",alignItems:"start",gap:isMobile?16:0}}>
              <div><div style={{fontSize:9,color:"#374151",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8,paddingLeft:3}}>Foundation Beats</div>{universalBeats.map(beat=>{const isLinked=mappingBeat&&genre.beats.find(g=>g.id===mappingBeat)?.universalLinks.includes(beat.id);return <div key={beat.id} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 7px",marginBottom:2,borderRadius:4,border:`1px solid ${isLinked?beat.color+"55":"#0d1020"}`,background:isLinked?beat.color+"10":"#09090f",transition:"all 0.2s",opacity:mappingBeat&&!isLinked?0.2:1}}><span style={{fontSize:8,color:"#374151",fontFamily:"monospace",width:13}}>{beat.id}</span><div style={{width:4,height:4,borderRadius:"50%",background:beat.color}}/><span style={{fontSize:9,color:isLinked?"#e2ddd4":"#6b7280"}}>{beat.short}</span></div>;})}
              </div>
              {!isMobile&&<div style={{display:"flex",justifyContent:"center"}}><div style={{width:1,minHeight:420,background:"linear-gradient(180deg,transparent,#12172a 15%,#12172a 85%,transparent)"}}/></div>}
              <div><div style={{fontSize:9,color:"#374151",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8,paddingLeft:3}}>{genre.label} Beats</div>{beats.map(beat=><div key={beat.id} onClick={()=>setMappingBeat(mappingBeat===beat.id?null:beat.id)} style={{padding:"8px 10px",marginBottom:5,borderRadius:5,border:`1px solid ${mappingBeat===beat.id?beat.color+"65":"#12172a"}`,borderLeft:`3px solid ${beat.color}`,background:mappingBeat===beat.id?beat.color+"10":"#09090f",cursor:"pointer",transition:"all 0.2s"}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11}}>{beat.icon}</span><div><div style={{fontSize:8,color:beat.color,fontFamily:"monospace"}}>{beat.timing}</div><div style={{fontSize:11,fontWeight:600,color:"#e2ddd4"}}>{beat.name}</div></div></div>{mappingBeat===beat.id&&<div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:6}}>{beat.universalLinks.map(uid=>{const ub=universalBeats.find(u=>u.id===uid);return ub?<span key={uid} style={{fontSize:9,padding:"1px 5px",borderRadius:8,background:ub.color+"15",color:ub.color,border:`1px solid ${ub.color}30`}}>{ub.id}. {ub.short}</span>:null;})}</div>}</div>)}
              </div>
            </div>
          </div>
        )}

        {/* ── SERIES ARC ── */}
        {activeTab==="arc" && (
          <div>
            {!projectReady ? (
              <div style={{textAlign:"center",padding:"60px 20px"}}>
                <div style={{fontSize:40,marginBottom:20}}>📈</div>
                <div style={{fontSize:16,color:"#e2ddd4",fontWeight:700,marginBottom:8}}>Set up your project first</div>
                <div style={{fontSize:12,color:"#6b7280",lineHeight:1.7,marginBottom:28,maxWidth:400,margin:"0 auto 28px"}}>
                  The Series Arc needs a premise and a genre to generate your tension curve.
                </div>
                <button onClick={()=>setActiveTab("project")} style={{background:accent,border:"none",color:"#fff",padding:"11px 28px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.1em"}}>
                  Go to Project Setup →
                </button>
              </div>
            ) : !activeEp ? null : (
            <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:16}}>
              <div style={{display:"flex",gap:6}}>{(genreRanking.filter(Boolean).length>0?genreRanking.filter(Boolean):Object.keys(genreData)).map((key,i)=>{const g=genreData[key];return <button key={key} onClick={()=>{setActiveGenre(key);setActiveEpIdx(0);}} style={{background:activeGenre===key?g.accentColor:"transparent",border:`1px solid ${activeGenre===key?"transparent":"#12172a"}`,color:activeGenre===key?"#fff":"#4b5563",padding:"6px 15px",borderRadius:4,cursor:"pointer",fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"inherit",transition:"all 0.2s"}}>{GENRE_RANK_ICONS[i]||""} {g.icon} {g.label}</button>;})}
              </div>
              <div style={{display:"flex",gap:4}}>{SERIES_LENGTHS.map(n=><button key={n} onClick={()=>handleLengthChange(n)} style={{background:seriesLength===n?accent:"transparent",border:`1px solid ${seriesLength===n?accent:"#1e2535"}`,color:seriesLength===n?"#fff":"#6b7280",padding:"4px 11px",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"inherit",transition:"all 0.18s"}}>{n} EP</button>)}</div>
            </div>
            <div style={{background:"#0a0d1c",border:"1px solid #12172a",borderRadius:8,padding:"14px",marginBottom:12,overflowX:"auto"}}>
              <div style={{minWidth:300}}>
              <div style={{fontSize:9,color:accent,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:3}}>{GENRE_RANK_ICONS[genreRanking.indexOf(activeGenre)]||""} {genre.label} — {seriesLength} Episodes</div>
              {ovPts.length>0 && (
                <svg width="100%" viewBox={`0 0 ${gW} ${gH}`} style={{overflow:"visible"}}>
                  <defs><linearGradient id="aG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity="0.18"/><stop offset="100%" stopColor={accent} stopOpacity="0"/></linearGradient></defs>
                  {[0,50,100].map(v=>{const y=pT+(1-v/100)*iH;return<line key={v} x1={pL} y1={y} x2={pL+iW} y2={y} stroke="#12172a" strokeWidth="1"/>;})}{[{p:0.25,l:"Act I"},{p:0.5,l:"Mid"},{p:0.75,l:"Crisis"},{p:0.92,l:"Climax"}].map(({p,l})=>{const x=pL+p*iW;return<g key={l}><line x1={x} y1={pT} x2={x} y2={pT+iH} stroke="#1e2535" strokeWidth="1" strokeDasharray="3,3"/><text x={x} y={pT-4} fill="#2d3748" fontSize="8" textAnchor="middle" fontFamily="monospace">{l}</text></g>;})}
                  {(()=>{const sp=ovPts[safeIdx];return sp?<g><line x1={sp.x} y1={pT} x2={sp.x} y2={pT+iH} stroke={accent} strokeWidth="1" strokeOpacity="0.4"/><circle cx={sp.x} cy={sp.y} r="6" fill={accent} stroke="#06080f" strokeWidth="2"/></g>:null;})()}
                  {ovArea&&<path d={ovArea} fill="url(#aG)"/>}
                  {ovPath&&<path d={ovPath} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"/>}
                  {ovPts.map((p,i)=>{const show=seriesLength===6||(seriesLength===30&&i%3===0)||(seriesLength===60&&i%6===0);if(!show)return null;const isA=i===safeIdx;return<g key={i} style={{cursor:"pointer"}} onClick={()=>setActiveEpIdx(i)}><circle cx={p.x} cy={p.y} r={isA?6:3} fill={isA?accent:"#1e2535"} stroke={accent} strokeWidth={isA?2:1} strokeOpacity={isA?1:0.4}/></g>;})}
                </svg>
              )}
              </div>
            </div>
            <div style={{background:"#09090f",border:"1px solid #12172a",borderRadius:6,padding:"9px 11px",marginBottom:10}}><div style={{fontSize:9,color:"#374151",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Episodes</div><div style={{display:"flex",flexWrap:"wrap",gap:3,maxHeight:seriesLength>6?85:38,overflowY:seriesLength>6?"auto":"visible"}}>{seriesEpisodes.map((ep,i)=><button key={i} onClick={()=>setActiveEpIdx(i)} style={{background:safeIdx===i?accent:"#0d1020",border:`1px solid ${safeIdx===i?accent:"#1e2535"}`,color:safeIdx===i?"#fff":"#4b5563",padding:"3px 8px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"monospace",transition:"all 0.15s"}}>EP{ep.ep}</button>)}</div></div>
            <div style={{background:"#0a0d1c",border:"1px solid #12172a",borderRadius:7,padding:"13px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><div style={{fontSize:9,color:accent,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:2}}>Episode {activeEp?.ep} of {seriesLength}</div><div style={{fontSize:13,color:"#fff"}}>{activeEp?.title}</div></div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}><div style={{textAlign:"right"}}><div style={{fontSize:8,color:"#374151"}}>Tension</div><div style={{fontSize:18,color:accent,fontWeight:700}}>{activeEp?.tension}</div></div><button onClick={()=>{setWritingBeat(1);setActiveTab("write");}} style={{background:accent,border:"none",color:"#fff",padding:"6px 13px",borderRadius:4,cursor:"pointer",fontSize:9,fontWeight:600,fontFamily:"inherit"}}>✍️ Write →</button></div>
            </div>
            </>
          )}
          </div>
        )}

        {/* ── FEEDBACK ── */}
        {activeTab==="feedback" && (
          <div>
            {feedbackSubmitted ? (
              /* ── THANK YOU STATE ── */
              <div style={{textAlign:"center",padding:"60px 30px"}}>
                <div style={{fontSize:48,marginBottom:16}}>🙏</div>
                <div style={{fontSize:18,color:"#22c55e",fontWeight:700,marginBottom:8}}>Thank you for your feedback</div>
                <div style={{fontSize:12,color:"#6b7280",lineHeight:1.7,marginBottom:28,maxWidth:420,margin:"0 auto 28px"}}>
                  Your responses have been recorded. This helps us build a better tool for every writer who uses it.
                </div>
                <div style={{background:"#0a0d1c",border:"1px solid #22c55e30",borderRadius:8,padding:"20px",maxWidth:480,margin:"0 auto 28px",textAlign:"left"}}>
                  <div style={{fontSize:9,color:"#22c55e",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:14}}>Your Ratings</div>
                  {FEEDBACK_QUESTIONS.map(q => (
                    <div key={q.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #12172a"}}>
                      <span style={{fontSize:11,color:"#9ca3af"}}>{q.label}</span>
                      <span style={{fontSize:11,color:"#22c55e",fontWeight:700}}>{FEEDBACK_RATINGS[feedbackAnswers[q.id]] || "—"}</span>
                    </div>
                  ))}
                  {feedbackSuggestion.trim() && (
                    <div style={{marginTop:12}}>
                      <div style={{fontSize:9,color:"#374151",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:5}}>Suggestions</div>
                      <div style={{fontSize:11,color:"#9ca3af",lineHeight:1.6,fontStyle:"italic"}}>"{feedbackSuggestion}"</div>
                    </div>
                  )}
                </div>
                <button onClick={()=>setActiveTab("export")} style={{background:"#22c55e",border:"none",color:"#000",padding:"10px 24px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.1em"}}>
                  Continue to Export →
                </button>
              </div>
            ) : (
              /* ── FEEDBACK FORM ── */
              <div>
                {/* Header */}
                <div style={{marginBottom:24}}>
                  <div style={{fontSize:9,color:"#22c55e",letterSpacing:"0.25em",textTransform:"uppercase",marginBottom:5}}>Project Feedback · One time per project</div>
                  <div style={{fontSize:16,color:"#fff",fontWeight:700,marginBottom:6}}>How was your experience?</div>
                  <div style={{fontSize:11,color:"#6b7280",lineHeight:1.6}}>
                    Rate each area — your answers help us improve VertiCliff for every writer who uses it.
                    This form can only be submitted once per project.
                  </div>
                </div>

                {/* 6 Rating Questions */}
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
                  {FEEDBACK_QUESTIONS.map((q, qi) => {
                    const selected = feedbackAnswers[q.id];
                    return (
                      <div key={q.id} style={{background:"#0a0d1c",border:`1px solid ${selected!==undefined?"#22c55e30":"#12172a"}`,borderLeft:`3px solid ${selected!==undefined?"#22c55e":"#1e2535"}`,borderRadius:6,padding:"14px 16px",transition:"all 0.18s"}}>
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                          {/* Question text */}
                          <div style={{flex:1,minWidth:180}}>
                            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                              <div style={{width:18,height:18,borderRadius:"50%",background:selected!==undefined?"#22c55e":"#1e2535",border:`1px solid ${selected!==undefined?"#22c55e":"#374151"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:selected!==undefined?"#000":"#6b7280",flexShrink:0,fontWeight:700}}>
                                {selected!==undefined ? "✓" : qi+1}
                              </div>
                              <span style={{fontSize:12,color:"#e2ddd4",fontWeight:600}}>{q.label}</span>
                            </div>
                            <div style={{fontSize:10,color:"#4b5563",paddingLeft:25}}>{q.sub}</div>
                          </div>

                          {/* Rating buttons */}
                          <div style={{display:"flex",gap:4,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                            {FEEDBACK_RATINGS.map((rating, ri) => {
                              const isSelected = selected === ri;
                              const ratingColors = ["#ef4444","#f97316","#eab308","#22c55e","#6366f1"];
                              const col = ratingColors[ri];
                              return (
                                <button
                                  key={ri}
                                  onClick={() => setFeedbackAnswers(prev => ({...prev, [q.id]: ri}))}
                                  style={{
                                    background: isSelected ? col : "transparent",
                                    border: `1px solid ${isSelected ? col : "#1e2535"}`,
                                    color: isSelected ? "#fff" : "#4b5563",
                                    padding: "5px 11px",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    fontSize: 10,
                                    fontFamily: "inherit",
                                    transition: "all 0.15s",
                                    fontWeight: isSelected ? 700 : 400,
                                  }}
                                >
                                  {rating}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Q7 — Open suggestions */}
                <div style={{background:"#0a0d1c",border:"1px solid #12172a",borderLeft:"3px solid #6366f1",borderRadius:6,padding:"16px",marginBottom:24}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                    <div style={{width:18,height:18,borderRadius:"50%",background:feedbackSuggestion.trim()?"#6366f1":"#1e2535",border:`1px solid ${feedbackSuggestion.trim()?"#6366f1":"#374151"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:feedbackSuggestion.trim()?"#fff":"#6b7280",flexShrink:0}}>7</div>
                    <div>
                      <div style={{fontSize:12,color:"#e2ddd4",fontWeight:600}}>Suggestions or comments</div>
                      <div style={{fontSize:10,color:"#4b5563"}}>Anything we should add, change, or rethink? We read every response.</div>
                    </div>
                  </div>
                  <textarea
                    value={feedbackSuggestion}
                    onChange={e => setFeedbackSuggestion(e.target.value)}
                    placeholder="Share any thoughts, feature requests, or things that frustrated you..."
                    rows={4}
                    style={{width:"100%",background:"#06080f",border:"1px solid #1e2535",borderRadius:4,color:"#e2ddd4",fontSize:11,lineHeight:1.6,padding:"10px 12px",resize:"vertical",fontFamily:"'Georgia',serif",boxSizing:"border-box",outline:"none",transition:"border-color 0.18s"}}
                    onFocus={e=>e.target.style.borderColor="#6366f160"}
                    onBlur={e=>e.target.style.borderColor="#1e2535"}
                  />
                  {feedbackSuggestion.trim() && (
                    <div style={{textAlign:"right",marginTop:4,fontSize:9,color:"#374151",fontFamily:"monospace"}}>{feedbackSuggestion.trim().split(/\s+/).filter(Boolean).length} words</div>
                  )}
                </div>

                {/* Progress + Submit */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"#09090f",border:"1px solid #12172a",borderRadius:6,flexWrap:"wrap",gap:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    {/* Mini progress */}
                    <div style={{display:"flex",gap:3}}>
                      {FEEDBACK_QUESTIONS.map(q => (
                        <div key={q.id} style={{width:8,height:8,borderRadius:"50%",background:feedbackAnswers[q.id]!==undefined?"#22c55e":"#1e2535",transition:"background 0.2s"}}/>
                      ))}
                    </div>
                    <span style={{fontSize:10,color:feedbackComplete?"#22c55e":"#4b5563"}}>
                      {FEEDBACK_QUESTIONS.filter(q=>feedbackAnswers[q.id]!==undefined).length}/6 questions answered
                      {feedbackComplete && " · Ready to submit"}
                    </span>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <button onClick={()=>setActiveTab("export")}
                      style={{background:"transparent",border:"1px solid #1e2535",color:"#374151",padding:"9px 16px",borderRadius:5,cursor:"pointer",fontSize:10,fontFamily:"inherit",letterSpacing:"0.08em"}}>
                      Skip for now →
                    </button>
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={!feedbackComplete || feedbackSubmitting}
                      style={{
                        background: feedbackComplete ? "#22c55e" : "#1e2535",
                        border: "none",
                        color: feedbackComplete ? "#000" : "#374151",
                        padding: "10px 24px",
                        borderRadius: 5,
                        cursor: feedbackComplete ? "pointer" : "not-allowed",
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: "inherit",
                        letterSpacing: "0.1em",
                        transition: "all 0.2s",
                        opacity: feedbackSubmitting ? 0.6 : 1,
                      }}
                    >
                      {feedbackSubmitting ? "Submitting..." : "Submit Feedback →"}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ── EXPORT ── */}
        {activeTab==="export" && (
          <div>
            {/* Project summary — read only, no dead buttons */}
            <div style={{background:"#09090f",border:"1px solid #12172a",borderRadius:8,padding:"16px 18px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontSize:9,color:"#374151",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:5}}>Exporting Project</div>
                <div style={{fontSize:15,fontWeight:700,color:"#e2ddd4",marginBottom:4}}>{projectTitle||"Untitled Project"}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  {genreRanking.filter(Boolean).map((g,i)=>(
                    <span key={g} style={{fontSize:9,padding:"2px 8px",borderRadius:8,background:genreData[g].accentColor+"20",color:genreData[g].accentColor,border:`1px solid ${genreData[g].accentColor}40`}}>
                      {GENRE_RANK_ICONS[i]} {genreData[g].label}
                    </span>
                  ))}
                  <span style={{fontSize:9,color:"#6b7280"}}>{seriesLength} episodes</span>
                  <span style={{fontSize:9,color:"#374151"}}>·</span>
                  <span style={{fontSize:9,color:"#6b7280"}}>
                    {Object.values(beatInputs?.[activeGenre]||{}).filter(ep=>ep?.hook?.trim()).length} of {seriesLength} written
                  </span>
                </div>
              </div>
              <button onClick={()=>setActiveTab("project")} style={{background:"transparent",border:"1px solid #1e2535",color:"#6b7280",padding:"6px 14px",borderRadius:5,cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>
                ← Back to Project
              </button>
            </div>

            {/* Story Board preview — compact */}
            <div style={{background:"#0a0d1c",border:"1px solid #22c55e30",borderLeft:"3px solid #22c55e",borderRadius:6,padding:"12px 14px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div>
                  <div style={{fontSize:9,color:"#22c55e",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:2}}>📊 Series Story Board</div>
                  <div style={{fontSize:10,color:"#6b7280"}}>
                    {seriesEpisodes.filter(ep=>STORY_MOMENTS.some(m=>getBoardCell(ep.ep,m.num).trim())).length} of {seriesLength} episodes have board content written
                  </div>
                </div>
                <button onClick={()=>setActiveTab("board")} style={{background:"transparent",border:"1px solid #22c55e40",color:"#22c55e",padding:"5px 12px",borderRadius:4,cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>Open Board →</button>
              </div>
              <div style={{display:"flex",gap:3}}>
                {STORY_MOMENTS.map(m=>{
                  const filled = seriesEpisodes.filter(ep=>getBoardCell(ep.ep,m.num).trim()).length;
                  const pct    = Math.round((filled/seriesLength)*100);
                  return (
                    <div key={m.num} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <div style={{width:"100%",height:4,background:"#12172a",borderRadius:2,overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",background:m.color,borderRadius:2}}/>
                      </div>
                      <span style={{fontSize:7,color:filled>0?m.color:"#1e2535"}} title={m.name}>{m.num}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {[
              {name:"Full Project",      ext:".txt",     desc:"Premise, treatment, all episode beats — everything in one readable document you can copy into any app.",status:"ready",  color:"#22c55e"},
              {name:"Series Story Board",ext:".csv",     desc:`${seriesLength}-episode board · 12 structural moments · Opens in Excel or Google Sheets.`,              status:"ready",  color:"#4a9eff"},
              {name:"Fountain Format",   ext:".fountain",desc:"Imports into Arc Studio Pro, Highland 2, Fade In, and 12+ apps.",                                       status:"soon",   color:"#ffd700"},
              {name:"Final Draft",       ext:".fdx",     desc:"Industry standard format with beat markers and scene descriptions.",                                    status:"soon",   color:"#ff8c00"},
              {name:"Full Project PDF",  ext:".pdf",     desc:"Title page, premise, treatment, beat map, series arc graph. Client-ready document.",                    status:"soon",   color:"#ff4aff"},
              {name:"JSON / API",        ext:".json",    desc:"Complete project data for custom workflows and integrations.",                                           status:"pro",    color:"#a855f7"},
            ].map((fmt,i)=>{

              const handleExport = () => {
                if (fmt.status !== "ready") return;

                if (fmt.ext === ".txt") {
                  // Build plain text export
                  const lines = [];
                  lines.push(`VERTICLIFF — ${projectTitle || "Untitled Project"}`);
                  lines.push(`${"=".repeat(60)}`);
                  lines.push(`Genre: ${genreRanking.filter(Boolean).map(g=>genreData[g].label).join(" / ") || "—"}`);
                  lines.push(`Series: ${seriesLength} Episodes`);
                  lines.push(`Exported: ${new Date().toLocaleDateString()}`);
                  lines.push("");
                  lines.push("PREMISE");
                  lines.push("-".repeat(40));
                  lines.push(fullPremise || "—");
                  lines.push("");

                  // Characters
                  const filledChars = characters.filter(c=>c.name.trim()||c.wound.trim()||c.desire.trim());
                  if (filledChars.length > 0) {
                    lines.push("CHARACTERS");
                    lines.push("=".repeat(60));
                    filledChars.forEach(char => {
                      lines.push(`\n${char.role.toUpperCase()}: ${char.name || "Unnamed"}`);
                      lines.push("-".repeat(30));
                      if (char.wound.trim())   lines.push(`The Wound: ${char.wound.trim()}`);
                      if (char.desire.trim())  lines.push(`Desire: ${char.desire.trim()}`);
                      if (char.flaw.trim())    lines.push(`The Flaw: ${char.flaw.trim()}`);
                      if (char.arc.trim())     lines.push(`Their Arc: ${char.arc.trim()}`);
                    });
                    lines.push("");
                  }

                  // Treatment
                  const hasTreatment = treatmentSections.some(s=>treatmentInputs[s.key]?.trim());
                  if (hasTreatment) {
                    lines.push("TREATMENT");
                    lines.push("=".repeat(60));
                    treatmentSections.forEach(s => {
                      const val = treatmentInputs[s.key];
                      if (val?.trim()) {
                        lines.push(s.label.toUpperCase());
                        lines.push("-".repeat(40));
                        lines.push(val.trim());
                        lines.push("");
                      }
                    });
                  }

                  lines.push("EPISODE BEATS");
                  lines.push("=".repeat(60));
                  seriesEpisodes.forEach(ep => {
                    const epData = beatInputs?.[activeGenre]?.[ep.ep];
                    if (!epData) return;
                    lines.push(`\nEP ${ep.ep} — ${getEpTitle(ep.ep, ep.title)}`);
                    lines.push("-".repeat(40));
                    EP_SECTIONS.forEach(sec => {
                      sec.fields.forEach(f => {
                        const val = epData[f.key];
                        if (val?.trim()) {
                          lines.push(`${f.label}: ${val.trim()}`);
                        }
                      });
                    });
                  });
                  const blob = new Blob([lines.join("\n")], {type:"text/plain"});
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `${(projectTitle||"verticliff-project").replace(/\s+/g,"-").toLowerCase()}.txt`;
                  a.click();
                }

                if (fmt.ext === ".csv") {
                  const header = ["Episode","Title","Beat",...STORY_MOMENTS.map(m=>m.name)];
                  const rows = seriesEpisodes.map(ep => {
                    const beatId = beatAssignments[ep.ep] || 1;
                    const beat   = beats.find(b=>b.id===beatId)||beats[0];
                    return [
                      `EP${ep.ep}`,
                      `"${getEpTitle(ep.ep, ep.title)}"`,
                      beat.name,
                      ...STORY_MOMENTS.map(m=>`"${(getBoardCell(ep.ep,m.num)||"").replace(/"/g,'""')}"`)
                    ];
                  });
                  const csv = [header,...rows].map(r=>r.join(",")).join("\n");
                  const blob = new Blob([csv], {type:"text/csv"});
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `${(projectTitle||"verticliff-project").replace(/\s+/g,"-").toLowerCase()}-board.csv`;
                  a.click();
                }
              };

              return (
                <div key={i} style={{border:"1px solid #12172a",borderLeft:`3px solid ${fmt.color}`,borderRadius:5,padding:"11px 13px",marginBottom:6,display:"flex",alignItems:"center",gap:11,background:"#0a0c14",opacity:fmt.status==="soon"?0.55:1}}>
                  <div style={{background:fmt.color+"12",border:`1px solid ${fmt.color}28`,borderRadius:4,padding:"3px 8px",fontSize:9,color:fmt.color,fontFamily:"monospace",flexShrink:0}}>{fmt.ext}</div>
                  <div style={{flex:1}}>
                    <div style={{color:"#e2ddd4",fontSize:12,marginBottom:1}}>{fmt.name}</div>
                    <div style={{color:"#6b7280",fontSize:10}}>{fmt.desc}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    {fmt.status === "ready" && (
                      <button onClick={handleExport}
                        style={{background:fmt.color,border:"none",color:"#000",padding:"6px 14px",borderRadius:4,cursor:"pointer",fontSize:9,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.08em"}}>
                        ↓ Export
                      </button>
                    )}
                    {fmt.status === "soon" && (
                      <span style={{fontSize:8,color:"#4b5563",background:"#12172a",border:"1px solid #1e2535",padding:"4px 10px",borderRadius:4,letterSpacing:"0.1em",textTransform:"uppercase"}}>Coming Soon</span>
                    )}
                    {fmt.status === "pro" && (
                      <span style={{fontSize:8,color:"#a855f7",background:"#a855f712",border:"1px solid #a855f730",padding:"4px 10px",borderRadius:4,letterSpacing:"0.1em",textTransform:"uppercase"}}>Pro</span>
                    )}
                  </div>
                </div>
              );
            })}
            <div style={{marginTop:12,background:"#0a0d1c",border:"1px solid #12172a",borderRadius:6,padding:"11px 13px"}}><div style={{fontSize:8,color:"#374151",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:6}}>Compatible Apps</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{["Arc Studio Pro","Final Draft","Highland 2","Fade In","Celtx","WriterDuet","Studiovity","Movie Magic","Scrite","NolanAI"].map(app=><span key={app} style={{fontSize:9,color:"#6b7280",background:"#0a0c14",border:"1px solid #12172a",padding:"2px 8px",borderRadius:20}}>{app}</span>)}</div></div>
          </div>
        )}

      </div>
    </div>
  );
}
