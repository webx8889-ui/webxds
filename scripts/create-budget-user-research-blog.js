const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const blogDir = path.join(root, 'assets', 'images', 'blogs');
const slug = 'how-to-conduct-user-research-on-a-limited-budget';
const title = 'How to Conduct User Research on a Limited Budget';
const dateIso = '2026-11-24';

function svgToPng(name, svg, width, height) {
  return sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(path.join(blogDir, name));
}

const cover = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
<rect width="1200" height="630" fill="#111817"/><path d="M0 487H1200M720 0V630" stroke="#2D3A37" stroke-width="2"/>
<text x="65" y="83" fill="#FF6B00" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="3">UX RESEARCH PLAYBOOK / SMALL BUDGET</text>
<text x="65" y="191" fill="#F6F1E8" font-family="Arial,sans-serif" font-size="64" font-weight="800">RESEARCH</text><text x="65" y="264" fill="#F6F1E8" font-family="Arial,sans-serif" font-size="64" font-weight="800">SMARTER.</text><text x="65" y="337" fill="#FF6B00" font-family="Arial,sans-serif" font-size="64" font-weight="800">SPEND LESS.</text>
<text x="69" y="399" fill="#BCC5C0" font-family="Arial,sans-serif" font-size="21">Five lean methods for learning what people really need.</text>
<rect x="67" y="452" width="537" height="79" rx="12" fill="#1C2926" stroke="#40534D"/><text x="94" y="484" fill="#FF6B00" font-family="Arial,sans-serif" font-size="14" font-weight="700" letter-spacing="2">THE LEAN RESEARCH LOOP</text><text x="94" y="514" fill="#F6F1E8" font-family="Arial,sans-serif" font-size="20" font-weight="700">Ask → Observe → Prioritise → Improve</text>
<rect x="779" y="64" width="343" height="500" rx="20" fill="#1B2724" stroke="#4C6059" stroke-width="2"/><rect x="804" y="92" width="293" height="72" rx="10" fill="#F6F1E8"/><circle cx="840" cy="128" r="18" fill="#FF6B00"/><path d="M834 128h12m-6-6v12" stroke="#111817" stroke-width="3" stroke-linecap="round"/><text x="873" y="124" fill="#1C2926" font-family="Arial,sans-serif" font-size="16" font-weight="700">Recruit one real user</text><text x="873" y="146" fill="#61706A" font-family="Arial,sans-serif" font-size="13">A focused learning question</text>
<path d="M950 181v32" stroke="#FF6B00" stroke-width="3" stroke-dasharray="4 7"/><rect x="804" y="218" width="293" height="93" rx="10" fill="#263733"/><text x="829" y="249" fill="#FF6B00" font-family="Arial,sans-serif" font-size="14" font-weight="700" letter-spacing="1">15-MINUTE TASK TEST</text><path d="M829 269h184M829 286h147" stroke="#9CAC A5" stroke-width="6" stroke-linecap="round"/><circle cx="1042" cy="275" r="26" fill="#FF6B00"/><path d="M1032 275h20m-10-10v20" stroke="#111817" stroke-width="3" stroke-linecap="round"/>
<path d="M950 328v32" stroke="#FF6B00" stroke-width="3" stroke-dasharray="4 7"/><rect x="804" y="365" width="293" height="145" rx="10" fill="#F6F1E8"/><text x="829" y="398" fill="#61706A" font-family="Arial,sans-serif" font-size="13" font-weight="700" letter-spacing="1">ONE EVIDENCE BOARD</text><rect x="829" y="418" width="105" height="57" rx="7" fill="#FFD3B5"/><rect x="946" y="418" width="125" height="57" rx="7" fill="#D8E7D3"/><text x="841" y="445" fill="#242F2B" font-family="Arial,sans-serif" font-size="14" font-weight="700">WHAT</text><text x="841" y="463" fill="#242F2B" font-family="Arial,sans-serif" font-size="14" font-weight="700">HAPPENED?</text><text x="958" y="445" fill="#242F2B" font-family="Arial,sans-serif" font-size="14" font-weight="700">WHAT TO</text><text x="958" y="463" fill="#242F2B" font-family="Arial,sans-serif" font-size="14" font-weight="700">CHANGE?</text>
</svg>`;

const methods = `<svg width="1200" height="720" viewBox="0 0 1200 720" xmlns="http://www.w3.org/2000/svg">
<rect width="1200" height="720" fill="#F4F0E8"/><text x="68" y="76" fill="#D75400" font-family="Arial,sans-serif" font-size="16" font-weight="700" letter-spacing="2">START WITH THE LEAST EXPENSIVE SIGNAL THAT CAN ANSWER THE QUESTION</text><text x="68" y="138" fill="#18231F" font-family="Arial,sans-serif" font-size="43" font-weight="800">A practical low-cost research stack</text>
<g font-family="Arial,sans-serif"><rect x="68" y="190" width="505" height="193" rx="14" fill="#FFFDFC"/><circle cx="119" cy="242" r="25" fill="#FF6B00"/><text x="119" y="249" text-anchor="middle" fill="#fff" font-size="18" font-weight="800">01</text><text x="162" y="247" fill="#18231F" font-size="26" font-weight="800">Support &amp; sales notes</text><text x="104" y="291" fill="#5B6962" font-size="18">Mine questions, objections and workarounds</text><text x="104" y="321" fill="#D75400" font-size="14" font-weight="700">COST: FREE  •  BEST FOR: REPEATED FRICTION</text><path d="M104 351h390" stroke="#DDE2DB" stroke-width="2"/><text x="104" y="372" fill="#18231F" font-size="16">Make a weekly 20-minute pattern review.</text>
<rect x="627" y="190" width="505" height="193" rx="14" fill="#1C2926"/><circle cx="678" cy="242" r="25" fill="#FF6B00"/><text x="678" y="249" text-anchor="middle" fill="#fff" font-size="18" font-weight="800">02</text><text x="721" y="247" fill="#F4F0E8" font-size="26" font-weight="800">Five-user task tests</text><text x="663" y="291" fill="#C6D0C9" font-size="18">Watch people try one crucial workflow</text><text x="663" y="321" fill="#FF9C5A" font-size="14" font-weight="700">COST: TIME OR A SMALL THANK-YOU</text><path d="M663 351h390" stroke="#40534D" stroke-width="2"/><text x="663" y="372" fill="#F4F0E8" font-size="16">Use a prototype or the live product.</text>
<rect x="68" y="424" width="505" height="193" rx="14" fill="#D7E9DE"/><circle cx="119" cy="476" r="25" fill="#18231F"/><text x="119" y="483" text-anchor="middle" fill="#fff" font-size="18" font-weight="800">03</text><text x="162" y="481" fill="#18231F" font-size="26" font-weight="800">Behavioural analytics</text><text x="104" y="525" fill="#40534D" font-size="18">Find where people pause, loop or leave</text><text x="104" y="555" fill="#18231F" font-size="14" font-weight="700">COST: OFTEN ALREADY AVAILABLE</text><path d="M104 585h390" stroke="#B5CFBF" stroke-width="2"/><text x="104" y="606" fill="#18231F" font-size="16">Use it to choose where to look closer.</text>
<rect x="627" y="424" width="505" height="193" rx="14" fill="#FFD8C0"/><circle cx="678" cy="476" r="25" fill="#D75400"/><text x="678" y="483" text-anchor="middle" fill="#fff" font-size="18" font-weight="800">04</text><text x="721" y="481" fill="#18231F" font-size="26" font-weight="800">One-question intercept</text><text x="663" y="525" fill="#40534D" font-size="18">Ask at the moment a decision is made</text><text x="663" y="555" fill="#D75400" font-size="14" font-weight="700">COST: FREE WITH A SIMPLE FORM</text><path d="M663 585h390" stroke="#F1B992" stroke-width="2"/><text x="663" y="606" fill="#18231F" font-size="16">Keep it specific: “What nearly stopped you?”</text></g></svg>`;

const plan = `<svg width="1200" height="720" viewBox="0 0 1200 720" xmlns="http://www.w3.org/2000/svg">
<rect width="1200" height="720" fill="#17221F"/><text x="70" y="75" fill="#FF8B45" font-family="Arial,sans-serif" font-size="16" font-weight="700" letter-spacing="2">A 10-DAY RESEARCH SPRINT</text><text x="70" y="137" fill="#F5F0E7" font-family="Arial,sans-serif" font-size="43" font-weight="800">From uncertainty to a clear next move</text>
<path d="M138 353H1062" stroke="#51645C" stroke-width="4"/><g font-family="Arial,sans-serif"><circle cx="162" cy="353" r="46" fill="#FF6B00"/><text x="162" y="347" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">DAYS</text><text x="162" y="370" text-anchor="middle" fill="#fff" font-size="18" font-weight="800">1–2</text><text x="162" y="444" text-anchor="middle" fill="#F5F0E7" font-size="20" font-weight="800">Frame</text><text x="162" y="474" text-anchor="middle" fill="#BFCAC3" font-size="16">Choose one risk</text><circle cx="440" cy="353" r="46" fill="#D7E9DE"/><text x="440" y="347" text-anchor="middle" fill="#17221F" font-size="14" font-weight="700">DAYS</text><text x="440" y="370" text-anchor="middle" fill="#17221F" font-size="18" font-weight="800">3–5</text><text x="440" y="444" text-anchor="middle" fill="#F5F0E7" font-size="20" font-weight="800">Listen</text><text x="440" y="474" text-anchor="middle" fill="#BFCAC3" font-size="16">Five conversations</text><circle cx="718" cy="353" r="46" fill="#FFD8C0"/><text x="718" y="347" text-anchor="middle" fill="#17221F" font-size="14" font-weight="700">DAYS</text><text x="718" y="370" text-anchor="middle" fill="#17221F" font-size="18" font-weight="800">6–7</text><text x="718" y="444" text-anchor="middle" fill="#F5F0E7" font-size="20" font-weight="800">Synthesize</text><text x="718" y="474" text-anchor="middle" fill="#BFCAC3" font-size="16">Cluster evidence</text><circle cx="996" cy="353" r="46" fill="#F5F0E7"/><text x="996" y="347" text-anchor="middle" fill="#17221F" font-size="14" font-weight="700">DAYS</text><text x="996" y="370" text-anchor="middle" fill="#17221F" font-size="18" font-weight="800">8–10</text><text x="996" y="444" text-anchor="middle" fill="#F5F0E7" font-size="20" font-weight="800">Act</text><text x="996" y="474" text-anchor="middle" fill="#BFCAC3" font-size="16">Test a change</text></g>
<rect x="70" y="559" width="1060" height="84" rx="12" fill="#263630"/><text x="103" y="593" fill="#FF8B45" font-family="Arial,sans-serif" font-size="15" font-weight="700" letter-spacing="1">THE OUTPUT IS NOT A DECK.</text><text x="103" y="622" fill="#F5F0E7" font-family="Arial,sans-serif" font-size="20" font-weight="700">It is one evidence-backed decision your team can confidently make next.</text></svg>`;

async function createVisuals() {
  await Promise.all([
    svgToPng('limited-budget-user-research-cover.png', cover, 1200, 630),
    svgToPng('limited-budget-research-stack.png', methods, 1200, 720),
    svgToPng('limited-budget-research-sprint.png', plan, 1200, 720)
  ]);
}

const article = `
          <p class="blog-intro">Good user research is not a luxury reserved for teams with a dedicated lab and a large budget. It is a habit of reducing uncertainty before expensive decisions are made.</p>
          <p class="blog-intro">With a focused question, a small group of the right people, and a lightweight way to capture what you learn, even a lean team can uncover the friction that matters most. This guide shows how to do it without mistaking activity for insight.</p>

          <section class="blog-page-section" aria-labelledby="start-small">
            <h2 class="section-heading" id="start-small">Start With One Decision, Not a Broad Brief</h2>
            <p class="section-text">A limited budget becomes a strength when it forces focus. Instead of asking whether people “like” a product, write down the one decision your team needs to make: Should we change onboarding? Why do qualified leads abandon the form? Can customers understand the new pricing?</p>
            <p class="section-text">A useful research question is specific enough to guide what you watch for, but open enough to let unexpected patterns appear. It keeps you from paying for answers you will not use.</p>
            <ul class="section-list"><li><strong style="color:#fff;">Weak question:</strong> “What do users think of the website?”</li><li><strong style="color:#fff;">Useful question:</strong> “What information do first-time visitors need before they feel confident requesting a quote?”</li><li><strong style="color:#fff;">Useful question:</strong> “Where does a new customer lose momentum while setting up their first project?”</li></ul>
          </section>

          <figure class="blog-inline-visual"><img src="/assets/images/blogs/limited-budget-research-stack.png" alt="Four affordable user research methods: support notes, five-user task tests, analytics and intercept questions" width="1200" height="720" loading="lazy" /><figcaption>Choose the lightest method that can give you credible evidence for the decision at hand.</figcaption></figure>

          <section class="blog-page-section" aria-labelledby="cheap-signals">
            <h2 class="section-heading" id="cheap-signals">Use the Evidence You Already Have</h2>
            <p class="section-text">Before recruiting anyone, look at the conversations and behaviour your business already creates. Support tickets, sales-call notes, form responses, search terms, app reviews and session analytics are all low-cost signals. They are not a substitute for watching people use a product, but they are excellent at showing where to look.</p>
            <p class="section-text">Create a simple evidence board with three columns: <em>what happened</em>, <em>what it might mean</em>, and <em>what we need to validate</em>. Separate direct quotes or observed behaviour from your interpretation. That single discipline prevents a team from treating a hunch as a finding.</p>
          </section>

          <section class="blog-page-section" aria-labelledby="choose-method">
            <h2 class="section-heading" id="choose-method">Choose the Right Method for the Risk</h2>
            <p class="section-text">Every research method answers a different kind of question. Interviews help you understand context, motivation and language. Usability tests show where an interface breaks down. Surveys are useful when you need to measure the size of a known pattern. Analytics show where to investigate, but rarely explain why the behaviour happened.</p>
            <ul class="section-list"><li><strong style="color:#fff;">Use interviews</strong> when you need to understand the problem before designing a solution.</li><li><strong style="color:#fff;">Use task tests</strong> when you need to learn whether people can use a page, flow or prototype.</li><li><strong style="color:#fff;">Use a short survey</strong> when you have a focused question and enough relevant respondents.</li><li><strong style="color:#fff;">Use analytics</strong> to identify high-friction moments worth studying with people.</li></ul>
          </section>

          <section class="blog-page-section" aria-labelledby="discussion-guide">
            <h2 class="section-heading" id="discussion-guide">Create a Lightweight Discussion Guide</h2>
            <p class="section-text">A discussion guide keeps a short session consistent without turning it into a script. It should be a page of prompts, not a questionnaire. Start with the participant's situation, move into the relevant task, and leave room to follow the details that matter.</p>
            <ol class="section-list"><li><strong style="color:#fff;">Warm-up:</strong> Ask about their current process, needs and constraints.</li><li><strong style="color:#fff;">Context:</strong> Find out what triggered the task and what a successful outcome looks like.</li><li><strong style="color:#fff;">Task:</strong> Give a realistic scenario and observe the path they choose.</li><li><strong style="color:#fff;">Reflection:</strong> Ask what felt clear, uncertain, useful or missing.</li><li><strong style="color:#fff;">Close:</strong> Invite anything you did not ask about that would improve the experience.</li></ol>
          </section>

          <section class="blog-page-section" aria-labelledby="ask-better-questions">
            <h2 class="section-heading" id="ask-better-questions">Ask Questions That Reveal Behaviour</h2>
            <p class="section-text">People are often generous, polite and poor at predicting their future behaviour. Questions about a real recent experience are more reliable than hypothetical opinions. Replace “Would you use this?” with “Tell me about the last time you tried to do this.”</p>
            <ul class="section-list"><li>Ask for examples, not approval: “What happened next?”</li><li>Probe the moment of friction: “What were you expecting here?”</li><li>Use neutral language so you do not lead someone toward the answer you want.</li><li>Do not explain the interface during a task; confusion is useful evidence.</li></ul>
          </section>

          <section class="blog-page-section" aria-labelledby="recruit">
            <h2 class="section-heading" id="recruit">Recruit Five Relevant People, Not Fifty Random Ones</h2>
            <p class="section-text">For early usability work, a handful of people who resemble your real audience is often far more valuable than a large generic survey. Start with recent customers, qualified leads, newsletter subscribers, community members or people referred by your network. Be transparent about the time required and offer a small thank-you if you can.</p>
            <ul class="section-list"><li>Recruit against a behaviour or need, not just an age or job title.</li><li>Use a short screener: what have they tried, what is their goal, and how recently did they face this problem?</li><li>Do not recruit friends or colleagues for a decision that depends on genuine customer behaviour.</li><li>Five sessions can reveal recurring usability friction; do more when you need confidence across distinct audience segments.</li></ul>
          </section>

          <section class="blog-page-section" aria-labelledby="sessions">
            <h2 class="section-heading" id="sessions">Run Short, Task-Based Sessions</h2>
            <p class="section-text">You do not need a formal lab. A video call, a prototype, and permission to record notes are enough. Give the participant a realistic goal instead of a list of instructions: “You need to compare two options and decide which fits your team,” not “click the pricing tab.”</p>
            <p class="section-text">Ask them to think aloud. Then stay quiet. Your job is to notice hesitation, workarounds, missing information and the words people use—not to persuade them that the design makes sense.</p>
            <ol class="section-list"><li>Set context and explain that you are testing the product, not the participant.</li><li>Give one task at a time and let them choose their own path.</li><li>Probe after the task: “What did you expect to happen?” and “What made that feel unclear?”</li><li>Capture short quotes, observable behaviour and exact points of friction.</li></ol>
          </section>

          <figure class="blog-inline-visual"><img src="/assets/images/blogs/limited-budget-research-sprint.png" alt="Ten-day lean user research sprint from defining a risk to testing an improvement" width="1200" height="720" loading="lazy" /><figcaption>A short research sprint is most useful when it ends with a decision and a next experiment—not a presentation that sits unread.</figcaption></figure>

          <section class="blog-page-section" aria-labelledby="synthesis">
            <h2 class="section-heading" id="synthesis">Turn Notes Into Priorities, Not a Long Report</h2>
            <p class="section-text">After every session, capture the same four things: the task, what the person did, what they said, and the impact on their goal. Then group similar observations. A pattern is stronger when it appears across people, tasks and data sources.</p>
            <p class="section-text">Prioritize findings by the harm they cause, not by how dramatic they sound. Focus first on problems that block an important task, create avoidable uncertainty, reduce trust, or push people into support.</p>
            <ul class="section-list"><li><strong style="color:#fff;">High priority:</strong> people cannot complete a core task or misunderstand a critical commitment.</li><li><strong style="color:#fff;">Medium priority:</strong> people complete the task but with doubt, delay or unnecessary work.</li><li><strong style="color:#fff;">Low priority:</strong> polish issues that do not materially change the outcome.</li></ul>
          </section>

          <section class="blog-page-section" aria-labelledby="share-findings">
            <h2 class="section-heading" id="share-findings">Share Findings So the Team Can Act</h2>
            <p class="section-text">A research readout does not need to be long to be persuasive. Share the decision you were investigating, the people you spoke with, the strongest evidence, and the next action. Pair each key finding with a direct quote, observation or behavioural signal so stakeholders can see the basis for the recommendation.</p>
            <p class="section-text">A one-page summary is usually enough: three to five findings, their impact, confidence level, and the owner of the next experiment. This keeps insight close to the work instead of leaving it in a forgotten slide deck.</p>
          </section>

          <section class="blog-page-section" aria-labelledby="avoid-mistakes">
            <h2 class="section-heading" id="avoid-mistakes">Common Low-Budget Research Mistakes to Avoid</h2>
            <ul class="section-list"><li><strong style="color:#fff;">Trying to answer everything:</strong> a broad study creates vague insights. Focus on one decision at a time.</li><li><strong style="color:#fff;">Only asking internal teams:</strong> colleagues have useful context, but they are not a replacement for customers.</li><li><strong style="color:#fff;">Treating one comment as a trend:</strong> look for repeated behaviour and confirm important patterns with more than one source.</li><li><strong style="color:#fff;">Collecting notes without a decision:</strong> every study should end with a next action, owner and deadline.</li><li><strong style="color:#fff;">Skipping consent:</strong> tell participants why you are speaking with them, how notes or recordings will be used, and that they may stop at any time.</li></ul>
          </section>

          <section class="blog-page-section" aria-labelledby="budget-plan">
            <h2 class="section-heading" id="budget-plan">A Simple Budget Plan You Can Repeat</h2>
            <p class="section-text">Make research a recurring operating rhythm rather than a one-time project. Choose one product risk each month. Spend a few days reviewing existing evidence, speak to five relevant people, share a one-page summary, and test the most promising improvement.</p>
            <p class="section-text">The best low-budget programme is not the one with the most methods. It is the one that repeatedly connects what customers experience to what the team builds next.</p>
          </section>

          <section class="blog-page-section" aria-labelledby="final-thoughts">
            <h2 class="section-heading" id="final-thoughts">Final Thoughts</h2>
            <p class="section-text">A small research budget should change the scope of your question, not your commitment to learning. Start with a decision that matters, make space for direct observation, and let evidence—not internal opinion—shape the next move.</p>
            <p class="section-text">When teams learn in small, regular loops, they catch expensive mistakes earlier and build with far more confidence.</p>
            <p class="section-text">Want help turning customer evidence into a clearer website or product experience? <a class="blog-cta-link" href="/pages/main/contact-page.html">Talk to Webx Design Studio about your project.</a></p>
          </section>`;

function createArticle() {
  const source = fs.readFileSync(path.join(root, 'pages', 'blogs', 'heuristic-evaluation-methods-for-web-apps.html'), 'utf8');
  let out = source
    .replaceAll('Heuristic Evaluation Methods for Web Apps: A Practical UX Review Framework', title)
    .replaceAll('Heuristic Evaluation Methods for Web Apps', title)
    .replaceAll('heuristic-evaluation-methods-for-web-apps', slug)
    .replaceAll('heuristic-evaluation-methods-web-apps.png', 'limited-budget-user-research-cover.png')
    .replaceAll('UX Research', 'UX Research')
    .replaceAll('2026-09-02', dateIso)
    .replaceAll('02 Sep 26', '24 Nov 26')
    .replaceAll('heuristic evaluation', 'budget user research')
    .replaceAll('web app usability', 'lean research')
    .replaceAll('usability review', 'user interviews')
    .replace('A practical guide to running heuristic evaluations for web apps and turning usability issues into product decisions.', 'A practical, low-cost playbook for gathering credible user insight, finding product friction, and making better design decisions.')
    .replace('Learn practical heuristic evaluation methods for web apps, including expert reviews, severity scoring, task analysis, and usability walkthroughs for better UX decisions.', 'Learn how to conduct user research on a limited budget with focused interviews, task tests, existing customer evidence, and a repeatable lean research sprint.')
    .replace('Heuristic evaluation framework for improving web app usability', 'A lean user research workflow that turns small-budget learning into product decisions')
    .replace('Need a usability review for your web app?', 'Need research that moves your product forward?')
    .replace(/<article class="blog-article"[\s\S]*?<\/article>/, `<article class="blog-article" itemscope itemtype="https://schema.org/BlogPosting"><meta itemprop="headline" content="${title}" /><meta itemprop="datePublished" content="${dateIso}" />${article}</article>`)
    .replace(/<script type="application\/ld\+json">\s*\{"@context":"https:\/\/schema.org","@type":"FAQPage"[\s\S]*?<\/script>/, `<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Can you conduct useful user research with a small budget?","acceptedAnswer":{"@type":"Answer","text":"Yes. Focus on one decision, use existing customer signals, recruit a small number of relevant participants, and watch them attempt a realistic task. Regular small studies can create strong evidence without a costly lab."}},{"@type":"Question","name":"How many people do I need for low-budget usability testing?","acceptedAnswer":{"@type":"Answer","text":"Five relevant participants can often expose recurring usability problems in a focused flow. Expand the sample when you need coverage across distinct audience segments or need to measure a pattern quantitatively."}},{"@type":"Question","name":"What is the cheapest way to start user research?","acceptedAnswer":{"@type":"Answer","text":"Start with support notes, sales-call patterns, form responses, and product analytics to identify a risky moment. Then run short task-based conversations with people who match the audience you are trying to serve."}}]}</script>`);
  out = out
    .replace(/<meta name="description" content="[^"]*" \/>/, '<meta name="description" content="Learn how to conduct user research on a limited budget with focused interviews, task tests, existing customer evidence, and a repeatable lean research sprint." />')
    .replace(/<meta name="keywords" content="[^"]*" \/>/, '<meta name="keywords" content="user research on a limited budget, low budget UX research, affordable usability testing, lean user research, product discovery methods" />')
    .replace(/<meta property="og:description" content="[^"]*" \/>/, '<meta property="og:description" content="A practical, low-cost playbook for gathering credible user insight, finding product friction, and making better design decisions." />')
    .replace(/<meta property="og:image:alt" content="[^"]*" \/>/, '<meta property="og:image:alt" content="A lean user research workflow for product teams with a limited budget" />')
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, '<meta name="twitter:description" content="Learn focused, affordable user research methods that help teams make better product decisions." />')
    .replace(/<meta name="twitter:image:alt" content="[^"]*" \/>/, '<meta name="twitter:image:alt" content="A lean user research workflow for product teams with a limited budget" />')
    .replace(/<script type="application\/ld\+json">\s*\{"@context":"https:\/\/schema.org","@type":"BlogPosting"[\s\S]*?<\/script>/, `<script type="application/ld+json">{"@context":"https://schema.org","@type":"BlogPosting","headline":"${title}","description":"Learn how to conduct user research on a limited budget with focused interviews, task tests, existing customer evidence, and a repeatable lean research sprint.","image":["https://webxds.com/assets/images/blogs/limited-budget-user-research-cover.png"],"url":"https://webxds.com/pages/blogs/${slug}.html","datePublished":"${dateIso}","dateModified":"${dateIso}","author":{"@type":"Organization","name":"Webx Design Studio","url":"https://webxds.com"},"publisher":{"@type":"Organization","name":"Webx Design Studio","url":"https://webxds.com","logo":{"@type":"ImageObject","url":"https://webxds.com/assets/images/logos/webx-logo.svg"}},"keywords":["user research on a limited budget","low budget UX research","affordable usability testing","lean user research"],"articleSection":"UX Research","mainEntityOfPage":{"@type":"WebPage","@id":"https://webxds.com/pages/blogs/${slug}.html"}}</script>`)
    .replace('Editorial cover representing budget user research for lean research', 'Editorial cover showing a lean user research workflow for product teams with a limited budget')
    .replace('Need a user interviews for your web app?', 'Need research that moves your product forward?');
  fs.writeFileSync(path.join(root, 'pages', 'blogs', `${slug}.html`), out);
}

