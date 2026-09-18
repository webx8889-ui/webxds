/*
 * Admin icons must remain available even when third-party CDNs are blocked.
 * The dashboard previously depended on api.iconify.design for every icon,
 * which made the navigation look empty whenever that service was unavailable.
 */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const paths = {
    "layout-dashboard": '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    "chart-bar": '<path d="M4 20V10M10 20V4M16 20v-7M22 20V7"/>',
    inbox: '<path d="M4 4h16v13H4zM4 14h4l2 3h4l2-3h4"/>',
    "file-text": '<path d="M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V20h-3v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7.08 14.7a1.7 1.7 0 0 0-1.55-1H5v-3h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06L8.36 5.6l.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1-1.55V4h3v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.55 1H20v3h-.09a1.7 1.7 0 0 0-1.55 1.7z"/>',
    "settings-2": '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    "settings-plus": '<path d="M5 4h14v9H5zM12 7v3M10.5 8.5h3M8 18h8M12 14v8"/>',
    photo: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m4 18 5-5 3 3 3-4 5 6"/>',
    "photo-plus": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m4 18 5-5 3 3 3-4 5 6M18 3v6M15 6h6"/>',
    pencil: '<path d="m4 20 4.2-1 10-10a2 2 0 0 0-2.8-2.8l-10 10zM13.5 7.5l3 3"/>',
    "pencil-plus": '<path d="m4 20 4.2-1 8.5-8.5a2 2 0 0 0-2.8-2.8L5.4 16.2zM13 7l3 3M19 14v6M16 17h6"/>',
    handshake: '<path d="m7 12 3 3a2 2 0 0 0 3-2l-1-1 1 1a2 2 0 0 0 3-2l-4-4-2 2-2-2-4 4 3 3"/><path d="m3 10 3-3 3 2M21 10l-3-3"/>',
    users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 20a4 4 0 0 1 7 0"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/>',
    folder: '<path d="M3 6h7l2 2h9v11H3z"/>',
    search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m16 16 5 5"/>',
    adjustments: '<path d="M4 7h5M14 7h6M4 17h9M18 17h2"/><circle cx="12" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',
    "menu-2": '<path d="M4 7h16M4 12h16M4 17h16"/>',
    bell: '<path d="M18 10a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4"/>',
    world: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    refresh: '<path d="M20 11a8 8 0 1 0 1 5M20 5v6h-6"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    upload: '<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',
    "external-link": '<path d="M14 4h6v6M20 4l-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone: '<path d="M5 3h4l2 5-2.5 1.5a14 14 0 0 0 6 6L16 13l5 2v4c-10 1-17-6-16-16z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/>',
    "device-floppy": '<path d="M5 3h12l3 3v15H4V4zM8 3v6h8V3M8 21v-7h8v7"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h2a7 7 0 0 0 7-7c0-2-4-3-9-3z"/><circle cx="7.5" cy="11" r=".8" fill="currentColor"/><circle cx="10" cy="7.5" r=".8" fill="currentColor"/><circle cx="14" cy="7" r=".8" fill="currentColor"/>',
    code: '<path d="m9 7-5 5 5 5M15 7l5 5-5 5M14 4l-4 16"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
    rocket: '<path d="M14 4c3-2 6-1 6-1s1 3-1 6l-7 7-4-4zM9 15l-3 1-2-2 1-3M12 18l-1 3 2 1 3-3"/><circle cx="16" cy="8" r="1.5"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    "info-circle": '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    "arrow-back-up": '<path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 6 6v1"/>',
    "arrow-forward-up": '<path d="m15 14 5-5-5-5M20 9H10a6 6 0 0 0-6 6v1"/>',
    logout: '<path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/>',
    "door-exit": '<path d="M5 3h12v18H5zM11 12h10M17 8l4 4-4 4"/>',
    home: '<path d="m3 11 9-8 9 8v9h-6v-6H9v6H3z"/>',
    "layout-grid": '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>',
    send: '<path d="m3 4 18 8-18 8 4-8zM7 12h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.3 2c-1.3 1-1.8 1.5-1.8 3M12 17h.01"/>',
    article: '<path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5"/>',
    "shield-lock": '<path d="M12 3 19 6v5c0 4.7-3 7.6-7 10-4-2.4-7-5.3-7-10V6z"/><rect x="9" y="11" width="6" height="5" rx="1"/><path d="M10.5 11V9.5a1.5 1.5 0 0 1 3 0V11"/>',
    "clipboard-text": '<rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M8 10h8M8 14h8M8 18h5"/>',
    "circle-check": '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.7 2.7L16.5 9"/>'
  };

  function iconName(source) {
    const match = String(source || "").match(/tabler\/([^/?#]+)\.svg/i);
    return match ? match[1] : "info-circle";
  }

  function replaceImage(image) {
    if (!image || image.dataset.localIcon === "true" || !/api\.iconify\.design\/tabler\//i.test(image.src || "")) return;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.className.baseVal = `${image.className || ""} admin-icon`;
    svg.style.cssText = image.style.cssText;
    svg.innerHTML = paths[iconName(image.src)] || paths["info-circle"];
    image.replaceWith(svg);
  }

  function replaceIcons(root) {
    if (!root) return;
    if (root.nodeType === 1 && root.matches && root.matches("img")) replaceImage(root);
    if (root.querySelectorAll) root.querySelectorAll('img[src*="api.iconify.design/tabler/"]').forEach(replaceImage);
  }

  function normalizeText(root) {
    if (!root || !root.ownerDocument && root !== document) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return /^(SCRIPT|STYLE)$/i.test(node.parentElement && node.parentElement.tagName || "")
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      }
    });
    const replacements = { "â€¢": "•", "â€“": "–", "â€”": "—", "â€¦": "…", "â€º": "›", "Â©": "©", "Â®": "®" };
    let node;
    while ((node = walker.nextNode())) {
      let clean = node.nodeValue;
      Object.entries(replacements).forEach(([broken, correct]) => { clean = clean.split(broken).join(correct); });
      if (clean !== node.nodeValue) node.nodeValue = clean;
    }
  }

  const style = document.createElement("style");
  style.textContent = `
    .admin-icon { width: 20px; height: 20px; display: block; flex: 0 0 auto; color: var(--c-muted, #94a3b8); }
    .nav-icon .admin-icon, .icon-btn .admin-icon, .quick-btn .admin-icon, .settings-nav-item .admin-icon { width: 20px; height: 20px; }
    .stat-icon-wrap .admin-icon { width: 24px; height: 24px; }
    .page-card-icon .admin-icon { width: 46px; height: 46px; color: #9ca3af; }
    .page-card:hover .page-card-icon .admin-icon { color: var(--c-accent, #fea800); }
    .lead-detail .admin-icon { width: 16px; height: 16px; }
    .nav-item.active .admin-icon { color: var(--c-accent, #fea800); }
    .nav-item:hover .admin-icon, .icon-btn:hover .admin-icon { color: var(--c-white, #fff); }
    .btn .admin-icon, .quick-btn .admin-icon { color: currentColor; }
  `;
  document.head.appendChild(style);

  replaceIcons(document);
  normalizeText(document);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    replaceIcons(node);
    normalizeText(node);
  })))
    .observe(document.documentElement, { childList: true, subtree: true });
}());
