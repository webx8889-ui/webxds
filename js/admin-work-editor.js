(function () {
  const FALLBACK_PROJECTS = [
    { slug: "morphico-pdp", path: "/pages/details/morphico-pdp.html", cardTitle: "Morphico Wallpapers & Murals", category: "Interior Brand / E-commerce", summary: "Transformed luxury interiors by designing an immersive digital gallery that brings wallpaper artistry to life.", thumbnailImage: "/assets/images/work-card-mockup/morphico-mockup.webp", thumbnailAlt: "Morphico Wallpapers and Murals project mockup" },
    { slug: "ab-pdp", path: "/pages/details/ab-pdp.html", cardTitle: "Arogya Bharat", category: "Healthcare / UI System", summary: "Architected a clinical UI/UX system that resolved navigation friction in the healthcare procurement journey.", thumbnailImage: "/assets/images/work-card-mockup/ab-mockup.webp", thumbnailAlt: "Arogya Bharat project mockup" },
    { slug: "tictax-pdp", path: "/pages/details/tictax-pdp.html", cardTitle: "Tictax", category: "Fintech / Tax Platform", summary: "Engineered frictionless fintech interfaces that turned complex tax saving into a premium digital experience.", thumbnailImage: "/assets/images/work-card-mockup/tictax-mockup.webp", thumbnailAlt: "Tictax project mockup" },
    { slug: "de-pdp", path: "/pages/details/de-pdp.html", cardTitle: "Dharmesh Enterprise", category: "Business / Inventory App", summary: "Developed a responsive management experience that simplified inventory and billing workflows.", thumbnailImage: "/assets/images/work-card-mockup/de-mockup.webp", thumbnailAlt: "Dharmesh Enterprise project mockup" },
    { slug: "mecon-pdp", path: "/pages/details/mecon-pdp.html", cardTitle: "Mecon", category: "Industrial / Brand Identity", summary: "Crafted a modern industrial identity that positioned the legacy manufacturer with fresh authority.", thumbnailImage: "/assets/images/work-card-mockup/mecon-logo.webp", thumbnailAlt: "Mecon project identity" },
    { slug: "gurukrupa-pdp", path: "/pages/details/gurukrupa-pdp.html", cardTitle: "Gurukrupa", category: "Industrial / Brand", summary: "Forged a precision-led brand framework that unified a diverse industrial catalog.", thumbnailImage: "/assets/images/work-card-mockup/gurukrupa-mockup.webp", thumbnailAlt: "Gurukrupa project mockup" },
    { slug: "manglam-pdp", path: "/pages/details/manglam-pdp.html", cardTitle: "Manglam", category: "Finance / Consultancy", summary: "Modernized financial consultancy through a strategic identity built for stability and growth.", thumbnailImage: "/assets/images/work-card-mockup/mangalam-mockup.webp", thumbnailAlt: "Manglam project mockup" }
  ];

  const state = {
    projects: [],
    selectedProjectId: "",
    selectedRawSectionId: "",
    selectedBuilderSectionId: "",
    sectionHistory: {},
    sectionSaveState: {},
    applyingHistory: false
  };

  function toast(message, icon, success) {
    if (typeof window.showToast === "function") window.showToast(message, icon || "check", !!success);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function slugify(value) {
    return String(value || "item")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "item";
  }

  function createLocalId(prefix) {
    return `${prefix || "item"}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
  }

  function getBuilderSectionTemplates(projectTitle) {
    const title = projectTitle || "New Project";
    return {
      hero: {
        type: "hero",
        enabled: true,
        title,
        subtitle: "Describe the product, transformation, and business outcome for this project.",
        heroImage: "/assets/images/others/work.webp",
        heroImageAlt: `${title} hero image`
      },
      about: {
        type: "about",
        enabled: true,
        title: `About ${title}`,
        description: "Add project overview, challenge, and design approach here.",
        industry: "Industry",
        year: "2026",
        services: "UI UX Design"
      },
      "challenge-solution": {
        type: "challenge-solution",
        enabled: true,
        challengeTitle: "The Challenge",
        solutionTitle: "The Solution",
        challengeItems: [
          { id: createLocalId("work-challenge"), title: "Challenge one", description: "Add the first challenge point here." },
          { id: createLocalId("work-challenge"), title: "Challenge two", description: "Add the second challenge point here." }
        ],
        solutionItems: [
          { id: createLocalId("work-solution"), title: "Solution one", description: "Add the first solution point here." },
          { id: createLocalId("work-solution"), title: "Solution two", description: "Add the second solution point here." }
        ]
      },
      comparison: {
        type: "comparison",
        enabled: true,
        beforeLabel: "UX",
        afterLabel: "UI",
        beforeImage: "/assets/images/others/work.webp",
        beforeImageAlt: `${title} before image`,
        afterImage: "/assets/images/others/work.webp",
        afterImageAlt: `${title} after image`,
        background: "#1f1f1f"
      },
      "visual-identity": {
        type: "visual-identity",
        enabled: true,
        label: "Visual Identity",
        title: "Build a consistent visual language for the brand",
        items: [
          { id: createLocalId("work-vi"), image: "/assets/images/others/work.webp", alt: `${title} visual identity`, title: "Colour Style", description: "Add description here." },
          { id: createLocalId("work-vi"), image: "/assets/images/others/work.webp", alt: `${title} visual identity`, title: "Typography", description: "Add description here." }
        ]
      },
      "design-system": {
        type: "design-system",
        enabled: true,
        label: "Design System",
        title: "Document the interface system and components",
        image: "/assets/images/others/work.webp",
        imageAlt: `${title} design system`
      },
      "web-ui": {
        type: "web-ui",
        enabled: true,
        label: "Web UI",
        title: "Showcase the web experience",
        items: [
          { id: createLocalId("work-webui"), image: "/assets/images/others/work.webp", alt: `${title} web ui` }
        ]
      },
      "mobile-ui": {
        type: "mobile-ui",
        enabled: true,
        label: "Mobile UI",
        title: "Showcase the mobile experience",
        items: [
          { id: createLocalId("work-mobileui"), image: "/assets/images/others/work.webp", alt: `${title} mobile ui` }
        ]
      },
      impact: {
        type: "impact",
        enabled: true,
        label: "Impact & Achievements",
        title: "From vision to impact - a team that delivers consistently",
        quote: "Add testimonial or project impact statement here.",
        author: "Client Name",
        role: "Role / Company",
        authorImage: "/assets/images/others/work.webp",
        authorImageAlt: `${title} author`,
        brandLogo: "/assets/images/others/work.webp",
        brandLogoAlt: `${title} logo`
      },
      stats: {
        type: "stats",
        enabled: true,
        title: "Key Outcomes",
        items: [
          { id: createLocalId("work-stat"), value: "01", label: "Outcome one" },
          { id: createLocalId("work-stat"), value: "02", label: "Outcome two" },
          { id: createLocalId("work-stat"), value: "03", label: "Outcome three" }
        ]
      },
      gallery: {
        type: "gallery",
        enabled: true,
        title: "Project Gallery",
        items: [
          { id: createLocalId("work-gallery"), image: "/assets/images/others/work.webp", alt: `${title} gallery image`, caption: "Add caption" }
        ]
      },
      cta: {
        type: "cta",
        enabled: true,
        title: "Want a case study page like this?",
        buttonText: "Start Your Project",
        buttonUrl: "/pages/main/contact-page.html"
      }
    };
  }

  function createBuilderSection(type, projectTitle) {
    const library = getBuilderSectionTemplates(projectTitle);
    const template = clone(library[type] || library.about);
    template.id = createLocalId("work-section");
    if (Array.isArray(template.items)) {
      template.items = template.items.map(item => ({ ...item, id: item.id || createLocalId("work-item") }));
    }
    return template;
  }

  function getSectionTypeLabel(type) {
    const map = {
      hero: "Hero",
      about: "About",
      "challenge-solution": "Challenge & Solution",
      comparison: "Before / After",
      "visual-identity": "Visual Identity",
      "design-system": "Design System",
      "web-ui": "Web UI",
      "mobile-ui": "Mobile UI",
      impact: "Impact & Achievements",
      stats: "Stats",
      gallery: "Gallery",
      cta: "CTA"
    };
    return map[type] || "Section";
  }

  function getBuilderSectionSummary(section, index) {
    if (!section) return `Section ${index + 1}`;
    return section.title || section.kicker || section.quote || `${getSectionTypeLabel(section.type)} ${index + 1}`;
  }

  function ensureBuilderSections(project) {
    if (!project) return [];
    if (!Array.isArray(project.sections) || !project.sections.length) {
      project.sections = [createBuilderSection("hero", project.cardTitle)];
    }
    project.sections.forEach(section => {
      if (!section.id) section.id = createLocalId("work-section");
      if (Array.isArray(section.items)) {
        section.items.forEach(item => {
          if (!item.id) item.id = createLocalId("work-item");
        });
      }
    });
    return project.sections;
  }

  function getSelectedBuilderSection(project) {
    const sections = ensureBuilderSections(project);
    const selected = sections.find(section => section.id === state.selectedBuilderSectionId);
    if (selected) return selected;
    state.selectedBuilderSectionId = sections[0] ? sections[0].id : "";
    return sections[0] || null;
  }

  function moveBuilderSection(project, sectionId, direction) {
    const sections = ensureBuilderSections(project);
    const index = sections.findIndex(section => section.id === sectionId);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= sections.length) return;
    const [item] = sections.splice(index, 1);
    sections.splice(target, 0, item);
  }

  function duplicateBuilderSection(project, sectionId) {
    const sections = ensureBuilderSections(project);
    const index = sections.findIndex(section => section.id === sectionId);
    if (index < 0) return null;
    const nextSection = clone(sections[index]);
    nextSection.id = createLocalId("work-section");
    if (Array.isArray(nextSection.items)) {
      nextSection.items = nextSection.items.map(item => ({ ...item, id: createLocalId("work-item") }));
    }
    sections.splice(index + 1, 0, nextSection);
    return nextSection;
  }

  function deleteBuilderSection(project, sectionId) {
    const sections = ensureBuilderSections(project);
    if (sections.length <= 1) return false;
    project.sections = sections.filter(section => section.id !== sectionId);
    return true;
  }

  function resolveApiUrl(url) {
    if (typeof url !== "string") return url;
    if (/^(https?:)?\/\//.test(url)) return url;
    const basePath = typeof window !== "undefined" && typeof window.WEBX_BASE_PATH === "string" ? window.WEBX_BASE_PATH : "";
    return url.startsWith("/") ? `${basePath}${url}` : url;
  }

  function api(path, options = {}) {
    return fetch(resolveApiUrl(path), {
      method: options.method || "GET",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: options.body
    }).then(async response => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Request failed");
      return payload;
    });
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function uploadImage(file) {
    const dataUrl = await readFileAsDataUrl(file);
    const response = await api("/api/admin/media/upload-image", {
      method: "POST",
      body: JSON.stringify({ fileName: file.name, dataUrl })
    });
    return response.url;
  }

  function ensureStyles() {
    if (document.getElementById("workCmsStyles")) return;
    const style = document.createElement("style");
    style.id = "workCmsStyles";
    style.textContent = `
      .work-cms-shell{margin-top:26px;display:grid;gap:18px}
      .work-cms-card,.work-cms-sidebar,.work-cms-panel,.work-cms-subpanel{border:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(14,14,14,.98),rgba(7,7,7,.98));box-shadow:0 18px 48px rgba(0,0,0,.28)}
      .work-cms-card{padding:22px;background:radial-gradient(circle at top left,rgba(254,168,0,.12),transparent 34%),linear-gradient(180deg,rgba(14,14,14,.98),rgba(7,7,7,.98))}
      .work-cms-head,.work-cms-toolbar,.work-cms-project-head,.work-cms-meta,.work-cms-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
      .work-cms-layout{display:grid;grid-template-columns:minmax(280px,340px) minmax(0,1fr);gap:18px;align-items:start}
      .work-cms-split{display:grid;grid-template-columns:minmax(220px,280px) minmax(0,1fr);gap:16px;align-items:start}
      .work-cms-title{font-size:clamp(20px,2.5vw,30px);font-weight:800;letter-spacing:-.04em;line-height:1.05;max-width:760px}
      .work-cms-subtitle,.work-cms-muted{color:var(--c-muted);font-size:12px;line-height:1.65}
      .work-cms-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      .work-cms-full{grid-column:1/-1}
      .work-cms-sidebar,.work-cms-panel,.work-cms-subpanel{padding:18px}
      .work-cms-sidebar{position:sticky;top:18px}
      .work-cms-sidebar-top{display:grid;gap:12px}
      .work-cms-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .work-cms-kpi{padding:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02)}
      .work-cms-kpi strong{display:block;font-size:19px;line-height:1.1}
      .work-cms-kpi span{display:block;margin-top:4px;color:var(--c-muted);font-size:11px;line-height:1.5}
      .work-cms-list{display:grid;gap:10px;max-height:calc(100vh - 240px);overflow:auto;padding-right:4px}
      .work-cms-btn{width:100%;text-align:left;padding:16px 15px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02);cursor:pointer;display:grid;gap:9px}
      .work-cms-btn.active{border-color:rgba(254,168,0,.45);background:linear-gradient(180deg,rgba(68,49,10,.9),rgba(46,33,8,.88));box-shadow:inset 0 0 0 1px rgba(254,168,0,.08)}
      .work-cms-btn:hover{border-color:rgba(254,168,0,.3)}
      .work-cms-index{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#f8c86d}
      .work-cms-btn-title{font-size:14px;font-weight:700;color:#fff}
      .work-cms-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 9px;border-radius:999px;background:rgba(16,185,129,.14);color:#bbf7d0;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
      .work-cms-badge::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
      .work-cms-badge.raw{background:rgba(148,163,184,.14);color:#cbd5e1}
      .work-cms-eyebrow{display:inline-flex;padding:6px 10px;border:1px solid rgba(254,168,0,.2);background:rgba(254,168,0,.08);color:var(--c-accent);font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;width:max-content}
      .work-cms-field{display:grid;gap:8px}
      .work-cms-field .editor-label{margin:0}
      .work-cms-visual-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      .work-cms-visual-card{display:grid;gap:8px;padding:16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02)}
      .work-cms-builder-add{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
      .work-cms-builder-list{display:grid;gap:10px}
      .work-cms-builder-item{padding:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);display:grid;gap:10px}
      .work-cms-builder-item.active{border-color:rgba(254,168,0,.45);background:linear-gradient(180deg,rgba(68,49,10,.9),rgba(46,33,8,.88))}
      .work-cms-builder-item-head,.work-cms-inline-actions,.work-cms-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
      .work-cms-inline-actions{justify-content:flex-start}
      .work-cms-mini-btn{padding:7px 10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:#fff;cursor:pointer;font-size:12px}
      .work-cms-mini-btn.danger{border-color:rgba(239,68,68,.35);color:#fca5a5}
      .work-cms-mini-btn.primary{border-color:rgba(254,168,0,.35);color:#ffd27a}
      .work-cms-builder-card{display:grid;gap:16px}
      .work-cms-item-list{display:grid;gap:12px}
      .work-cms-repeat-card{padding:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);display:grid;gap:12px}
      .work-cms-checkbox{display:flex;align-items:center;gap:10px;color:#fff;font-size:13px}
      .work-cms-checkbox input{accent-color:#fea800}
      .work-cms-select{appearance:none}
      .work-cms-image-editor{display:grid;grid-template-columns:minmax(220px,280px) minmax(0,1fr);gap:14px;align-items:start}
      .work-cms-upload{border:1px dashed rgba(254,168,0,.35);background:linear-gradient(180deg,rgba(254,168,0,.08),rgba(255,255,255,.02));min-height:162px;padding:14px;display:flex;flex-direction:column;justify-content:center;gap:10px;cursor:pointer}
      .work-cms-upload img{width:100%;aspect-ratio:1.1/1;object-fit:cover;border:1px solid rgba(255,255,255,.08);background:#020202}
      .work-cms-empty{padding:18px;border:1px dashed rgba(255,255,255,.12);color:var(--c-muted);font-size:12px;line-height:1.6}
      .work-cms-section-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,.08)}
      .work-cms-icon-btn{display:inline-flex;align-items:center;gap:8px;padding:11px 14px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:#fff;cursor:pointer}
      .work-cms-icon-btn[disabled]{opacity:.45;cursor:not-allowed}
      .work-cms-icon-btn.primary{border-color:rgba(254,168,0,.4);background:linear-gradient(180deg,#f7b733,#d98b00);color:#111;font-weight:700}
      .work-cms-status{font-size:12px;color:var(--c-muted)}
      @media(max-width:1100px){.work-cms-layout,.work-cms-grid,.work-cms-split,.work-cms-kpis,.work-cms-visual-grid,.work-cms-image-editor{grid-template-columns:1fr}.work-cms-sidebar{position:static}.work-cms-list{max-height:none}}
    `;
    document.head.appendChild(style);
  }

  async function ensureRawHtml(project) {
    if (!project || project.mode !== "raw" || String(project.rawHtml || "").trim()) return;
    try {
      const response = await fetch(project.path, { credentials: "same-origin" });
      if (!response.ok) return;
      project.rawHtml = await response.text();
    } catch {}
  }

  function getSelectedProject() {
    const selected = state.projects.find(project => project.id === state.selectedProjectId);
    if (selected) return selected;
    state.selectedProjectId = state.projects[0] ? state.projects[0].id : "";
    return state.projects[0] || null;
  }

  function normalizeProject(project, index) {
    const title = project.cardTitle || project.title || `Project ${index + 1}`;
    const slug = slugify(project.slug || title);
    return {
      id: project.id || `work-project-${index + 1}`,
      slug,
      path: project.path || `/pages/details/${slug}.html`,
      status: project.status || "live",
      mode: project.mode === "builder" ? "builder" : "raw",
      cardTitle: title,
      category: project.category || "Case Study",
      summary: project.summary || "",
      thumbnailImage: project.thumbnailImage || "/assets/images/others/work.webp",
      thumbnailAlt: project.thumbnailAlt || title,
      metaTitle: project.metaTitle || `${title} | Webx Design Studio`,
      metaDescription: project.metaDescription || project.summary || "",
      rawHtml: String(project.rawHtml || ""),
      sections: Array.isArray(project.sections) ? project.sections : []
    };
  }

  function fallbackProjects() {
    return FALLBACK_PROJECTS.map((project, index) => normalizeProject({
      ...project,
      id: `fallback-${index + 1}`,
      mode: "raw",
      rawHtml: ""
    }, index));
  }

  function buildRawSections(rawHtml) {
    const html = String(rawHtml || "");
    const matches = [...html.matchAll(/<section\b[\s\S]*?<\/section>/gi)];
    return matches.map((match, index) => {
      const markup = match[0];
      const aria = (markup.match(/aria-label="([^"]+)"/i) || [])[1];
      const heading = (markup.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i) || [])[1];
      const className = (markup.match(/class="([^"]+)"/i) || [])[1];
      const label = aria || (heading ? heading.replace(/<[^>]+>/g, "").trim() : "") || className || `Section ${index + 1}`;
      return {
        id: `raw-section-${index + 1}`,
        label,
        markup
      };
    });
  }

  function updateRawSection(project, sectionId, nextMarkup) {
    const currentSections = buildRawSections(project.rawHtml);
    const targetIndex = currentSections.findIndex(section => section.id === sectionId);
    if (targetIndex < 0) return;
    const matches = [...project.rawHtml.matchAll(/<section\b[\s\S]*?<\/section>/gi)];
    if (!matches[targetIndex]) return;
    const start = matches[targetIndex].index;
    const original = matches[targetIndex][0];
    project.rawHtml = `${project.rawHtml.slice(0, start)}${nextMarkup}${project.rawHtml.slice(start + original.length)}`;
  }

  function getSectionHistoryKey(projectId, sectionId) {
    return `${projectId || "project"}::${sectionId || "section"}`;
  }

  function getRawSectionMarkup(project, sectionId) {
    const section = buildRawSections(project && project.rawHtml).find(item => item.id === sectionId);
    return section ? section.markup : "";
  }

  function ensureRawSectionHistory(project, sectionId) {
    const key = getSectionHistoryKey(project && project.id, sectionId);
    if (!state.sectionHistory[key]) {
      const markup = getRawSectionMarkup(project, sectionId);
      state.sectionHistory[key] = { undo: markup ? [markup] : [], redo: [] };
    }
    return state.sectionHistory[key];
  }

  function syncRawSectionHistory(project, sections) {
    (sections || []).forEach(section => {
      const history = ensureRawSectionHistory(project, section.id);
      if (!history.undo.length) history.undo = [section.markup];
    });
  }

  function recordRawSectionHistory(project, sectionId) {
    if (!project || !sectionId || state.applyingHistory) return;
    const history = ensureRawSectionHistory(project, sectionId);
    const markup = getRawSectionMarkup(project, sectionId);
    if (!markup || history.undo[history.undo.length - 1] === markup) return;
    history.undo.push(markup);
    if (history.undo.length > 50) history.undo = history.undo.slice(-50);
    history.redo = [];
  }

  function getRawSectionHistoryCounts(project, sectionId) {
    const history = ensureRawSectionHistory(project, sectionId);
    return {
      undo: Math.max(0, history.undo.length - 1),
      redo: history.redo.length
    };
  }

  function applyRawSectionSnapshot(project, sectionId, markup) {
    if (!project || !sectionId || !markup) return;
    state.applyingHistory = true;
    updateRawSection(project, sectionId, markup);
    state.applyingHistory = false;
  }

  function undoRawSection(project, sectionId) {
    const history = ensureRawSectionHistory(project, sectionId);
    if (history.undo.length <= 1) return false;
    const current = history.undo.pop();
    history.redo.push(current);
    applyRawSectionSnapshot(project, sectionId, history.undo[history.undo.length - 1]);
    return true;
  }

  function redoRawSection(project, sectionId) {
    const history = ensureRawSectionHistory(project, sectionId);
    if (!history.redo.length) return false;
    const markup = history.redo.pop();
    history.undo.push(markup);
    applyRawSectionSnapshot(project, sectionId, markup);
    return true;
  }

  function markRawSectionSaved(project, sectionId) {
    state.sectionSaveState[getSectionHistoryKey(project && project.id, sectionId)] = Date.now();
  }

  function getRawSectionSavedLabel(project, sectionId) {
    const savedAt = state.sectionSaveState[getSectionHistoryKey(project && project.id, sectionId)];
    if (!savedAt) return "Section changes have not been saved yet.";
    const date = new Date(savedAt);
    return `Last saved at ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
  }

  function parseSectionElement(markup) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${String(markup || "")}</body>`, "text/html");
    return doc.body.querySelector("section");
  }

  function serializeSectionElement(sectionEl) {
    return sectionEl ? sectionEl.outerHTML : "";
  }

  function parseRawSectionFields(markup) {
    const sectionEl = parseSectionElement(markup);
    if (!sectionEl) return [];
    const fields = [];
    const pushTextFields = (selector, type, label) => {
      sectionEl.querySelectorAll(selector).forEach((node, index) => {
        fields.push({
          type,
          index,
          label: `${label} ${String(index + 1).padStart(2, "0")}`,
          value: node.textContent.trim()
        });
      });
    };
    pushTextFields("h1, h2, h3, h4, h5, h6", "heading", "Heading");
    pushTextFields("p", "paragraph", "Paragraph");
    pushTextFields("li", "listItem", "List Item");
    sectionEl.querySelectorAll("a").forEach((node, index) => {
      fields.push({
        type: "linkText",
        index,
        label: `Link Label ${String(index + 1).padStart(2, "0")}`,
        value: node.textContent.trim()
      });
      fields.push({
        type: "linkHref",
        index,
        label: `Link URL ${String(index + 1).padStart(2, "0")}`,
        value: node.getAttribute("href") || ""
      });
    });
    sectionEl.querySelectorAll("img").forEach((node, index) => {
      fields.push({
        type: "imageSrc",
        index,
        label: `Image ${String(index + 1).padStart(2, "0")}`,
        value: node.getAttribute("src") || "",
        preview: node.getAttribute("src") || "",
        alt: node.getAttribute("alt") || ""
      });
      fields.push({
        type: "imageAlt",
        index,
        label: `Image Alt ${String(index + 1).padStart(2, "0")}`,
        value: node.getAttribute("alt") || ""
      });
    });
    return fields;
  }

  function updateRawSectionField(project, sectionId, fieldType, index, value) {
    const currentSections = buildRawSections(project.rawHtml);
    const targetSection = currentSections.find(section => section.id === sectionId);
    if (!targetSection) return;
    const sectionEl = parseSectionElement(targetSection.markup);
    if (!sectionEl) return;
    const groups = {
      heading: sectionEl.querySelectorAll("h1, h2, h3, h4, h5, h6"),
      paragraph: sectionEl.querySelectorAll("p"),
      listItem: sectionEl.querySelectorAll("li"),
      linkText: sectionEl.querySelectorAll("a"),
      linkHref: sectionEl.querySelectorAll("a"),
      imageSrc: sectionEl.querySelectorAll("img"),
      imageAlt: sectionEl.querySelectorAll("img")
    };
    const node = groups[fieldType] && groups[fieldType][index];
    if (!node) return;
    if (fieldType === "linkHref") {
      node.setAttribute("href", value);
    } else if (fieldType === "imageSrc") {
      node.setAttribute("src", value);
    } else if (fieldType === "imageAlt") {
      node.setAttribute("alt", value);
    } else {
      node.textContent = value;
    }
    updateRawSection(project, sectionId, serializeSectionElement(sectionEl));
  }

  function renderRawVisualEditor(project, section) {
    const fields = parseRawSectionFields(section.markup);
    const history = getRawSectionHistoryCounts(project, section.id);
    const savedLabel = getRawSectionSavedLabel(project, section.id);
    if (!fields.length) {
      return `<div class="work-cms-empty">No editable content was detected in this section.</div>`;
    }
    return `
      <div class="work-cms-section-head">
        <div>
          <div class="work-cms-eyebrow">Section Editor</div>
          <div class="work-cms-subtitle">${esc(section.label)}</div>
        </div>
      </div>
      <div class="work-cms-visual-grid">
        ${fields.map(field => {
          if (field.type === "imageSrc") {
            return `
              <div class="work-cms-visual-card work-cms-full">
                <div class="editor-label">${esc(field.label)}</div>
                <div class="work-cms-image-editor">
                  <div class="work-cms-upload js-work-raw-upload" data-section-id="${esc(section.id)}" data-field-type="imageSrc" data-field-index="${field.index}">
                    <img src="${esc(field.preview || "/assets/images/others/work.webp")}" alt="${esc(field.alt || "Project image")}" />
                    <div class="work-cms-muted">Click to replace this image.</div>
                    <input type="file" accept="image/*" class="js-work-raw-image-input" data-section-id="${esc(section.id)}" data-field-type="imageSrc" data-field-index="${field.index}" hidden />
                  </div>
                  <label class="work-cms-field">
                    <div class="editor-label">Image URL</div>
                    <input class="editor-input js-work-raw-field" data-section-id="${esc(section.id)}" data-field-type="imageSrc" data-field-index="${field.index}" value="${esc(field.value)}" />
                  </label>
                </div>
              </div>
            `;
          }
          const isLong = field.type === "paragraph" || field.type === "listItem";
          return `
            <label class="work-cms-visual-card ${isLong ? "work-cms-full" : ""}">
              <div class="editor-label">${esc(field.label)}</div>
              ${isLong
                ? `<textarea class="editor-input js-work-raw-field" style="min-height:120px" data-section-id="${esc(section.id)}" data-field-type="${esc(field.type)}" data-field-index="${field.index}">${esc(field.value)}</textarea>`
                : `<input class="editor-input js-work-raw-field" data-section-id="${esc(section.id)}" data-field-type="${esc(field.type)}" data-field-index="${field.index}" value="${esc(field.value)}" />`
              }
            </label>
          `;
        }).join("")}
      </div>
      <div class="work-cms-section-footer">
        <div class="work-cms-toolbar">
          <button type="button" class="work-cms-icon-btn" data-work-section-undo="${esc(section.id)}" ${history.undo ? "" : "disabled"}>Undo</button>
          <button type="button" class="work-cms-icon-btn" data-work-section-redo="${esc(section.id)}" ${history.redo ? "" : "disabled"}>Redo</button>
        </div>
        <div class="work-cms-toolbar">
          <div class="work-cms-status">${esc(savedLabel)}</div>
          <button type="button" class="work-cms-icon-btn" data-work-section-save-stay="${esc(section.id)}">Save Draft</button>
          <button type="button" class="work-cms-icon-btn primary" data-work-section-save="${esc(section.id)}">Save Section</button>
        </div>
      </div>
    `;
  }

  function renderBuilderImageField(sectionId, field, value, altValue, label) {
    return `
      <div class="work-cms-visual-card work-cms-full">
        <div class="editor-label">${esc(label)}</div>
        <div class="work-cms-image-editor">
          <div class="work-cms-upload js-work-builder-upload" data-section-id="${esc(sectionId)}" data-field="${esc(field)}">
            <img src="${esc(value || "/assets/images/others/work.webp")}" alt="${esc(altValue || label)}" />
            <div class="work-cms-muted">Click to upload or replace this image.</div>
            <input type="file" accept="image/*" class="js-work-builder-image-input" data-section-id="${esc(sectionId)}" data-field="${esc(field)}" hidden />
          </div>
          <div class="work-cms-builder-card">
            <label class="work-cms-field">
              <div class="editor-label">Image URL</div>
              <input class="editor-input js-work-builder-field" data-section-id="${esc(sectionId)}" data-field="${esc(field)}" value="${esc(value || "")}" />
            </label>
            ${altValue != null ? `
              <label class="work-cms-field">
                <div class="editor-label">Image Alt</div>
                <input class="editor-input js-work-builder-field" data-section-id="${esc(sectionId)}" data-field="${esc(field)}Alt" value="${esc(altValue || "")}" />
              </label>
            ` : ""}
          </div>
        </div>
      </div>
    `;
  }

  function renderBuilderRepeater(section, listKey, itemType) {
    const items = Array.isArray(section[listKey]) ? section[listKey] : [];
    if (itemType === "stats") {
      return `
        <div class="work-cms-item-list">
          ${items.map((item, index) => `
            <div class="work-cms-repeat-card">
              <div class="work-cms-builder-item-head">
                <div class="work-cms-btn-title">Stat ${String(index + 1).padStart(2, "0")}</div>
                <button type="button" class="work-cms-mini-btn danger" data-work-builder-item-delete="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}">Delete</button>
              </div>
              <div class="work-cms-grid">
                <label class="work-cms-field">
                  <div class="editor-label">Value</div>
                  <input class="editor-input js-work-builder-item-field" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="value" value="${esc(item.value || "")}" />
                </label>
                <label class="work-cms-field">
                  <div class="editor-label">Label</div>
                  <input class="editor-input js-work-builder-item-field" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="label" value="${esc(item.label || "")}" />
                </label>
              </div>
            </div>
          `).join("")}
          <button type="button" class="work-cms-mini-btn primary" data-work-builder-item-add="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-type="stats">+ Add Stat</button>
        </div>
      `;
    }
    if (itemType === "challenge" || itemType === "solution") {
      return `
        <div class="work-cms-item-list">
          ${items.map((item, index) => `
            <div class="work-cms-repeat-card">
              <div class="work-cms-builder-item-head">
                <div class="work-cms-btn-title">${esc(itemType === "challenge" ? "Challenge" : "Solution")} ${String(index + 1).padStart(2, "0")}</div>
                <button type="button" class="work-cms-mini-btn danger" data-work-builder-item-delete="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}">Delete</button>
              </div>
              <div class="work-cms-grid">
                <label class="work-cms-field">
                  <div class="editor-label">Title</div>
                  <input class="editor-input js-work-builder-item-field" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="title" value="${esc(item.title || "")}" />
                </label>
                <label class="work-cms-field work-cms-full">
                  <div class="editor-label">Description</div>
                  <textarea class="editor-input js-work-builder-item-field" style="min-height:100px" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="description">${esc(item.description || "")}</textarea>
                </label>
              </div>
            </div>
          `).join("")}
          <button type="button" class="work-cms-mini-btn primary" data-work-builder-item-add="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-type="${esc(itemType)}">+ Add ${esc(itemType === "challenge" ? "Challenge" : "Solution")}</button>
        </div>
      `;
    }
    if (itemType === "visual-identity") {
      return `
        <div class="work-cms-item-list">
          ${items.map((item, index) => `
            <div class="work-cms-repeat-card">
              <div class="work-cms-builder-item-head">
                <div class="work-cms-btn-title">Identity Card ${String(index + 1).padStart(2, "0")}</div>
                <button type="button" class="work-cms-mini-btn danger" data-work-builder-item-delete="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}">Delete</button>
              </div>
              <div class="work-cms-builder-card">
                <div class="work-cms-image-editor">
                  <div class="work-cms-upload js-work-builder-item-upload" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="image">
                    <img src="${esc(item.image || "/assets/images/others/work.webp")}" alt="${esc(item.alt || "Identity image")}" />
                    <div class="work-cms-muted">Click to replace identity image.</div>
                    <input type="file" accept="image/*" class="js-work-builder-item-image-input" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="image" hidden />
                  </div>
                  <div class="work-cms-builder-card">
                    <label class="work-cms-field"><div class="editor-label">Image URL</div><input class="editor-input js-work-builder-item-field" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="image" value="${esc(item.image || "")}" /></label>
                    <label class="work-cms-field"><div class="editor-label">Image Alt</div><input class="editor-input js-work-builder-item-field" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="alt" value="${esc(item.alt || "")}" /></label>
                  </div>
                </div>
                <label class="work-cms-field"><div class="editor-label">Card Title</div><input class="editor-input js-work-builder-item-field" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="title" value="${esc(item.title || "")}" /></label>
                <label class="work-cms-field"><div class="editor-label">Description</div><textarea class="editor-input js-work-builder-item-field" style="min-height:96px" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="description">${esc(item.description || "")}</textarea></label>
              </div>
            </div>
          `).join("")}
          <button type="button" class="work-cms-mini-btn primary" data-work-builder-item-add="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-type="visual-identity">+ Add Identity Card</button>
        </div>
      `;
    }
    if (itemType === "ui-gallery") {
      return `
        <div class="work-cms-item-list">
          ${items.map((item, index) => `
            <div class="work-cms-repeat-card">
              <div class="work-cms-builder-item-head">
                <div class="work-cms-btn-title">Slide ${String(index + 1).padStart(2, "0")}</div>
                <button type="button" class="work-cms-mini-btn danger" data-work-builder-item-delete="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}">Delete</button>
              </div>
              <div class="work-cms-image-editor">
                <div class="work-cms-upload js-work-builder-item-upload" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="image">
                  <img src="${esc(item.image || "/assets/images/others/work.webp")}" alt="${esc(item.alt || "UI image")}" />
                  <div class="work-cms-muted">Click to replace UI image.</div>
                  <input type="file" accept="image/*" class="js-work-builder-item-image-input" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="image" hidden />
                </div>
                <div class="work-cms-builder-card">
                  <label class="work-cms-field"><div class="editor-label">Image URL</div><input class="editor-input js-work-builder-item-field" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="image" value="${esc(item.image || "")}" /></label>
                  <label class="work-cms-field"><div class="editor-label">Image Alt</div><input class="editor-input js-work-builder-item-field" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="alt" value="${esc(item.alt || "")}" /></label>
                </div>
              </div>
            </div>
          `).join("")}
          <button type="button" class="work-cms-mini-btn primary" data-work-builder-item-add="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-type="ui-gallery">+ Add Slide</button>
        </div>
      `;
    }
    return `
      <div class="work-cms-item-list">
        ${items.map((item, index) => `
          <div class="work-cms-repeat-card">
            <div class="work-cms-builder-item-head">
              <div class="work-cms-btn-title">Gallery Item ${String(index + 1).padStart(2, "0")}</div>
              <button type="button" class="work-cms-mini-btn danger" data-work-builder-item-delete="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}">Delete</button>
            </div>
            <div class="work-cms-builder-card">
              <div class="work-cms-image-editor">
                <div class="work-cms-upload js-work-builder-item-upload" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="image">
                  <img src="${esc(item.image || "/assets/images/others/work.webp")}" alt="${esc(item.alt || "Gallery image")}" />
                  <div class="work-cms-muted">Click to replace gallery image.</div>
                  <input type="file" accept="image/*" class="js-work-builder-item-image-input" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="image" hidden />
                </div>
                <div class="work-cms-builder-card">
                  <label class="work-cms-field">
                    <div class="editor-label">Image URL</div>
                    <input class="editor-input js-work-builder-item-field" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="image" value="${esc(item.image || "")}" />
                  </label>
                  <label class="work-cms-field">
                    <div class="editor-label">Image Alt</div>
                    <input class="editor-input js-work-builder-item-field" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="alt" value="${esc(item.alt || "")}" />
                  </label>
                </div>
              </div>
              <label class="work-cms-field">
                <div class="editor-label">Caption</div>
                <textarea class="editor-input js-work-builder-item-field" style="min-height:96px" data-section-id="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-id="${esc(item.id)}" data-field="caption">${esc(item.caption || "")}</textarea>
              </label>
            </div>
          </div>
        `).join("")}
        <button type="button" class="work-cms-mini-btn primary" data-work-builder-item-add="${esc(section.id)}" data-list-key="${esc(listKey)}" data-item-type="gallery">+ Add Gallery Item</button>
      </div>
    `;
  }

  function renderBuilderSectionEditor(section) {
    if (!section) {
      return `<div class="work-cms-empty">Select a section to begin editing.</div>`;
    }

    const commonHeader = `
      <div class="work-cms-builder-item-head">
        <div>
          <div class="work-cms-eyebrow">${esc(getSectionTypeLabel(section.type))}</div>
          <div class="work-cms-subtitle">Edit this section without touching HTML.</div>
        </div>
        <label class="work-cms-checkbox"><input type="checkbox" class="js-work-builder-enabled" data-section-id="${esc(section.id)}" ${section.enabled !== false ? "checked" : ""} /> Section visible</label>
      </div>
    `;

    if (section.type === "hero") {
      return `<div class="work-cms-builder-card">${commonHeader}<div class="work-cms-visual-grid">
        <label class="work-cms-visual-card work-cms-full"><div class="editor-label">Title</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="title" value="${esc(section.title || "")}" /></label>
        <label class="work-cms-visual-card work-cms-full"><div class="editor-label">Subtitle</div><textarea class="editor-input js-work-builder-field" style="min-height:120px" data-section-id="${esc(section.id)}" data-field="subtitle">${esc(section.subtitle || "")}</textarea></label>
        ${renderBuilderImageField(section.id, "heroImage", section.heroImage, section.heroImageAlt, "Hero Image")}
      </div></div>`;
    }

    if (section.type === "about") {
      return `<div class="work-cms-builder-card">${commonHeader}<div class="work-cms-visual-grid">
        <label class="work-cms-visual-card"><div class="editor-label">Section Title</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="title" value="${esc(section.title || "")}" /></label>
        <label class="work-cms-visual-card"><div class="editor-label">Industry</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="industry" value="${esc(section.industry || "")}" /></label>
        <label class="work-cms-visual-card"><div class="editor-label">Year</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="year" value="${esc(section.year || "")}" /></label>
        <label class="work-cms-visual-card"><div class="editor-label">Services</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="services" value="${esc(section.services || "")}" /></label>
        <label class="work-cms-visual-card work-cms-full"><div class="editor-label">Description</div><textarea class="editor-input js-work-builder-field" style="min-height:160px" data-section-id="${esc(section.id)}" data-field="description">${esc(section.description || "")}</textarea></label>
      </div></div>`;
    }

    if (section.type === "challenge-solution") {
      return `<div class="work-cms-builder-card">${commonHeader}<div class="work-cms-visual-grid">
        <label class="work-cms-visual-card"><div class="editor-label">Challenge Title</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="challengeTitle" value="${esc(section.challengeTitle || "")}" /></label>
        <label class="work-cms-visual-card"><div class="editor-label">Solution Title</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="solutionTitle" value="${esc(section.solutionTitle || "")}" /></label>
      </div>${renderBuilderRepeater(section, "challengeItems", "challenge")}${renderBuilderRepeater(section, "solutionItems", "solution")}</div>`;
    }

    if (section.type === "comparison") {
      return `<div class="work-cms-builder-card">${commonHeader}<div class="work-cms-visual-grid">
        <label class="work-cms-visual-card"><div class="editor-label">Left Label</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="beforeLabel" value="${esc(section.beforeLabel || "")}" /></label>
        <label class="work-cms-visual-card"><div class="editor-label">Right Label</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="afterLabel" value="${esc(section.afterLabel || "")}" /></label>
        <label class="work-cms-visual-card work-cms-full"><div class="editor-label">Background</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="background" value="${esc(section.background || "")}" /></label>
        ${renderBuilderImageField(section.id, "beforeImage", section.beforeImage, section.beforeImageAlt, "Before Image")}
        ${renderBuilderImageField(section.id, "afterImage", section.afterImage, section.afterImageAlt, "After Image")}
      </div></div>`;
    }

    if (section.type === "visual-identity") {
      return `<div class="work-cms-builder-card">${commonHeader}<div class="work-cms-visual-grid">
        <label class="work-cms-visual-card"><div class="editor-label">Label</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="label" value="${esc(section.label || "")}" /></label>
        <label class="work-cms-visual-card"><div class="editor-label">Section Title</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="title" value="${esc(section.title || "")}" /></label>
      </div>${renderBuilderRepeater(section, "items", "visual-identity")}</div>`;
    }

    if (section.type === "design-system") {
      return `<div class="work-cms-builder-card">${commonHeader}<div class="work-cms-visual-grid">
        <label class="work-cms-visual-card"><div class="editor-label">Label</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="label" value="${esc(section.label || "")}" /></label>
        <label class="work-cms-visual-card"><div class="editor-label">Section Title</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="title" value="${esc(section.title || "")}" /></label>
        ${renderBuilderImageField(section.id, "image", section.image, section.imageAlt, "Design System Image")}
      </div></div>`;
    }

    if (section.type === "web-ui" || section.type === "mobile-ui") {
      return `<div class="work-cms-builder-card">${commonHeader}<div class="work-cms-visual-grid">
        <label class="work-cms-visual-card"><div class="editor-label">Label</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="label" value="${esc(section.label || "")}" /></label>
        <label class="work-cms-visual-card"><div class="editor-label">Section Title</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="title" value="${esc(section.title || "")}" /></label>
      </div>${renderBuilderRepeater(section, "items", "ui-gallery")}</div>`;
    }

    if (section.type === "impact") {
      return `<div class="work-cms-builder-card">${commonHeader}<div class="work-cms-visual-grid">
        <label class="work-cms-visual-card"><div class="editor-label">Label</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="label" value="${esc(section.label || "")}" /></label>
        <label class="work-cms-visual-card"><div class="editor-label">Section Title</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="title" value="${esc(section.title || "")}" /></label>
        <label class="work-cms-visual-card work-cms-full"><div class="editor-label">Quote</div><textarea class="editor-input js-work-builder-field" style="min-height:160px" data-section-id="${esc(section.id)}" data-field="quote">${esc(section.quote || "")}</textarea></label>
        <label class="work-cms-visual-card"><div class="editor-label">Author</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="author" value="${esc(section.author || "")}" /></label>
        <label class="work-cms-visual-card"><div class="editor-label">Role</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="role" value="${esc(section.role || "")}" /></label>
        ${renderBuilderImageField(section.id, "authorImage", section.authorImage, section.authorImageAlt, "Author Image")}
        ${renderBuilderImageField(section.id, "brandLogo", section.brandLogo, section.brandLogoAlt, "Brand Logo")}
      </div></div>`;
    }

    if (section.type === "stats") {
      return `<div class="work-cms-builder-card">${commonHeader}<div class="work-cms-visual-grid">
        <label class="work-cms-visual-card work-cms-full"><div class="editor-label">Section Title</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="title" value="${esc(section.title || "")}" /></label>
      </div>${renderBuilderRepeater(section, "items", "stats")}</div>`;
    }

    if (section.type === "gallery") {
      return `<div class="work-cms-builder-card">${commonHeader}<div class="work-cms-visual-grid">
        <label class="work-cms-visual-card work-cms-full"><div class="editor-label">Section Title</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="title" value="${esc(section.title || "")}" /></label>
      </div>${renderBuilderRepeater(section, "items", "gallery")}</div>`;
    }

    return `<div class="work-cms-builder-card">${commonHeader}<div class="work-cms-visual-grid">
      <label class="work-cms-visual-card work-cms-full"><div class="editor-label">Heading</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="title" value="${esc(section.title || "")}" /></label>
      <label class="work-cms-visual-card"><div class="editor-label">Button Text</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="buttonText" value="${esc(section.buttonText || "")}" /></label>
      <label class="work-cms-visual-card"><div class="editor-label">Button URL</div><input class="editor-input js-work-builder-field" data-section-id="${esc(section.id)}" data-field="buttonUrl" value="${esc(section.buttonUrl || "")}" /></label>
    </div></div>`;
  }

  function render() {
    ensureStyles();
    const mount = document.getElementById("homeCmsMount");
    const primaryCard = document.getElementById("pageEditorPrimaryCard");
    if (!mount) return;
    if (primaryCard) primaryCard.style.display = "none";
    const project = getSelectedProject();
    const totalProjects = state.projects.length;
    const visibleProjects = state.projects.filter(item => item.status !== "archived").length;
    const rawProjects = state.projects.filter(item => item.mode === "raw").length;
    const rawSections = project && project.mode === "raw" ? buildRawSections(project.rawHtml) : [];
    const builderSections = project && project.mode === "builder" ? ensureBuilderSections(project) : [];
    if (project && project.mode === "raw") syncRawSectionHistory(project, rawSections);
    const selectedRawSection = rawSections.find(section => section.id === state.selectedRawSectionId) || rawSections[0] || null;
    const selectedBuilderSection = builderSections.find(section => section.id === state.selectedBuilderSectionId) || builderSections[0] || null;
    if (selectedRawSection) state.selectedRawSectionId = selectedRawSection.id;
    if (selectedBuilderSection) state.selectedBuilderSectionId = selectedBuilderSection.id;

    mount.innerHTML = `
      <div class="work-cms-shell">
        <div class="work-cms-card">
          <div class="work-cms-head">
            <div>
              <div class="work-cms-eyebrow">Work Projects Studio</div>
              <div class="work-cms-title">Structured control for every project detail page.</div>
              <div class="work-cms-subtitle">Browse all projects from the sidebar and update the selected project from a focused editor panel.</div>
            </div>
            <div class="work-cms-toolbar">
              <button type="button" class="btn btn-outline" id="workAddBtn">+ Add Project</button>
              <button type="button" class="btn btn-primary" id="workSaveBtn">Save All</button>
            </div>
          </div>
          <div class="work-cms-grid" style="margin-top:18px;grid-template-columns:repeat(2,minmax(0,1fr))">
            <div class="work-cms-field work-cms-full" style="background:rgba(254,168,0,.05);border:1px solid rgba(254,168,0,.15);padding:14px;border-radius:2px">
              <div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#f8c86d;margin-bottom:10px">&#9733; Work Page Intro (Visible on Work Page)</div>
              <div class="work-cms-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">
                <label class="work-cms-field">
                  <div class="editor-label">Page Hero Title <span style="color:#f8c86d">&#x2014; h1 heading</span></div>
                  <input class="editor-input js-work-hero-title" placeholder="Creative Projects That Define Us" value="${esc(state._workHeroTitle !== undefined ? state._workHeroTitle : ((document.getElementById('editPageHero') || {}).value || ''))}" />
                </label>
                <label class="work-cms-field">
                  <div class="editor-label">Page Hero Description <span style="color:#f8c86d">&#x2014; intro paragraph</span></div>
                  <textarea class="editor-input js-work-hero-desc" style="min-height:92px" placeholder="We are a UI UX design studio...">${esc(state._workHeroDesc !== undefined ? state._workHeroDesc : ((document.getElementById('editPageSub') || {}).value || ''))}</textarea>
                </label>
              </div>
            </div>
            <label class="work-cms-field">
              <div class="editor-label">SEO Title <span style="color:var(--c-muted)">&mdash; browser tab</span></div>
              <input class="editor-input js-work-page-title" value="${esc(state._workPageTitle !== undefined ? state._workPageTitle : ((document.getElementById('editPageTitle') || {}).value || ''))}" />
            </label>
            <label class="work-cms-field">
              <div class="editor-label">SEO Meta Description <span style="color:var(--c-muted)">&mdash; search engines</span></div>
              <textarea class="editor-input js-work-page-meta" style="min-height:92px">${esc(state._workPageMeta !== undefined ? state._workPageMeta : ((document.getElementById('editPageMeta') || {}).value || ''))}</textarea>
            </label>
          </div>
        </div>
        <div class="work-cms-layout">
          <aside class="work-cms-sidebar">
            <div class="work-cms-sidebar-top">
              <div>
                <div class="editor-label" style="margin:0">Projects</div>
                <div class="work-cms-muted">Select a project to open its editor on the right.</div>
              </div>
              <div class="work-cms-kpis">
                <div class="work-cms-kpi"><strong>${String(totalProjects).padStart(2, "0")}</strong><span>Total</span></div>
                <div class="work-cms-kpi"><strong>${String(visibleProjects).padStart(2, "0")}</strong><span>Visible</span></div>
                <div class="work-cms-kpi"><strong>${String(rawProjects).padStart(2, "0")}</strong><span>Raw</span></div>
              </div>
            </div>
            <div class="work-cms-list">
              ${state.projects.map((item, index) => `
                <button type="button" class="work-cms-btn ${project && project.id === item.id ? "active" : ""}" data-work-select="${esc(item.id)}">
                  <div class="work-cms-meta">
                  <span class="work-cms-index">Project ${String(index + 1).padStart(2, "0")}</span>
                    <span class="work-cms-badge ${item.mode === "raw" ? "raw" : ""}">${esc(item.mode)}</span>
                  </div>
                  <div class="work-cms-btn-title">${esc(item.cardTitle)}</div>
                  <div class="work-cms-muted">${esc(item.path)}</div>
                </button>
              `).join("") || `<div class="work-cms-empty">No projects are available.</div>`}
            </div>
          </aside>
          <section class="work-cms-panel">
            ${project ? `
              <div class="work-cms-project-head">
                <div>
                  <div class="work-cms-eyebrow">Selected Project</div>
                  <div class="work-cms-title" style="font-size:28px">${esc(project.cardTitle)}</div>
                  <div class="work-cms-subtitle">${esc(project.path)}</div>
                </div>
                <div class="work-cms-toolbar">
                  <button type="button" class="btn btn-primary" id="workProjectSaveBtn">Save Project</button>
                  <button type="button" class="btn btn-danger" data-work-delete="${esc(project.id)}">Delete</button>
                </div>
              </div>
              <div class="work-cms-grid" style="margin-top:18px">
                <label class="work-cms-field"><div class="editor-label">Card Title</div><input class="editor-input js-work-field" data-field="cardTitle" value="${esc(project.cardTitle)}" /></label>
                <label class="work-cms-field"><div class="editor-label">Slug</div><input class="editor-input js-work-field" data-field="slug" value="${esc(project.slug)}" /></label>
                <label class="work-cms-field"><div class="editor-label">Category</div><input class="editor-input js-work-field" data-field="category" value="${esc(project.category)}" /></label>
                <label class="work-cms-field"><div class="editor-label">Mode</div><select class="editor-input js-work-field" data-field="mode"><option value="raw" ${project.mode === "raw" ? "selected" : ""}>Structured Editor</option><option value="builder" ${project.mode === "builder" ? "selected" : ""}>Builder JSON</option></select></label>
                <label class="work-cms-field work-cms-full"><div class="editor-label">Summary</div><textarea class="editor-input js-work-field" data-field="summary" style="min-height:110px">${esc(project.summary)}</textarea></label>
                <div class="work-cms-field work-cms-full">
                  <div class="editor-label">Thumbnail Image</div>
                  <div class="work-cms-grid">
                    <div class="work-cms-upload js-work-thumb-drop">
                      <img src="${esc(project.thumbnailImage || "/assets/images/others/work.webp")}" alt="${esc(project.thumbnailAlt || project.cardTitle)}" />
                      <div class="work-cms-muted">Click to upload a new thumbnail image.</div>
                      <input type="file" accept="image/*" id="workThumbInput" hidden />
                    </div>
                    <label class="work-cms-field">
                      <div class="editor-label">Asset URL</div>
                      <input class="editor-input js-work-field" data-field="thumbnailImage" value="${esc(project.thumbnailImage)}" />
                      <div class="editor-label">Alt Text</div>
                      <input class="editor-input js-work-field" data-field="thumbnailAlt" value="${esc(project.thumbnailAlt)}" />
                    </label>
                  </div>
                </div>
                <label class="work-cms-field"><div class="editor-label">Meta Title</div><input class="editor-input js-work-field" data-field="metaTitle" value="${esc(project.metaTitle)}" /></label>
                <label class="work-cms-field work-cms-full"><div class="editor-label">Meta Description</div><textarea class="editor-input js-work-field" data-field="metaDescription" style="min-height:110px">${esc(project.metaDescription)}</textarea></label>
              </div>
              <div style="margin-top:18px">
                ${project.mode === "raw" ? `
                  <div class="work-cms-split">
                    <div class="work-cms-subpanel">
                      <div class="work-cms-sidebar-top">
                        <div>
                          <div class="editor-label" style="margin:0">Sections</div>
                          <div class="work-cms-muted">Select a section to open its editor on the right.</div>
                        </div>
                        <div class="work-cms-kpis">
                          <div class="work-cms-kpi"><strong>${String(rawSections.length).padStart(2, "0")}</strong><span>Total</span></div>
                          <div class="work-cms-kpi"><strong>${String(rawSections.length).padStart(2, "0")}</strong><span>Visible</span></div>
                          <div class="work-cms-kpi"><strong>00</strong><span>Hidden</span></div>
                        </div>
                      </div>
                      <div class="work-cms-list">
                        ${rawSections.map((section, index) => `
                          <button type="button" class="work-cms-btn ${selectedRawSection && selectedRawSection.id === section.id ? "active" : ""}" data-work-raw-section="${esc(section.id)}">
                            <div class="work-cms-meta">
                              <span class="work-cms-index">Section ${String(index + 1).padStart(2, "0")}</span>
                              <span class="work-cms-badge">Live</span>
                            </div>
                            <div class="work-cms-btn-title">${esc(section.label)}</div>
                            <div class="work-cms-muted">Structured section editor</div>
                          </button>
                        `).join("") || `<div class="work-cms-empty">No sections were found for this project.</div>`}
                      </div>
                    </div>
                    <div class="work-cms-subpanel">
                      ${selectedRawSection ? renderRawVisualEditor(project, selectedRawSection) : `<div class="work-cms-empty">Select a section to begin editing.</div>`}
                    </div>
                  </div>
                ` : `
                  <div class="work-cms-split">
                    <div class="work-cms-subpanel">
                      <div class="work-cms-sidebar-top">
                        <div>
                          <div class="editor-label" style="margin:0">PDP Sections</div>
                          <div class="work-cms-muted">Add, reorder, duplicate, hide, or delete sections from here.</div>
                        </div>
                        <div class="work-cms-builder-add">
                          <select class="editor-input work-cms-select" id="workBuilderSectionType">
                            <option value="hero">Hero</option>
                            <option value="about">About</option>
                            <option value="challenge-solution">Challenge &amp; Solution</option>
                            <option value="comparison">Before / After Comparison</option>
                            <option value="visual-identity">Visual Identity</option>
                            <option value="design-system">Design System</option>
                            <option value="web-ui">Web UI</option>
                            <option value="mobile-ui">Mobile UI</option>
                            <option value="impact">Impact &amp; Achievements</option>
                            <option value="stats">Stats</option>
                            <option value="gallery">Gallery</option>
                            <option value="cta">CTA</option>
                          </select>
                          <button type="button" class="work-cms-mini-btn primary" id="workBuilderAddSectionBtn">+ Add Section</button>
                        </div>
                      </div>
                      <div class="work-cms-builder-list" style="margin-top:16px">
                        ${builderSections.map((section, index) => `
                          <div class="work-cms-builder-item ${selectedBuilderSection && selectedBuilderSection.id === section.id ? "active" : ""}">
                            <button type="button" class="work-cms-btn ${selectedBuilderSection && selectedBuilderSection.id === section.id ? "active" : ""}" data-work-builder-section="${esc(section.id)}">
                              <div class="work-cms-meta">
                                <span class="work-cms-index">Section ${String(index + 1).padStart(2, "0")}</span>
                                <span class="work-cms-badge ${section.enabled === false ? "raw" : ""}">${esc(section.enabled === false ? "hidden" : getSectionTypeLabel(section.type))}</span>
                              </div>
                              <div class="work-cms-btn-title">${esc(getBuilderSectionSummary(section, index))}</div>
                              <div class="work-cms-muted">${esc(getSectionTypeLabel(section.type))}</div>
                            </button>
                            <div class="work-cms-inline-actions">
                              <button type="button" class="work-cms-mini-btn" data-work-builder-move-up="${esc(section.id)}" ${index === 0 ? "disabled" : ""}>Up</button>
                              <button type="button" class="work-cms-mini-btn" data-work-builder-move-down="${esc(section.id)}" ${index === builderSections.length - 1 ? "disabled" : ""}>Down</button>
                              <button type="button" class="work-cms-mini-btn" data-work-builder-duplicate="${esc(section.id)}">Duplicate</button>
                              <button type="button" class="work-cms-mini-btn danger" data-work-builder-delete="${esc(section.id)}" ${builderSections.length <= 1 ? "disabled" : ""}>Delete</button>
                            </div>
                          </div>
                        `).join("") || `<div class="work-cms-empty">No sections have been added yet.</div>`}
                      </div>
                    </div>
                    <div class="work-cms-subpanel">
                      ${renderBuilderSectionEditor(selectedBuilderSection)}
                    </div>
                  </div>
                `}
              </div>
            ` : `<div class="work-cms-empty">Select a project from the sidebar to begin editing.</div>`}
          </section>
        </div>
      </div>
    `;
  }

  function createProject() {
    const stamp = Date.now();
    const cardTitle = "New Project";
    return normalizeProject({
      id: `work-project-${stamp}`,
      slug: `new-project-${stamp}`,
      path: `/pages/details/new-project-${stamp}.html`,
      status: "live",
      mode: "builder",
      cardTitle,
      category: "Case Study",
      summary: "Add project summary",
      thumbnailImage: "/assets/images/others/work.webp",
      thumbnailAlt: "New project thumbnail",
      metaTitle: `${cardTitle} | Webx Design Studio`,
      metaDescription: "Add project meta description",
      sections: [
        createBuilderSection("hero", cardTitle),
        createBuilderSection("about", cardTitle),
        createBuilderSection("challenge-solution", cardTitle),
        createBuilderSection("comparison", cardTitle),
        createBuilderSection("visual-identity", cardTitle),
        createBuilderSection("design-system", cardTitle),
        createBuilderSection("web-ui", cardTitle),
        createBuilderSection("mobile-ui", cardTitle),
        createBuilderSection("impact", cardTitle),
        createBuilderSection("stats", cardTitle),
        createBuilderSection("gallery", cardTitle),
        createBuilderSection("cta", cardTitle)
      ]
    }, state.projects.length);
  }

  async function ensureProjects(data) {
    const projects = Array.isArray(data && data.projects) ? data.projects : [];
    if (projects.length) return projects.map((project, index) => normalizeProject(project, index));
    try {
      const payload = await api("/api/admin/bootstrap");
      const bootstrapProjects = ((((payload || {}).pages || {}).work || {}).projects || []);
      if (bootstrapProjects.length) return bootstrapProjects.map((project, index) => normalizeProject(project, index));
    } catch {}
    return fallbackProjects();
  }

  async function save(options = {}) {
    const selected = getSelectedProject();
    if (selected && selected.mode === "builder") {
      ensureBuilderSections(selected);
    }
    const titleInput = document.getElementById("editPageTitle");
    const metaInput = document.getElementById("editPageMeta");
    const heroInput = document.getElementById("editPageHero");
    const subInput = document.getElementById("editPageSub");
    const pageTitleUi = document.querySelector(".js-work-page-title");
    const pageMetaUi = document.querySelector(".js-work-page-meta");
    const heroTitleUi = document.querySelector(".js-work-hero-title");
    const heroDescUi = document.querySelector(".js-work-hero-desc");
    if (titleInput && pageTitleUi) titleInput.value = pageTitleUi.value;
    if (metaInput && pageMetaUi) metaInput.value = pageMetaUi.value;
    if (heroInput && heroTitleUi) heroInput.value = heroTitleUi.value;
    if (subInput && heroDescUi) subInput.value = heroDescUi.value;
    await api("/api/admin/pages/work", {
      method: "PUT",
      body: JSON.stringify({
        title: titleInput ? titleInput.value : "",
        meta: metaInput ? metaInput.value : "",
        heroTitle: heroTitleUi ? heroTitleUi.value : (heroInput ? heroInput.value : ""),
        heroDescription: heroDescUi ? heroDescUi.value : (subInput ? subInput.value : ""),
        heroSubtitle: "",
        projects: state.projects
      })
    });
    if (!options.quiet) toast("Work editor saved", "check", true);
  }

  async function saveRawSection(project, sectionId, options = {}) {
    if (!project || !sectionId) return;
    recordRawSectionHistory(project, sectionId);
    await save({ quiet: true });
    markRawSectionSaved(project, sectionId);
    if (!options.quiet) toast("Selected section saved", "check", true);
    render();
  }

  document.addEventListener("click", async event => {
    const mount = document.getElementById("homeCmsMount");
    if (!mount || !mount.querySelector(".work-cms-shell")) return;
    const project = getSelectedProject();

    const projectSelect = event.target.closest("[data-work-select]");
    if (projectSelect) {
      state.selectedProjectId = projectSelect.dataset.workSelect || "";
      state.selectedRawSectionId = "";
      state.selectedBuilderSectionId = "";
      await ensureRawHtml(getSelectedProject());
      render();
    }

    const rawSectionSelect = event.target.closest("[data-work-raw-section]");
    if (rawSectionSelect) {
      state.selectedRawSectionId = rawSectionSelect.dataset.workRawSection || "";
      render();
    }

    const builderSectionSelect = event.target.closest("[data-work-builder-section]");
    if (builderSectionSelect) {
      state.selectedBuilderSectionId = builderSectionSelect.dataset.workBuilderSection || "";
      render();
    }

    const sectionUndo = event.target.closest("[data-work-section-undo]");
    if (sectionUndo && project && undoRawSection(project, sectionUndo.dataset.workSectionUndo || "")) {
      render();
    }

    const sectionRedo = event.target.closest("[data-work-section-redo]");
    if (sectionRedo && project && redoRawSection(project, sectionRedo.dataset.workSectionRedo || "")) {
      render();
    }

    const sectionSaveDraft = event.target.closest("[data-work-section-save-stay]");
    if (sectionSaveDraft && project) {
      await saveRawSection(project, sectionSaveDraft.dataset.workSectionSaveStay || "", { quiet: false });
    }

    const sectionSave = event.target.closest("[data-work-section-save]");
    if (sectionSave && project) {
      await saveRawSection(project, sectionSave.dataset.workSectionSave || "", { quiet: false });
    }

    if (event.target.closest("#workAddBtn")) {
      const project = createProject();
      state.projects.unshift(project);
      state.selectedProjectId = project.id;
      state.selectedRawSectionId = "";
      state.selectedBuilderSectionId = project.sections[0] ? project.sections[0].id : "";
      render();
    }

    if (event.target.closest("#workBuilderAddSectionBtn") && project && project.mode === "builder") {
      const typeSelect = document.getElementById("workBuilderSectionType");
      const nextSection = createBuilderSection(typeSelect ? typeSelect.value : "about", project.cardTitle);
      ensureBuilderSections(project).push(nextSection);
      state.selectedBuilderSectionId = nextSection.id;
      render();
    }

    const builderMoveUp = event.target.closest("[data-work-builder-move-up]");
    if (builderMoveUp && project && project.mode === "builder") {
      moveBuilderSection(project, builderMoveUp.dataset.workBuilderMoveUp || "", "up");
      render();
    }

    const builderMoveDown = event.target.closest("[data-work-builder-move-down]");
    if (builderMoveDown && project && project.mode === "builder") {
      moveBuilderSection(project, builderMoveDown.dataset.workBuilderMoveDown || "", "down");
      render();
    }

    const builderDuplicate = event.target.closest("[data-work-builder-duplicate]");
    if (builderDuplicate && project && project.mode === "builder") {
      const nextSection = duplicateBuilderSection(project, builderDuplicate.dataset.workBuilderDuplicate || "");
      if (nextSection) state.selectedBuilderSectionId = nextSection.id;
      render();
    }

    const builderDelete = event.target.closest("[data-work-builder-delete]");
    if (builderDelete && project && project.mode === "builder") {
      const sectionId = builderDelete.dataset.workBuilderDelete || "";
      if (!deleteBuilderSection(project, sectionId)) {
        toast("At least one section is required", "lock");
        return;
      }
      const nextSelected = ensureBuilderSections(project)[0];
      state.selectedBuilderSectionId = nextSelected ? nextSelected.id : "";
      render();
    }

    const builderItemAdd = event.target.closest("[data-work-builder-item-add]");
    if (builderItemAdd && project && project.mode === "builder") {
      const section = ensureBuilderSections(project).find(item => item.id === (builderItemAdd.dataset.workBuilderItemAdd || ""));
      if (!section) return;
      if (!Array.isArray(section[builderItemAdd.dataset.listKey])) section[builderItemAdd.dataset.listKey] = [];
      if (builderItemAdd.dataset.itemType === "stats") {
        section[builderItemAdd.dataset.listKey].push({ id: createLocalId("work-stat"), value: String(section[builderItemAdd.dataset.listKey].length + 1).padStart(2, "0"), label: "New outcome" });
      } else if (builderItemAdd.dataset.itemType === "challenge") {
        section[builderItemAdd.dataset.listKey].push({ id: createLocalId("work-challenge"), title: "New challenge", description: "Add description here." });
      } else if (builderItemAdd.dataset.itemType === "solution") {
        section[builderItemAdd.dataset.listKey].push({ id: createLocalId("work-solution"), title: "New solution", description: "Add description here." });
      } else if (builderItemAdd.dataset.itemType === "visual-identity") {
        section[builderItemAdd.dataset.listKey].push({ id: createLocalId("work-vi"), image: "/assets/images/others/work.webp", alt: `${project.cardTitle} visual identity`, title: "New card", description: "Add description here." });
      } else if (builderItemAdd.dataset.itemType === "ui-gallery") {
        section[builderItemAdd.dataset.listKey].push({ id: createLocalId("work-ui"), image: "/assets/images/others/work.webp", alt: `${project.cardTitle} ui image` });
      } else {
        section[builderItemAdd.dataset.listKey].push({ id: createLocalId("work-gallery"), image: "/assets/images/others/work.webp", alt: `${project.cardTitle} gallery image`, caption: "Add caption" });
      }
      state.selectedBuilderSectionId = section.id;
      render();
    }

    const builderItemDelete = event.target.closest("[data-work-builder-item-delete]");
    if (builderItemDelete && project && project.mode === "builder") {
      const section = ensureBuilderSections(project).find(item => item.id === (builderItemDelete.dataset.workBuilderItemDelete || ""));
      const listKey = builderItemDelete.dataset.listKey || "";
      if (!section || !Array.isArray(section[listKey])) return;
      if (section[listKey].length <= 1) {
        toast("At least one item is required", "lock");
        return;
      }
      section[listKey] = section[listKey].filter(item => item.id !== builderItemDelete.dataset.itemId);
      render();
    }

    if (event.target.closest("#workSaveBtn")) {
      await save();
    }

    if (event.target.closest("#workProjectSaveBtn")) {
      await save();
    }

    const projectDelete = event.target.closest("[data-work-delete]");
    if (projectDelete) {
      state.projects = state.projects.filter(project => project.id !== projectDelete.dataset.workDelete);
      state.selectedProjectId = state.projects[0] ? state.projects[0].id : "";
      state.selectedRawSectionId = "";
      render();
    }

    if (event.target.closest(".js-work-thumb-drop") && !event.target.closest("input")) {
      const input = document.getElementById("workThumbInput");
      if (input) input.click();
    }

    const rawUpload = event.target.closest(".js-work-raw-upload");
    if (rawUpload && !event.target.closest("input")) {
      const input = rawUpload.querySelector(".js-work-raw-image-input");
      if (input) input.click();
    }

    const builderUpload = event.target.closest(".js-work-builder-upload");
    if (builderUpload && !event.target.closest("input")) {
      const input = builderUpload.querySelector(".js-work-builder-image-input");
      if (input) input.click();
    }

    const builderItemUpload = event.target.closest(".js-work-builder-item-upload");
    if (builderItemUpload && !event.target.closest("input")) {
      const input = builderItemUpload.querySelector(".js-work-builder-item-image-input");
      if (input) input.click();
    }
  });

  document.addEventListener("input", event => {
    const mount = document.getElementById("homeCmsMount");
    if (!mount || !mount.querySelector(".work-cms-shell")) return;
    const project = getSelectedProject();
    if (!project) return;

    if (event.target.closest(".js-work-page-title")) {
      const titleInput = document.getElementById("editPageTitle");
      if (titleInput) titleInput.value = event.target.value;
    }

    if (event.target.closest(".js-work-page-meta")) {
      const metaInput = document.getElementById("editPageMeta");
      if (metaInput) metaInput.value = event.target.value;
    }

    if (event.target.closest(".js-work-hero-title")) {
      state._workHeroTitle = event.target.value;
      const heroInput = document.getElementById("editPageHero");
      if (heroInput) heroInput.value = event.target.value;
    }

    if (event.target.closest(".js-work-hero-desc")) {
      state._workHeroDesc = event.target.value;
      const subInput = document.getElementById("editPageSub");
      if (subInput) subInput.value = event.target.value;
    }

    const projectField = event.target.closest(".js-work-field");
    if (projectField) {
      project[projectField.dataset.field] = projectField.value;
      if (projectField.dataset.field === "slug") {
        project.path = `/pages/details/${projectField.value}.html`;
      }
      if (projectField.dataset.field === "mode" && project.mode === "builder") {
        const sections = ensureBuilderSections(project);
        state.selectedBuilderSectionId = sections[0] ? sections[0].id : "";
      }
    }

    const rawField = event.target.closest(".js-work-raw-field");
    if (rawField) {
      updateRawSectionField(
        project,
        rawField.dataset.sectionId || "",
        rawField.dataset.fieldType || "",
        Number(rawField.dataset.fieldIndex || 0),
        rawField.value
      );
    }

    const builderField = event.target.closest(".js-work-builder-field");
    if (builderField && project.mode === "builder") {
      const section = ensureBuilderSections(project).find(item => item.id === (builderField.dataset.sectionId || ""));
      if (section) section[builderField.dataset.field] = builderField.value;
    }

    const builderItemField = event.target.closest(".js-work-builder-item-field");
    if (builderItemField && project.mode === "builder") {
      const section = ensureBuilderSections(project).find(item => item.id === (builderItemField.dataset.sectionId || ""));
      const listKey = builderItemField.dataset.listKey || "";
      const item = section && Array.isArray(section[listKey]) ? section[listKey].find(entry => entry.id === builderItemField.dataset.itemId) : null;
      if (item) item[builderItemField.dataset.field] = builderItemField.value;
    }
  });

  document.addEventListener("change", async event => {
    const mount = document.getElementById("homeCmsMount");
    if (!mount || !mount.querySelector(".work-cms-shell")) return;
    const project = getSelectedProject();
    if (!project) return;

    const rawField = event.target.closest(".js-work-raw-field");
    if (rawField) {
      recordRawSectionHistory(project, rawField.dataset.sectionId || "");
      render();
      return;
    }

    const thumbInput = event.target.closest("#workThumbInput");
    if (thumbInput && thumbInput.files && thumbInput.files[0]) {
      const url = await uploadImage(thumbInput.files[0]);
      project.thumbnailImage = url;
      render();
      toast("Thumbnail updated", "upload", true);
    }

    const rawImageInput = event.target.closest(".js-work-raw-image-input");
    if (rawImageInput && rawImageInput.files && rawImageInput.files[0]) {
      const url = await uploadImage(rawImageInput.files[0]);
      updateRawSectionField(
        project,
        rawImageInput.dataset.sectionId || "",
        rawImageInput.dataset.fieldType || "imageSrc",
        Number(rawImageInput.dataset.fieldIndex || 0),
        url
      );
      recordRawSectionHistory(project, rawImageInput.dataset.sectionId || "");
      render();
      toast("Section image updated", "upload", true);
    }

    const builderEnabled = event.target.closest(".js-work-builder-enabled");
    if (builderEnabled && project.mode === "builder") {
      const section = ensureBuilderSections(project).find(item => item.id === (builderEnabled.dataset.sectionId || ""));
      if (section) {
        section.enabled = !!builderEnabled.checked;
        render();
      }
    }

    const builderImageInput = event.target.closest(".js-work-builder-image-input");
    if (builderImageInput && builderImageInput.files && builderImageInput.files[0] && project.mode === "builder") {
      const section = ensureBuilderSections(project).find(item => item.id === (builderImageInput.dataset.sectionId || ""));
      if (!section) return;
      section[builderImageInput.dataset.field || "image"] = await uploadImage(builderImageInput.files[0]);
      render();
      toast("Section image updated", "upload", true);
    }

    const builderItemImageInput = event.target.closest(".js-work-builder-item-image-input");
    if (builderItemImageInput && builderItemImageInput.files && builderItemImageInput.files[0] && project.mode === "builder") {
      const section = ensureBuilderSections(project).find(item => item.id === (builderItemImageInput.dataset.sectionId || ""));
      const listKey = builderItemImageInput.dataset.listKey || "";
      const item = section && Array.isArray(section[listKey]) ? section[listKey].find(entry => entry.id === builderItemImageInput.dataset.itemId) : null;
      if (!item) return;
      item[builderItemImageInput.dataset.field || "image"] = await uploadImage(builderItemImageInput.files[0]);
      render();
      toast("Gallery image updated", "upload", true);
    }
  });

  window.renderWorkStudio = async function renderWorkStudio(data) {
    state.projects = await ensureProjects(data || {});
    state.selectedProjectId = state.projects[0] ? state.projects[0].id : "";
    state.selectedRawSectionId = "";
    state.selectedBuilderSectionId = "";
    // Seed page fields from server data (loaded from store.pages.work)
    state._workPageTitle = String((data && data.title) || "");
    state._workPageMeta = String((data && data.meta) || "");
    state._workHeroTitle = String((data && data.heroTitle) || "");
    state._workHeroDesc = String((data && data.heroDescription) || "");
    // Also sync the hidden dashboard inputs so they match
    const titleInput = document.getElementById("editPageTitle");
    const metaInput = document.getElementById("editPageMeta");
    const heroInput = document.getElementById("editPageHero");
    const subInput = document.getElementById("editPageSub");
    if (titleInput) titleInput.value = state._workPageTitle;
    if (metaInput) metaInput.value = state._workPageMeta;
    if (heroInput) heroInput.value = state._workHeroTitle;
    if (subInput) subInput.value = state._workHeroDesc;
    await ensureRawHtml(getSelectedProject());
    render();
  };
})();
