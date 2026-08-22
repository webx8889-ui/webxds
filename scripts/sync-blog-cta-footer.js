const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
const cta = home.match(/<section class="cta-banner-section"[\s\S]*?<\/section>/)?.[0];
const footer = home.match(/<footer class="footer-section animate-section"[\s\S]*?<\/footer>/)?.[0];

if (!cta || !footer) throw new Error("Unable to locate the homepage CTA or footer.");

for (const name of fs.readdirSync(path.join(root, "pages", "blogs"))) {
  if (!name.endsWith(".html") || name === "blogs.html") continue;
  const file = path.join(root, "pages", "blogs", name);
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes('class="cta-banner-section"') || !html.includes('class="footer-section')) {
    throw new Error(`Missing CTA or footer in ${name}`);
  }
  const withCta = html.replace(/<section class="cta-banner-section"[\s\S]*?<\/section>/, cta);
  const next = withCta.replace(/<footer class="footer-section[^\"]*"[\s\S]*?<\/footer>/, footer);
  fs.writeFileSync(file, next, "utf8");
  console.log(`Synced ${name}`);
}
