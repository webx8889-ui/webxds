(function () {
  "use strict";

  var REVIEW_CONFIG = {
    apiEndpoint: "/api/google-reviews",
    mapsUrl: "https://www.google.com/search?q=Webx+Design+Studio+Google+reviews"
  };

  var fallbackReviews = [
    { author: "Jyoti Kamble", rating: 5, relativeTime: "2 months ago", text: "Great support by Avinash. Thanks for the quick help." },
    { author: "Aditya Kumar Singh", rating: 5, relativeTime: "2 weeks ago", text: "Good customer support." },
    { author: "Sandesh Patil", rating: 5, relativeTime: "a month ago", text: "Thanks for the quick support." },
    { author: "Anirudh Vasudevan", rating: 5, relativeTime: "a month ago", text: "Amazing!" },
    { author: "Irfan N. Shaikh", rating: 5, relativeTime: "3 months ago", text: "A dependable team with a strong workflow and polished execution." },
    { author: "Archit Sankhe", rating: 5, relativeTime: "4 months ago", text: "The collaboration was smooth, strategic, and detail-driven." }
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

  function normalizeReviews(items) {
    if (!Array.isArray(items) || !items.length) return fallbackReviews;
    return items.slice(0, 12).map(function (item) {
      return {
        author: item.author_name || item.author || "Google user",
        rating: item.rating || 5,
        relativeTime: item.relative_time_description || item.relativeTime || "Google review",
        text: item.text || item.review || "",
        profilePhotoUrl: item.profile_photo_url || item.profilePhotoUrl || ""
      };
    }).filter(function (item) { return item.text; });
  }

  function buildReviewCard(review) {
    var initials = String(review.author || "G").trim().split(/\s+/).map(function (part) {
      return part.charAt(0);
    }).join("").slice(0, 2).toUpperCase();
    var photo = review.profilePhotoUrl
      ? '<img src="' + escapeHtml(review.profilePhotoUrl) + '" alt="" class="google-review-avatar-img" loading="lazy">'
      : '<span>' + escapeHtml(initials || "G") + '</span>';

    return [
      '<article class="google-review-card">',
      '  <div class="google-review-card-head">',
      '    <div class="google-review-avatar">' + photo + '</div>',
      '    <div class="google-review-person">',
      '      <div class="google-review-author-row"><h3 class="google-review-author">' + escapeHtml(review.author) + '</h3><span class="google-verified" title="Verified Google review" aria-label="Verified Google review">&#10003;</span></div>',
      '      <div class="google-review-source"><span class="google-g-icon" aria-hidden="true">G</span><span>' + escapeHtml(review.relativeTime) + '</span></div>',
      '    </div>',
      '  </div>',
      '  <div class="google-review-stars google-review-card-stars" aria-label="' + clampRating(review.rating) + ' out of 5 stars">' + renderStars(review.rating) + '</div>',
      '  <p class="google-review-text">' + escapeHtml(review.text) + '</p>',
      '</article>'
    ].join("");
  }

  function buildWordmark() {
    return '<div class="google-wordmark" aria-label="Google"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span></div>';
  }

  function buildSection(payload) {
    var reviews = normalizeReviews(payload && payload.reviews);
    var rating = payload && payload.rating ? Number(payload.rating).toFixed(1) : "4.7";
    var total = payload && payload.user_ratings_total ? payload.user_ratings_total : 18;
    var mapsUrl = payload && payload.mapsUrl ? payload.mapsUrl : REVIEW_CONFIG.mapsUrl;

    return [
      '<section class="google-reviews-section animate-section" aria-label="Google reviews">',
      '  <div class="google-reviews-container">',
      '    <div class="google-reviews-header">',
      '      <div class="google-reviews-summary">' + buildWordmark(),
      '        <div class="google-rating-row"><span>' + escapeHtml(rating) + '</span><span class="google-review-stars" aria-hidden="true">' + renderStars(Math.round(Number(rating) || 5)) + '</span><span class="google-review-count">(' + escapeHtml(total) + ')</span></div>',
      '      </div>',
      '      <a href="' + escapeHtml(mapsUrl) + '" class="google-review-button" target="_blank" rel="noopener">Review us on Google</a>',
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
      var visibleCards = Math.max(1, Math.floor((track.clientWidth + 1) / cardStep()));
      return Math.max(1, cards.length - visibleCards + 1);
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
      var index = Math.min(dots.length - 1, Math.round(track.scrollLeft / cardStep()));
      dots.forEach(function (dot, dotIndex) { dot.classList.toggle("is-active", dotIndex === index); });
    }

    track.addEventListener("scroll", function () { window.requestAnimationFrame(updateDots); }, { passive: true });
    window.addEventListener("resize", function () { renderDots(); updateDots(); });
    renderDots();
  }

  function insertSection(payload) {
    var impactSection = document.querySelector(".impact-section");
    if (!impactSection || document.querySelector(".google-reviews-section")) return;
    impactSection.insertAdjacentHTML("afterend", buildSection(payload));
    initCarousel(impactSection.nextElementSibling);
  }

  function initGoogleReviews() {
    if (document.querySelector(".google-reviews-section")) return;
    fetch(REVIEW_CONFIG.apiEndpoint, { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("Google reviews API not configured");
        return response.json();
      })
      .then(insertSection)
      .catch(function () { insertSection(null); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initGoogleReviews();
    window.setTimeout(initGoogleReviews, 800);
  });
})();