const card = `          <article class="blog-card">\n            <div class="blog-image"><img src="/assets/images/blogs/limited-budget-user-research-cover.png" alt="Lean user research workflow for a product team on a limited budget" width="400" height="240" loading="lazy" /></div>\n            <div class="blog-content"><h2 class="blog-card-title">How to Conduct User Research on a Limited Budget | Webx Design Studio</h2><div class="blog-meta"><div class="blog-tags"><span class="blog-tag">user research</span><span class="blog-tag">UX research</span><span class="blog-tag">product discovery</span></div><span class="blog-date"><time datetime="2026-11-24">Date: 24 Nov 26</time></span></div><p class="blog-excerpt">A practical low-cost research playbook: use existing signals, run focused task tests, find patterns, and turn insight into the next product decision.</p><a href="/pages/blogs/${slug}.html" class="blog-read-more" aria-label="Read ${title} | Webx Design Studio"><span>READ MORE</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg></a></div>\n          </article>\n\n`;

function addListings() {
  const listingPath = path.join(root, 'pages', 'blogs', 'blogs.html');
  let listing = fs.readFileSync(listingPath, 'utf8');
  if (!listing.includes(`${slug}.html`)) listing = listing.replace('          <article class="blog-card">', card + '          <article class="blog-card">');
  fs.writeFileSync(listingPath, listing);

  const relatedPath = path.join(root, 'js', 'related-blogs.js');
  let related = fs.readFileSync(relatedPath, 'utf8');
  const post = `    { slug: '${slug}', title: '${title}', category: 'UX Research', date: '24 Nov 26', image: '/assets/images/blogs/limited-budget-user-research-cover.png', href: '/pages/blogs/${slug}.html', alt: 'Lean user research workflow for a product team on a limited budget' },\n`;
  if (!related.includes(`slug: '${slug}'`)) related = related.replace('    { slug:', post + '    { slug:');
  fs.writeFileSync(relatedPath, related);
}

function addSitemap(file) {
  let xml = fs.readFileSync(file, 'utf8');
  const url = `  <url>\n    <loc>https://webxds.com/pages/blogs/${slug}.html</loc>\n    <lastmod>${dateIso}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n\n`;
  if (!xml.includes(`${slug}.html`)) xml = xml.replace('  <url>', url + '  <url>');
  fs.writeFileSync(file, xml);
}

async function main() {
  await createVisuals();
  createArticle();
  addListings();
  addSitemap(path.join(root, 'sitemap.xml'));
  addSitemap(path.join(root, 'root', 'sitemap.xml'));
  console.log(`Created ${slug} article, listings, sitemap entries, and 3 visuals.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
