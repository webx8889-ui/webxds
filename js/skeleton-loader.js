(function () {
    "use strict";

    if (window.__webxSkeletonLoaderReady) return;
    window.__webxSkeletonLoaderReady = true;

    var startedAt = Date.now();
    var minVisibleMs = 650;
    var maxVisibleMs = 1800;

    function createLine(width, className) {
        var line = document.createElement("span");
        line.className = "webx-skeleton-line" + (className ? " " + className : "");
        if (width) line.style.setProperty("--line-width", width);
        return line;
    }

    function createPostBlock(isSecond) {
        var block = document.createElement("div");
        block.className = "webx-skeleton-post" + (isSecond ? " webx-skeleton-post-small" : "");

        var author = document.createElement("div");
        author.className = "webx-skeleton-author";
        author.appendChild(document.createElement("span")).className = "webx-skeleton-avatar";

        var meta = document.createElement("div");
        meta.className = "webx-skeleton-meta";
        meta.appendChild(createLine("48%", "webx-skeleton-meta-line"));
        meta.appendChild(createLine("26%", "webx-skeleton-meta-line"));
        author.appendChild(meta);

        var text = document.createElement("div");
        text.className = "webx-skeleton-copy";
        text.appendChild(createLine("100%"));
        text.appendChild(createLine("100%"));
        text.appendChild(createLine(isSecond ? "74%" : "82%"));

        block.appendChild(author);
        block.appendChild(text);
        return block;
    }

    function createLoader() {
        if (document.querySelector(".webx-skeleton-loader")) return null;

        var loader = document.createElement("div");
        loader.className = "webx-skeleton-loader";
        loader.setAttribute("role", "status");
        loader.setAttribute("aria-live", "polite");
        loader.setAttribute("aria-label", "Loading page");

        var shell = document.createElement("div");
        shell.className = "webx-skeleton-shell";

        var content = document.createElement("div");
        content.className = "webx-skeleton-content";
        content.appendChild(createPostBlock(false));
        content.appendChild(createPostBlock(true));

        var sidebar = document.createElement("aside");
        sidebar.className = "webx-skeleton-sidebar";
        sidebar.appendChild(createLine("100%", "webx-skeleton-thin"));
        sidebar.appendChild(createLine("34%", "webx-skeleton-short"));

        var chipGrid = document.createElement("div");
        chipGrid.className = "webx-skeleton-chip-grid";
        for (var i = 0; i < 5; i += 1) {
            var chip = document.createElement("span");
            chip.className = "webx-skeleton-chip";
            chipGrid.appendChild(chip);
        }
        sidebar.appendChild(chipGrid);

        shell.appendChild(content);
        shell.appendChild(sidebar);
        loader.appendChild(shell);
        document.body.appendChild(loader);
        document.body.classList.add("webx-loading-active");
        return loader;
    }

    function hideLoader(loader) {
        if (!loader) return;
        loader.classList.add("is-hidden");
        document.body.classList.remove("webx-loading-active");
        window.setTimeout(function () {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 380);
    }

    function finish(loader) {
        var elapsed = Date.now() - startedAt;
        var wait = Math.max(0, minVisibleMs - elapsed);
        window.setTimeout(function () {
            hideLoader(loader);
        }, wait);
    }

    function init() {
        var loader = createLoader();
        if (!loader) return;

        if (document.readyState === "complete") {
            finish(loader);
        } else {
            window.addEventListener("load", function () {
                finish(loader);
            }, { once: true });
            window.setTimeout(function () {
                finish(loader);
            }, maxVisibleMs);
        }
    }

    if (document.body) {
        init();
    } else {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    }
})();
