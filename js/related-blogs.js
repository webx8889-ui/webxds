(() => {
  const posts = [
    { slug: 'top-ui-ux-design-trends-2026', title: 'Top UI/UX Design Trends for 2026', category: 'UX/UI Design', date: '29 Aug 26', image: '/assets/images/blogs/ui-ux-design-trends-2026-cover.png', href: '/pages/blogs/top-ui-ux-design-trends-2026.html', alt: 'Top UI/UX Design Trends 2026 editorial cover with orange and violet abstract glass sculpture' },
    { slug: 'ai-voice-assistant-form-fields', title: 'AI Voice Assistant Form Fields: A UX Guide for Natural Conversations', category: 'AI & UX', date: '22 Aug 26', image: '/assets/images/blogs/ai-voice-assistant-form-fields.webp', href: '/pages/blogs/ai-voice-assistant-form-fields.html', alt: 'AI voice assistant form fields UX guide' },
    { slug: 'blog-what-makes-a-great-website-2026', title: 'What Makes a Great Website in 2026?', category: 'Web Design', date: '13 Aug 26', image: '/assets/images/blogs/blog-img-great-website-2026.png', href: '/pages/blogs/blog-what-makes-a-great-website-2026.html', alt: 'Mobile-first, fast, accessible and AI-readable website concept' },
    { slug: 'blog-dark-mode-vs-light-mode', title: 'Dark Mode vs Light Mode: Which Improves User Experience?', category: 'UX/UI Design', date: '24 Jun 26', image: '/assets/images/blogs/blog-img-light-dark-mode.png', href: '/pages/blogs/blog-dark-mode-vs-light-mode.html', alt: 'Dark mode versus light mode UX decision guide' },
    { slug: 'blog-agentic-ux-design', title: 'Agentic UX Design: How to Design Interfaces for AI Agents in 2026', category: 'AI & UX', date: '06 Jun 26', image: '/assets/images/blogs/blog-img-5.png', href: '/pages/blogs/blog-agentic-ux-design.html', alt: 'Agentic UX design for AI agents and adaptive interfaces' },
    { slug: 'high-converting-landing-page-2026', title: 'How to Design a High-Converting Landing Page in 2026', category: 'UX & CRO', date: '18 Feb 26', image: '/assets/images/blogs/blog-img-3.webp', href: '/pages/blogs/high-converting-landing-page-2026.html', alt: 'High-converting landing page UX design guide' },
    { slug: 'website-redesign-checklist-2026', title: '10 Signs It’s Time to Redesign Your Website in 2026', category: 'Web Design', date: '18 Feb 26', image: '/assets/images/blogs/blog-img-4.webp', href: '/pages/blogs/website-redesign-checklist-2026.html', alt: 'Website redesign checklist for 2026' },
    { slug: 'ai-driven-personalization-ux-design-2026', title: 'AI-Driven Personalization: The UX/UI Trend Your Business Cannot Ignore', category: 'AI & UX', date: '07 Feb 26', image: '/assets/images/blogs/blog-img-1.webp', href: '/pages/blogs/ai-driven-personalization-ux-design-2026.html', alt: 'AI-driven personalization in UX and UI design' },
    { slug: 'blog-apple', title: 'Apple’s Design Philosophy: Lessons for Digital Products', category: 'Product Design', date: '12 Jan 26', image: '/assets/images/blogs/blog-img-2.webp', href: '/pages/blogs/blog-apple.html', alt: 'Apple-inspired product design interface' }
  ];

  document.querySelectorAll('.related-blogs-section').forEach((section) => {
    const related = posts.filter((post) => post.slug !== section.dataset.current).slice(0, 3);
    section.innerHTML = `
      <div class="related-blogs-container">
        <div class="related-blogs-header">
          <p class="section-label">Keep Reading</p>
          <h2 class="section-title">Related blogs</h2>
        </div>
        <div class="related-blogs-grid" role="list">
          ${related.map((post) => `
            <article class="related-blog-card" role="listitem">
              <a class="related-blog-image" href="${post.href}" aria-label="Read ${post.title}">
                <img src="${post.image}" alt="${post.alt}" width="400" height="240" loading="lazy" />
              </a>
              <div class="related-blog-content">
                <p class="related-blog-meta"><span>${post.category}</span><time>${post.date}</time></p>
                <h3><a href="${post.href}">${post.title}</a></h3>
                <a class="related-blog-link" href="${post.href}">Read article <span aria-hidden="true">↗</span></a>
              </div>
            </article>`).join('')}
        </div>
      </div>`;
  });

  document.querySelectorAll('main > .blog-section.animate-section').forEach((section) => section.remove());
})();
