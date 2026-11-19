/* global PagefindUI */
(function () {
    "use strict";

    var root = document.documentElement;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function listenMedia(query, handler) {
        if (typeof query.addEventListener === "function") query.addEventListener("change", handler);
        else if (typeof query.addListener === "function") query.addListener(handler);
    }

    /* ---------------------------------------------------------------------
       Theme: light -> dark -> system, remembered across both sites.
       ------------------------------------------------------------------ */

    var themeToggle = document.getElementById("theme-toggle");
    var themeIcon = document.getElementById("theme-icon");
    var THEME_COLORS = { light: "#f1e7d2", dark: "#101119" };
    var MODE_ORDER = ["light", "dark", "system"];
    var MODE_ICONS = { light: "#i-sun", dark: "#i-moon", system: "#i-monitor" };
    var MODE_LABELS = {
        light: "Theme: light (click for dark)",
        dark: "Theme: dark (click to follow system)",
        system: "Theme: follow system (click for light)"
    };

    function currentMode() {
        return root.getAttribute("data-theme-mode") || "system";
    }

    function appliedTheme(mode) {
        return mode === "system" ? (darkQuery.matches ? "dark" : "light") : mode;
    }

    function persistMode(mode) {
        try { localStorage.setItem("theme", mode); } catch (e) {}
        try {
            var host = location.hostname;
            if (host === "dztang.net" || host.endsWith(".dztang.net")) {
                document.cookie = "dzt_theme=" + mode + "; Domain=.dztang.net; Path=/; Max-Age=31536000; SameSite=Lax";
            }
        } catch (e) {}
    }

    function syncGiscusTheme(theme) {
        var iframe = document.querySelector("iframe.giscus-frame");
        if (!iframe || !iframe.contentWindow) return;
        iframe.contentWindow.postMessage(
            { giscus: { setConfig: { theme: theme === "dark" ? "noborder_dark" : "noborder_light" } } },
            "https://giscus.app"
        );
    }

    function applyMode(mode) {
        var theme = appliedTheme(mode);
        root.setAttribute("data-theme", theme);
        root.setAttribute("data-theme-mode", mode);

        var meta = document.getElementById("meta-theme-color");
        if (meta) meta.setAttribute("content", THEME_COLORS[theme]);

        if (themeIcon) themeIcon.setAttribute("href", MODE_ICONS[mode]);
        if (themeToggle) {
            themeToggle.setAttribute("aria-label", MODE_LABELS[mode]);
            themeToggle.setAttribute("title", MODE_LABELS[mode]);
        }
        syncGiscusTheme(theme);
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            var next = MODE_ORDER[(MODE_ORDER.indexOf(currentMode()) + 1) % MODE_ORDER.length];
            persistMode(next);
            applyMode(next);
        });
        applyMode(currentMode());
    }

    listenMedia(darkQuery, function () {
        if (currentMode() === "system") applyMode("system");
    });

    /* ---------------------------------------------------------------------
       Masthead: raised edge on scroll, mobile drawer.
       ------------------------------------------------------------------ */

    var header = document.getElementById("site-header");
    var burger = document.getElementById("nav-burger");
    var drawer = document.getElementById("nav-drawer");
    var mobileQuery = window.matchMedia("(max-width: 1023px)");

    if (header) {
        var onScroll = function () {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    function setDrawer(open) {
        if (!header || !burger || !drawer) return;
        var visible = open && mobileQuery.matches;
        header.classList.toggle("is-open", visible);
        drawer.hidden = !visible;
        burger.setAttribute("aria-expanded", String(visible));
        burger.setAttribute("aria-label", visible ? "Close navigation" : "Open navigation");
    }

    if (burger && drawer) {
        setDrawer(false);
        burger.addEventListener("click", function () {
            setDrawer(burger.getAttribute("aria-expanded") !== "true");
        });
        document.addEventListener("click", function (event) {
            if (header && header.classList.contains("is-open") && !header.contains(event.target)) setDrawer(false);
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && header && header.classList.contains("is-open")) {
                setDrawer(false);
                burger.focus();
            }
        });
        listenMedia(mobileQuery, function () { setDrawer(false); });
    }

    /* ---------------------------------------------------------------------
       Search: lazy-load Pagefind into a dialog.
       ------------------------------------------------------------------ */

    var searchBtn = document.getElementById("nav-search-btn");
    var searchDialog = document.getElementById("search-dialog");
    var searchTarget = document.getElementById("navbar-search");
    var pagefindState = "idle";
    var pagefindFailures = 0;

    function focusSearchInput() {
        if (!searchDialog) return;
        var input = searchDialog.querySelector("input");
        if (input) { input.focus(); input.select(); }
    }

    function pagefindUnavailable() {
        if (!searchTarget) return;
        searchTarget.innerHTML = '<p class="search-unavailable">Search index not available in this build. Run <code>npm run build</code> to generate it.</p>';
    }

    function initPagefind() {
        if (pagefindState === "loading" || pagefindState === "ready") return;
        pagefindState = "loading";

        var css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "/pagefind/pagefind-ui.css";
        document.head.appendChild(css);

        var script = document.createElement("script");
        script.src = "/pagefind/pagefind-ui.js";
        script.onload = function () {
            pagefindState = "ready";
            if (typeof PagefindUI !== "function") { pagefindUnavailable(); return; }
            new PagefindUI({
                element: "#navbar-search",
                showSubResults: true,
                showImages: false,
                autofocus: true,
                translations: { placeholder: "Search posts…" }
            });
            window.setTimeout(focusSearchInput, 60);
        };
        script.onerror = function () {
            pagefindState = "failed";
            if (pagefindFailures++ < 1) pagefindUnavailable();
        };
        document.head.appendChild(script);
    }

    function openSearch() {
        if (!searchDialog || typeof searchDialog.showModal !== "function") return false;
        if (!searchDialog.open) searchDialog.showModal();
        initPagefind();
        focusSearchInput();
        return true;
    }

    if (searchDialog) {
        searchDialog.querySelectorAll("[data-dialog-close]").forEach(function (btn) {
            btn.addEventListener("click", function () { searchDialog.close(); });
        });
        searchDialog.addEventListener("click", function (event) {
            if (event.target !== searchDialog) return;
            var rect = searchDialog.getBoundingClientRect();
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
                searchDialog.close();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", function (event) {
            if (openSearch()) event.preventDefault();
        });
    }

    document.querySelectorAll("[data-open-search]").forEach(function (btn) {
        btn.addEventListener("click", function () { openSearch(); });
    });

    var isApple = /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
    document.querySelectorAll("[data-search-key]").forEach(function (el) {
        el.textContent = isApple ? "⌘K" : "Ctrl+K";
    });

    document.addEventListener("keydown", function (event) {
        var target = event.target;
        var typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
        var slash = event.key === "/" && !typing;
        var chord = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
        if ((slash || chord) && !event.defaultPrevented) {
            event.preventDefault();
            if (!event.repeat && !(searchDialog && searchDialog.open)) openSearch();
        }
    });

    /* ---------------------------------------------------------------------
       Reading progress: 32 segments, exactly like a health bar.
       ------------------------------------------------------------------ */

    var progress = document.getElementById("reading-progress");
    if (progress) {
        var segments = progress.querySelectorAll(".progress__seg");
        var ticking = false;
        var updateProgress = function () {
            ticking = false;
            var max = document.documentElement.scrollHeight - window.innerHeight;
            var ratio = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
            var lit = Math.round(ratio * segments.length);
            for (var i = 0; i < segments.length; i++) {
                segments[i].classList.toggle("is-on", i < lit);
            }
        };
        var requestProgress = function () {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(updateProgress);
            }
        };
        window.addEventListener("scroll", requestProgress, { passive: true });
        window.addEventListener("resize", requestProgress);
        updateProgress();
    }

    /* ---------------------------------------------------------------------
       Table of contents: highlight the heading in view.
       ------------------------------------------------------------------ */

    var tocLinks = document.querySelectorAll(".toc__link");
    if (tocLinks.length && "IntersectionObserver" in window) {
        var headings = document.querySelectorAll(".prose h2[id], .prose h3[id], .prose h4[id]");
        var setActive = function (id) {
            tocLinks.forEach(function (link) {
                var active = decodeURI(link.getAttribute("href").slice(1)) === id;
                link.classList.toggle("is-active", active);
                if (active) link.setAttribute("aria-current", "true");
                else link.removeAttribute("aria-current");
            });
        };
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });
        headings.forEach(function (h) { observer.observe(h); });
        if (headings.length) setActive(headings[0].id);
    }

    /* ---------------------------------------------------------------------
       Scroll reveal.
       ------------------------------------------------------------------ */

    var revealTargets = document.querySelectorAll(".sec, .post-card, .year-block, .tool-card, .page-head");
    if ("IntersectionObserver" in window && !reducedMotion && revealTargets.length) {
        revealTargets.forEach(function (el) { el.classList.add("reveal"); });
        var revealer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-in");
                revealer.unobserve(entry.target);
            });
        }, { threshold: 0.04, rootMargin: "0px 0px -40px 0px" });
        revealTargets.forEach(function (el) { revealer.observe(el); });
        window.setTimeout(function () {
            revealTargets.forEach(function (el) { el.classList.add("is-in"); });
        }, 3000);
    }

    /* ---------------------------------------------------------------------
       Prose: table wrappers, code labels, copy buttons.
       ------------------------------------------------------------------ */

    document.querySelectorAll(".prose table").forEach(function (table, index) {
        var wrapper = document.createElement("div");
        wrapper.className = "table-scroll";
        wrapper.setAttribute("role", "region");
        wrapper.setAttribute("aria-label", "Scrollable table " + (index + 1));
        wrapper.tabIndex = 0;
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });

    document.querySelectorAll(".prose pre").forEach(function (pre) {
        var source = pre.className + " " + (pre.querySelector("code") ? pre.querySelector("code").className : "");
        var match = source.match(/language-([a-z0-9+-]+)/i);
        if (match) {
            var label = document.createElement("span");
            label.className = "code-lang";
            label.textContent = match[1];
            pre.insertBefore(label, pre.firstChild);
        }

        var button = document.createElement("button");
        button.className = "code-copy";
        button.type = "button";
        button.setAttribute("aria-label", "Copy code");
        button.innerHTML = '<svg class="ico" aria-hidden="true" style="width:16px;height:16px"><use href="#i-copy"></use></svg>';

        var resetTimer = null;
        var liveRegion = document.getElementById("copy-status");

        function announce(message) {
            if (!liveRegion) return;
            liveRegion.textContent = "";
            window.setTimeout(function () { liveRegion.textContent = message; }, 40);
        }

        function showState(state) {
            button.classList.remove("is-copied", "is-failed");
            if (state === "copied") {
                button.classList.add("is-copied");
                button.setAttribute("aria-label", "Code copied to clipboard");
                button.innerHTML = '<svg class="ico" aria-hidden="true" style="width:16px;height:16px"><use href="#i-check"></use></svg>';
                announce("Code copied to clipboard");
            } else if (state === "failed") {
                button.classList.add("is-failed");
                button.setAttribute("aria-label", "Copy failed — select and copy manually");
                announce("Copy failed. Select the code and copy it manually.");
            } else {
                button.setAttribute("aria-label", "Copy code");
                button.innerHTML = '<svg class="ico" aria-hidden="true" style="width:16px;height:16px"><use href="#i-copy"></use></svg>';
            }
            window.clearTimeout(resetTimer);
            if (state !== "idle") resetTimer = window.setTimeout(function () { showState("idle"); }, 1600);
        }

        button.addEventListener("click", function () {
            var code = pre.querySelector("code");
            var text = (code ? code.innerText : pre.innerText).replace(/\n$/, "");
            if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
                showState("failed");
                return;
            }
            navigator.clipboard.writeText(text).then(function () { showState("copied"); })
                .catch(function () { showState("failed"); });
        });

        pre.appendChild(button);
    });

    /* ---------------------------------------------------------------------
       Lightbox for article images.
       ------------------------------------------------------------------ */

    var lightbox = document.getElementById("lightbox");
    var lightboxImg = document.getElementById("lightbox-img");
    var lightboxCaption = document.getElementById("lightbox-caption");
    if (lightbox && lightboxImg && typeof lightbox.showModal === "function") {
        document.querySelectorAll(".prose img").forEach(function (img) {
            img.addEventListener("click", function () {
                lightboxImg.src = img.currentSrc || img.src;
                lightboxImg.alt = img.alt || "";
                var caption = img.getAttribute("alt") || "";
                lightboxCaption.textContent = caption;
                lightboxCaption.hidden = caption === "";
                lightbox.showModal();
            });
        });
        lightbox.querySelectorAll("[data-dialog-close]").forEach(function (btn) {
            btn.addEventListener("click", function () { lightbox.close(); });
        });
        lightbox.addEventListener("close", function () { lightboxImg.removeAttribute("src"); });
    }

    /* ---------------------------------------------------------------------
       Back to top.
       ------------------------------------------------------------------ */

    var backToTop = document.getElementById("back-to-top");
    if (backToTop) {
        var syncBackToTop = function () {
            backToTop.classList.toggle("is-visible", window.scrollY > 480);
        };
        window.addEventListener("scroll", syncBackToTop, { passive: true });
        syncBackToTop();
        backToTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
        });
    }

    /* ---------------------------------------------------------------------
       Giscus: keep the comment theme in sync once the iframe exists.
       ------------------------------------------------------------------ */

    var giscusContainer = document.getElementById("giscus-container");
    if (giscusContainer && "MutationObserver" in window) {
        new MutationObserver(function () {
            var iframe = giscusContainer.querySelector("iframe.giscus-frame");
            if (iframe && !iframe.getAttribute("data-theme-bound")) {
                iframe.setAttribute("data-theme-bound", "1");
                iframe.addEventListener("load", function () {
                    syncGiscusTheme(root.getAttribute("data-theme"));
                });
                syncGiscusTheme(root.getAttribute("data-theme"));
            }
        }).observe(giscusContainer, { childList: true, subtree: true });
    }
})();
