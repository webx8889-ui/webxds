(() => {
  "use strict";

  const BLOG_PREFIX = "/pages/blogs/";
  const BLOG_INDEX = "/pages/blogs/blogs.html";
  const REFRESH_INTERVAL_MS = 10000;
  let metadata = {};
  let refreshQueued = false;

  function blogPath(value) {
    if (!value) return "";
    try {
      const url = new URL(value, window.location.origin);
      const pathname = url.pathname.replace(/\/+$/, "") || "/";
      if (!pathname.startsWith(BLOG_PREFIX) || pathname === BLOG_INDEX || !pathname.endsWith(".html")) return "";
      return pathname;
    } catch (_) {
      return "";
    }
  }

  function getVisitorId() {
    const key = "webx_blog_visitor_id";
    try {
      let id = localStorage.getItem(key);
      if (!id) {
        id = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem(key, id);
      }
      return id;
    } catch (_) {
      return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  }

  function formatViews(count) {
    const value = Math.max(0, Number(count) || 0);
    const label = new Intl.NumberFormat("en-IN").format(value);
    return `${label} ${value === 1 ? "view" : "views"}`;
  }

  function createByline(path, info) {
    const byline = document.createElement("p");
    byline.className = "blog-byline";
    byline.dataset.blogPath = path;

    const author = document.createElement("span");
    author.className = "blog-author";
    author.textContent = `By ${info.author || "Webx Design Studio"}`;

    const separator = document.createElement("span");
    separator.className = "blog-meta-separator";
    separator.setAttribute("aria-hidden", "true");
    separator.textContent = "•";

    const views = document.createElement("span");
    views.className = "blog-view-count";
    views.setAttribute("aria-live", "polite");
    views.textContent = formatViews(info.views);

    byline.append(author, separator, views);
    return byline;
  }

  function renderByline(container, path) {
    const info = metadata[path];
    if (!info || !container) return;
    let byline = Array.from(container.querySelectorAll(".blog-byline")).find(item => item.dataset.blogPath === path);
    if (!byline) {
      byline = createByline(path, info);
      const anchor = container.querySelector(".blog-meta, .blog-tags-date-row, .related-blog-meta");
      if (anchor) anchor.insertAdjacentElement("afterend", byline);
      else container.appendChild(byline);
    } else {
      const author = byline.querySelector(".blog-author");
      const views = byline.querySelector(".blog-view-count");
      const authorLabel = `By ${info.author || "Webx Design Studio"}`;
      const viewLabel = formatViews(info.views);
      if (author && author.textContent !== authorLabel) author.textContent = authorLabel;
      if (views && views.textContent !== viewLabel) views.textContent = viewLabel;
    }
  }

  function renderMetadata() {
    const currentPath = blogPath(window.location.pathname);
    if (currentPath) renderByline(document.querySelector(".blog-header"), currentPath);

    document.querySelectorAll(".blog-card, .related-blog-card").forEach(card => {
      const path = blogPath(card.dataset.blogPath || card.querySelector('a[href*="/pages/blogs/"]')?.getAttribute("href"));
      if (!path) return;
      card.dataset.blogPath = path;
      renderByline(card.querySelector(".blog-content, .related-blog-content") || card, path);
    });
  }

  async function refreshMetadata() {
    try {
      const response = await fetch("/api/blogs/meta", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      metadata = payload && payload.blogs ? payload.blogs : {};
      renderMetadata();
    } catch (_) {
      // The site can still be viewed if the API is temporarily unavailable.
    }
  }

  async function recordCurrentBlogView() {
    const path = blogPath(window.location.pathname);
    if (!path || document.visibilityState !== "visible") return;
    const key = `webx_blog_viewed:${path}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch (_) {}

    try {
      const response = await fetch("/api/blogs/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, visitorId: getVisitorId() })
      });
      if (!response.ok) return;
      const payload = await response.json();
      if (payload?.blog) {
        metadata[path] = payload.blog;
        renderMetadata();
      }
      try { sessionStorage.setItem(key, "1"); } catch (_) {}
    } catch (_) {}
  }

  function queueRender() {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => {
      refreshQueued = false;
      renderMetadata();
    });
  }

  function init() {
    refreshMetadata().then(recordCurrentBlogView);
    new MutationObserver(queueRender).observe(document.body, { childList: true, subtree: true });
    window.setInterval(refreshMetadata, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") recordCurrentBlogView();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
