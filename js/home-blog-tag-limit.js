document.addEventListener("DOMContentLoaded", function () {
    const maxTags = 4;

    function limitHomeBlogTags() {
        document.querySelectorAll("main .home-blog-tags-limited, main .blog-section[aria-label='Latest blog posts'] .blog-tags").forEach(function (tags) {
            tags.classList.add("home-blog-tags-limited");
            Array.from(tags.querySelectorAll(".blog-tag")).slice(maxTags).forEach(function (tag) {
                tag.remove();
            });
        });
    }

    limitHomeBlogTags();

    const main = document.querySelector("main");
    if (main) new MutationObserver(limitHomeBlogTags).observe(main, { childList: true, subtree: true });
});
