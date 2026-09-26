const sharp = require("sharp");
const path = require("path");

const outputDir = path.join(__dirname, "..", "assets", "images", "blogs");

const cover = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
<rect width="1200" height="630" fill="#121918"/><path d="M0 510h1200" stroke="#33413C"/><path d="M700 0v630" stroke="#33413C"/>
<path d="M738 78h390v474H738z" fill="#19221F"/><path d="M758 98h350v434H758z" fill="#202B27"/>
<text x="68" y="82" fill="#D6FF62" font-family="Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="3">UX FIELD NOTE  /  2026</text>
<text x="66" y="205" fill="#F4F3E9" font-family="Arial,sans-serif" font-size="74" font-weight="800">LESS</text><text x="66" y="286" fill="#F4F3E9" font-family="Arial,sans-serif" font-size="74" font-weight="800">SCREEN.</text>
<text x="66" y="390" fill="#D6FF62" font-family="Arial,sans-serif" font-size="74" font-weight="800">MORE</text><text x="66" y="471" fill="#D6FF62" font-family="Arial,sans-serif" font-size="74" font-weight="800">EXPERIENCE.</text>
<text x="70" y="540" fill="#BBC4BE" font-family="Arial,sans-serif" font-size="20">Design the whole journey, not another destination.</text>
<text x="782" y="135" fill="#BBC4BE" font-family="Arial,sans-serif" font-size="15" font-weight="700" letter-spacing="2">ONE INTENT, CONTINUOUSLY CARRIED</text>
<path d="M824 271C886 194 937 194 991 267s81 93 106 126" fill="none" stroke="#D6FF62" stroke-width="4" stroke-dasharray="3 11" stroke-linecap="round"/>
<circle cx="824" cy="271" r="9" fill="#D6FF62"/><circle cx="991" cy="267" r="9" fill="#D6FF62"/><circle cx="1097" cy="393" r="9" fill="#D6FF62"/>
<rect x="782" y="190" width="116" height="164" rx="12" fill="#111715" stroke="#6D8175" stroke-width="2"/><rect x="794" y="207" width="92" height="62" rx="5" fill="#D6FF62"/><path d="M806 285h68m-68 13h48m-48 23h56" stroke="#AAB7AE" stroke-width="5" stroke-linecap="round"/>
<rect x="937" y="185" width="118" height="164" rx="12" fill="#111715" stroke="#6D8175" stroke-width="2"/><circle cx="996" cy="234" r="20" fill="#F09C72"/><path d="M966 278h60m-60 13h43m-43 24h50" stroke="#AAB7AE" stroke-width="5" stroke-linecap="round"/>
<rect x="1033" y="360" width="123" height="145" rx="12" fill="#D6FF62"/><path d="M1051 389h87m-87 18h63m-63 35h78" stroke="#233027" stroke-width="6" stroke-linecap="round"/><circle cx="1064" cy="474" r="9" fill="#233027"/><path d="m1060 474 3 3 6-7" fill="none" stroke="#D6FF62" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<text x="782" y="545" fill="#BBC4BE" font-family="Arial,sans-serif" font-size="16">NOTICE  →  CHOOSE  →  CONTINUE</text>
</svg>`;

const journey = `<svg width="1200" height="720" viewBox="0 0 1200 720" xmlns="http://www.w3.org/2000/svg">
<rect width="1200" height="720" fill="#F2F0E7"/><text x="72" y="78" fill="#355048" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="2">A JOURNEY IS BIGGER THAN A SCREEN</text><text x="72" y="137" fill="#17231F" font-family="Arial,sans-serif" font-size="42" font-weight="700">Design for the moments that move it forward</text>
<path d="M145 334H1050" fill="none" stroke="#A1B1A4" stroke-width="5"/><path d="m1037 321 18 13-18 13" fill="none" stroke="#355048" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<g font-family="Arial,sans-serif"><circle cx="176" cy="334" r="50" fill="#D6FF62"/><text x="176" y="327" text-anchor="middle" fill="#17231F" font-size="16" font-weight="700">NEED</text><text x="176" y="350" text-anchor="middle" fill="#17231F" font-size="14">appears</text><text x="176" y="421" text-anchor="middle" fill="#17231F" font-size="20" font-weight="700">1. Notice</text><text x="176" y="452" text-anchor="middle" fill="#596760" font-size="16">What brought them here?</text>
<circle cx="456" cy="334" r="50" fill="#F3A17B"/><text x="456" y="327" text-anchor="middle" fill="#17231F" font-size="16" font-weight="700">OPTIONS</text><text x="456" y="350" text-anchor="middle" fill="#17231F" font-size="14">make sense</text><text x="456" y="421" text-anchor="middle" fill="#17231F" font-size="20" font-weight="700">2. Decide</text><text x="456" y="452" text-anchor="middle" fill="#596760" font-size="16">What helps them choose?</text>
<circle cx="736" cy="334" r="50" fill="#B3D9D0"/><text x="736" y="327" text-anchor="middle" fill="#17231F" font-size="16" font-weight="700">ACTION</text><text x="736" y="350" text-anchor="middle" fill="#17231F" font-size="14">feels safe</text><text x="736" y="421" text-anchor="middle" fill="#17231F" font-size="20" font-weight="700">3. Act</text><text x="736" y="452" text-anchor="middle" fill="#596760" font-size="16">Can they complete the job?</text>
<circle cx="1016" cy="334" r="50" fill="#D5B8E3"/><text x="1016" y="327" text-anchor="middle" fill="#17231F" font-size="16" font-weight="700">FOLLOW-</text><text x="1016" y="350" text-anchor="middle" fill="#17231F" font-size="14">THROUGH</text><text x="1016" y="421" text-anchor="middle" fill="#17231F" font-size="20" font-weight="700">4. Continue</text><text x="1016" y="452" text-anchor="middle" fill="#596760" font-size="16">What happens next?</text></g>
<rect x="72" y="535" width="1056" height="116" rx="8" fill="#17231F"/><text x="104" y="581" fill="#D6FF62" font-family="Arial,sans-serif" font-size="17" font-weight="700">THE DESIGN QUESTION</text><text x="104" y="619" fill="#F2F0E7" font-family="Arial,sans-serif" font-size="23">What does the person need to understand, decide, or do at this moment?</text>
</svg>`;

const handoff = `<svg width="1200" height="720" viewBox="0 0 1200 720" xmlns="http://www.w3.org/2000/svg">
<rect width="1200" height="720" fill="#172523"/><text x="72" y="78" fill="#D6FF62" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="2">CONTEXT SHOULD TRAVEL WITH THE PERSON</text><text x="72" y="139" fill="#F2F0E7" font-family="Arial,sans-serif" font-size="42" font-weight="700">A channel change is not a fresh start</text>
<rect x="80" y="214" width="360" height="330" rx="12" fill="#F2F0E7"/><text x="112" y="261" fill="#355048" font-family="Arial,sans-serif" font-size="16" font-weight="700" letter-spacing="1">ON THE WEBSITE</text><text x="112" y="315" fill="#17231F" font-family="Arial,sans-serif" font-size="25" font-weight="700">Project enquiry</text><path d="M112 348h270" stroke="#C4CEC5" stroke-width="2"/><text x="112" y="391" fill="#596760" font-family="Arial,sans-serif" font-size="18">Goal</text><text x="112" y="420" fill="#17231F" font-family="Arial,sans-serif" font-size="19">Redesign an online store</text><text x="112" y="466" fill="#596760" font-family="Arial,sans-serif" font-size="18">Already shared</text><rect x="112" y="484" width="122" height="34" rx="17" fill="#D6FF62"/><text x="173" y="507" text-anchor="middle" fill="#17231F" font-family="Arial,sans-serif" font-size="14" font-weight="700">BUSINESS TYPE</text><rect x="244" y="484" width="102" height="34" rx="17" fill="#B3D9D0"/><text x="295" y="507" text-anchor="middle" fill="#17231F" font-family="Arial,sans-serif" font-size="14" font-weight="700">TIMELINE</text>
<path d="M472 375h220" stroke="#D6FF62" stroke-width="5" stroke-dasharray="9 11"/><path d="m674 359 22 16-22 16" fill="none" stroke="#D6FF62" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="582" cy="375" r="37" fill="#F3A17B"/><path d="M570 375h24m-12-12v24" stroke="#17231F" stroke-width="4" stroke-linecap="round"/>
<rect x="760" y="214" width="360" height="330" rx="12" fill="#273A35" stroke="#77958A" stroke-width="2"/><text x="792" y="261" fill="#D6FF62" font-family="Arial,sans-serif" font-size="16" font-weight="700" letter-spacing="1">IN A TEAM CONVERSATION</text><text x="792" y="315" fill="#F2F0E7" font-family="Arial,sans-serif" font-size="25" font-weight="700">Pick up where you left off</text><path d="M792 348h270" stroke="#52665E" stroke-width="2"/><text x="792" y="392" fill="#B8C6BF" font-family="Arial,sans-serif" font-size="18">Your goal and timeline are here.</text><text x="792" y="429" fill="#B8C6BF" font-family="Arial,sans-serif" font-size="18">No need to repeat the brief.</text><rect x="792" y="467" width="228" height="48" rx="6" fill="#D6FF62"/><text x="906" y="497" text-anchor="middle" fill="#17231F" font-family="Arial,sans-serif" font-size="16" font-weight="700">CONTINUE THE CONVERSATION</text>
<text x="82" y="612" fill="#B8C6BF" font-family="Arial,sans-serif" font-size="18">Carry only useful, permissioned context. Let people review, edit, or remove it.</text>
</svg>`;

const measurement = `<svg width="1200" height="720" viewBox="0 0 1200 720" xmlns="http://www.w3.org/2000/svg">
<rect width="1200" height="720" fill="#F5F1EA"/><text x="72" y="78" fill="#8C462E" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="2">MEASURE THE EXPERIENCE, NOT THE SCREEN COUNT</text><text x="72" y="139" fill="#202725" font-family="Arial,sans-serif" font-size="42" font-weight="700">A small scorecard for better journeys</text>
<g font-family="Arial,sans-serif"><rect x="72" y="192" width="510" height="190" rx="8" fill="#FFFFFF"/><circle cx="120" cy="245" r="23" fill="#D6FF62"/><text x="120" y="252" text-anchor="middle" fill="#202725" font-size="18" font-weight="700">01</text><text x="162" y="251" fill="#202725" font-size="23" font-weight="700">Time to first value</text><text x="108" y="299" fill="#596760" font-size="17">How quickly can someone make progress?</text><path d="M108 337h400" stroke="#CFD6CE" stroke-width="2"/><text x="108" y="364" fill="#8C462E" font-size="15" font-weight="700">WATCH FOR: SETUP BEFORE THE PAYOFF</text>
<rect x="618" y="192" width="510" height="190" rx="8" fill="#FFFFFF"/><circle cx="666" cy="245" r="23" fill="#F3A17B"/><text x="666" y="252" text-anchor="middle" fill="#202725" font-size="18" font-weight="700">02</text><text x="708" y="251" fill="#202725" font-size="23" font-weight="700">Effort at key decisions</text><text x="654" y="299" fill="#596760" font-size="17">Where do people hesitate or abandon?</text><path d="M654 337h400" stroke="#CFD6CE" stroke-width="2"/><text x="654" y="364" fill="#8C462E" font-size="15" font-weight="700">WATCH FOR: REPEATED INPUT AND UNCERTAINTY</text>
<rect x="72" y="412" width="510" height="190" rx="8" fill="#FFFFFF"/><circle cx="120" cy="465" r="23" fill="#B3D9D0"/><text x="120" y="472" text-anchor="middle" fill="#202725" font-size="18" font-weight="700">03</text><text x="162" y="471" fill="#202725" font-size="23" font-weight="700">Recovery and completion</text><text x="108" y="519" fill="#596760" font-size="17">Can someone recover and finish the task?</text><path d="M108 557h400" stroke="#CFD6CE" stroke-width="2"/><text x="108" y="584" fill="#8C462E" font-size="15" font-weight="700">WATCH FOR: ERRORS WITHOUT A NEXT STEP</text>
<rect x="618" y="412" width="510" height="190" rx="8" fill="#202725"/><circle cx="666" cy="465" r="23" fill="#D5B8E3"/><text x="666" y="472" text-anchor="middle" fill="#202725" font-size="18" font-weight="700">04</text><text x="708" y="471" fill="#F5F1EA" font-size="23" font-weight="700">Confidence and continuity</text><text x="654" y="519" fill="#CAD2CC" font-size="17">Do people trust what happens next?</text><path d="M654 557h400" stroke="#52615A" stroke-width="2"/><text x="654" y="584" fill="#D6FF62" font-size="15" font-weight="700">WATCH FOR: CONTEXT LOST BETWEEN TOUCHPOINTS</text></g>
<text x="74" y="659" fill="#596760" font-family="Arial,sans-serif" font-size="17">Pair behavioural signals with research. A fast journey is not automatically a good one.</text>
</svg>`;

async function writeImage(name, svg, format) {
  const image = sharp(Buffer.from(svg)).resize({ width: 1200 });
  const outputPath = path.join(outputDir, name);
  if (format === "webp") await image.webp({ quality: 90 }).toFile(outputPath);
  else await image.png({ compressionLevel: 9 }).toFile(outputPath);
  return outputPath;
}

Promise.all([
  writeImage("better-experiences-ux-cover.webp", cover, "webp"),
  writeImage("better-experiences-journey.png", journey, "png"),
  writeImage("better-experiences-context-handoff.webp", handoff, "webp"),
  writeImage("better-experiences-scorecard.png", measurement, "png")
]).then((files) => console.log(`Created ${files.length} blog visuals.`)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});