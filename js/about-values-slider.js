document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".about-values-section").forEach(function (section) {
        if (section.dataset.valuesSliderReady === "true") return;

        const track = section.querySelector(".about-values-grid");
        const cards = Array.from(section.querySelectorAll(".about-value-card"));
        const prev = section.querySelector(".about-values-prev");
        const next = section.querySelector(".about-values-next");
        const progress = section.querySelector(".about-values-progress-fill");
        if (!track || cards.length < 2 || !prev || !next) return;

        section.dataset.valuesSliderReady = "true";
        let page = 0;
        const cardsPerPage = 3;

        function isMobile() {
            return window.innerWidth <= 768;
        }

        function update() {
            if (!isMobile()) {
                page = 0;
                track.style.transform = "";
                prev.disabled = true;
                next.disabled = false;
                if (progress) progress.style.width = "";
                return;
            }

            const pageCount = Math.ceil(cards.length / cardsPerPage);
            page = Math.max(0, Math.min(page, pageCount - 1));
            const columnWidth = track.parentElement ? track.parentElement.clientWidth : track.clientWidth;
            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            track.style.transform = "translateX(-" + ((columnWidth + gap) * page) + "px)";
            prev.disabled = page === 0;
            next.disabled = page === pageCount - 1;
            if (progress) {
                progress.style.width = (pageCount > 1 ? page / (pageCount - 1) * 100 : 0) + "%";
            }
        }

        prev.addEventListener("click", function () {
            page -= 1;
            update();
        });

        next.addEventListener("click", function () {
            page += 1;
            update();
        });

        let resizeTimer;
        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(update, 120);
        });

        update();
    });
});
