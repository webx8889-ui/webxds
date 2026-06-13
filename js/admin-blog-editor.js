(function () {
  const state = {
    image: "",
    currentBlogId: null,
    blogs: [],
    sections: [
      { id: createId("blog-section"), heading: "", details: "", bullets: [""] }
    ]
  };

  function createId(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toast(message, icon, success) {
    if (typeof window.showToast === "function") window.showToast(message, icon || "check", !!success);
  }

  function token() {
    return localStorage.getItem("webx-admin-token") || "";
  }

  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(token() ? { "x-admin-token": token() } : {}),
        ...(options.headers || {})
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Request failed");
    return payload;
  }

  function slugify(value) {
    return String(value || "new-blog")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "new-blog";
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read image"));
      reader.readAsDataURL(file);
    });
  }

  async function uploadImage(file) {
    if (!file || !String(file.type || "").startsWith("image/")) throw new Error("Please upload an image file");
    const dataUrl = await readFileAsDataUrl(file);
    const payload = await api("/api/admin/media/upload-image", {
      method: "POST",
      body: JSON.stringify({ fileName: file.name, dataUrl })
    });
    return payload.url;
  }

  function ensureStyles() {
    if (document.getElementById("adminBlogEditorStyles")) return;
    const style = document.createElement("style");
    style.id = "adminBlogEditorStyles";
    style.textContent = `
      .modal.blog-editor-modal{width:min(1240px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;}
      .blog-editor-shell{display:grid;gap:18px}
      .blog-editor-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(280px,.95fr);gap:18px;align-items:start}
      .blog-editor-panel,.blog-editor-preview,.blog-editor-section{border:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(14,14,14,.98),rgba(7,7,7,.98));box-shadow:0 18px 48px rgba(0,0,0,.22)}
      .blog-editor-panel,.blog-editor-preview{padding:18px}
      .blog-editor-form{display:grid;gap:14px}
      .blog-editor-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      .blog-editor-field{display:grid;gap:8px}
      .blog-editor-full{grid-column:1/-1}
      .blog-editor-upload{border:1px dashed rgba(254,168,0,.35);background:linear-gradient(180deg,rgba(254,168,0,.08),rgba(255,255,255,.02));min-height:176px;padding:14px;display:grid;gap:10px;cursor:pointer}
      .blog-editor-upload.dragover{border-color:#fea800;background:rgba(254,168,0,.13)}
      .blog-editor-upload img{width:100%;aspect-ratio:1.8/1;object-fit:cover;border:1px solid rgba(255,255,255,.08);background:#050505}
      .blog-editor-muted{color:var(--c-muted);font-size:12px;line-height:1.6}
      .blog-editor-section{padding:16px;display:grid;gap:12px}
      .blog-editor-section-head,.blog-editor-preview-head,.blog-editor-bullet-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
      .blog-editor-actions{display:flex;align-items:center;justify-content:flex-start;gap:12px;flex-wrap:wrap;padding:0 0 2px 0}
      .blog-editor-actions-primary{display:flex;align-items:center;justify-content:flex-start;gap:12px;order:0}
      .blog-editor-actions-secondary{display:flex;align-items:center;justify-content:flex-start;gap:12px;order:1;margin-left:auto}
      .blog-editor-section-title{font-weight:800;color:#fff}
      .blog-editor-mini{padding:8px 12px;font-size:12px}
      .blog-editor-bullets{display:grid;gap:8px}
      .blog-editor-bullet-row{flex-wrap:nowrap}
      .blog-editor-bullet-row .editor-input{flex:1}
      .blog-editor-preview{position:sticky;top:82px;display:grid;gap:14px}
      .blog-preview-card{border:1px solid rgba(255,255,255,.08);background:#050505;overflow:hidden}
      .blog-preview-card img{width:100%;aspect-ratio:1.9/1;object-fit:cover;background:#0d0d0d}
      .blog-preview-body{padding:16px;display:grid;gap:10px}
      .blog-preview-title{font-size:clamp(20px,2.4vw,30px);font-weight:800;letter-spacing:-.03em;line-height:1.05}
      .blog-preview-tags{display:flex;gap:6px;flex-wrap:wrap}
      .blog-preview-tags span{font-size:11px;color:#111;background:#fea800;padding:5px 8px;font-weight:700}
      .blog-preview-section{padding-top:12px;border-top:1px solid rgba(255,255,255,.08);display:grid;gap:8px}
      .blog-preview-section h4{margin:0;font-size:15px}
      .blog-preview-section p,.blog-preview-section li{color:#c8c8c8;font-size:12px;line-height:1.6}
      .blog-preview-section ul{padding-left:18px;margin:0}
      #blogPostList{display:grid;gap:12px}
      #blogPostList .blog-list-item{border-top:1px solid var(--c-border)}
      #blogPostList .blog-thumb{overflow:hidden;background:#111}
      #blogPostList .blog-thumb img{width:100%;height:100%;object-fit:cover;filter:none}
      @media(max-width:980px){.blog-editor-grid,.blog-editor-row{grid-template-columns:1fr}.blog-editor-preview{position:static}.modal.blog-editor-modal{width:calc(100vw - 24px)}}
    `;
    document.head.appendChild(style);
  }

  function getFormValue(name) {
    const field = document.querySelector(`[data-blog-field="${name}"]`);
    return field ? field.value.trim() : "";
  }

  function setFormValue(name, value) {
    const field = document.querySelector(`[data-blog-field="${name}"]`);
    if (field) field.value = value || "";
  }

  function collectSectionsFromDom() {
    document.querySelectorAll("[data-blog-section-id]").forEach(sectionEl => {
      const section = state.sections.find(item => item.id === sectionEl.dataset.blogSectionId);
      if (!section) return;
      section.heading = sectionEl.querySelector('[data-blog-section-field="heading"]')?.value || "";
      section.details = sectionEl.querySelector('[data-blog-section-field="details"]')?.value || "";
      section.bullets = Array.from(sectionEl.querySelectorAll("[data-blog-bullet]")).map(input => input.value);
    });
  }

  function renderSections() {
    const mount = document.getElementById("blogSectionsMount");
    if (!mount) return;
    mount.innerHTML = state.sections.map((section, index) => `
      <div class="blog-editor-section" data-blog-section-id="${esc(section.id)}">
        <div class="blog-editor-section-head">
          <div class="blog-editor-section-title">Content Section ${String(index + 1).padStart(2, "0")}</div>
          <button type="button" class="btn btn-danger blog-editor-mini" data-blog-section-delete="${esc(section.id)}" ${state.sections.length <= 1 ? "disabled" : ""}>Delete</button>
        </div>
        <label class="blog-editor-field"><div class="editor-label">Sub Heading</div><input class="editor-input" data-blog-section-field="heading" value="${esc(section.heading)}" placeholder="What this section explains" /></label>
        <label class="blog-editor-field"><div class="editor-label">Detail</div><textarea class="editor-input editor-textarea" data-blog-section-field="details" style="min-height:112px" placeholder="Write the section detail here...">${esc(section.details)}</textarea></label>
        <div class="blog-editor-field">
          <div class="editor-label">Bullet Points</div>
          <div class="blog-editor-bullets">
            ${(section.bullets.length ? section.bullets : [""]).map((point, bulletIndex) => `
              <div class="blog-editor-bullet-row">
                <input class="editor-input" data-blog-bullet="${bulletIndex}" value="${esc(point)}" placeholder="Add one point" />
                <button type="button" class="btn btn-outline blog-editor-mini" data-blog-bullet-delete="${bulletIndex}" data-section-id="${esc(section.id)}">Remove</button>
              </div>
            `).join("")}
          </div>
          <button type="button" class="btn btn-outline blog-editor-mini" data-blog-bullet-add="${esc(section.id)}">+ Add Point</button>
        </div>
      </div>
    `).join("");
  }

  function getPostDraft() {
    collectSectionsFromDom();
    const title = getFormValue("title");
    const slug = getFormValue("slug") || slugify(title);
    const tags = getFormValue("tags").split(",").map(item => item.trim()).filter(Boolean);
    return {
      title,
      slug,
      articleSection: getFormValue("articleSection"),
      metaTitle: getFormValue("metaTitle"),
      metaDescription: getFormValue("metaDescription"),
      excerpt: getFormValue("excerpt"),
      intro: getFormValue("intro"),
      image: state.image || getFormValue("image"),
      imageAlt: getFormValue("imageAlt") || `${title} featured image`,
      dateValue: getFormValue("dateValue") || new Date().toISOString().slice(0, 10),
      author: getFormValue("author") || "Webx Design Studio",
      tags,
      keywords: getFormValue("keywords").split(",").map(item => item.trim()).filter(Boolean),
      status: getFormValue("status") || "published",
      sections: state.sections.map(section => ({
        heading: section.heading,
        details: section.details,
        bullets: section.bullets.map(point => point.trim()).filter(Boolean)
      })).filter(section => section.heading || section.details || section.bullets.length)
    };
  }

  function renderPreview() {
    const preview = document.getElementById("blogEditorPreview");
    if (!preview) return;
    const post = getPostDraft();
    preview.innerHTML = `
      <div class="blog-editor-preview-head">
        <div>
          <div class="editor-label" style="margin:0">Live Preview</div>
          <div class="blog-editor-muted">Visual check before publishing</div>
        </div>
        <span class="badge ${post.status === "draft" ? "badge-gray" : "badge-green"}">${esc(post.status || "published")}</span>
      </div>
      <div class="blog-preview-card">
        <img src="${esc(post.image || "/assets/images/blogs/blog-img-1.png")}" alt="${esc(post.imageAlt)}" />
        <div class="blog-preview-body">
          <div class="blog-preview-title">${esc(post.title || "New blog title")}</div>
          <div class="blog-editor-muted">${esc(post.dateValue)} | ${esc(post.author)}</div>
          ${post.articleSection ? `<div class="blog-preview-meta">${esc(post.articleSection)}</div>` : ""}
          <div class="blog-preview-tags">${post.tags.slice(0, 5).map(tag => `<span>${esc(tag)}</span>`).join("")}</div>
          ${post.keywords.length ? `<div class="blog-preview-keywords" style="color:var(--c-muted);font-size:12px;margin-top:6px">Keywords: ${post.keywords.map(keyword => `${esc(keyword)}`).join(", ")}</div>` : ""}
          <p class="blog-editor-muted">${esc(post.intro || post.excerpt || "Intro preview will appear here.")}</p>
          ${post.sections.slice(0, 3).map(section => `
            <div class="blog-preview-section">
              <h4>${esc(section.heading || "Sub heading")}</h4>
              <p>${esc(section.details || "Section detail preview")}</p>
              ${section.bullets.length ? `<ul>${section.bullets.map(point => `<li>${esc(point)}</li>`).join("")}</ul>` : ""}
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function enhanceModal() {
    const modal = document.querySelector("#modal-newBlog .modal");
    if (!modal) return;
    modal.classList.add("blog-editor-modal");
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title" style="display:flex;align-items:center;gap:10px">
          <img src="https://api.iconify.design/tabler/pencil-plus.svg" alt="" style="width:20px;height:20px;filter:brightness(0) invert(0.7)" /> New Blog Post
        </div>
        <span class="modal-close" onclick="closeModal('newBlog')">x</span>
      </div>
      <div class="blog-editor-shell">
        <div class="blog-editor-grid">
          <div class="blog-editor-panel">
            <div class="blog-editor-form">
              <div class="blog-editor-row">
                <label class="blog-editor-field blog-editor-full"><div class="editor-label">Post Title</div><input class="editor-input" data-blog-field="title" placeholder="Enter blog title..." /></label>
                <label class="blog-editor-field"><div class="editor-label">Slug</div><input class="editor-input" data-blog-field="slug" placeholder="auto-generated-from-title" /></label>
                <label class="blog-editor-field"><div class="editor-label">Date</div><input class="editor-input" type="date" data-blog-field="dateValue" /></label>
                <label class="blog-editor-field"><div class="editor-label">Author</div><input class="editor-input" data-blog-field="author" value="Webx Design Studio" /></label>
                <label class="blog-editor-field"><div class="editor-label">Status</div><select class="editor-input" data-blog-field="status"><option value="published">Published</option><option value="draft">Draft</option></select></label>
                <label class="blog-editor-field"><div class="editor-label">Article Category</div><input class="editor-input" data-blog-field="articleSection" placeholder="UX/UI Design" /></label>
                <label class="blog-editor-field blog-editor-full"><div class="editor-label">SEO Title</div><input class="editor-input" data-blog-field="metaTitle" placeholder="Browser title" /></label>
                <label class="blog-editor-field blog-editor-full"><div class="editor-label">Meta Description</div><textarea class="editor-input editor-textarea" data-blog-field="metaDescription" style="min-height:82px"></textarea></label>
                <label class="blog-editor-field blog-editor-full"><div class="editor-label">SEO Tags (comma separated)</div><input class="editor-input" data-blog-field="tags" placeholder="ui ux design, product design, conversion" /></label>
                <label class="blog-editor-field blog-editor-full"><div class="editor-label">SEO Keywords (comma separated)</div><input class="editor-input" data-blog-field="keywords" placeholder="ux design, seo, conversion" /></label>
                <label class="blog-editor-field blog-editor-full"><div class="editor-label">Short Excerpt</div><textarea class="editor-input editor-textarea" data-blog-field="excerpt" style="min-height:82px"></textarea></label>
                <label class="blog-editor-field blog-editor-full"><div class="editor-label">Intro Detail</div><textarea class="editor-input editor-textarea" data-blog-field="intro" style="min-height:120px"></textarea></label>
                <div class="blog-editor-field blog-editor-full">
                  <div class="editor-label">Featured Image</div>
                  <div class="blog-editor-upload" id="blogImageDrop">
                    <img id="blogImagePreview" src="/assets/images/blogs/blog-img-1.png" alt="" />
                    <div class="blog-editor-muted">Click or drop an image here. PNG, JPG, WEBP, GIF supported.</div>
                    <input type="file" accept="image/*" id="blogImageInput" hidden />
                  </div>
                </div>
                <label class="blog-editor-field"><div class="editor-label">Image URL</div><input class="editor-input" data-blog-field="image" placeholder="/assets/images/..." /></label>
                <label class="blog-editor-field"><div class="editor-label">Image Alt</div><input class="editor-input" data-blog-field="imageAlt" /></label>
              </div>
              <div class="blog-editor-section-head">
                <div>
                  <div class="editor-label" style="margin:0">Sub Heading Sections</div>
                  <div class="blog-editor-muted">Add detail and bullet points section by section.</div>
                </div>
                <button type="button" class="btn btn-primary blog-editor-mini" id="blogAddSectionBtn">+ Add Section</button>
              </div>
              <div id="blogSectionsMount"></div>
            </div>
          </div>
          <aside class="blog-editor-preview" id="blogEditorPreview"></aside>
        </div>
        <div class="blog-editor-actions">
          <div class="blog-editor-actions-primary">
            <button class="btn btn-primary" type="button" id="blogPublishBtn"><img src="https://api.iconify.design/tabler/device-floppy.svg" alt="" /> Save All</button>
            <button class="btn btn-danger" type="button" id="blogDeleteBtn" disabled><img src="https://api.iconify.design/tabler/trash.svg" alt="" /> Delete Blog</button>
          </div>
          <div class="blog-editor-actions-secondary">
            <button class="btn btn-outline" type="button" id="blogPreviewBtn">Preview Full Page</button>
            <button class="btn btn-outline" type="button" id="blogResetBtn">Reset</button>
            <button class="btn btn-outline" type="button" onclick="closeModal('newBlog')">Cancel</button>
          </div>
        </div>
      </div>
    `;
    resetEditor();
  }

  function appendBlogToDashboard(post) {
    loadBlogList();
  }

  function createBlogListItem(post) {
    const tags = (post.tags || []).slice(0, 3);
    return `<div class="blog-list-item" data-blog-id="${esc(post.id)}">
      <div class="blog-thumb"><img src="${esc(post.image || '/assets/images/blogs/blog-img-1.png')}" alt="${esc(post.title)}" /></div>
      <div class="blog-list-content">
        <div class="blog-title-text">${esc(post.title)}</div>
        <div class="blog-meta-text">${esc(post.status)} • ${esc(post.dateLabel || post.dateValue)} • ${esc(tags.join(', '))}</div>
        <div class="blog-excerpt">${esc(post.excerpt || post.intro || 'Click to edit full blog content')}</div>
      </div>
      <div class="blog-item-actions">
        <span class="badge ${post.status === "draft" ? "badge-gray" : "badge-green"}">${esc(post.status)}</span>
        <button class="action-btn edit" type="button" data-blog-action="edit" data-blog-id="${esc(post.id)}">Edit</button>
        <button class="action-btn delete" type="button" data-blog-action="delete" data-blog-id="${esc(post.id)}">Delete</button>
      </div>
    </div>`;
  }

  function renderBlogList(posts) {
    const list = document.getElementById("blogPostList");
    if (!list) return;
    if (!posts.length) {
      list.innerHTML = '<div class="blog-list-empty">No blog posts found. Click “New Post” to add your first article.</div>';
      return;
    }
    list.innerHTML = posts.map(createBlogListItem).join("\n");
  }

  async function loadBlogList() {
    const list = document.getElementById("blogPostList");
    if (list) list.innerHTML = '<div class="blog-list-empty">Loading blog posts…</div>';
    try {
      const payload = await api("/api/admin/blogs", { method: "GET" });
      state.blogs = Array.isArray(payload.blogs) ? payload.blogs : [];
      renderBlogList(state.blogs);
    } catch (error) {
      // Try static fallback: load blogs from data/store.json (for static deployments)
      try {
        const res = await fetch('/data/store.json', { credentials: 'same-origin' });
        const store = await res.json();
        let posts = [];
        if (store && store.pages && store.pages.home && Array.isArray(store.pages.home.sections)) {
          const blogsSection = store.pages.home.sections.find(s => s.type === 'blogs');
          if (blogsSection && Array.isArray(blogsSection.items)) posts = blogsSection.items;
        }
        // Normalize posts to expected shape
        state.blogs = (posts || []).map(p => ({
          id: p.id || p.slug || p.url || Math.random().toString(36).slice(2,9),
          title: p.title || 'Untitled',
          image: p.image || '',
          imageAlt: p.imageAlt || (p.title ? `${p.title} featured image` : ''),
          dateLabel: p.dateLabel || p.dateValue || '',
          dateValue: p.dateValue || '',
          excerpt: p.excerpt || p.intro || '',
          url: p.url || '',
          tags: Array.isArray(p.tags) ? p.tags : [],
          status: p.status || 'published',
          sections: p.sections || []
        }));
        renderBlogList(state.blogs);
        return;
      } catch (err) {
        if (list) list.innerHTML = `<div class="blog-list-empty">Failed to load blogs: ${esc(error.message)}</div>`;
      }
    }
  }

  function fillEditorFromPost(post) {
    state.currentBlogId = post.id || null;
    state.image = post.image || "";
    state.sections = (Array.isArray(post.sections) && post.sections.length ? post.sections : [{ id: createId("blog-section"), heading: "", details: "", bullets: [""] }]).map(section => ({
      id: section.id || createId("blog-section"),
      heading: section.heading || "",
      details: section.details || "",
      bullets: Array.isArray(section.bullets) && section.bullets.length ? section.bullets : [""]
    }));
    setFormValue("title", post.title || "");
    setFormValue("slug", post.slug || "");
    setFormValue("metaTitle", post.metaTitle || "");
    setFormValue("metaDescription", post.metaDescription || "");
    setFormValue("excerpt", post.excerpt || "");
    setFormValue("intro", post.intro || "");
    setFormValue("image", post.image || "");
    setFormValue("imageAlt", post.imageAlt || (post.title ? `${post.title} featured image` : ""));
    setFormValue("dateValue", post.dateValue || new Date().toISOString().slice(0, 10));
    setFormValue("author", post.author || "Webx Design Studio");
    setFormValue("tags", (post.tags || []).join(", "));
    setFormValue("keywords", (post.keywords || []).join(", "));
    setFormValue("status", post.status || "published");
    setFormValue("articleSection", post.articleSection || "");
    const preview = document.getElementById("blogImagePreview");
    if (preview) preview.src = post.image || "/assets/images/blogs/blog-img-1.png";
    renderSections();
    renderPreview();
    const saveButton = document.getElementById("blogPublishBtn");
    if (saveButton) saveButton.innerHTML = post.id ? '<img src="https://api.iconify.design/tabler/device-floppy.svg" alt="" /> Save All' : '<img src="https://api.iconify.design/tabler/device-floppy.svg" alt="" /> Save All';
    const deleteButton = document.getElementById("blogDeleteBtn");
    if (deleteButton) deleteButton.disabled = !post.id;
  }

  function openBlogEditor(blogId) {
    state.currentBlogId = null;
    const post = state.blogs.find(item => item.id === blogId);
    if (post) {
      fillEditorFromPost(post);
    } else {
      resetEditor();
    }
    if (typeof window.showModal === "function") window.showModal("newBlog");
  }

  function resetEditor() {
    state.currentBlogId = null;
    state.image = "";
    state.sections = [{ id: createId("blog-section"), heading: "", details: "", bullets: [""] }];
    const today = new Date().toISOString().slice(0, 10);
    setFormValue("title", "");
    setFormValue("slug", "");
    setFormValue("metaTitle", "");
    setFormValue("metaDescription", "");
    setFormValue("excerpt", "");
    setFormValue("intro", "");
    setFormValue("keywords", "");
    setFormValue("image", "");
    setFormValue("imageAlt", "");
    setFormValue("dateValue", today);
    setFormValue("author", "Webx Design Studio");
    setFormValue("tags", "");
    setFormValue("status", "published");
    setFormValue("articleSection", "");
    renderSections();
    renderPreview();
    const deleteButton = document.getElementById("blogDeleteBtn");
    if (deleteButton) deleteButton.disabled = true;
  }

  async function submitBlog() {
    const button = document.getElementById("blogPublishBtn");
    const post = getPostDraft();
    if (!post.title) return toast("Blog title is required", "lock");
    if (!post.intro && !post.sections.length) return toast("Add intro or at least one section", "lock");
    if (button) {
      button.disabled = true;
      button.innerHTML = "Saving...";
    }
    try {
      const method = state.currentBlogId ? "PUT" : "POST";
      const url = state.currentBlogId ? `/api/admin/blogs/${encodeURIComponent(state.currentBlogId)}` : "/api/admin/blogs";
      const payload = await api(url, { method, body: JSON.stringify(post) });
      state.currentBlogId = payload.post?.id || state.currentBlogId;
      await loadBlogList();
      if (typeof window.closeModal === "function") window.closeModal("newBlog");
      toast(state.currentBlogId && method === "PUT" ? "Blog updated successfully" : "Blog created and published", "check", true);
    } catch (error) {
      toast(error.message || "Blog save failed", "lock");
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = '<img src="https://api.iconify.design/tabler/device-floppy.svg" alt="" /> Save All';
      }
    }
  }

  function buildBlogPreviewHtml(post) {
    const keywords = post.keywords.length ? post.keywords.join(", ") : post.tags.join(", ");
    const tags = [...(post.articleSection ? [post.articleSection] : []), ...post.tags];
    const tagMarkup = tags.map(tag => `<span class="blog-tag" style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;font-size:12px;background:rgba(254,168,0,0.12);color:#fea800;margin:0 6px 6px 0;">${esc(tag)}</span>`).join("\n          ");
    const sectionMarkup = post.sections.map((section, index) => `
      <section style="margin-bottom:28px">
        <h2 style="font-size:clamp(18px,2vw,22px);margin-bottom:12px;color:#fff;">${esc(section.heading || `Section ${index + 1}`)}</h2>
        ${section.details ? `<p style="color:rgba(255,255,255,0.78);line-height:1.8;margin-bottom:14px">${esc(section.details).replace(/\n\n+/g, "</p><p style='color:rgba(255,255,255,0.78);line-height:1.8;margin-bottom:14px'>").replace(/\n/g, "<br>")}</p>` : ""}
        ${section.bullets.length ? `<ul style="color:rgba(255,255,255,0.78);line-height:1.8;margin-left:18px">${section.bullets.map(point => `<li style="margin-bottom:10px">${esc(point)}</li>`).join("")}</ul>` : ""}
      </section>`).join("");
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(post.metaTitle || post.title)}</title>
<meta name="description" content="${esc(post.metaDescription || post.excerpt || post.intro)}" />
<meta name="keywords" content="${esc(keywords)}" />
<meta name="author" content="${esc(post.author)}" />
<link rel="stylesheet" href="/css/style.css" />
<style>body{background:#050505;color:#f8f8f8;min-height:100vh;margin:0;font-family:Inter,system-ui,sans-serif}main{padding:32px;max-width:1180px;margin:0 auto} .blog-hero-image{width:100%;height:auto;border-radius:28px;object-fit:cover;display:block;margin-bottom:32px} .blog-title{font-size:clamp(36px,4vw,56px);line-height:1.02;margin-bottom:18px;max-width:780px;} .blog-tags-wrapper{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px;} .blog-info{color:rgba(255,255,255,0.68);font-size:13px;letter-spacing:0.02em;margin-bottom:32px;} .blog-intro{font-size:clamp(18px,2vw,22px);line-height:1.8;color:rgba(255,255,255,0.88);max-width:840px;margin-bottom:36px;} .blog-tag{display:inline-flex;align-items:center;gap:6px;padding:10px 14px;border-radius:999px;background:rgba(254,168,0,0.12);color:#fea800;font-size:12px;margin:0}.blog-keyword-row{color:rgba(255,255,255,0.6);font-size:13px;margin-bottom:24px;}</style>
</head>
<body>
<main>
  <article>
    ${post.image ? `<img src="${esc(post.image)}" alt="${esc(post.imageAlt)}" class="blog-hero-image" />` : ""}
    <div class="blog-tags-wrapper">${tagMarkup}</div>
    <h1 class="blog-title">${esc(post.title)}</h1>
    <div class="blog-info">${esc(post.dateLabel)} · ${esc(post.author)}</div>
    ${post.intro ? `<p class="blog-intro">${esc(post.intro).replace(/\n\n+/g, "</p><p class='blog-intro'>").replace(/\n/g, "<br>")}</p>` : ""}
    ${post.keywords.length ? `<div class="blog-keyword-row">Keywords: ${post.keywords.map(keyword => esc(keyword)).join(", ")}</div>` : ""}
    ${sectionMarkup}
  </article>
</main>
</body>
</html>`;
  }

  function previewBlog() {
    const post = getPostDraft();
    if (!post.title) return toast("Enter a title before previewing", "lock");
    const previewWindow = window.open("", "_blank");
    if (!previewWindow) return toast("Please allow popups to preview the blog", "lock");
    previewWindow.document.write(buildBlogPreviewHtml(post));
    previewWindow.document.close();
  }

  function wireEvents() {
    document.addEventListener("input", event => {
      if (event.target.matches('[data-blog-field="title"]')) {
        const slug = document.querySelector('[data-blog-field="slug"]');
        const metaTitle = document.querySelector('[data-blog-field="metaTitle"]');
        if (slug && !slug.value) slug.value = slugify(event.target.value);
        if (metaTitle && !metaTitle.value) metaTitle.value = `${event.target.value} | Webx Design Studio`;
      }
      if (event.target.closest("#modal-newBlog")) renderPreview();
    });

    document.addEventListener("click", async event => {
      if (event.target.closest("#blogAddSectionBtn")) {
        collectSectionsFromDom();
        state.sections.push({ id: createId("blog-section"), heading: "", details: "", bullets: [""] });
        renderSections();
        renderPreview();
      }
      const sectionDelete = event.target.closest("[data-blog-section-delete]");
      if (sectionDelete) {
        collectSectionsFromDom();
        state.sections = state.sections.filter(section => section.id !== sectionDelete.dataset.blogSectionDelete);
        renderSections();
        renderPreview();
      }
      const bulletAdd = event.target.closest("[data-blog-bullet-add]");
      if (bulletAdd) {
        collectSectionsFromDom();
        const section = state.sections.find(item => item.id === bulletAdd.dataset.blogBulletAdd);
        if (section) section.bullets.push("");
        renderSections();
        renderPreview();
      }
      const bulletDelete = event.target.closest("[data-blog-bullet-delete]");
      if (bulletDelete) {
        collectSectionsFromDom();
        const section = state.sections.find(item => item.id === bulletDelete.dataset.sectionId);
        if (section) section.bullets.splice(Number(bulletDelete.dataset.blogBulletDelete), 1);
        renderSections();
        renderPreview();
      }
      const blogDelete = event.target.closest("[data-blog-action=delete]");
      if (blogDelete) {
        const blogId = blogDelete.dataset.blogId;
        if (!blogId) return;
        if (!window.confirm('Are you sure you want to delete this blog post?')) return;
        try {
          await api(`/api/admin/blogs/${encodeURIComponent(blogId)}`, { method: 'DELETE' });
          toast('Blog deleted', 'trash', true);
          await loadBlogList();
        } catch (error) {
          toast(error.message || 'Failed to delete blog', 'lock');
        }
        return;
      }

      const editorDelete = event.target.closest("#blogDeleteBtn");
      if (editorDelete) {
        if (!state.currentBlogId) return toast('No blog selected to delete', 'lock');
        if (!window.confirm('Delete this blog from the live site and all sections?')) return;
        try {
          await api(`/api/admin/blogs/${encodeURIComponent(state.currentBlogId)}`, { method: 'DELETE' });
          await loadBlogList();
          resetEditor();
          if (typeof window.closeModal === "function") window.closeModal('newBlog');
          toast('Blog deleted from site', 'trash', true);
        } catch (error) {
          toast(error.message || 'Failed to delete blog', 'lock');
        }
        return;
      }
      const blogEdit = event.target.closest("[data-blog-action=edit], .blog-list-item[data-blog-id]");
      if (blogEdit) {
        event.preventDefault();
        const blogId = blogEdit.dataset.blogId;
        if (blogId) openBlogEditor(blogId);
        return;
      }
      if (event.target.closest("#blogPreviewBtn")) previewBlog();
      if (event.target.closest("#blogPublishBtn")) await submitBlog();
      if (event.target.closest("#blogResetBtn")) resetEditor();
      if (event.target.closest("#blogImageDrop") && !event.target.closest("input")) {
        const input = document.getElementById("blogImageInput");
        if (input) input.click();
      }
    });

    document.addEventListener("change", async event => {
      if (event.target.id !== "blogImageInput" || !event.target.files || !event.target.files[0]) return;
      const drop = document.getElementById("blogImageDrop");
      try {
        if (drop) drop.classList.add("dragover");
        const url = await uploadImage(event.target.files[0]);
        state.image = url;
        setFormValue("image", url);
        const preview = document.getElementById("blogImagePreview");
        if (preview) preview.src = url;
        renderPreview();
        toast("Blog image uploaded", "upload", true);
      } catch (error) {
        toast(error.message || "Image upload failed", "lock");
      } finally {
        if (drop) drop.classList.remove("dragover");
        event.target.value = "";
      }
    });

    document.addEventListener("dragover", event => {
      const drop = event.target.closest("#blogImageDrop");
      if (!drop) return;
      event.preventDefault();
      drop.classList.add("dragover");
    });

    document.addEventListener("dragleave", event => {
      const drop = event.target.closest("#blogImageDrop");
      if (drop && !drop.contains(event.relatedTarget)) drop.classList.remove("dragover");
    });

    document.addEventListener("drop", async event => {
      const drop = event.target.closest("#blogImageDrop");
      if (!drop) return;
      event.preventDefault();
      drop.classList.remove("dragover");
      const file = event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files[0] : null;
      if (!file) return;
      try {
        const url = await uploadImage(file);
        state.image = url;
        setFormValue("image", url);
        const preview = document.getElementById("blogImagePreview");
        if (preview) preview.src = url;
        renderPreview();
        toast("Blog image uploaded", "upload", true);
      } catch (error) {
        toast(error.message || "Image upload failed", "lock");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureStyles();
    enhanceModal();
    wireEvents();
    loadBlogList();
    window.resetBlogEditor = () => {
      resetEditor();
    };
    window.openBlogEditor = (blogId) => {
      if (blogId) {
        openBlogEditor(blogId);
        return;
      }
      resetEditor();
      if (typeof window.showModal === "function") window.showModal("newBlog");
    };
  });
})();
