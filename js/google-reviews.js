(function () {
  "use strict";

  var GOOGLE_REVIEWS_URL = "https://www.google.com/search?q=Webx+Design+Studio+Google+reviews";

  var reviews = [
    {
      author: "Morphico Designs",
      rating: 5,
      meta: "4 reviews",
      relativeTime: "3 months ago",
      avatarColor: "#6276c8",
      text: "Great output by piyush sir. His ability to take feedback and turn it around is really phenomenal. Great attention to detail. Would be great to work with him again."
    },
    {
      author: "Invisible World Poetry",
      rating: 5,
      meta: "3 reviews",
      relativeTime: "3 months ago",
      avatarColor: "#0097a7",
      text: "WebX Designs is easily one of the best design studios to work with. Piyush is an absolute pleasure to collaborate with. He's intuitive, brings a great attitude to every interaction, and genuinely puts in the effort to understand client needs and deliver accordingly."
    },
    {
      author: "Irfan Shaikh",
      rating: 5,
      meta: "Local Guide · 91 reviews · 38 photos",
      relativeTime: "3 months ago",
      avatarImage: "/assets/images/blogs/auther-imag-ab.webp",
      text: "We improved out customers ESAT by 30% by implementing good UI UX journeys.\n\nHighly recommend Design agency."
    },
    {
      author: "sujit metaliya",
      rating: 5,
      meta: "3 reviews",
      relativeTime: "3 months ago",
      avatarColor: "#5e35b1",
      text: "Excellent work"
    }
  ];

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function clampRating(value) {
    var rating = Number(value);
    return Number.isFinite(rating) ? Math.max(0, Math.min(5, Math.round(rating))) : 5;
  }

  function renderStars(rating) {
    var count = clampRating(rating);
    return Array.from({ length: 5 }, function (_, index) {
      return '<span class="google-review-star' + (index < count ? " is-filled" : "") + '" aria-hidden="true">&#9733;</span>';
    }).join("");
  }

  function buildWordmark() {
    return '<div class="google-wordmark" aria-label="Google"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span></div>';
  }

  function buildReviewCard(review) {
    var initials = String(review.author || "G").trim().split(/\s+/).map(function (part) {
      return part.charAt(0);
    }).join("").slice(0, 2).toUpperCase();
    var avatarStyle = review.avatarColor ? ' style="background:' + escapeHtml(review.avatarColor) + ';color:#fff"' : "";
    var avatar = review.avatarImage
      ? '<img src="' + escapeHtml(review.avatarImage) + '" alt="" class="google-review-avatar-img" loading="lazy">'
      : '<span>' + escapeHtml(initials || "G") + '</span>';

    return [
      '<article class="google-review-card">',
      '  <div class="google-review-card-head">',
      '    <div class="google-review-avatar"' + avatarStyle + '>' + avatar + '</div>',
      '    <div class="google-review-person">',
      '      <div class="google-review-author-row"><h3 class="google-review-author">' + escapeHtml(review.author) + '</h3></div>',
      '      <div class="google-review-source">' + escapeHtml(review.meta || "") + '</div>',
      '    </div>',
      '  </div>',
      '  <div class="google-review-rating-row"><div class="google-review-stars google-review-card-stars" aria-label="' + clampRating(review.rating) + ' out of 5 stars">' + renderStars(review.rating) + '</div><span class="google-review-date">' + escapeHtml(review.relativeTime) + '</span></div>',
      '  <p class="google-review-text">' + escapeHtml(review.text).replace(/\n/g, "<br>") + '</p>',
      '</article>'
    ].join("");
  }

  function buildSection() {
    return [
      '<section class="google-reviews-section animate-section" aria-label="Google reviews">',
      '  <div class="google-reviews-container">',
      '    <div class="google-reviews-header">',
      '      <div class="google-reviews-summary">' + buildWordmark(),
      '        <div class="google-rating-row"><span>5.0</span><span class="google-review-stars" aria-hidden="true">' + renderStars(5) + '</span><span class="google-review-count">(' + reviews.length + ' reviews)</span></div>',
      '      </div>',
      '      <a href="' + GOOGLE_REVIEWS_URL + '" class="google-review-button" target="_blank" rel="noopener">View on Google</a>',
      '    </div>',
      '    <div class="google-reviews-viewport"><div class="google-reviews-track" tabindex="0" aria-label="Google review carousel">' + reviews.map(buildReviewCard).join("") + '</div></div>',
      '    <div class="google-review-nav" aria-label="Review carousel pages"></div>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function initCarousel(section) {
    var track = section.querySelector(".google-reviews-track");
    var nav = section.querySelector(".google-review-nav");
    if (!track || !nav) return;
    var cards = Array.from(track.querySelectorAll(".google-review-card"));
    var dots = [];

    function cardStep() {
      if (!cards[0]) return 1;
      return cards[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).gap) || 0);
    }

    function pageCount() {
      var maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
      return Math.max(1, Math.ceil(maxScrollLeft / cardStep()) + 1);
    }

    function renderDots() {
      var count = pageCount();
      nav.innerHTML = "";
      dots = Array.from({ length: count }, function (_, index) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "google-review-dot" + (index === 0 ? " is-active" : "");
        button.setAttribute("aria-label", "Show review page " + (index + 1));
        button.addEventListener("click", function () {
          track.scrollTo({ left: index * cardStep(), behavior: "smooth" });
        });
        nav.appendChild(button);
        return button;
      });
      nav.hidden = count <= 1;
    }

    function updateDots() {
      if (!dots.length) return;
      var index = Math.max(0, Math.min(dots.length - 1, Math.round(track.scrollLeft / cardStep())));
      dots.forEach(function (dot, dotIndex) { dot.classList.toggle("is-active", dotIndex === index); });
    }

    track.addEventListener("scroll", function () { window.requestAnimationFrame(updateDots); }, { passive: true });
    window.addEventListener("resize", function () { renderDots(); updateDots(); });
    renderDots();
  }

  function insertSection() {
    var impactSection = document.querySelector(".impact-section");
    if (!impactSection || document.querySelector(".google-reviews-section")) return;
    impactSection.insertAdjacentHTML("afterend", buildSection());
    initCarousel(impactSection.nextElementSibling);
  }

  document.addEventListener("DOMContentLoaded", insertSection);
})();
