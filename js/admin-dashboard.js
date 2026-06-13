(function () {
  const state = {
    adminToken: localStorage.getItem("webx-admin-token") || "",
    currentUser: readStoredUser(),
    snapshot: null,
    currentPageKey: "home",
    eventSource: null,
    authReady: false,
    replayCache: {},
    replayTimerIds: [],
    replaySpeed: 1,
    replayPlayer: null,
    replayVideoParts: [],
    activeReplayPartIndex: 0,
    homeEditor: {
      sections: [],
      selectedSectionId: "",
      history: {},
      applyingHistory: false
    },
    genericEditor: {
      sections: [],
      selectedSectionId: "",
      title: "",
      meta: ""
    }
  };

  function readStoredUser() {
    try {
      return JSON.parse(localStorage.getItem("webx-admin-user") || "null");
    } catch {
      return null;
    }
  }

  function toast(message, icon, success) {
    if (typeof window.showToast === "function") {
      window.showToast(message, icon || "check", !!success);
    } else {
      alert(message);
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function cloneData(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function initials(name) {
    return String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join("")
      .toUpperCase();
  }

  function formatDate(value) {
    if (!value) return "Now";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function formatDateTime(value) {
    if (!value) return "Now";
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function shortVisitorId(value) {
    const text = String(value || "").trim();
    if (!text) return "unknown";
    return text.length > 12 ? text.slice(0, 12) : text;
  }

  function formatPageLabel(value) {
    const text = String(value || "/").trim().toLowerCase();
    if (!text || text === "/") return "home";
    if (text.includes("work")) return "work";
    if (text.includes("blog")) return "blog";
    if (text.includes("home") || text.includes("index")) return "home";
    if (text.includes("about")) return "about";
    if (text.includes("service")) return "services";
    if (text.includes("contact")) return "contact";
    const cleaned = text.split("/").filter(Boolean).pop() || "home";
    return cleaned.replace(".html", "");
  }

  function formatLocationLabel(session) {
    const label = String(session.locationLabel || "").trim();
    if (label) return label;
    const timezone = String(session.timezone || "").trim();
    if (timezone) return timezone.split("/").pop().replace(/_/g, " ");
    return "Unknown";
  }

  function loadStyle(href) {
    return new Promise(resolve => {
      const existing = document.querySelector(`link[href="${href}"]`);
      if (existing) return resolve();
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => resolve();
      document.head.appendChild(link);
    });
  }

  function loadScript(src) {
    return new Promise(resolve => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return resolve();
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.head.appendChild(script);
    });
  }

  async function ensureRrwebPlayer() {
    await loadStyle("/node_modules/rrweb-player/dist/style.css");
    await loadScript("/node_modules/rrweb-player/dist/index.js");
  }

  function getReplayVideoElement() {
    return document.getElementById("sessionReplayVideo");
  }

  function statusClass(status) {
    if (status === "closed") return "badge-green";
    if (status === "contacted") return "badge-blue";
    return "badge-gold";
  }

  function getCardByTitle(scope, text) {
    return Array.from(scope.querySelectorAll(".card")).find(card => {
      const title = card.querySelector(".card-title");
      return title && title.textContent.trim() === text;
    });
  }

  function persistSession(token, user) {
    state.adminToken = token;
    state.currentUser = user;
    localStorage.setItem("webx-admin-token", token);
    localStorage.setItem("webx-admin-user", JSON.stringify(user));
  }

  function clearSession() {
    state.adminToken = "";
    state.currentUser = null;
    localStorage.removeItem("webx-admin-token");
    localStorage.removeItem("webx-admin-user");
    if (state.eventSource) {
      state.eventSource.close();
      state.eventSource = null;
    }
  }

  function resolveApiUrl(url) {
    if (typeof url !== "string") return url;
    if (/^(https?:)?\/\//.test(url)) return url;
    const basePath = typeof window !== "undefined" && typeof window.WEBX_BASE_PATH === "string" ? window.WEBX_BASE_PATH : "";
    return url.startsWith("/") ? `${basePath}${url}` : url;
  }

  async function api(url, options = {}) {
    const response = await fetch(resolveApiUrl(url), {
      ...options,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(state.adminToken ? { "x-admin-token": state.adminToken } : {}),
        ...(options.headers || {})
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    if (!response.ok) throw new Error(payload.error || "Request failed");
    return payload;
  }

  function injectAuthStyles() {
    if (document.getElementById("webx-auth-styles")) return;
    const style = document.createElement("style");
    style.id = "webx-auth-styles";
    style.textContent = `
      body.auth-locked { overflow: hidden; }
      body.auth-locked .sidebar,
      body.auth-locked .main-wrapper { filter: blur(10px); pointer-events: none; user-select: none; }
      .auth-gate {
        position: fixed; inset: 0; z-index: 1200; display: none; align-items: center; justify-content: center;
        padding: 24px; background:
          radial-gradient(circle at 20% 20%, rgba(254,168,0,0.18), transparent 28%),
          radial-gradient(circle at 80% 0%, rgba(59,130,246,0.14), transparent 24%),
          linear-gradient(135deg, rgba(0,0,0,0.82), rgba(7,12,20,0.95));
        backdrop-filter: blur(18px);
      }
      .auth-gate.active { display: flex; }
      .auth-card {
        width: min(100%, 1020px); border: 1px solid rgba(255,255,255,0.08); background: rgba(10,10,10,0.92);
        box-shadow: 0 30px 80px rgba(0,0,0,0.55); display: grid; grid-template-columns: 1.1fr 0.9fr; overflow: hidden;
      }
      .auth-showcase {
        padding: 40px; background:
          linear-gradient(180deg, rgba(254,168,0,0.12), rgba(254,168,0,0.02)),
          linear-gradient(135deg, #050505 0%, #111827 100%);
        border-right: 1px solid rgba(255,255,255,0.06);
      }
      .auth-kicker { color: #fea800; letter-spacing: 0.18em; text-transform: uppercase; font-size: 11px; font-weight: 700; }
      .auth-title { margin: 18px 0 12px; font-size: clamp(34px, 5vw, 56px); line-height: 0.95; }
      .auth-copy { color: rgba(255,255,255,0.72); line-height: 1.7; max-width: 36ch; }
      .auth-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 28px; }
      .auth-metric {
        border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); padding: 16px;
      }
      .auth-metric strong { display: block; font-size: 20px; margin-bottom: 6px; }
      .auth-metric span { color: rgba(255,255,255,0.62); font-size: 13px; }
      .auth-panel { padding: 40px; display: flex; flex-direction: column; justify-content: center; }
      .auth-panel h2 { font-size: 28px; margin: 0 0 10px; }
      .auth-panel p { color: rgba(255,255,255,0.66); line-height: 1.6; margin: 0 0 26px; }
      .auth-roles { display: grid; gap: 12px; margin-bottom: 20px; }
      .auth-role {
        width: 100%; text-align: left; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.03); color: #fff; transition: 0.2s ease;
      }
      .auth-role:hover, .auth-role.active { border-color: rgba(254,168,0,0.55); background: rgba(254,168,0,0.09); }
      .auth-role strong { display: block; font-size: 15px; margin-bottom: 4px; }
      .auth-role span { color: rgba(255,255,255,0.62); font-size: 12px; }
      .auth-form { display: grid; gap: 14px; }
      .auth-field { display: grid; gap: 8px; }
      .auth-field label { color: rgba(255,255,255,0.68); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
      .auth-field input {
        width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
        color: #fff; padding: 15px 16px; font: inherit;
      }
      .auth-submit {
        width: 100%; margin-top: 6px; padding: 15px 18px; font: inherit; font-weight: 700; border: 0;
        background: linear-gradient(135deg, #fea800, #ff8a00); color: #0b0b0b; cursor: pointer;
      }
      .auth-help { margin-top: 16px; color: rgba(255,255,255,0.56); font-size: 12px; line-height: 1.6; }
      .auth-error { min-height: 20px; color: #fca5a5; font-size: 13px; }
      .auth-userline { color: rgba(255,255,255,0.64); font-size: 12px; margin-bottom: 10px; }
      @media (max-width: 900px) {
        .auth-card { grid-template-columns: 1fr; }
        .auth-showcase { padding: 28px; }
        .auth-panel { padding: 28px; }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureAuthGate() {
    injectAuthStyles();
    if (document.getElementById("authGate")) return;
    const gate = document.createElement("div");
    gate.id = "authGate";
    gate.className = "auth-gate";
    gate.innerHTML = `
      <div class="auth-card">
        <div class="auth-showcase">
          <div class="auth-kicker">Secure Dashboard Access</div>
          <div class="auth-title">Only authorized Webx admins can enter.</div>
          <div class="auth-copy">This dashboard is now protected with named-role access. Piyush Gohil and Harsh Hariyani can manage the website, leads, live tracking, services, and content from here.</div>
          <div class="auth-grid">
            <div class="auth-metric"><strong>2</strong><span>Authorized operators</span></div>
            <div class="auth-metric"><strong>Live</strong><span>Backend session validation</span></div>
            <div class="auth-metric"><strong>Role Based</strong><span>Owner admin and developer admin</span></div>
            <div class="auth-metric"><strong>Protected</strong><span>Dashboard APIs and live stream locked</span></div>
          </div>
        </div>
        <div class="auth-panel">
          <div class="auth-userline">Allowed users</div>
          <div class="auth-roles">
            <button type="button" class="auth-role" data-username="piyush.gohil">
              <strong>Piyush Gohil</strong>
              <span>Owner Admin | Full website control</span>
            </button>
            <button type="button" class="auth-role" data-username="harsh.hariyani">
              <strong>Harsh Hariyani</strong>
              <span>Developer Admin | Website operations and updates</span>
            </button>
          </div>
          <h2>Admin Sign In</h2>
          <p>Please sign in with your authorized credentials to access the admin dashboard. After successful login, your secure session will be maintained automatically.</p>
          <form class="auth-form" id="authLoginForm">
            <div class="auth-field">
              <label for="authUsername">Username</label>
              <input id="authUsername" name="username" type="text" autocomplete="username" placeholder="piyush.gohil or harsh.hariyani" required />
            </div>
            <div class="auth-field">
              <label for="authPassword">Password</label>
              <input id="authPassword" name="password" type="password" autocomplete="current-password" placeholder="Enter secure password" required />
            </div>
            <div class="auth-error" id="authError"></div>
            <button class="auth-submit" type="submit">Unlock Dashboard</button>
          </form>
          <div class="auth-help">Default login is configured for Piyush Gohil and Harsh Hariyani only. Passwords can be changed later from backend data if needed.</div>
        </div>
      </div>
    `;
    document.body.appendChild(gate);
  }

  function setLocked(locked) {
    document.body.classList.toggle("auth-locked", locked);
    const gate = document.getElementById("authGate");
    if (gate) gate.classList.toggle("active", locked);
  }

  function showAuthError(message) {
    const error = document.getElementById("authError");
    if (error) error.textContent = message || "";
  }

  function selectRole(username) {
    document.querySelectorAll(".auth-role").forEach(button => {
      button.classList.toggle("active", button.dataset.username === username);
    });
    const usernameInput = document.getElementById("authUsername");
    const passwordInput = document.getElementById("authPassword");
    if (usernameInput) usernameInput.value = username || "";
    if (passwordInput) passwordInput.focus();
  }

  function openAuthGate(message) {
    ensureAuthGate();
    setLocked(true);
    showAuthError(message || "");
    updateCurrentUserUI(null);
  }

  function closeAuthGate() {
    setLocked(false);
    showAuthError("");
  }

  async function login(username, password) {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Login failed");
    persistSession(payload.token, payload.user);
    updateCurrentUserUI(payload.user);
    closeAuthGate();
    return payload;
  }

  async function logout(showMessage) {
    try {
      if (state.adminToken) {
        await fetch("/api/admin/logout", {
          method: "POST",
          credentials: "same-origin",
          headers: state.adminToken ? { "x-admin-token": state.adminToken } : {}
        });
      }
    } catch {
      // ignore logout network issues and clear local session anyway
    }
    clearSession();
    setConnectionStatus(false);
    openAuthGate("Session ended. Sign in again to continue.");
    if (showMessage) toast("Logged out successfully", "lock", true);
  }

  function updateCurrentUserUI(user) {
    const actualUser = user || state.currentUser;
    const avatar = document.getElementById("currentAdminAvatar") || document.querySelector(".sidebar-user .user-avatar");
    const name = document.getElementById("currentAdminName") || document.querySelector(".sidebar-user .user-name");
    const role = document.getElementById("currentAdminRole") || document.querySelector(".sidebar-user .user-role");
    const title = document.querySelector("#page-dashboard .section-title");
    if (avatar) avatar.textContent = actualUser ? initials(actualUser.name) : "--";
    if (name) name.textContent = actualUser ? actualUser.name : "Authorized Admin";
    if (role) role.textContent = actualUser ? actualUser.role : "Secure Access";
    if (title) title.textContent = actualUser ? `Welcome back, ${actualUser.name.split(" ")[0]}` : "Welcome back";
  }

  function setConnectionStatus(connected) {
    const badges = document.querySelectorAll(".nav-badge");
    const footerStatus = document.querySelector(".user-status");
    const liveBadge = badges[1];
    if (liveBadge && !connected) {
      liveBadge.textContent = "OFF";
      liveBadge.classList.remove("green");
    }
    if (footerStatus) footerStatus.style.background = connected ? "var(--c-green)" : "var(--c-red)";
  }

  function sanitizeStaticDashboard() {
    document.title = "Admin Dashboard - Webx Design Studio";
    const logo = document.querySelector(".sidebar-logo-icon");
    if (logo) {
      logo.innerHTML = '<img src="/assets/images/icons/webx-icon.svg" alt="Webx" />';
      logo.style.background = "transparent";
      logo.style.letterSpacing = "0";
      logo.style.fontSize = "0";
      logo.style.width = "32px";
      logo.style.height = "32px";
      const image = logo.querySelector("img");
      if (image) {
        image.style.width = "32px";
        image.style.height = "32px";
        image.style.objectFit = "contain";
        image.style.display = "block";
      }
    }
  }

  function sanitizeStaticDashboardContent() {
    document.querySelectorAll(".page-card-status").forEach(el => {
      el.textContent = "Live";
    });

    document.querySelectorAll(".modal-close").forEach(el => {
      el.textContent = "x";
    });

    const backButton = document.querySelector("#pageEditor .btn.btn-outline");
    if (backButton) backButton.textContent = "Back";

    const filterButton = document.querySelector("#page-leads .btn.btn-outline");
    if (filterButton) filterButton.textContent = "Filter";

    const dashboardPanel = document.getElementById("page-dashboard");
    const inquiryTrendSubtitle = dashboardPanel ? dashboardPanel.querySelector(".grid-6-4 .card .card-subtitle") : null;
    if (inquiryTrendSubtitle) inquiryTrendSubtitle.textContent = "Monthly inquiries - 2025";

    const recentInquiryAction = dashboardPanel ? getCardByTitle(dashboardPanel, "Recent Inquiries")?.querySelector(".card-action") : null;
    if (recentInquiryAction) recentInquiryAction.textContent = "View all ->";

    const mediaCards = document.querySelectorAll('#page-media .card div[style*="font-size:12px;color:var(--c-accent)"]');
    if (mediaCards[0]) mediaCards[0].textContent = "48 files | 12.4 MB";
    if (mediaCards[1]) mediaCards[1].textContent = "3 files | 86.2 MB";
    if (mediaCards[2]) mediaCards[2].textContent = "2 files | 298 KB";

    const seoTitleInput = document.querySelector("#page-seo input.editor-input");
    if (seoTitleInput) seoTitleInput.value = "UI/UX Design Agency for Websites & Apps - Webx Design Studio";

    const blogItems = document.querySelectorAll("#page-blog .blog-list-item");
    if (blogItems[0]) blogItems[0].querySelector(".blog-meta-text").textContent = "Published | 16 Apr 2025 | ai powered user interfaces, ux design trends";
    if (blogItems[1]) blogItems[1].querySelector(".blog-meta-text").textContent = "Published | 16 Apr 2025 | apple design study, ios design principles";
    if (blogItems[2]) {
      blogItems[2].querySelector(".blog-title-text").textContent = "How to Design a High-Converting Landing Page in 2026 - UX and CRO Complete Guide";
      blogItems[2].querySelector(".blog-meta-text").textContent = "Published | 18 Feb 2026 | landing page ux design, conversion rate optimization";
    }
    if (blogItems[3]) {
      blogItems[3].querySelector(".blog-title-text").textContent = "10 Signs It's Time to Redesign Your Website in 2026 - Full Redesign Checklist";
      blogItems[3].querySelector(".blog-meta-text").textContent = "Published | 18 Feb 2026 | website redesign 2026, redesign checklist";
    }

    const teamRows = document.querySelectorAll("#page-team tbody tr");
    if (teamRows[0] && teamRows[0].children[5]) teamRows[0].children[5].textContent = "-";

    const defaults = window.pageDefaults;
    if (defaults) {
      if (defaults.home) defaults.home.title = "UI/UX Design Agency for Websites & Apps - Webx Design Studio";
      if (defaults.about) defaults.about.title = "About Us - Webx Design Studio";
      if (defaults.services) defaults.services.title = "Services - Webx Design Studio";
      if (defaults.work) {
        defaults.work.title = "Work - Webx Design Studio";
        defaults.work.meta = "Portfolio of creative projects - Morphico, Arogya Bharat, Tictax and more.";
      }
      if (defaults.blog) defaults.blog.title = "Blog - Webx Design Studio";
      if (defaults.contact) defaults.contact.title = "Contact - Webx Design Studio";
    }
  }

  function renderOverview(snapshot) {
    const dashboardPanel = document.getElementById("page-dashboard");
    const statCards = dashboardPanel.querySelectorAll(".stats-grid .stat-card");
    const values = [
      snapshot.totals.totalLeads,
      snapshot.services.length,
      Object.keys(snapshot.pages || {}).length,
      snapshot.totals.liveUsers
    ];

    statCards.forEach((card, index) => {
      const value = card.querySelector(".stat-value");
      const change = card.querySelector(".stat-change");
      if (value) value.textContent = String(values[index] || 0);
      if (change && index === 0) change.textContent = `${snapshot.totals.todayLeads} new today`;
      if (change && index === 1) change.textContent = `${snapshot.services.filter(service => service.status === "active").length} active services`;
      if (change && index === 2) change.textContent = `${snapshot.totals.todayVisitors} visitors today`;
      if (change && index === 3) change.textContent = `${snapshot.totals.conversionRate}% conversion`;
    });

    const inquiryCard = getCardByTitle(dashboardPanel, "Recent Inquiries");
    if (inquiryCard) {
      const tbody = inquiryCard.querySelector("tbody");
      tbody.innerHTML = (snapshot.leads || []).slice(0, 5).map(lead => `
        <tr>
          <td><div class="client-row"><div class="client-avatar">${initials(lead.name)}</div><div><div class="client-name">${escapeHtml(lead.name)}</div><div class="client-email">${escapeHtml(lead.email)}</div></div></div></td>
          <td>${escapeHtml((lead.services || []).join(", "))}</td>
          <td><span class="badge ${statusClass(lead.status)}">${escapeHtml(lead.status)}</span></td>
          <td>${formatDate(lead.createdAt)}</td>
        </tr>
      `).join("") || '<tr><td colspan="4">No inquiries yet.</td></tr>';
    }

    const activityCard = getCardByTitle(dashboardPanel, "Recent Activity");
    if (activityCard) {
      const listWrap = activityCard.querySelector(".card-header").nextElementSibling;
      listWrap.innerHTML = (snapshot.recentActivity || []).slice(0, 6).map(item => `
        <div class="activity-item">
          <div class="activity-dot" style="background:${item.type === "lead" ? "var(--c-accent)" : item.type === "visitor" ? "var(--c-blue)" : "var(--c-green)"}"></div>
          <div><div class="activity-text">${escapeHtml(item.message)}</div><div class="activity-time">${formatDateTime(item.createdAt)}</div></div>
        </div>
      `).join("") || '<div class="activity-item"><div><div class="activity-text">No activity yet.</div></div></div>';
    }
  }

  function renderLeads(snapshot) {
    const leadsList = document.getElementById("leadsList");
    leadsList.innerHTML = (snapshot.leads || []).map(lead => `
      <div class="lead-card" data-lead-id="${lead.id}">
        <div class="lead-top">
          <div><div class="lead-name">${escapeHtml(lead.name)}</div><div class="lead-service">Service: ${escapeHtml((lead.services || []).join(", "))} | Budget: ${escapeHtml(lead.budget || "Not specified")}</div></div>
          <span class="badge ${statusClass(lead.status)}">${escapeHtml(lead.status)}</span>
        </div>
        <div class="lead-details">
          <div class="lead-detail"><img src="https://api.iconify.design/tabler/mail.svg" alt="" /> ${escapeHtml(lead.email)}</div>
          <div class="lead-detail"><img src="https://api.iconify.design/tabler/phone.svg" alt="" /> ${escapeHtml(lead.phone)}</div>
          <div class="lead-detail"><img src="https://api.iconify.design/tabler/calendar.svg" alt="" /> ${formatDate(lead.createdAt)}</div>
        </div>
        <div class="lead-message">"${escapeHtml(lead.message)}"</div>
        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
          <button class="btn btn-primary js-lead-contact" style="font-size:11.5px;padding:7px 14px">Mark Contacted</button>
          <button class="btn btn-outline js-lead-close" style="font-size:11.5px;padding:7px 14px">Mark Closed</button>
          <button class="btn btn-danger js-lead-delete" style="font-size:11.5px;padding:7px 14px">Delete</button>
        </div>
      </div>
    `).join("") || '<div class="card">No leads received yet.</div>';
  }

  function renderAnalytics(snapshot) {
    const panel = document.getElementById("page-analytics");
    const statCards = panel.querySelectorAll(".stats-grid .stat-card");
    const totalSessions = snapshot.totals.totalSessions;
    const avgSessionSeconds = snapshot.liveSessions.length
      ? Math.round(snapshot.liveSessions.reduce((sum, session) => sum + Number(session.activeSeconds || 0), 0) / snapshot.liveSessions.length)
      : 0;
    const bounceEstimate = totalSessions ? Math.max(5, 100 - snapshot.totals.conversionRate * 3) : 0;
    const values = [
      totalSessions * 3,
      totalSessions,
      `${Math.floor(avgSessionSeconds / 60)}:${String(avgSessionSeconds % 60).padStart(2, "0")}`,
      `${bounceEstimate}%`
    ];

    statCards.forEach((card, index) => {
      const value = card.querySelector(".stat-value");
      const change = card.querySelector(".stat-change");
      if (value) value.textContent = values[index];
      if (change && index === 0) change.textContent = "Up 18% vs last month";
      if (change && index === 1) change.textContent = "Up 9%";
      if (change && index === 2) change.textContent = "Up 0:14";
      if (change && index === 3) {
        change.textContent = "Up 3% (worse)";
        change.classList.add("down");
      }
    });

    const trafficCard = getCardByTitle(panel, "Traffic by Page");
    if (trafficCard) {
      const headers = trafficCard.querySelectorAll("thead th");
      if (headers[0]) headers[0].textContent = "User ID";
      if (headers[1]) headers[1].textContent = "Location";
      if (headers[2]) headers[2].textContent = "Page";
      if (headers[3]) headers[3].textContent = "Trend";
      const tbody = trafficCard.querySelector("tbody");
      const entries = (snapshot.liveSessions || []).slice(0, 8);
      tbody.innerHTML = entries.map(session => `
        <tr>
          <td>${escapeHtml(shortVisitorId(session.visitorId))}</td>
          <td>${escapeHtml(formatLocationLabel(session))}</td>
          <td>${escapeHtml(formatPageLabel(session.path || session.currentPage || "/"))}</td>
          <td style="color:var(--c-green)">Live</td>
        </tr>
      `).join("") || '<tr><td colspan="4">No visitor tracking yet.</td></tr>';
    }

    ensureReplaySection();
    renderReplaySessions(snapshot.replaySessions || []);
    renderClarityReplayHub(snapshot);
  }

  function ensureReplaySection() {
    const panel = document.getElementById("page-analytics");
    if (!panel || document.getElementById("replayAnalyticsGrid")) return;
    const replayWrap = document.createElement("div");
    replayWrap.id = "replayAnalyticsGrid";
    replayWrap.className = "grid-2";
    replayWrap.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Clarity Control</div>
            <div class="card-subtitle">Professional analytics and replay workspace for the website</div>
          </div>
        </div>
        <div id="sessionReplayList"></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Replay Workspace</div>
            <div class="card-subtitle">Open the Microsoft Clarity workspace for accurate replay, filters, and heatmaps</div>
          </div>
        </div>
        <div style="display:grid;gap:12px">
          <div id="sessionReplayMeta" style="font-size:12px;color:var(--c-muted)">No replay selected.</div>
          <div id="sessionReplayStage" style="position:relative;min-height:520px;height:72vh;border:1px solid var(--c-border);background:radial-gradient(circle at top left, rgba(254,168,0,0.14), transparent 28%),radial-gradient(circle at bottom right, rgba(59,130,246,0.16), transparent 34%),linear-gradient(135deg,#050505,#0d1117 72%);overflow:hidden;padding:28px">
            <div id="sessionReplayFrame" style="width:100%;height:100%;display:grid;place-items:center;color:var(--c-white);text-align:left"></div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
            <button class="btn btn-primary js-open-clarity" type="button">Open Clarity</button>
          </div>
        </div>
      </div>
    `;
    panel.appendChild(replayWrap);
  }

  function renderReplaySessions(replaySessions) {
    const list = document.getElementById("sessionReplayList");
    if (!list) return;
    const settings = (state.snapshot && state.snapshot.settings) || {};
    const connected = !!(settings.clarityEnabled && settings.clarityProjectId);
    list.innerHTML = `
      <div style="display:grid;gap:14px">
        <div style="padding:18px;border:1px solid var(--c-border);background:rgba(255,255,255,0.02)">
          <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap">
            <div>
              <div style="font-size:18px;font-weight:700">${escapeHtml(settings.clarityProjectLabel || "Webx Website")}</div>
              <div style="margin-top:6px;color:var(--c-muted);font-size:13px">${escapeHtml(settings.clarityDashboardUrl || "https://clarity.microsoft.com/")}</div>
            </div>
            <span class="badge ${connected ? "badge-green" : "badge-gold"}">${connected ? "Live via Clarity" : "Setup Required"}</span>
          </div>
        </div>
        <div style="padding:18px;border:1px solid var(--c-border);background:rgba(255,255,255,0.02);color:var(--c-muted);line-height:1.7">
          ${connected ? "Session replay now runs through Microsoft Clarity. Open the workspace to view recordings, filters, and heatmaps." : "Add your Clarity Project ID in Settings to activate hosted session replay and heatmaps."}
        </div>
      </div>
    `;
  }

  function renderClarityReplayHub(snapshot) {
    const frame = document.getElementById("sessionReplayFrame");
    const meta = document.getElementById("sessionReplayMeta");
    if (!frame || !meta) return;
    const settings = snapshot.settings || {};
    const connected = !!(settings.clarityEnabled && settings.clarityProjectId);
    meta.textContent = connected
      ? `Connected to ${settings.clarityProjectLabel || "Microsoft Clarity"} | ${settings.clarityDashboardUrl || "https://clarity.microsoft.com/"}`
      : "Microsoft Clarity is not connected yet.";
    frame.innerHTML = `
      <div style="max-width:560px">
        <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.56);font-weight:700">Modern Replay Stack</div>
        <div style="margin-top:14px;font-size:34px;line-height:1.02;font-weight:800">Microsoft Clarity</div>
        <div style="margin-top:14px;color:rgba(255,255,255,.72);line-height:1.7;font-size:15px">${connected ? "Replay now runs through Microsoft Clarity for hosted recordings, filters, and heatmaps." : "Connect your Microsoft Clarity project in Settings to replace the old custom replay system with a hosted stack."}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px">
          <span class="badge badge-blue">Autocapture</span>
          <span class="badge badge-green">Session Replay</span>
          <span class="badge badge-gold">Heatmaps</span>
        </div>
      </div>
    `;
  }

  function clearReplayTimers() {
    state.replayTimerIds.forEach(id => window.clearTimeout(id));
    state.replayTimerIds = [];
  }

  function resetReplayStage() {
    clearReplayTimers();
    const frame = document.getElementById("sessionReplayFrame");
    if (state.replayPlayer && typeof state.replayPlayer.pause === "function") state.replayPlayer.pause();
    state.replayPlayer = null;
    state.replayVideoParts = [];
    state.activeReplayPartIndex = 0;
    if (frame) frame.innerHTML = "";
  }

  function buildReplayDocument(snapshotHtml, snapshotHeadHtml) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><base href="${window.location.origin}/">${snapshotHeadHtml || ""}<style>html,body{margin:0;background:#fff;color:#111} body{font:14px/1.5 Arial,sans-serif} img,video{max-width:100%} a{color:inherit;text-decoration:none}</style></head><body>${snapshotHtml || "<div style='padding:20px'>Snapshot unavailable.</div>"}</body></html>`;
  }

  async function loadReplay(sessionId) {
    resetReplayStage();
    if (!state.replayCache[sessionId]) {
      const payload = await api(`/api/admin/sessions/${encodeURIComponent(sessionId)}/replay`);
      state.replayCache[sessionId] = payload.replay;
    }
    const replay = state.replayCache[sessionId];
    const meta = document.getElementById("sessionReplayMeta");
    const frame = document.getElementById("sessionReplayFrame");
    if (meta) {
      meta.textContent = `${formatDateTime(replay.createdAt || replay.updatedAt)} | ${replay.ip || "unknown"} | ${formatPageLabel(replay.path || replay.page || "/")} | ${formatDuration(replay.durationMs)} | ${(replay.parts || []).length || 1} clips`;
    }
    if (frame) frame.innerHTML = "";
    if (replay.format === "video" && frame) {
      state.replayVideoParts = (replay.parts || []).slice().sort((a, b) => Number(a.index || 0) - Number(b.index || 0));
      frame.innerHTML = "";
      frame.innerHTML = `<video id="sessionReplayVideo" controls playsinline preload="metadata" style="width:100%;height:100%;background:#000;object-fit:contain"></video>`;
      const video = getReplayVideoElement();
      if (video && state.replayVideoParts[0]) {
        video.src = state.replayVideoParts[0].url;
        video.playbackRate = Number(state.replaySpeed || 1) || 1;
        video.onended = function() {
          if (state.activeReplayPartIndex + 1 >= state.replayVideoParts.length) return;
          state.activeReplayPartIndex += 1;
          video.src = state.replayVideoParts[state.activeReplayPartIndex].url;
          video.playbackRate = Number(state.replaySpeed || 1) || 1;
          video.play().catch(() => {});
        };
      }
    } else {
      if (frame) {
        frame.innerHTML = `<div style="display:grid;place-items:center;height:100%;padding:24px;text-align:center;color:var(--c-muted)">This session is not available in the new video replay format.</div>`;
      }
    }
    state.activeReplaySessionId = sessionId;
  }

  function playLoadedReplay() {
    const sessionId = state.activeReplaySessionId;
    if (!sessionId || !state.replayCache[sessionId]) return;
    if (state.replayCache[sessionId].format === "video") {
      const video = getReplayVideoElement();
      if (video) video.play().catch(() => {});
      return;
    }
  }

  function renderServices(snapshot) {
    const serviceList = document.getElementById("serviceList");
    serviceList.innerHTML = (snapshot.services || []).map((service, index) => `
      <div class="service-list-item" data-service-id="${service.id}">
        <div class="service-num">${String(index + 1).padStart(2, "0")}</div>
        <div class="service-info">
          <div class="service-name">${escapeHtml(service.name)}</div>
          <div class="service-desc">${escapeHtml(service.shortDescription)}</div>
        </div>
        <span class="badge ${service.status === "active" ? "badge-green" : "badge-gold"}">${escapeHtml(service.status)}</span>
        <div class="service-actions">
          <button class="action-btn edit js-service-edit">Edit</button>
          <button class="action-btn delete js-service-delete">Delete</button>
        </div>
      </div>
    `).join("");
  }

  function renderSettings(snapshot) {
    const panel = document.getElementById("page-settings");
    const inputs = panel.querySelectorAll(".editor-input");
    if (inputs[0]) inputs[0].value = snapshot.settings.siteName || "";
    if (inputs[1]) inputs[1].value = snapshot.settings.contactEmail || "";
    if (inputs[2]) inputs[2].value = snapshot.settings.contactPhone || "";
    const toggles = panel.querySelectorAll(".toggle");
    if (toggles[0]) toggles[0].classList.toggle("on", !!snapshot.settings.maintenanceMode);
    if (toggles[1]) toggles[1].classList.toggle("on", !!snapshot.settings.acceptLeads);
    ensureClaritySettingsCard(snapshot);
  }

  function ensureClaritySettingsCard(snapshot) {
    const panel = document.getElementById("page-settings");
    if (!panel) return;
    let card = document.getElementById("claritySettingsCard");
    if (!card) {
      const settingsBody = panel.querySelector(".settings-grid .card");
      if (!settingsBody) return;
      card = document.createElement("div");
      card.id = "claritySettingsCard";
      card.style.cssText = "margin-top:18px;padding:22px;border:1px solid var(--c-border);background:linear-gradient(135deg,rgba(254,168,0,0.08),rgba(59,130,246,0.06) 55%,rgba(255,255,255,0.02));display:grid;gap:14px";
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap">
          <div>
            <div style="font-size:15px;font-weight:700">Microsoft Clarity Hub</div>
            <div style="margin-top:6px;color:var(--c-muted);font-size:13px;line-height:1.6">Use Microsoft Clarity for hosted session replay, heatmaps, and cleaner production analytics.</div>
          </div>
          <div id="clarityStatusBadge" class="badge badge-gold">Not Connected</div>
        </div>
        <div class="editor-field"><div class="editor-label">Project Label</div><input class="editor-input" id="clarityProjectLabel" type="text" placeholder="Webx Website" /></div>
        <div class="editor-field"><div class="editor-label">Clarity Project ID</div><input class="editor-input" id="clarityProjectId" type="text" placeholder="Paste Clarity project id" /></div>
        <div class="editor-field"><div class="editor-label">Clarity Dashboard URL</div><input class="editor-input" id="clarityDashboardUrl" type="text" placeholder="https://clarity.microsoft.com/" /></div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="editor-label" style="margin:0">Enable Clarity Tracking</div>
            <div class="toggle" id="clarityEnabledToggle"></div>
          </div>
          <button class="btn btn-outline js-open-clarity" type="button">Open Clarity</button>
        </div>
      `;
      settingsBody.appendChild(card);
    }

    const settings = snapshot.settings || {};
    const projectId = card.querySelector("#clarityProjectId");
    const dashboardUrl = card.querySelector("#clarityDashboardUrl");
    const label = card.querySelector("#clarityProjectLabel");
    const toggle = card.querySelector("#clarityEnabledToggle");
    const badge = card.querySelector("#clarityStatusBadge");
    if (projectId) projectId.value = settings.clarityProjectId || "";
    if (dashboardUrl) dashboardUrl.value = settings.clarityDashboardUrl || "https://clarity.microsoft.com/";
    if (label) label.value = settings.clarityProjectLabel || "Webx Website";
    if (toggle) toggle.classList.toggle("on", !!settings.clarityEnabled);
    if (badge) {
      const connected = !!(settings.clarityEnabled && settings.clarityProjectId);
      badge.className = `badge ${connected ? "badge-green" : "badge-gold"}`;
      badge.textContent = connected ? "Connected" : "Not Connected";
    }
  }

  const HOME_SECTION_LIBRARY = {
    hero: {
      label: "Hero",
      create: () => ({ id: `home-hero-${Date.now()}`, type: "hero", enabled: true, title: "DESIGN THAT MOVES PEOPLE", subtitle: "A UI/UX Design Studio Creating Thoughtful Digital Experiences for Brands and Products", backgroundVideo: "/videos/home-background.mp4", previewVideo: "/videos/logo-intro-wds.mp4", thumbnailImage: "/assets/images/hero/hero-mockup.jpg", thumbnailAlt: "Hero thumbnail", badgeText: "SHOWREEL - SHOWREEL - SHOWREEL -" })
    },
    stats: {
      label: "Stats",
      create: () => ({ id: `home-stats-${Date.now()}`, type: "stats", enabled: true, items: [{ id: `stat-${Date.now()}`, value: "1", label: "New stat" }] })
    },
    services: {
      label: "Services",
      create: () => ({ id: `home-services-${Date.now()}`, type: "services", enabled: true, label: "Core Services", title: "Where Creativity Meets User Experience", ctaText: "EXPLORE ALL EXPERTISE", ctaUrl: "/pages/main/services.html", items: [{ id: `service-${Date.now()}`, title: "New service", description: "Service description", icon: "/assets/images/icons/webx-icon.svg", iconAlt: "Service icon", ctaText: "GET INQUIRY", ctaUrl: "/pages/system/service-form.html" }] })
    },
    work: {
      label: "Work",
      create: () => ({ id: `home-work-${Date.now()}`, type: "work", enabled: true, label: "Work", title: "Creative Projects That Define Us", ctaText: "VIEW ALL", ctaUrl: "/pages/main/work.html", items: [{ id: `work-${Date.now()}`, title: "New project", description: "Project description", image: "/assets/images/others/work.png", imageAlt: "Project image", url: "/pages/main/work.html" }] })
    },
    clients: {
      label: "Clients",
      create: () => ({ id: `home-clients-${Date.now()}`, type: "clients", enabled: true, label: "Clients", title: "We've Worked With Amazing People", items: [{ id: `client-${Date.now()}`, image: "/assets/images/logos/webx-logo.svg", alt: "Client logo" }] })
    },
    testimonials: {
      label: "Testimonials",
      create: () => ({ id: `home-testimonials-${Date.now()}`, type: "testimonials", enabled: true, label: "The Impact", title: "From vision to real results, a team that delivers consistently", items: [{ id: `testimonial-${Date.now()}`, quote: "Client quote", authorName: "Client name", authorTitle: "Founder", authorImage: "/assets/images/blogs/auther-imag-ab.png", authorImageAlt: "Client image", brandLogo: "/assets/images/logos/webx-logo.svg", brandLogoAlt: "Brand logo" }] })
    },
    blogs: {
      label: "Blogs",
      create: () => ({ id: `home-blogs-${Date.now()}`, type: "blogs", enabled: true, label: "Today's Blogs", title: "Check out our blog for the latest tips, tricks, and happenings in business and design.", items: [{ id: `blog-${Date.now()}`, title: "New blog", image: "/assets/images/others/home.png", imageAlt: "Blog image", dateLabel: "Date: 30 Mar 26", dateValue: "2026-03-30", excerpt: "Blog excerpt", url: "/pages/blogs/blogs.html", tags: ["tag one", "tag two"] }] })
    },
    faq: {
      label: "FAQ",
      create: () => ({ id: `home-faq-${Date.now()}`, type: "faq", enabled: true, label: "Frequently Asked Questions", title: "Find answers to common questions about our services", items: [{ id: `faq-${Date.now()}`, question: "New question?", answer: "New answer.", open: false }] })
    },
    cta: {
      label: "CTA",
      create: () => ({ id: `home-cta-${Date.now()}`, type: "cta", enabled: true, title: "Ready to build something meaningful?", buttonText: "START YOUR PROJECT", buttonUrl: "/pages/main/contact-page.html" })
    }
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function homeSectionFields(type) {
    const map = {
      hero: ["title", "subtitle", "backgroundVideo", "previewVideo", "thumbnailImage", "thumbnailAlt", "badgeText"],
      stats: [],
      services: ["label", "title", "ctaText", "ctaUrl"],
      work: ["label", "title", "ctaText", "ctaUrl"],
      clients: ["label", "title"],
      testimonials: ["label", "title"],
      blogs: ["label", "title"],
      faq: ["label", "title"],
      cta: ["title", "buttonText", "buttonUrl"]
    };
    return map[type] || [];
  }

  function homeItemFields(type) {
    const map = {
      stats: ["value", "label"],
      services: ["title", "description", "icon", "iconAlt", "ctaText", "ctaUrl"],
      work: ["title", "description", "image", "imageAlt", "url"],
      clients: ["image", "alt"],
      testimonials: ["quote", "authorName", "authorTitle", "authorImage", "authorImageAlt", "brandLogo", "brandLogoAlt"],
      blogs: ["title", "image", "imageAlt", "dateLabel", "dateValue", "excerpt", "url", "tags"],
      faq: ["question", "answer", "open"]
    };
    return map[type] || [];
  }

  const HOME_IMAGE_FIELDS = new Set(["thumbnailImage", "image", "icon", "authorImage", "brandLogo"]);
  const HOME_LONG_FIELDS = new Set(["subtitle", "description", "excerpt", "quote", "answer", "badgeText"]);

  function formatFieldLabel(value) {
    return String(value || "").replace(/([A-Z])/g, " $1").replace(/^./, letter => letter.toUpperCase());
  }

  function ensureHomeCmsStyles() {
    if (document.getElementById("homeCmsStyles")) return;
    const style = document.createElement("style");
    style.id = "homeCmsStyles";
    style.textContent = `
      .home-cms-shell{margin-top:26px;display:grid;gap:18px}
      .home-cms-command,.home-cms-sidebar,.home-cms-editor-panel,.home-cms-item,.home-cms-empty{border:1px solid rgba(255,255,255,0.08);background:linear-gradient(180deg,rgba(14,14,14,0.98),rgba(7,7,7,0.98));box-shadow:0 18px 48px rgba(0,0,0,0.28)}
      .home-cms-command{padding:22px;background:radial-gradient(circle at top left,rgba(254,168,0,0.12),transparent 34%),linear-gradient(180deg,rgba(14,14,14,0.98),rgba(7,7,7,0.98))}
      .home-cms-command-head,.home-cms-toolbar,.home-cms-page-grid,.home-cms-section-head,.home-cms-item-head,.home-cms-section-footer,.home-cms-sidebar-top,.home-cms-upload-meta{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
      .home-cms-title{font-size:clamp(20px,2.4vw,30px);font-weight:800;letter-spacing:-0.04em;line-height:1.05;max-width:680px}
      .home-cms-subtitle,.home-cms-muted{color:var(--c-muted);font-size:12px;line-height:1.65}
      .home-cms-page-grid{margin-top:18px;align-items:flex-start}
      .home-cms-page-grid .home-cms-input-wrap{flex:1;min-width:260px}
      .home-cms-layout{display:grid;grid-template-columns:minmax(260px,320px) minmax(0,1fr);gap:18px;align-items:start}
      .home-cms-sidebar,.home-cms-editor-panel{padding:18px}
      .home-cms-sidebar{position:sticky;top:18px;display:grid;gap:14px}
      .home-cms-sidebar-list{display:grid;gap:10px;max-height:calc(100vh - 260px);overflow:auto;padding-right:4px}
      .home-cms-nav-item{width:100%;text-align:left;padding:14px 15px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.02);cursor:pointer;transition:0.2s ease;display:grid;gap:7px}
      .home-cms-nav-item:hover{border-color:rgba(254,168,0,0.28);background:rgba(255,255,255,0.04)}
      .home-cms-nav-item.active{border-color:rgba(254,168,0,0.45);background:linear-gradient(180deg,rgba(254,168,0,0.12),rgba(254,168,0,0.04));box-shadow:inset 0 0 0 1px rgba(254,168,0,0.08)}
      .home-cms-nav-meta{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .home-cms-nav-index{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#f8c86d}
      .home-cms-nav-title{font-size:14px;font-weight:700;color:#fff}
      .home-cms-nav-copy{font-size:11px;color:var(--c-muted);line-height:1.5}
      .home-cms-status{display:inline-flex;align-items:center;gap:7px;padding:5px 9px;border-radius:999px;background:rgba(16,185,129,0.14);color:#bbf7d0;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase}
      .home-cms-status::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
      .home-cms-status.hidden{background:rgba(148,163,184,0.14);color:#cbd5e1}
      .home-cms-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .home-cms-kpi{padding:14px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02)}
      .home-cms-kpi strong{display:block;font-size:19px;line-height:1.1}
      .home-cms-kpi span{display:block;margin-top:4px;color:var(--c-muted);font-size:11px;line-height:1.5}
      .home-cms-editor-panel{display:grid;gap:18px}
      .home-cms-editor-top{display:grid;gap:16px}
      .home-cms-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid rgba(254,168,0,0.2);background:rgba(254,168,0,0.08);color:var(--c-accent);font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;width:max-content}
      .home-cms-section-title{font-size:24px;font-weight:800;letter-spacing:-0.03em;line-height:1.05}
      .home-cms-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      .home-cms-full{grid-column:1/-1}
      .home-cms-input-wrap{display:grid;gap:8px}
      .home-cms-input-wrap .editor-label{margin:0}
      .home-cms-item{padding:16px}
      .home-cms-items{display:grid;gap:14px}
      .home-cms-item-head{margin-bottom:12px}
      .home-cms-small{padding:9px 13px;font-size:12px}
      .home-cms-icon-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.12);background:#0f0f0f;color:#fff;cursor:pointer;transition:0.2s ease}
      .home-cms-icon-btn:hover{border-color:rgba(254,168,0,0.35);transform:translateY(-1px)}
      .home-cms-icon-btn img{width:16px;height:16px;filter:brightness(0) invert(1)}
      .home-cms-icon-btn.primary{background:linear-gradient(135deg,#fea800,#ffcb52);border-color:#fea800;color:#111;font-weight:700}
      .home-cms-icon-btn.primary img{filter:brightness(0)}
      .home-cms-icon-btn:disabled{opacity:0.45;cursor:not-allowed;transform:none}
      .home-cms-upload-grid{display:grid;grid-template-columns:minmax(0,190px) minmax(0,1fr);gap:14px;align-items:stretch}
      .home-cms-upload{border:1px dashed rgba(254,168,0,0.35);background:linear-gradient(180deg,rgba(254,168,0,0.08),rgba(255,255,255,0.02));min-height:162px;padding:14px;display:flex;flex-direction:column;justify-content:center;gap:10px;cursor:pointer;transition:0.2s ease}
      .home-cms-upload.dragover{border-color:#fea800;background:linear-gradient(180deg,rgba(254,168,0,0.16),rgba(255,255,255,0.05));transform:scale(1.01)}
      .home-cms-upload-preview{width:100%;aspect-ratio:1.1/1;object-fit:cover;border:1px solid rgba(255,255,255,0.08);background:#020202}
      .home-cms-upload-title{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ffe3a2}
      .home-cms-upload-copy{font-size:12px;color:#e8e8e8;line-height:1.55}
      .home-cms-upload-note{font-size:11px;color:var(--c-muted)}
      .home-cms-empty{padding:18px;color:var(--c-muted);font-size:12px;line-height:1.6}
      .home-cms-divider{height:1px;background:rgba(255,255,255,0.08)}
      @media (max-width: 1100px){.home-cms-layout,.home-cms-grid,.home-cms-upload-grid,.home-cms-kpis{grid-template-columns:1fr}.home-cms-sidebar{position:static}.home-cms-sidebar-list{max-height:none}}
    `;
    document.head.appendChild(style);
  }

  function ensureHomeCms() {
    ensureHomeCmsStyles();
    const primaryCard = document.getElementById("pageEditorPrimaryCard");
    const mount = document.getElementById("homeCmsMount");
    if (!mount) return null;
    if (state.currentPageKey !== "home") {
      if (primaryCard) primaryCard.style.display = "block";
      mount.innerHTML = "";
      return null;
    }
    if (primaryCard) primaryCard.style.display = "none";
    let shell = document.getElementById("homeCmsShell");
    if (!shell) {
      shell = document.createElement("div");
      shell.id = "homeCmsShell";
      shell.className = "home-cms-shell";
      mount.appendChild(shell);
    }
    return shell;
  }

  function initializeHomeSectionHistory(sections) {
    state.homeEditor.history = {};
    (sections || []).forEach(section => {
      state.homeEditor.history[section.id] = {
        undo: [JSON.stringify(section)],
        redo: []
      };
    });
  }

  function getHomeSection(sectionId) {
    return (state.homeEditor.sections || []).find(section => section.id === sectionId) || null;
  }

  function getSelectedHomeSection() {
    const sections = state.homeEditor.sections || [];
    if (!sections.length) return null;
    const selected = getHomeSection(state.homeEditor.selectedSectionId || "");
    if (selected) return selected;
    state.homeEditor.selectedSectionId = sections[0].id;
    return sections[0];
  }

  function ensureSectionHistory(sectionId) {
    if (!state.homeEditor.history) state.homeEditor.history = {};
    if (!state.homeEditor.history[sectionId]) {
      const section = getHomeSection(sectionId);
      state.homeEditor.history[sectionId] = {
        undo: section ? [JSON.stringify(section)] : [],
        redo: []
      };
    }
    return state.homeEditor.history[sectionId];
  }

  function recordSectionHistory(sectionId) {
    if (!sectionId || state.homeEditor.applyingHistory) return;
    const section = getHomeSection(sectionId);
    if (!section) return;
    const history = ensureSectionHistory(sectionId);
    const snapshot = JSON.stringify(section);
    if (history.undo[history.undo.length - 1] === snapshot) return;
    history.undo.push(snapshot);
    if (history.undo.length > 40) history.undo = history.undo.slice(-40);
    history.redo = [];
  }

  function getSectionHistoryCounts(sectionId) {
    const history = ensureSectionHistory(sectionId);
    return {
      undo: Math.max(0, history.undo.length - 1),
      redo: history.redo.length
    };
  }

  function applySectionSnapshot(sectionId, snapshot) {
    const index = (state.homeEditor.sections || []).findIndex(section => section.id === sectionId);
    if (index < 0) return;
    state.homeEditor.applyingHistory = true;
    state.homeEditor.sections[index] = JSON.parse(snapshot);
    state.homeEditor.applyingHistory = false;
  }

  function undoHomeSection(sectionId) {
    const history = ensureSectionHistory(sectionId);
    if (history.undo.length <= 1) return false;
    const current = history.undo.pop();
    history.redo.push(current);
    applySectionSnapshot(sectionId, history.undo[history.undo.length - 1]);
    return true;
  }

  function redoHomeSection(sectionId) {
    const history = ensureSectionHistory(sectionId);
    if (!history.redo.length) return false;
    const snapshot = history.redo.pop();
    history.undo.push(snapshot);
    applySectionSnapshot(sectionId, snapshot);
    return true;
  }

  function createHomeItem(type) {
    const section = (HOME_SECTION_LIBRARY[type] && HOME_SECTION_LIBRARY[type].create()) || {};
    return Array.isArray(section.items) && section.items[0] ? clone(section.items[0]) : null;
  }

  function renderHomeField(sectionId, field, value, options = {}) {
    const itemId = options.itemId || "";
    const longField = HOME_LONG_FIELDS.has(field);
    const inputClass = itemId ? "js-home-item-field" : "js-home-section-field";
    const dataAttrs = `${itemId ? `data-item-id="${escapeHtml(itemId)}"` : ""} data-section-id="${escapeHtml(sectionId)}" data-field="${escapeHtml(field)}"`;
    if (field === "open") {
      return `<label class="home-cms-input-wrap"><div class="editor-label">Open By Default</div><select class="editor-input ${inputClass}" ${dataAttrs}><option value="false"${value ? "" : " selected"}>Closed</option><option value="true"${value ? " selected" : ""}>Open</option></select></label>`;
    }
    if (HOME_IMAGE_FIELDS.has(field)) {
      return `
        <div class="home-cms-input-wrap home-cms-full">
          <div class="editor-label">${formatFieldLabel(field)}</div>
          <div class="home-cms-upload-grid">
            <div class="home-cms-upload js-home-image-drop" data-section-id="${escapeHtml(sectionId)}" ${itemId ? `data-item-id="${escapeHtml(itemId)}"` : ""} data-field="${escapeHtml(field)}">
              <img class="home-cms-upload-preview" src="${escapeHtml(value || "/assets/images/others/home.png")}" alt="${escapeHtml(formatFieldLabel(field))}" />
              <div class="home-cms-upload-title">Upload Image</div>
              <div class="home-cms-upload-copy">Click to upload or drop a new image here.</div>
              <div class="home-cms-upload-note">PNG, JPG, WEBP, GIF supported</div>
              <input type="file" accept="image/*" class="js-home-image-input" data-section-id="${escapeHtml(sectionId)}" ${itemId ? `data-item-id="${escapeHtml(itemId)}"` : ""} data-field="${escapeHtml(field)}" hidden />
            </div>
            <label class="home-cms-input-wrap">
              <div class="editor-label">Asset URL</div>
              <input class="editor-input ${inputClass}" ${dataAttrs} value="${escapeHtml(value || "")}" placeholder="/assets/images/..." />
            </label>
          </div>
        </div>
      `;
    }
    const control = longField
      ? `<textarea class="editor-input editor-textarea ${inputClass}" ${dataAttrs} style="min-height:100px">${escapeHtml(value || "")}</textarea>`
      : `<input class="editor-input ${inputClass}" ${dataAttrs} value="${escapeHtml(value || "")}" />`;
    return `<label class="home-cms-input-wrap ${longField ? "home-cms-full" : ""}"><div class="editor-label">${formatFieldLabel(field)}</div>${control}</label>`;
  }

  function renderHomeCms() {
    const shell = ensureHomeCms();
    if (!shell) return;
    const sections = state.homeEditor.sections || [];
    const selectedSection = getSelectedHomeSection();
    const hiddenCount = sections.filter(section => section.enabled === false).length;
    const selectedHistory = selectedSection ? getSectionHistoryCounts(selectedSection.id) : { undo: 0, redo: 0 };
    const selectedSectionFields = selectedSection
      ? homeSectionFields(selectedSection.type).map(field => renderHomeField(selectedSection.id, field, selectedSection[field], {})).join("")
      : "";
    const selectedItems = selectedSection && Array.isArray(selectedSection.items)
      ? selectedSection.items.map((item, itemIndex) => {
          const itemFields = homeItemFields(selectedSection.type).map(field => renderHomeField(selectedSection.id, field, field === "tags" && Array.isArray(item[field]) ? item[field].join(", ") : item[field], { itemId: item.id })).join("");
          return `
            <div class="home-cms-item">
              <div class="home-cms-item-head">
                <strong>Card ${String(itemIndex + 1).padStart(2, "0")}</strong>
                <button type="button" class="btn btn-danger home-cms-small" data-home-item-delete="${escapeHtml(item.id)}" data-section-id="${escapeHtml(selectedSection.id)}">Delete Card</button>
              </div>
              <div class="home-cms-grid">${itemFields}</div>
            </div>
          `;
        }).join("")
      : "";

    shell.innerHTML = `
      <div class="home-cms-command">
        <div class="home-cms-command-head">
          <div>
            <div class="home-cms-eyebrow">Home Content Studio</div>
            <div class="home-cms-title">Focused editing for every home page section.</div>
            <div class="home-cms-subtitle">Switch sections from the sidebar and update the selected content with clear, production-ready controls.</div>
          </div>
          <div class="home-cms-toolbar">
            <select id="homeSectionTypePicker" class="editor-input" style="min-width:220px">
              <option value="hero">Hero</option><option value="stats">Stats</option><option value="services">Services</option><option value="work">Work</option><option value="clients">Clients</option><option value="testimonials">Testimonials</option><option value="blogs">Blogs</option><option value="faq">FAQ</option><option value="cta">CTA</option>
            </select>
            <button type="button" class="home-cms-icon-btn" id="homeUndoBtn"><img src="https://api.iconify.design/tabler/refresh.svg" alt="" /> Restore Last Saved</button>
            <button type="button" class="home-cms-icon-btn primary" id="homeAddSectionBtn"><img src="https://api.iconify.design/tabler/plus.svg" alt="" /> Add Section</button>
            <button type="button" class="home-cms-icon-btn primary" id="homeSaveAllBtn"><img src="https://api.iconify.design/tabler/device-floppy.svg" alt="" /> Save All</button>
          </div>
        </div>
        <div class="home-cms-page-grid">
          <label class="home-cms-input-wrap"><div class="editor-label">Page Title (SEO)</div><input class="editor-input" id="homeSeoTitle" type="text" placeholder="Enter page title..." value="${escapeHtml(document.getElementById("homeSeoTitle") ? document.getElementById("homeSeoTitle").value : (document.getElementById("editPageTitle") ? document.getElementById("editPageTitle").value : ""))}" /></label>
          <label class="home-cms-input-wrap" style="min-width:360px"><div class="editor-label">Meta Description</div><textarea class="editor-input editor-textarea" id="homeSeoMeta" placeholder="Enter meta description..." style="min-height:92px">${escapeHtml(document.getElementById("homeSeoMeta") ? document.getElementById("homeSeoMeta").value : (document.getElementById("editPageMeta") ? document.getElementById("editPageMeta").value : ""))}</textarea></label>
        </div>
      </div>
      <div class="home-cms-layout">
        <aside class="home-cms-sidebar">
          <div class="home-cms-sidebar-top">
            <div>
              <div class="editor-label" style="margin:0">Sections</div>
              <div class="home-cms-muted">Select a section to open its editor on the right.</div>
            </div>
          </div>
          <div class="home-cms-kpis">
            <div class="home-cms-kpi"><strong>${String(sections.length).padStart(2, "0")}</strong><span>Total</span></div>
            <div class="home-cms-kpi"><strong>${String(Math.max(0, sections.length - hiddenCount)).padStart(2, "0")}</strong><span>Visible</span></div>
            <div class="home-cms-kpi"><strong>${String(hiddenCount).padStart(2, "0")}</strong><span>Hidden</span></div>
          </div>
          <div class="home-cms-sidebar-list">
            ${sections.map((section, index) => `
              <button type="button" class="home-cms-nav-item ${selectedSection && selectedSection.id === section.id ? "active" : ""}" data-home-section-select="${escapeHtml(section.id)}">
                <div class="home-cms-nav-meta">
                  <span class="home-cms-nav-index">Section ${String(index + 1).padStart(2, "0")}</span>
                  <span class="home-cms-status ${section.enabled === false ? "hidden" : ""}">${section.enabled === false ? "Hidden" : "Live"}</span>
                </div>
                <div class="home-cms-nav-title">${escapeHtml((HOME_SECTION_LIBRARY[section.type] || {}).label || section.type)}</div>
                <div class="home-cms-nav-copy">${escapeHtml(section.title || section.label || "Section content editor")}</div>
              </button>
            `).join("") || '<div class="home-cms-empty">No sections available yet.</div>'}
          </div>
        </aside>
        <section class="home-cms-editor-panel">
          ${selectedSection ? `
            <div class="home-cms-editor-top">
              <div class="home-cms-section-head">
                <div>
                  <div class="home-cms-eyebrow">Selected Section</div>
                  <div class="home-cms-section-title">${escapeHtml((HOME_SECTION_LIBRARY[selectedSection.type] || {}).label || selectedSection.type)} Editor</div>
                  <div class="home-cms-subtitle">${escapeHtml(selectedSection.title || selectedSection.label || "Update this section from the editor panel.")}</div>
                </div>
                <div class="home-cms-toolbar">
                  <span class="home-cms-status ${selectedSection.enabled === false ? "hidden" : ""}">${selectedSection.enabled === false ? "Hidden" : "Live"}</span>
                  <button type="button" class="btn btn-outline home-cms-small" data-home-section-toggle="${escapeHtml(selectedSection.id)}">${selectedSection.enabled === false ? "Show Section" : "Hide Section"}</button>
                  <button type="button" class="btn btn-danger home-cms-small" data-home-section-delete="${escapeHtml(selectedSection.id)}">Delete Section</button>
                </div>
              </div>
              <div class="home-cms-grid">${selectedSectionFields || '<div class="home-cms-empty home-cms-full">This section is primarily managed through cards or visibility settings.</div>'}</div>
            </div>
            <div class="home-cms-divider"></div>
            ${Array.isArray(selectedSection.items) ? `
              <div class="home-cms-editor-top">
                <div class="home-cms-section-head">
                  <div>
                    <div class="editor-label" style="margin:0">Cards / Items</div>
                    <div class="home-cms-muted">Manage the individual cards for this section from here.</div>
                  </div>
                  <button type="button" class="btn btn-primary home-cms-small" data-home-item-add="${escapeHtml(selectedSection.id)}">+ Add Card</button>
                </div>
                <div class="home-cms-items">${selectedItems || '<div class="home-cms-empty">No cards yet. Add a new card to continue.</div>'}</div>
              </div>
              <div class="home-cms-divider"></div>
            ` : ""}
            <div class="home-cms-section-footer">
              <div class="home-cms-toolbar">
                <button type="button" class="home-cms-icon-btn" data-home-section-undo="${escapeHtml(selectedSection.id)}" ${selectedHistory.undo ? "" : "disabled"}><img src="https://api.iconify.design/tabler/arrow-back-up.svg" alt="" /> Undo</button>
                <button type="button" class="home-cms-icon-btn" data-home-section-redo="${escapeHtml(selectedSection.id)}" ${selectedHistory.redo ? "" : "disabled"}><img src="https://api.iconify.design/tabler/arrow-forward-up.svg" alt="" /> Redo</button>
              </div>
              <button type="button" class="home-cms-icon-btn primary" data-home-section-save="${escapeHtml(selectedSection.id)}"><img src="https://api.iconify.design/tabler/device-floppy.svg" alt="" /> Save Section</button>
            </div>
          ` : '<div class="home-cms-empty">Select a section from the sidebar to start editing.</div>'}
        </section>
      </div>
    `;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function uploadHomeImage(file) {
    if (!file) throw new Error("No image selected");
    if (!String(file.type || "").startsWith("image/")) throw new Error("Please upload an image file");
    const dataUrl = await readFileAsDataUrl(file);
    const response = await api("/api/admin/media/upload-image", {
      method: "POST",
      body: JSON.stringify({ fileName: file.name, dataUrl })
    });
    return response.url;
  }

  async function assignUploadedHomeImage(target, file) {
    const sectionId = target.dataset.sectionId || "";
    const itemId = target.dataset.itemId || "";
    const field = target.dataset.field || "";
    const section = getHomeSection(sectionId);
    const item = section && itemId && Array.isArray(section.items)
      ? section.items.find(entry => entry.id === itemId)
      : null;
    if (!section || !field) return;
    recordSectionHistory(sectionId);
    const uploadZone = target.closest(".js-home-image-drop");
    if (uploadZone) uploadZone.classList.add("dragover");
    try {
      const nextUrl = await uploadHomeImage(file);
      if (item) item[field] = nextUrl;
      else section[field] = nextUrl;
      renderHomeCms();
      toast("Image updated in section", "upload", true);
    } catch (error) {
      toast(error.message || "Image upload failed", "lock");
    } finally {
      if (uploadZone) uploadZone.classList.remove("dragover");
      if (target.value) target.value = "";
    }
  }

  function getPageEntries(snapshot) {
    const pages = (snapshot && snapshot.pages) || {};
    const preferredOrder = ["home", "about", "services", "work", "contact", "faq", "blogs"];
    return Object.entries(pages)
      .filter(([, page]) => page && (page.editorType === "generic" || ["home", "work"].includes(page.editorType) || page.sections || page.projects))
      .sort((a, b) => {
        const aIndex = preferredOrder.indexOf(a[0]);
        const bIndex = preferredOrder.indexOf(b[0]);
        if (aIndex !== -1 || bIndex !== -1) {
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        }
        return a[0].localeCompare(b[0]);
      });
  }

  function getPageCardMeta(pageKey, page) {
    const iconMap = {
      home: "home",
      about: "users",
      services: "settings",
      work: "layout-grid",
      contact: "mail",
      faq: "help",
      blogs: "article",
      blog: "pencil",
      "blog-apple": "pencil",
      "blog-3": "pencil",
      "blog-4": "pencil",
      "privacy-policy": "shield-lock",
      "term-condition": "file-text",
      "service-form": "clipboard-text",
      "thank-you-page": "circle-check"
    };
    // Detect any dynamically created blog post page by its path or summary
    const isBlogPost = !!(page && (
      (page.path && String(page.path).includes("/pages/blogs/") && page.path !== "/pages/blogs/blogs.html") ||
      (page.summary && String(page.summary).startsWith("blog post"))
    ));
    return {
      icon: isBlogPost ? "pencil" : (iconMap[pageKey] || "file-text"),
      name: page.displayName || pageKey.replace(/[-_]+/g, " ").replace(/\b\w/g, ch => ch.toUpperCase()),
      description: page.summary || `${((page.sections || []).length || 0)} editable sections`,
      isBlogPost
    };
  }

  function renderPageManager(snapshot) {
    const grid = document.getElementById("pageCardGrid");
    if (!grid) return;
    const entries = getPageEntries(snapshot);
    const blogs = (snapshot && snapshot.blogs) || [];
    grid.innerHTML = entries.map(([pageKey, page]) => {
      const meta = getPageCardMeta(pageKey, page);
      // For blog posts: find the matching blog object by url to get its id for the editor
      let blogId = null;
      if (meta.isBlogPost && page.path) {
        const matchedBlog = blogs.find(b => b.url === page.path || b.url === (page.path));
        if (matchedBlog) blogId = matchedBlog.id;
      }
      const statusLabel = meta.isBlogPost ? "Blog Post" : "Live";
      const statusClass = meta.isBlogPost ? "badge-blue" : "";
      const editBtn = blogId
        ? `<span class="btn btn-outline js-page-card-blog-edit" data-blog-id="${escapeHtml(blogId)}" style="font-size:11px;padding:4px 12px">Edit Blog</span>`
        : `<span class="btn btn-outline" style="font-size:11px;padding:4px 12px">Edit</span>`;
      return `
        <div class="page-card" data-page-key="${escapeHtml(pageKey)}">
          <div class="page-card-icon"><img src="https://api.iconify.design/tabler/${escapeHtml(meta.icon)}.svg" alt="" /></div>
          <div class="page-card-name">${escapeHtml(meta.name)}</div>
          <div class="page-card-desc">${escapeHtml(meta.description)}</div>
          <div class="page-card-footer"><span class="page-card-status ${escapeHtml(statusClass)}">${escapeHtml(statusLabel)}</span>${editBtn}</div>
        </div>
      `;
    }).join("");
  }

  function parseGenericSectionDocument(html) {
    const parser = new DOMParser();
    return parser.parseFromString(`<body>${html || ""}</body>`, "text/html");
  }

  function buildAdminBlogCard(post) {
    const blogId = escapeAttr(post.id || post.slug || post.url || "");
    return `
          <article class="blog-card" data-blog-id="${blogId}">
            <div class="blog-image">
              <img src="${escapeAttr(post.image || '/assets/images/blogs/blog-img-1.png')}" alt="${escapeAttr(post.imageAlt || post.title || '')}" width="400" height="240" loading="lazy" />
            </div>
            <div class="blog-content">
              <h2 class="blog-card-title">${escapeHtml(post.title || 'Untitled')}</h2>
              <div class="blog-meta">
                <div class="blog-tags">
                  ${(post.tags || []).slice(0,3).map(tag => `<span class="blog-tag">${escapeHtml(tag)}</span>`).join("\n                  ")}
                </div>
                <span class="blog-date"><time datetime="${escapeAttr(post.dateValue || '')}">${escapeHtml(post.dateLabel || post.dateValue || '')}</time></span>
              </div>
              <p class="blog-excerpt">${escapeHtml(post.excerpt || post.intro || '')}</p>
              <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
                <a href="${escapeAttr(post.url || '#')}" class="blog-read-more" aria-label="Read ${escapeAttr(post.title || '')}">
                  <span>READ MORE</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </a>
                <button type="button" class="btn btn-outline home-cms-mini" data-open-blog-id="${blogId}">Edit</button>
                <button type="button" class="btn btn-danger home-cms-mini js-delete-blog-post" data-blog-id="${blogId}" ${blogId ? '' : 'disabled'}>Delete</button>
              </div>
            </div>
          </article>`;
  }

  function generateBlogsGridHtmlFromSnapshot() {
    try {
      const store = state.snapshot || {};
      const blogs = Array.isArray(store.blogs) ? store.blogs : [];
      const items = blogs.length ? blogs : ((store.pages || {}).home || {}).sections?.find(s => s.type === 'blogs')?.items || [];
      if (!items || !items.length) return "";
      return items.map(item => buildAdminBlogCard(item)).join("\n\n          ");
    } catch (e) {
      return "";
    }
  }

  function getNodeLabel(node, fallback) {
    const attrLabel = node.getAttribute && (node.getAttribute("aria-label") || node.getAttribute("alt") || node.getAttribute("title"));
    if (attrLabel) return attrLabel;
    const className = node.className && typeof node.className === "string" ? node.className.trim().split(/\s+/)[0] : "";
    if (className) {
      return className
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, ch => ch.toUpperCase());
    }
    return fallback;
  }

  function getNodePath(node, root) {
    const path = [];
    let current = node;
    while (current && current !== root) {
      const parent = current.parentNode;
      if (!parent) break;
      const siblings = Array.from(parent.children || []).filter(item => item.tagName === current.tagName);
      path.unshift({
        tag: current.tagName.toLowerCase(),
        index: siblings.indexOf(current)
      });
      current = parent;
    }
    return path;
  }

  function findNodeByPath(root, path) {
    let current = root;
    for (const step of path || []) {
      const matches = Array.from(current.children || []).filter(item => item.tagName.toLowerCase() === step.tag);
      current = matches[step.index];
      if (!current) return null;
    }
    return current;
  }

  function analyzeGenericSection(section) {
    const documentRef = parseGenericSectionDocument(section.html || "");
    const root = documentRef.body;
    const fields = [];
    let counter = 0;

    const pushField = (node, kind, label, extra = {}) => {
      counter += 1;
      fields.push({
        id: `${kind}-${counter}`,
        kind,
        label,
        path: getNodePath(node, root),
        ...extra
      });
    };

    root.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((node, index) => {
      pushField(node, "text", getNodeLabel(node, `Heading ${index + 1}`), { value: node.textContent || "", multiline: false });
    });

    root.querySelectorAll("p").forEach((node, index) => {
      pushField(node, "text", getNodeLabel(node, `Paragraph ${index + 1}`), { value: node.textContent || "", multiline: true });
    });

    root.querySelectorAll("li").forEach((node, index) => {
      pushField(node, "text", getNodeLabel(node, `List Item ${index + 1}`), { value: node.textContent || "", multiline: true });
    });

    root.querySelectorAll("a").forEach((node, index) => {
      pushField(node, "link", getNodeLabel(node, `Link ${index + 1}`), {
        text: node.textContent || "",
        href: node.getAttribute("href") || ""
      });
    });

    root.querySelectorAll("img").forEach((node, index) => {
      pushField(node, "image", getNodeLabel(node, `Image ${index + 1}`), {
        src: node.getAttribute("src") || "",
        alt: node.getAttribute("alt") || ""
      });
    });

    root.querySelectorAll("time").forEach((node, index) => {
      pushField(node, "time", getNodeLabel(node, `Date ${index + 1}`), {
        value: node.textContent || "",
        datetime: node.getAttribute("datetime") || ""
      });
    });

    root.querySelectorAll("[data-target]").forEach((node, index) => {
      pushField(node, "stat", getNodeLabel(node, `Stat ${index + 1}`), {
        value: node.textContent || "",
        target: node.getAttribute("data-target") || ""
      });
    });

    root.querySelectorAll(".section-label,.section-title,.services-page-title,.about-page-title,.contact-main-title,.contact-subtitle,.blogs-page-subtitle,.blog-card-title,.blog-excerpt,.service-title,.service-description,.accordion-title,.accordion-text,.office-address,.privacy-title,.privacy-intro,.pt-section-title,.privacy-meta p,.footer-heading,.footer-links a").forEach((node, index) => {
      if (fields.some(field => JSON.stringify(field.path) === JSON.stringify(getNodePath(node, root)))) return;
      pushField(node, "text", getNodeLabel(node, `Content ${index + 1}`), {
        value: node.textContent || "",
        multiline: node.textContent && node.textContent.trim().length > 80
      });
    });

    return fields;
  }

  function updateGenericSectionField(section, fieldId, prop, value) {
    const field = analyzeGenericSection(section).find(item => item.id === fieldId);
    if (!field) return;
    const documentRef = parseGenericSectionDocument(section.html || "");
    const node = findNodeByPath(documentRef.body, field.path);
    if (!node) return;

    if (field.kind === "text") {
      node.textContent = value;
    } else if (field.kind === "link") {
      if (prop === "text") node.textContent = value;
      if (prop === "href") node.setAttribute("href", value);
    } else if (field.kind === "image") {
      if (prop === "src") node.setAttribute("src", value);
      if (prop === "alt") node.setAttribute("alt", value);
    } else if (field.kind === "time") {
      if (prop === "value") node.textContent = value;
      if (prop === "datetime") node.setAttribute("datetime", value);
    } else if (field.kind === "stat") {
      if (prop === "value") node.textContent = value;
      if (prop === "target") node.setAttribute("data-target", value);
    }

    section.html = documentRef.body.innerHTML.trim();
  }

  function renderGenericField(section, field) {
    if (field.kind === "text") {
      const control = field.multiline
        ? `<textarea class="editor-input editor-textarea js-generic-structured-field" data-section-id="${escapeHtml(section.id)}" data-field-id="${escapeHtml(field.id)}" data-prop="value" style="min-height:110px">${escapeHtml(field.value || "")}</textarea>`
        : `<input class="editor-input js-generic-structured-field" data-section-id="${escapeHtml(section.id)}" data-field-id="${escapeHtml(field.id)}" data-prop="value" value="${escapeHtml(field.value || "")}" />`;
      return `<label class="home-cms-input-wrap home-cms-full"><div class="editor-label">${escapeHtml(field.label)}</div>${control}</label>`;
    }

    if (field.kind === "link") {
      return `
        <div class="home-cms-grid home-cms-full">
          <label class="home-cms-input-wrap">
            <div class="editor-label">${escapeHtml(field.label)} Text</div>
            <input class="editor-input js-generic-structured-field" data-section-id="${escapeHtml(section.id)}" data-field-id="${escapeHtml(field.id)}" data-prop="text" value="${escapeHtml(field.text || "")}" />
          </label>
          <label class="home-cms-input-wrap">
            <div class="editor-label">${escapeHtml(field.label)} URL</div>
            <input class="editor-input js-generic-structured-field" data-section-id="${escapeHtml(section.id)}" data-field-id="${escapeHtml(field.id)}" data-prop="href" value="${escapeHtml(field.href || "")}" />
          </label>
        </div>
      `;
    }

    if (field.kind === "image") {
      return `
        <div class="home-cms-input-wrap home-cms-full">
          <div class="editor-label">${escapeHtml(field.label)}</div>
          <div class="home-cms-upload-grid">
            <div class="home-cms-upload js-generic-image-drop" data-section-id="${escapeHtml(section.id)}" data-field-id="${escapeHtml(field.id)}">
              <img class="home-cms-upload-preview" src="${escapeHtml(field.src || "/assets/images/others/home.png")}" alt="${escapeHtml(field.alt || field.label || "Image preview")}" />
              <div class="home-cms-upload-title">Change Image</div>
              <div class="home-cms-upload-copy">Click to upload or drop a new image here.</div>
              <div class="home-cms-upload-note">PNG, JPG, WEBP, GIF supported</div>
              <input type="file" accept="image/*" class="js-generic-image-input" data-section-id="${escapeHtml(section.id)}" data-field-id="${escapeHtml(field.id)}" hidden />
            </div>
            <div class="home-cms-grid">
              <label class="home-cms-input-wrap">
                <div class="editor-label">${escapeHtml(field.label)} Image URL</div>
                <input class="editor-input js-generic-structured-field" data-section-id="${escapeHtml(section.id)}" data-field-id="${escapeHtml(field.id)}" data-prop="src" value="${escapeHtml(field.src || "")}" />
              </label>
              <label class="home-cms-input-wrap">
                <div class="editor-label">${escapeHtml(field.label)} Alt Text</div>
                <input class="editor-input js-generic-structured-field" data-section-id="${escapeHtml(section.id)}" data-field-id="${escapeHtml(field.id)}" data-prop="alt" value="${escapeHtml(field.alt || "")}" />
              </label>
            </div>
          </div>
        </div>
      `;
    }

    if (field.kind === "time") {
      return `
        <div class="home-cms-grid home-cms-full">
          <label class="home-cms-input-wrap">
            <div class="editor-label">${escapeHtml(field.label)} Text</div>
            <input class="editor-input js-generic-structured-field" data-section-id="${escapeHtml(section.id)}" data-field-id="${escapeHtml(field.id)}" data-prop="value" value="${escapeHtml(field.value || "")}" />
          </label>
          <label class="home-cms-input-wrap">
            <div class="editor-label">${escapeHtml(field.label)} Datetime</div>
            <input class="editor-input js-generic-structured-field" data-section-id="${escapeHtml(section.id)}" data-field-id="${escapeHtml(field.id)}" data-prop="datetime" value="${escapeHtml(field.datetime || "")}" />
          </label>
        </div>
      `;
    }

    if (field.kind === "stat") {
      return `
        <div class="home-cms-grid home-cms-full">
          <label class="home-cms-input-wrap">
            <div class="editor-label">${escapeHtml(field.label)} Number</div>
            <input class="editor-input js-generic-structured-field" data-section-id="${escapeHtml(section.id)}" data-field-id="${escapeHtml(field.id)}" data-prop="target" value="${escapeHtml(field.target || "")}" />
          </label>
          <label class="home-cms-input-wrap">
            <div class="editor-label">${escapeHtml(field.label)} Text</div>
            <input class="editor-input js-generic-structured-field" data-section-id="${escapeHtml(section.id)}" data-field-id="${escapeHtml(field.id)}" data-prop="value" value="${escapeHtml(field.value || "")}" />
          </label>
        </div>
      `;
    }

    return "";
  }

  function getGenericSelectedSection() {
    const sections = state.genericEditor.sections || [];
    const selected = sections.find(section => section.id === state.genericEditor.selectedSectionId);
    if (selected) return selected;
    state.genericEditor.selectedSectionId = sections[0] ? sections[0].id : "";
    return sections[0] || null;
  }

  async function uploadGenericImage(file) {
    if (!file) throw new Error("No image selected");
    if (!String(file.type || "").startsWith("image/")) throw new Error("Please upload an image file");
    const dataUrl = await readFileAsDataUrl(file);
    const response = await api("/api/admin/media/upload-image", {
      method: "POST",
      body: JSON.stringify({ fileName: file.name, dataUrl })
    });
    return response.url;
  }

  async function assignUploadedGenericImage(target, file) {
    const section = (state.genericEditor.sections || []).find(item => item.id === (target.dataset.sectionId || ""));
    const fieldId = target.dataset.fieldId || "";
    if (!section || !fieldId) return;
    const uploadZone = target.closest(".js-generic-image-drop");
    if (uploadZone) uploadZone.classList.add("dragover");
    try {
      const nextUrl = await uploadGenericImage(file);
      updateGenericSectionField(section, fieldId, "src", nextUrl);
      renderGenericPageCms(state.currentPageKey, (((state.snapshot || {}).pages || {})[state.currentPageKey] || {}));
      toast("Image updated in section", "upload", true);
    } catch (error) {
      toast(error.message || "Image upload failed", "lock");
    } finally {
      if (uploadZone) uploadZone.classList.remove("dragover");
      if (target.value) target.value = "";
    }
  }

  function renderGenericPageCms(pageKey, page) {
    const mount = document.getElementById("homeCmsMount");
    const primaryCard = document.getElementById("pageEditorPrimaryCard");
    if (!mount) return;
    if (primaryCard) primaryCard.style.display = "none";
    const sections = state.genericEditor.sections || [];
    const selectedSection = getGenericSelectedSection();
    const structuredFields = selectedSection ? analyzeGenericSection(selectedSection) : [];
    // If editing the blogs page, inject live blogs grid into the section preview
    if (pageKey === 'blogs' && selectedSection && String(selectedSection.html || '').includes('blogs-grid')) {
      const cardsHtml = generateBlogsGridHtmlFromSnapshot();
      if (cardsHtml) {
        // replace existing grid contents
        selectedSection.html = String(selectedSection.html || '').replace(/<div class="blogs-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/i, `<div class="blogs-grid">\n          ${cardsHtml}\n        </div>\n      </div>\n    </section>`);
      }
    }
    const hiddenCount = sections.filter(section => section.enabled === false).length;
    mount.innerHTML = `
      <div class="home-cms-shell">
        <div class="home-cms-command">
          <div class="home-cms-command-head">
            <div>
              <div class="home-cms-eyebrow">Page Content Studio</div>
              <div class="home-cms-title">Structured controls for every editable section.</div>
              <div class="home-cms-subtitle">Update detected text, images, links, dates, and stats while preserving the live page layout.</div>
            </div>
            <div class="home-cms-toolbar">
              <button type="button" class="home-cms-icon-btn primary" id="genericSaveAllBtn"><img src="https://api.iconify.design/tabler/device-floppy.svg" alt="" /> Save All</button>
            </div>
          </div>
          <div class="home-cms-page-grid">
            <label class="home-cms-input-wrap">
              <div class="editor-label">Page Title (SEO)</div>
              <input class="editor-input" id="genericSeoTitle" type="text" value="${escapeHtml(state.genericEditor.title || page.title || "")}" />
            </label>
            <label class="home-cms-input-wrap" style="min-width:360px">
              <div class="editor-label">Meta Description</div>
              <textarea class="editor-input editor-textarea" id="genericSeoMeta" style="min-height:92px">${escapeHtml(state.genericEditor.meta || page.meta || "")}</textarea>
            </label>
          </div>
        </div>
        <div class="home-cms-layout">
          <aside class="home-cms-sidebar">
            <div class="home-cms-sidebar-top">
              <div>
                <div class="editor-label" style="margin:0">Sections</div>
                <div class="home-cms-muted">${escapeHtml(page.path || "")}</div>
              </div>
            </div>
            <div class="home-cms-kpis">
              <div class="home-cms-kpi"><strong>${String(sections.length).padStart(2, "0")}</strong><span>Total</span></div>
              <div class="home-cms-kpi"><strong>${String(Math.max(0, sections.length - hiddenCount)).padStart(2, "0")}</strong><span>Visible</span></div>
              <div class="home-cms-kpi"><strong>${String(hiddenCount).padStart(2, "0")}</strong><span>Hidden</span></div>
            </div>
            <div class="home-cms-sidebar-list">
              ${sections.map((section, index) => `
                <button type="button" class="home-cms-nav-item ${selectedSection && selectedSection.id === section.id ? "active" : ""}" data-generic-section-select="${escapeHtml(section.id)}">
                  <div class="home-cms-nav-meta">
                    <span class="home-cms-nav-index">Section ${String(index + 1).padStart(2, "0")}</span>
                    <span class="home-cms-status ${section.enabled === false ? "hidden" : ""}">${section.enabled === false ? "Hidden" : "Live"}</span>
                  </div>
                  <div class="home-cms-nav-title">${escapeHtml(section.label || `Section ${index + 1}`)}</div>
                  <div class="home-cms-nav-copy">${escapeHtml((section.html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 72) || "HTML section editor")}</div>
                </button>
              `).join("") || '<div class="home-cms-empty">No editable sections were detected for this page.</div>'}
            </div>
          </aside>
          <section class="home-cms-editor-panel">
            ${selectedSection ? `
              <div class="home-cms-editor-top">
                <div class="home-cms-section-head">
                  <div>
                    <div class="home-cms-eyebrow">Selected Section</div>
                    <div class="home-cms-section-title">${escapeHtml(selectedSection.label || "Section")}</div>
                    <div class="home-cms-subtitle">Focused controls for the content detected in this section.</div>
                  </div>
                  <div class="home-cms-toolbar">
                    <span class="home-cms-status ${selectedSection.enabled === false ? "hidden" : ""}">${selectedSection.enabled === false ? "Hidden" : "Live"}</span>
                    <button type="button" class="btn btn-outline home-cms-small" data-generic-section-toggle="${escapeHtml(selectedSection.id)}">${selectedSection.enabled === false ? "Show Section" : "Hide Section"}</button>
                    <button type="button" class="home-cms-icon-btn primary" data-generic-section-save="${escapeHtml(selectedSection.id)}"><img src="https://api.iconify.design/tabler/device-floppy.svg" alt="" /> Save Section</button>
                  </div>
                </div>
                <label class="home-cms-input-wrap home-cms-full">
                  <div class="editor-label">Section Label</div>
                  <input class="editor-input js-generic-section-label" data-section-id="${escapeHtml(selectedSection.id)}" value="${escapeHtml(selectedSection.label || "")}" />
                </label>
                <div class="home-cms-grid">
                  ${structuredFields.map(field => renderGenericField(selectedSection, field)).join("") || '<div class="home-cms-empty home-cms-full">No supported editable fields were detected in this section.</div>'}
                </div>
              </div>
            ` : '<div class="home-cms-empty">Select a section from the sidebar to start editing.</div>'}
          </section>
        </div>
      </div>
    `;
  }

  function renderConnection(snapshot) {
    const badges = document.querySelectorAll(".nav-badge");
    const liveBadge = badges[1];
    if (liveBadge) {
      liveBadge.textContent = String(snapshot.totals.liveUsers);
      liveBadge.classList.toggle("green", snapshot.totals.liveUsers > 0);
    }
  }

  function renderAll(snapshot) {
    state.snapshot = snapshot;
    if (snapshot.currentUser) {
      state.currentUser = snapshot.currentUser;
      localStorage.setItem("webx-admin-user", JSON.stringify(snapshot.currentUser));
    }
    sanitizeStaticDashboard();
    sanitizeStaticDashboardContent();
    updateCurrentUserUI(snapshot.currentUser || state.currentUser);
    renderOverview(snapshot);
    renderLeads(snapshot);
    renderAnalytics(snapshot);
    renderServices(snapshot);
    renderSettings(snapshot);
    renderPageManager(snapshot);
    renderConnection(snapshot);
    if (state.currentPageKey === "home") renderHomeCms();
    if (((snapshot.pages || {})[state.currentPageKey] || {}).editorType === "generic" && document.getElementById("pageEditor")?.classList.contains("visible")) {
      renderGenericPageCms(state.currentPageKey, snapshot.pages[state.currentPageKey]);
    }
  }

  function openPageDataEditor(pageKey) {
    state.currentPageKey = pageKey;
    const data = (state.snapshot.pages || {})[pageKey] || {};
    const heroSection = (data.sections || []).find(section => section.type === "hero");
    const previousSelectedId = state.homeEditor.selectedSectionId || "";
    const grid = document.getElementById("pageCardGrid");
    const editor = document.getElementById("pageEditor");
    const title = document.getElementById("editorTitle");
    const primaryCard = document.getElementById("pageEditorPrimaryCard");
    if (grid) grid.style.display = "none";
    if (editor) editor.classList.add("visible");
    if (primaryCard) primaryCard.style.display = data.editorType === "generic" || pageKey === "work" ? "none" : "";
    if (title) {
      const label = data.displayName || pageKey.replace(/[-_]+/g, " ").replace(/\b\w/g, ch => ch.toUpperCase());
      title.textContent = `Editing: ${label}`;
    }
    document.getElementById("editPageTitle").value = data.title || "";
    document.getElementById("editPageMeta").value = data.meta || "";
    document.getElementById("editPageHero").value = heroSection ? (heroSection.title || "") : (data.heroTitle || "");
    document.getElementById("editPageSub").value = heroSection ? (heroSection.subtitle || "") : (data.heroSubtitle || "");
    state.homeEditor.sections = clone(data.sections || []);
    state.homeEditor.selectedSectionId = state.homeEditor.sections.find(section => section.id === previousSelectedId)
      ? previousSelectedId
      : (state.homeEditor.sections[0] ? state.homeEditor.sections[0].id : "");
    initializeHomeSectionHistory(state.homeEditor.sections);
    if (pageKey === "home") {
      renderHomeCms();
      const seoTitle = document.getElementById("homeSeoTitle");
      const seoMeta = document.getElementById("homeSeoMeta");
      if (seoTitle) seoTitle.value = data.title || "";
      if (seoMeta) seoMeta.value = data.meta || "";
      const undoButton = document.getElementById("homeUndoBtn");
      if (undoButton) undoButton.disabled = !((data.undoStack || []).length);
    }
    if (pageKey === "work" && typeof window.renderWorkStudio === "function") {
      window.renderWorkStudio(data);
      return;
    }
    if (data.editorType === "generic") {
      state.genericEditor.sections = cloneData(data.sections || []);
      state.genericEditor.selectedSectionId = state.genericEditor.sections[0] ? state.genericEditor.sections[0].id : "";
      state.genericEditor.title = data.title || "";
      state.genericEditor.meta = data.meta || "";
      renderGenericPageCms(pageKey, data);
      return;
    }
  }

  function setTopbarLabel(primary, secondary) {
    const title = document.getElementById("topbarTitle");
    if (!title) return;
    title.innerHTML = `${escapeHtml(primary)}${secondary ? ` <span>/${escapeHtml(secondary)}</span>` : ""}`;
  }

  function selectHomeSectionByType(type) {
    const section = (state.homeEditor.sections || []).find(item => item.type === type);
    if (!section) return false;
    state.homeEditor.selectedSectionId = section.id;
    renderHomeCms();
    return true;
  }

  function openHomeSectionEditor(type, navEl, label) {
    if (!state.snapshot || !state.snapshot.pages || !state.snapshot.pages.home) {
      toast("Dashboard data is still loading. Please try again in a moment.", "refresh");
      return;
    }
    if (typeof window.showPage === "function") window.showPage("pages", navEl || null);
    openPageDataEditor("home");
    const found = selectHomeSectionByType(type);
    setTopbarLabel("Content", label || "Home Section");
    if (!found) toast(`${label || "Section"} section is not available on the home page`, "lock");
  }

  function openWebsiteContentEditor(target, navEl) {
    const key = String(target || "").toLowerCase();
    if (key === "services") {
      if (typeof window.showPage === "function") window.showPage("services", navEl || null);
      setTopbarLabel("Content", "Services Editor");
      return;
    }

    if (!state.snapshot || !state.snapshot.pages) {
      toast("Dashboard data is still loading. Please try again in a moment.", "refresh");
      return;
    }

    if (key === "work" || key === "portfolio" || key === "pdp") {
      if (typeof window.showPage === "function") window.showPage("pages", navEl || null);
      openPageDataEditor("work");
      setTopbarLabel("Content", "Portfolio PDP Editor");
      return;
    }

    if (key === "blog" || key === "blogs") {
      if (state.snapshot.pages.blogs) {
        if (typeof window.showPage === "function") window.showPage("pages", navEl || null);
        openPageDataEditor("blogs");
        setTopbarLabel("Content", "Blog Editor");
      } else {
        openHomeSectionEditor("blogs", navEl, "Blog Editor");
      }
      return;
    }

    if (key === "testimonials" || key === "clients") {
      openHomeSectionEditor("testimonials", navEl, "Testimonials Editor");
      return;
    }

    if (typeof window.showPage === "function") window.showPage("pages", navEl || null);
  }

  async function savePageData(sectionId) {
    const heroSection = state.currentPageKey === "home"
      ? (state.homeEditor.sections || []).find(section => section.type === "hero")
      : null;
    const isGenericPage = (((state.snapshot || {}).pages || {})[state.currentPageKey] || {}).editorType === "generic";
    const seoTitleInput = state.currentPageKey === "home"
      ? (document.getElementById("homeSeoTitle") || document.getElementById("editPageTitle"))
      : isGenericPage
        ? (document.getElementById("genericSeoTitle") || document.getElementById("editPageTitle"))
        : document.getElementById("editPageTitle");
    const seoMetaInput = state.currentPageKey === "home"
      ? (document.getElementById("homeSeoMeta") || document.getElementById("editPageMeta"))
      : isGenericPage
        ? (document.getElementById("genericSeoMeta") || document.getElementById("editPageMeta"))
        : document.getElementById("editPageMeta");
    try {
      await api(`/api/admin/pages/${state.currentPageKey}`, {
        method: "PUT",
        body: JSON.stringify({
          title: seoTitleInput ? seoTitleInput.value : "",
          meta: seoMetaInput ? seoMetaInput.value : "",
          heroTitle: heroSection ? heroSection.title : document.getElementById("editPageHero").value,
          heroSubtitle: heroSection ? heroSection.subtitle : document.getElementById("editPageSub").value,
          sections: state.currentPageKey === "home"
            ? state.homeEditor.sections
            : isGenericPage
              ? state.genericEditor.sections
              : undefined
        })
      });
      await loadDashboard();
      if (state.currentPageKey === "home") {
        openPageDataEditor("home");
        const savedSection = sectionId ? getHomeSection(sectionId) : null;
        toast(savedSection ? `${(HOME_SECTION_LIBRARY[savedSection.type] || {}).label || "Section"} saved` : "Home page saved", "check", true);
      } else if (isGenericPage) {
        openPageDataEditor(state.currentPageKey);
        const currentPage = (((state.snapshot || {}).pages || {})[state.currentPageKey] || {});
        const currentSection = (currentPage.sections || []).find(section => section.id === sectionId);
        toast(currentSection ? `${currentSection.label || "Section"} saved` : "Page content saved", "check", true);
      } else {
        if (typeof window.closePageEditor === "function") window.closePageEditor();
        toast("Page content saved", "check", true);
      }
    } catch (error) {
      if (error.message === "Unauthorized") return logout(false);
      toast(error.message, "lock");
    }
  }

  async function saveSettings() {
    const panel = document.getElementById("page-settings");
    const inputs = panel.querySelectorAll(".editor-input");
    const toggles = panel.querySelectorAll(".toggle");
    const clarityProjectId = panel.querySelector("#clarityProjectId");
    const clarityDashboardUrl = panel.querySelector("#clarityDashboardUrl");
    const clarityProjectLabel = panel.querySelector("#clarityProjectLabel");
    const clarityEnabledToggle = panel.querySelector("#clarityEnabledToggle");
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          siteName: inputs[0] ? inputs[0].value : "",
          contactEmail: inputs[1] ? inputs[1].value : "",
          contactPhone: inputs[2] ? inputs[2].value : "",
          contactWhatsapp: inputs[2] ? inputs[2].value : "",
          headOffice: state.snapshot.settings.headOffice,
          branchOffice: state.snapshot.settings.branchOffice,
          maintenanceMode: toggles[0] ? toggles[0].classList.contains("on") : false,
          acceptLeads: toggles[1] ? toggles[1].classList.contains("on") : true,
          clarityEnabled: clarityEnabledToggle ? clarityEnabledToggle.classList.contains("on") : false,
          clarityProjectId: clarityProjectId ? clarityProjectId.value : "",
          clarityDashboardUrl: clarityDashboardUrl ? clarityDashboardUrl.value : "",
          clarityProjectLabel: clarityProjectLabel ? clarityProjectLabel.value : ""
        })
      });
      await loadDashboard();
      toast("Settings saved", "check", true);
    } catch (error) {
      if (error.message === "Unauthorized") return logout(false);
      toast(error.message, "lock");
    }
  }

  async function loadDashboard() {
    const snapshot = await api("/api/admin/bootstrap");
    renderAll(snapshot);
    closeAuthGate();
    connectStream();
    setConnectionStatus(true);
  }

  function connectStream() {
    if (!state.adminToken) return;
    if (state.eventSource) state.eventSource.close();
    state.eventSource = new EventSource(`/api/admin/stream?token=${encodeURIComponent(state.adminToken)}`);
    state.eventSource.onmessage = event => {
      const data = JSON.parse(event.data);
      if (data && data.payload) renderAll(data.payload);
      setConnectionStatus(true);
    };
    state.eventSource.onerror = () => {
      setConnectionStatus(false);
    };
  }

  function ensureTopbarControls() {
    const actions = document.querySelector(".topbar-actions");
    if (!actions) return;

    if (!document.getElementById("refreshDashboardBtn")) {
      const refresh = document.createElement("div");
      refresh.id = "refreshDashboardBtn";
      refresh.className = "icon-btn";
      refresh.title = "Refresh";
      refresh.innerHTML = '<img src="https://api.iconify.design/tabler/refresh.svg" alt="refresh" />';
      actions.appendChild(refresh);
    }

    if (!document.getElementById("logoutDashboardBtn")) {
      const logoutButton = document.createElement("div");
      logoutButton.id = "logoutDashboardBtn";
      logoutButton.className = "icon-btn";
      logoutButton.title = "Logout";
      logoutButton.innerHTML = '<img src="https://api.iconify.design/tabler/logout.svg" alt="logout" />';
      actions.appendChild(logoutButton);
    }
  }

  function wireEvents() {
    if (state.authReady) return;
    state.authReady = true;

    ensureAuthGate();
    ensureTopbarControls();

    document.addEventListener("click", async event => {
      const genericImageDrop = event.target.closest(".js-generic-image-drop");
      if (genericImageDrop && !event.target.closest("input")) {
        const picker = genericImageDrop.querySelector(".js-generic-image-input");
        if (picker) picker.click();
      }

      const genericSelect = event.target.closest("[data-generic-section-select]");
      if (genericSelect) {
        state.genericEditor.selectedSectionId = genericSelect.dataset.genericSectionSelect || "";
        renderGenericPageCms(state.currentPageKey, (((state.snapshot || {}).pages || {})[state.currentPageKey] || {}));
      }

      const genericToggle = event.target.closest("[data-generic-section-toggle]");
      if (genericToggle) {
        const section = (state.genericEditor.sections || []).find(item => item.id === genericToggle.dataset.genericSectionToggle);
        if (section) {
          section.enabled = section.enabled === false;
          renderGenericPageCms(state.currentPageKey, (((state.snapshot || {}).pages || {})[state.currentPageKey] || {}));
        }
      }

      const genericSave = event.target.closest("[data-generic-section-save]");
      if (genericSave) {
        await savePageData(genericSave.dataset.genericSectionSave || "");
      }

      if (event.target.closest("#genericSaveAllBtn")) {
        await savePageData();
      }

      // Open blog editor from CMS preview
      const openBlogBtn = event.target.closest("[data-open-blog-id]");
      if (openBlogBtn) {
        const bid = openBlogBtn.dataset.openBlogId || openBlogBtn.closest('[data-blog-id]')?.dataset.blogId;
        if (bid && typeof window.openBlogEditor === 'function') {
          window.openBlogEditor(bid);
        } else {
          toast('Blog editor not available yet', 'lock');
        }
        return;
      }

      const deleteBlogBtn = event.target.closest(".js-delete-blog-post");
      if (deleteBlogBtn) {
        const blogId = deleteBlogBtn.dataset.blogId;
        if (!blogId) return;
        if (!window.confirm('Are you sure you want to delete this blog post?')) return;
        try {
          await api(`/api/admin/blogs/${encodeURIComponent(blogId)}`, { method: 'DELETE' });
          await loadDashboard();
          if (state.currentPageKey === 'blogs') openPageDataEditor('blogs');
          toast('Blog deleted successfully', 'trash', true);
        } catch (error) {
          if (error.message === 'Unauthorized') return logout(false);
          toast(error.message || 'Failed to delete blog', 'lock');
        }
        return;
      }

      const sectionSelect = event.target.closest("[data-home-section-select]");
      if (sectionSelect) {
        state.homeEditor.selectedSectionId = sectionSelect.dataset.homeSectionSelect || "";
        renderHomeCms();
      }

      const sectionToggle = event.target.closest("[data-home-section-toggle]");
      if (sectionToggle) {
        const section = getHomeSection(sectionToggle.dataset.homeSectionToggle || "");
        if (section) {
          recordSectionHistory(section.id);
          section.enabled = section.enabled === false;
          renderHomeCms();
        }
      }

      const sectionDelete = event.target.closest("[data-home-section-delete]");
      if (sectionDelete) {
        const deletedId = sectionDelete.dataset.homeSectionDelete || "";
        state.homeEditor.sections = (state.homeEditor.sections || []).filter(item => item.id !== deletedId);
        delete state.homeEditor.history[deletedId];
        if (state.homeEditor.selectedSectionId === deletedId) {
          state.homeEditor.selectedSectionId = state.homeEditor.sections[0] ? state.homeEditor.sections[0].id : "";
        }
        renderHomeCms();
      }

      const itemDelete = event.target.closest("[data-home-item-delete]");
      if (itemDelete) {
        const section = getHomeSection(itemDelete.dataset.sectionId || "");
        if (section && Array.isArray(section.items)) {
          recordSectionHistory(section.id);
          section.items = section.items.filter(item => item.id !== itemDelete.dataset.homeItemDelete);
          renderHomeCms();
        }
      }

      const itemAdd = event.target.closest("[data-home-item-add]");
      if (itemAdd) {
        const section = getHomeSection(itemAdd.dataset.homeItemAdd || "");
        const nextItem = section ? createHomeItem(section.type) : null;
        if (section && nextItem) {
          recordSectionHistory(section.id);
          section.items = [...(section.items || []), nextItem];
          renderHomeCms();
        }
      }

      if (event.target.closest("#homeAddSectionBtn")) {
        const picker = document.getElementById("homeSectionTypePicker");
        const type = picker ? picker.value : "hero";
        const factory = HOME_SECTION_LIBRARY[type];
        if (factory) {
          const section = factory.create();
          state.homeEditor.sections = [...(state.homeEditor.sections || []), section];
          state.homeEditor.selectedSectionId = section.id;
          ensureSectionHistory(section.id);
          renderHomeCms();
          const newCard = document.querySelector(`[data-home-section-card="${section.id}"]`);
          if (newCard) newCard.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      if (event.target.closest("#homeUndoBtn")) {
        try {
          await api("/api/admin/pages/home/undo", { method: "POST" });
          await loadDashboard();
          openPageDataEditor("home");
          toast("Home page changes undone", "refresh", true);
        } catch (error) {
          if (error.message === "Unauthorized") return logout(false);
          toast(error.message, "lock");
        }
      }

      if (event.target.closest("#homeSaveAllBtn")) {
        await savePageData();
      }

      const sectionUndo = event.target.closest("[data-home-section-undo]");
      if (sectionUndo) {
        if (undoHomeSection(sectionUndo.dataset.homeSectionUndo || "")) renderHomeCms();
      }

      const sectionRedo = event.target.closest("[data-home-section-redo]");
      if (sectionRedo) {
        if (redoHomeSection(sectionRedo.dataset.homeSectionRedo || "")) renderHomeCms();
      }

      const sectionSave = event.target.closest("[data-home-section-save]");
      if (sectionSave) {
        await savePageData(sectionSave.dataset.homeSectionSave || "");
      }

      const imageDrop = event.target.closest(".js-home-image-drop");
      if (imageDrop && !event.target.closest("input")) {
        const picker = imageDrop.querySelector(".js-home-image-input");
        if (picker) picker.click();
      }

      const roleButton = event.target.closest(".auth-role");
      if (roleButton) {
        selectRole(roleButton.dataset.username || "");
      }

      if (event.target.closest("#refreshDashboardBtn")) {
        try {
          await loadDashboard();
          toast("Dashboard refreshed", "refresh", true);
        } catch (error) {
          if (error.message === "Unauthorized") return logout(false);
          toast(error.message, "lock");
        }
      }

      if (event.target.closest("#logoutDashboardBtn")) {
        await logout(true);
      }

      if (event.target.closest(".js-open-clarity")) {
        const uiHost = (((state.snapshot || {}).settings || {}).clarityDashboardUrl || "https://clarity.microsoft.com/").trim();
        if (uiHost) window.open(uiHost, "_blank", "noopener,noreferrer");
      }

      const replayButton = event.target.closest(".js-replay-open");
      if (replayButton) {
        try {
          await loadReplay(replayButton.dataset.sessionId);
          toast("Replay loaded", "eye", true);
        } catch (error) {
          if (error.message === "Unauthorized") return logout(false);
          toast(error.message, "lock");
        }
      }

      if (event.target.closest("#sessionReplayPlayBtn")) {
        playLoadedReplay();
      }

      if (event.target.closest("#sessionReplayResetBtn")) {
        const video = getReplayVideoElement();
        if (video) {
          video.pause();
          video.currentTime = 0;
          state.activeReplayPartIndex = 0;
          if (state.replayVideoParts[0]) video.src = state.replayVideoParts[0].url;
        } else {
          resetReplayStage();
        }
      }

      if (event.target.closest("#sessionReplayTheaterBtn")) {
        const stage = document.getElementById("sessionReplayStage");
        if (stage) {
          stage.style.height = stage.style.height === "88vh" ? "72vh" : "88vh";
        }
      }

      const replayDeleteButton = event.target.closest(".js-replay-delete");
      if (replayDeleteButton) {
        try {
          await api(`/api/admin/sessions/${encodeURIComponent(replayDeleteButton.dataset.sessionId)}`, { method: "DELETE" });
          delete state.replayCache[replayDeleteButton.dataset.sessionId];
          if (state.activeReplaySessionId === replayDeleteButton.dataset.sessionId) {
            state.activeReplaySessionId = "";
            resetReplayStage();
          }
          await loadDashboard();
          toast("Replay deleted", "trash", true);
        } catch (error) {
          if (error.message === "Unauthorized") return logout(false);
          toast(error.message, "lock");
        }
      }

      const leadCard = event.target.closest("[data-lead-id]");
      const serviceItem = event.target.closest("[data-service-id]");

      if (event.target.closest(".page-card")) {
        // If clicking the "Edit Blog" button on a blog post card, open the blog editor
        const blogEditBtn = event.target.closest(".js-page-card-blog-edit");
        if (blogEditBtn) {
          const blogId = blogEditBtn.dataset.blogId || "";
          if (blogId && typeof window.openBlogEditor === "function") {
            window.openBlogEditor(blogId);
          } else if (blogId) {
            toast("Blog editor not available yet", "lock");
          }
          return;
        }
        const pageCard = event.target.closest(".page-card");
        const pageKey = pageCard.dataset.pageKey;
        if (pageKey && ((state.snapshot || {}).pages || {})[pageKey]) {
          setTimeout(() => openPageDataEditor(pageKey), 0);
        }
      }

      try {
        if (leadCard && event.target.closest(".js-lead-contact")) {
          await api(`/api/admin/leads/${leadCard.dataset.leadId}`, { method: "PATCH", body: JSON.stringify({ status: "contacted" }) });
          await loadDashboard();
          toast("Lead marked contacted", "mail", true);
        }

        if (leadCard && event.target.closest(".js-lead-close")) {
          await api(`/api/admin/leads/${leadCard.dataset.leadId}`, { method: "PATCH", body: JSON.stringify({ status: "closed" }) });
          await loadDashboard();
          toast("Lead marked closed", "check", true);
        }

        if (leadCard && event.target.closest(".js-lead-delete")) {
          await api(`/api/admin/leads/${leadCard.dataset.leadId}`, { method: "DELETE" });
          await loadDashboard();
          toast("Lead deleted", "trash", true);
        }

        if (serviceItem && event.target.closest(".js-service-delete")) {
          await api(`/api/admin/services/${serviceItem.dataset.serviceId}`, { method: "DELETE" });
          await loadDashboard();
          toast("Service deleted", "trash", true);
        }

        if (serviceItem && event.target.closest(".js-service-edit")) {
          const service = (state.snapshot.services || []).find(item => item.id === serviceItem.dataset.serviceId);
          if (!service) return;
          const modal = document.getElementById("modal-newService");
          const inputs = modal.querySelectorAll(".editor-input");
          inputs[0].value = service.name;
          inputs[1].value = service.shortDescription;
          inputs[2].value = service.icon;
          inputs[3].value = service.status === "paused" ? "Paused" : "Active";
          modal.dataset.editServiceId = service.id;
          if (typeof window.showModal === "function") window.showModal("newService");
        }
      } catch (error) {
        if (error.message === "Unauthorized") return logout(false);
        toast(error.message, "lock");
      }
    });

    document.addEventListener("input", event => {
      if (event.target.id === "genericSeoTitle") {
        state.genericEditor.title = event.target.value;
      }

      if (event.target.id === "genericSeoMeta") {
        state.genericEditor.meta = event.target.value;
      }

      const genericLabel = event.target.closest(".js-generic-section-label");
      if (genericLabel) {
        const section = (state.genericEditor.sections || []).find(item => item.id === genericLabel.dataset.sectionId);
        if (section) section.label = genericLabel.value;
      }

      const genericStructuredField = event.target.closest(".js-generic-structured-field");
      if (genericStructuredField) {
        const section = (state.genericEditor.sections || []).find(item => item.id === genericStructuredField.dataset.sectionId);
        if (section) {
          updateGenericSectionField(
            section,
            genericStructuredField.dataset.fieldId,
            genericStructuredField.dataset.prop,
            genericStructuredField.value
          );
        }
      }

      if (event.target.id === "homeSeoTitle") {
        const hiddenTitle = document.getElementById("editPageTitle");
        if (hiddenTitle) hiddenTitle.value = event.target.value;
      }
      if (event.target.id === "homeSeoMeta") {
        const hiddenMeta = document.getElementById("editPageMeta");
        if (hiddenMeta) hiddenMeta.value = event.target.value;
      }

      const sectionField = event.target.closest(".js-home-section-field");
      if (sectionField) {
        const section = getHomeSection(sectionField.dataset.sectionId || "");
        if (section) {
          recordSectionHistory(section.id);
          section[sectionField.dataset.field] = sectionField.value;
        }
      }

      const itemField = event.target.closest(".js-home-item-field");
      if (itemField && itemField.dataset.field !== "open") {
        const section = getHomeSection(itemField.dataset.sectionId || "");
        const item = section && Array.isArray(section.items)
          ? section.items.find(entry => entry.id === itemField.dataset.itemId)
          : null;
        if (item) {
          recordSectionHistory(section.id);
          item[itemField.dataset.field] = itemField.dataset.field === "tags"
            ? itemField.value.split(",").map(entry => entry.trim()).filter(Boolean)
            : itemField.value;
        }
      }
    });

    document.addEventListener("change", async event => {
      const genericImageInput = event.target.closest(".js-generic-image-input");
      if (genericImageInput && genericImageInput.files && genericImageInput.files[0]) {
        await assignUploadedGenericImage(genericImageInput, genericImageInput.files[0]);
        return;
      }

      const imageInput = event.target.closest(".js-home-image-input");
      if (imageInput && imageInput.files && imageInput.files[0]) {
        await assignUploadedHomeImage(imageInput, imageInput.files[0]);
        return;
      }

      const itemField = event.target.closest(".js-home-item-field");
      if (itemField && itemField.dataset.field === "open") {
        const section = getHomeSection(itemField.dataset.sectionId || "");
        const item = section && Array.isArray(section.items)
          ? section.items.find(entry => entry.id === itemField.dataset.itemId)
          : null;
        if (item) {
          recordSectionHistory(section.id);
          item.open = itemField.value === "true";
        }
      }
    });

    document.addEventListener("dragover", event => {
      const genericDropzone = event.target.closest(".js-generic-image-drop");
      if (genericDropzone) {
        event.preventDefault();
        genericDropzone.classList.add("dragover");
      }

      const dropzone = event.target.closest(".js-home-image-drop");
      if (!dropzone) return;
      event.preventDefault();
      dropzone.classList.add("dragover");
    });

    document.addEventListener("dragleave", event => {
      const genericDropzone = event.target.closest(".js-generic-image-drop");
      if (genericDropzone) {
        if (!genericDropzone.contains(event.relatedTarget)) genericDropzone.classList.remove("dragover");
      }

      const dropzone = event.target.closest(".js-home-image-drop");
      if (!dropzone) return;
      if (dropzone.contains(event.relatedTarget)) return;
      dropzone.classList.remove("dragover");
    });

    document.addEventListener("drop", async event => {
      const genericDropzone = event.target.closest(".js-generic-image-drop");
      if (genericDropzone) {
        event.preventDefault();
        genericDropzone.classList.remove("dragover");
        const file = event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files[0] : null;
        if (file) {
          const input = genericDropzone.querySelector(".js-generic-image-input");
          if (input) await assignUploadedGenericImage(input, file);
        }
      }

      const dropzone = event.target.closest(".js-home-image-drop");
      if (!dropzone) return;
      event.preventDefault();
      dropzone.classList.remove("dragover");
      const file = event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files[0] : null;
      if (!file) return;
      const input = dropzone.querySelector(".js-home-image-input");
      if (input) await assignUploadedHomeImage(input, file);
    });

    const authForm = document.getElementById("authLoginForm");
    if (authForm) {
      authForm.addEventListener("submit", async event => {
        event.preventDefault();
        const username = document.getElementById("authUsername").value.trim();
        const password = document.getElementById("authPassword").value;
        const button = authForm.querySelector("button[type='submit']");
        button.disabled = true;
        button.textContent = "Signing In...";
        showAuthError("");
        try {
          await login(username, password);
          await loadDashboard();
          document.getElementById("authPassword").value = "";
          toast("Secure dashboard unlocked", "check", true);
        } catch (error) {
          showAuthError(error.message);
        } finally {
          button.disabled = false;
          button.textContent = "Unlock Dashboard";
        }
      });
    }

    const serviceModal = document.getElementById("modal-newService");
    if (serviceModal) {
      const addButton = serviceModal.querySelector(".btn.btn-primary");
      addButton.onclick = async function () {
        const inputs = serviceModal.querySelectorAll(".editor-input");
        const id = serviceModal.dataset.editServiceId || "";
        const body = {
          name: inputs[0].value,
          shortDescription: inputs[1].value,
          details: inputs[1].value,
          icon: inputs[2].value || "/assets/images/icons/webx-icon.svg",
          status: String(inputs[3].value || "Active").toLowerCase()
        };
        try {
          await api(id ? `/api/admin/services/${id}` : "/api/admin/services", {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(body)
          });
          serviceModal.dataset.editServiceId = "";
          if (typeof window.closeModal === "function") window.closeModal("newService");
          await loadDashboard();
          toast("Service saved", "check", true);
        } catch (error) {
          if (error.message === "Unauthorized") return logout(false);
          toast(error.message, "lock");
        }
      };
    }

    window.openPageEditor = openPageDataEditor;
    window.savePageContent = savePageData;
    window.openWebsiteContentEditor = openWebsiteContentEditor;

    const settingsPanel = document.getElementById("page-settings");
    const saveSettingsButton = settingsPanel.querySelector(".editor-actions .btn.btn-primary");
    if (saveSettingsButton) saveSettingsButton.onclick = saveSettings;
    settingsPanel.addEventListener("click", event => {
      const toggle = event.target.closest("#clarityEnabledToggle");
      if (toggle) toggle.classList.toggle("on");
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    sanitizeStaticDashboard();
    sanitizeStaticDashboardContent();
    ensureAuthGate();
    ensureTopbarControls();
    wireEvents();
    updateCurrentUserUI(state.currentUser);

    if (!state.adminToken) {
      openAuthGate("Sign in with an authorized admin account.");
      return;
    }

    try {
      await loadDashboard();
      toast("Dashboard ready", "rocket", true);
    } catch (error) {
      clearSession();
      setConnectionStatus(false);
      openAuthGate("Session expired. Sign in again to continue.");
    }
  });
})();

















