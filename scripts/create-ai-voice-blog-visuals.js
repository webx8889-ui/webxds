const sharp = require("sharp");
const path = require("path");

const outputDir = path.join(__dirname, "..", "assets", "images", "blogs");
const base = (body) => `<svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" y1="0" x2="1200" y2="675" gradientUnits="userSpaceOnUse"><stop stop-color="#0D0D0F"/><stop offset="1" stop-color="#2E1808"/></linearGradient><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter></defs><rect width="1200" height="675" rx="18" fill="url(#bg)"/>${body}</svg>`;

const flow = base(`
  <text x="74" y="93" fill="#FF8A1E" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" letter-spacing="3">VOICE FORM UX</text>
  <text x="74" y="156" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="800">A clear conversation has four stages</text>
  <path d="M192 369H1000" stroke="#FF7900" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/>
  <path d="M383 355l21 14-21 14M584 355l21 14-21 14M785 355l21 14-21 14" stroke="#FF9C42" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <g transform="translate(74 260)"><circle cx="93" cy="109" r="79" fill="#FF7900" opacity=".15" filter="url(#glow)"/><circle cx="93" cy="109" r="62" fill="#171719" stroke="#FF8B1E" stroke-width="2"/><text x="93" y="99" text-anchor="middle" fill="#FF8A1E" font-family="Arial" font-size="22" font-weight="800">01</text><text x="93" y="131" text-anchor="middle" fill="#FFF" font-family="Arial" font-size="19" font-weight="700">ASK</text><text x="93" y="220" text-anchor="middle" fill="#BFBFC1" font-family="Arial" font-size="17">One clear question</text></g>
  <g transform="translate(275 260)"><circle cx="93" cy="109" r="62" fill="#171719" stroke="#FF8B1E" stroke-width="2"/><text x="93" y="99" text-anchor="middle" fill="#FF8A1E" font-family="Arial" font-size="22" font-weight="800">02</text><text x="93" y="131" text-anchor="middle" fill="#FFF" font-family="Arial" font-size="19" font-weight="700">LISTEN</text><text x="93" y="220" text-anchor="middle" fill="#BFBFC1" font-family="Arial" font-size="17">Accept natural answers</text></g>
  <g transform="translate(476 260)"><circle cx="93" cy="109" r="62" fill="#171719" stroke="#FF8B1E" stroke-width="2"/><text x="93" y="99" text-anchor="middle" fill="#FF8A1E" font-family="Arial" font-size="22" font-weight="800">03</text><text x="93" y="131" text-anchor="middle" fill="#FFF" font-family="Arial" font-size="19" font-weight="700">CHECK</text><text x="93" y="220" text-anchor="middle" fill="#BFBFC1" font-family="Arial" font-size="17">Clarify only when needed</text></g>
  <g transform="translate(677 260)"><circle cx="93" cy="109" r="62" fill="#171719" stroke="#FF8B1E" stroke-width="2"/><text x="93" y="99" text-anchor="middle" fill="#FF8A1E" font-family="Arial" font-size="22" font-weight="800">04</text><text x="93" y="131" text-anchor="middle" fill="#FFF" font-family="Arial" font-size="19" font-weight="700">CONFIRM</text><text x="93" y="220" text-anchor="middle" fill="#BFBFC1" font-family="Arial" font-size="17">Summarise important details</text></g>
  <g transform="translate(878 260)"><circle cx="93" cy="109" r="62" fill="#171719" stroke="#FF8B1E" stroke-width="2"/><text x="93" y="99" text-anchor="middle" fill="#FF8A1E" font-family="Arial" font-size="22" font-weight="800">✓</text><text x="93" y="131" text-anchor="middle" fill="#FFF" font-family="Arial" font-size="19" font-weight="700">COMPLETE</text><text x="93" y="220" text-anchor="middle" fill="#BFBFC1" font-family="Arial" font-size="17">Keep an editable record</text></g>
`);

const confirmation = base(`
  <text x="74" y="93" fill="#FF8A1E" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" letter-spacing="3">VOICE CONFIRMATION PATTERN</text>
  <text x="74" y="156" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="800">Make understanding visible</text>
  <rect x="74" y="210" width="490" height="355" rx="20" fill="#18181A" stroke="#FFFFFF" stroke-opacity=".12"/>
  <text x="110" y="270" fill="#BDBDBE" font-family="Arial" font-size="17" font-weight="700" letter-spacing="2">USER SAYS</text>
  <path d="M110 314h322" stroke="#FF7900" stroke-width="3" stroke-linecap="round"/><text x="110" y="365" fill="#FFF" font-family="Arial" font-size="25" font-weight="600">“I need a website for my</text><text x="110" y="401" fill="#FFF" font-family="Arial" font-size="25" font-weight="600">new interior design studio.”</text>
  <circle cx="481" cy="343" r="37" fill="#FF7900"/><path d="M470 333v8a11 11 0 0 0 22 0v-8m-11 19v11m-10 0h20" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round"/>
  <path d="M606 386h83" stroke="#FF8B1E" stroke-width="4" stroke-linecap="round"/><path d="M672 368l20 18-20 18" fill="none" stroke="#FF8B1E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="728" y="210" width="398" height="355" rx="20" fill="#22180F" stroke="#FF8B1E" stroke-opacity=".6"/>
  <text x="764" y="270" fill="#FF9A3E" font-family="Arial" font-size="17" font-weight="700" letter-spacing="2">ASSISTANT SUMMARY</text>
  <text x="764" y="326" fill="#FFF" font-family="Arial" font-size="24" font-weight="700">Website project</text>
  <text x="764" y="369" fill="#D7D7D8" font-family="Arial" font-size="20">Business: Interior design studio</text>
  <text x="764" y="405" fill="#D7D7D8" font-family="Arial" font-size="20">Need: New website</text>
  <rect x="764" y="451" width="233" height="55" rx="28" fill="#FF7900"/>
  <text x="880" y="486" text-anchor="middle" fill="#121212" font-family="Arial" font-size="18" font-weight="800">YES, THAT'S RIGHT</text>
`);

Promise.all([
  sharp(Buffer.from(flow)).webp({ quality: 90 }).toFile(path.join(outputDir, "ai-voice-form-flow.webp")),
  sharp(Buffer.from(confirmation)).webp({ quality: 90 }).toFile(path.join(outputDir, "ai-voice-form-confirmation.webp"))
]).then(() => console.log("Created AI voice blog visuals.")).catch((error) => { console.error(error); process.exitCode = 1; });
