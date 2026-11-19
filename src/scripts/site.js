/* =============================================================================
   PIXEL LOG — blog behaviour.
   Progressive enhancement only: search falls back to /search/, code blocks keep
   their plain markup, images stay readable without the lightbox.
   ============================================================================= */
(function () {
    "use strict";

    var root = document.documentElement;
    root.classList.add("js-enhanced");
    var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    var mobileQuery = window.matchMedia("(max-width: 1180px)");
    var reducedMotion = motionQuery.matches;

    function listenMedia(query, handler) {
        if (typeof query.addEventListener === "function") query.addEventListener("change", handler);
        else if (typeof query.addListener === "function") query.addListener(handler);
    }

    function announce(message) {
        var live = document.getElementById("px-status");
        if (!live) {
            live = document.createElement("p");
            live.id = "px-status";
            live.className = "visually-hidden";
            live.setAttribute("role", "status");
            live.setAttribute("aria-live", "polite");
            document.body.appendChild(live);
        }
        live.textContent = "";
        window.setTimeout(function () { live.textContent = message; }, 40);
    }

    listenMedia(motionQuery, function (event) { reducedMotion = event.matches; });

    var toastTimer = null;
    function toast(message) {
        var el = document.getElementById("px-toast");
        if (!el) {
            el = document.createElement("div");
            el.id = "px-toast";
            el.className = "toast";
            el.setAttribute("aria-hidden", "true");
            el.innerHTML = '<span class="toast__led" aria-hidden="true"></span><span class="toast__text"></span>';
            document.body.appendChild(el);
        }
        el.querySelector(".toast__text").textContent = message;
        el.hidden = false;
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () { el.hidden = true; }, 2200);
    }

    /* ---------------------------------------------------------------------
       Theme.
       ------------------------------------------------------------------ */

    var themeToggle = document.getElementById("theme-toggle");
    var THEME_COLORS = { light: "#f1e7d2", dark: "#101119" };
    var MODE_ORDER = ["light", "dark", "system"];
    var MODE_LABELS = {
        light: "Theme: light (click for dark)",
        dark: "Theme: dark (click to follow system)",
        system: "Theme: follow system (click for light)"
    };
    var THEME_NAMES = { light: "Light theme", dark: "Dark theme", system: "Following the system theme" };

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
        if (iframe.getAttribute("data-giscus-ready") !== "1") return;
        iframe.contentWindow.postMessage(
            { giscus: { setConfig: { theme: theme === "dark" ? "noborder_dark" : "noborder_light" } } },
            "https://giscus.app"
        );
    }

    function applyMode(mode, notify) {
        var theme = appliedTheme(mode);
        root.setAttribute("data-theme", theme);
        root.setAttribute("data-theme-mode", mode);

        var meta = document.getElementById("meta-theme-color");
        if (meta) meta.setAttribute("content", THEME_COLORS[theme]);
        if (themeToggle) {
            themeToggle.setAttribute("aria-label", MODE_LABELS[mode]);
            themeToggle.setAttribute("title", MODE_LABELS[mode]);
        }
        syncGiscusTheme(theme);
        if (notify) announce(THEME_NAMES[mode] + ".");
    }

    var wipeTimer = null;
    function switchThemeWithWipe(apply) {
        var canClip = window.CSS && CSS.supports && CSS.supports("clip-path", "inset(0 0 0 0)");
        if (reducedMotion || !document.body || !canClip) { apply(); return; }
        var wipe = document.createElement("div");
        wipe.className = "wipe";
        wipe.setAttribute("aria-hidden", "true");
        document.body.appendChild(wipe);
        window.requestAnimationFrame(function () {
            wipe.classList.add("is-run");
            window.clearTimeout(wipeTimer);
            wipeTimer = window.setTimeout(function () {
                apply();
                wipe.classList.remove("is-run");
                wipe.classList.add("is-out");
                window.setTimeout(function () { wipe.remove(); }, 230);
            }, 200);
        });
    }

    var switchingTheme = false;
    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            if (switchingTheme) return;
            switchingTheme = true;
            window.setTimeout(function () { switchingTheme = false; }, 460);
            var next = MODE_ORDER[(MODE_ORDER.indexOf(currentMode()) + 1) % MODE_ORDER.length];
            switchThemeWithWipe(function () {
                persistMode(next);
                applyMode(next, true);
            });
        });
        applyMode(currentMode());
    }

    listenMedia(darkQuery, function () {
        if (currentMode() === "system") applyMode("system");
    });

    /* Some browsers miss prefers-color-scheme changes while the tab is hidden;
       re-check whenever the page regains attention. */
    function syncSystemTheme() {
        if (currentMode() === "system") applyMode("system");
    }
    window.addEventListener("focus", syncSystemTheme);
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) syncSystemTheme();
    });

    /* ---------------------------------------------------------------------
       Masthead, scroll meter, drawer.
       ------------------------------------------------------------------ */

    var header = document.getElementById("site-header");
    var scrollFill = document.getElementById("scroll-fill");
    var burger = document.getElementById("nav-burger");
    var drawer = document.getElementById("nav-drawer");
    var drawerTimer = null;
    var lastY = window.scrollY;
    var scrollQueued = false;
    /* Articles keep the header: the reading bar lives directly under it. */
    var autoHideHeader = !document.getElementById("reading-progress");

    function updateScrollUI() {
        scrollQueued = false;
        var y = window.scrollY;
        if (header) {
            header.classList.toggle("is-scrolled", y > 8);
            if (autoHideHeader && mobileQuery.matches && !header.classList.contains("is-open")) {
                if (y > 320 && y > lastY + 4) header.classList.add("is-hidden");
                else if (y < lastY - 4 || y <= 320) header.classList.remove("is-hidden");
            } else {
                header.classList.remove("is-hidden");
            }
        }
        if (scrollFill) {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            var p = max > 0 ? Math.min(100, (y / max) * 100) : 0;
            scrollFill.style.setProperty("--p", p.toFixed(1));
        }
        lastY = y;
    }

    function requestScrollUI() {
        if (scrollQueued) return;
        scrollQueued = true;
        window.requestAnimationFrame(updateScrollUI);
    }

    window.addEventListener("scroll", requestScrollUI, { passive: true });
    window.addEventListener("resize", requestScrollUI);
    window.addEventListener("load", requestScrollUI);
    if ("ResizeObserver" in window) {
        new ResizeObserver(requestScrollUI).observe(document.body);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(requestScrollUI);
    updateScrollUI();

    function setDrawer(open, options) {
        if (!header || !burger || !drawer) return;
        var visible = !!open && mobileQuery.matches;
        var opts = options || {};
        window.clearTimeout(drawerTimer);

        if (visible) {
            drawer.hidden = false;
            header.classList.add("is-open");
            window.requestAnimationFrame(function () { drawer.classList.add("is-open"); });
            burger.setAttribute("aria-expanded", "true");
            burger.setAttribute("aria-label", "Close navigation");
            if (opts.focus) {
                var first = drawer.querySelector("a, button");
                if (first) first.focus();
            }
        } else {
            var wasOpen = header.classList.contains("is-open");
            header.classList.remove("is-open");
            drawer.classList.remove("is-open");
            burger.setAttribute("aria-expanded", "false");
            burger.setAttribute("aria-label", "Open navigation");
            drawerTimer = window.setTimeout(function () {
                if (!header.classList.contains("is-open")) drawer.hidden = true;
            }, reducedMotion ? 0 : 260);
            if (opts.restoreFocus && wasOpen) burger.focus();
        }
    }

    if (burger && drawer && header) {
        root.classList.add("nav-ready");
        setDrawer(false);
        burger.addEventListener("click", function (event) {
            var open = burger.getAttribute("aria-expanded") !== "true";
            setDrawer(open, { focus: open && event.detail === 0 });
        });
        document.addEventListener("click", function (event) {
            if (header.classList.contains("is-open") && !header.contains(event.target)) setDrawer(false);
        });
        header.addEventListener("focusout", function (event) {
            if (!header.classList.contains("is-open")) return;
            if (event.relatedTarget && header.contains(event.relatedTarget)) return;
            setDrawer(false);
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && header.classList.contains("is-open")) {
                var inside = drawer.contains(document.activeElement);
                setDrawer(false, { restoreFocus: inside });
            }
        });
        listenMedia(mobileQuery, function () { setDrawer(false); });
    }

    /* ---------------------------------------------------------------------
       Search: a real link to /search/ that upgrades into a dialog.
       ------------------------------------------------------------------ */

    var searchLink = document.getElementById("nav-search-btn");
    var searchDialog = document.getElementById("search-dialog");
    var searchTarget = document.getElementById("navbar-search");
    var pagefindState = "idle";

    function focusSearchInput() {
        if (!searchDialog) return;
        var input = searchDialog.querySelector("input");
        if (input) {
            input.focus();
            if (typeof input.select === "function") input.select();
        }
    }

    function pagefindUnavailable() {
        if (!searchTarget) return;
        searchTarget.innerHTML = '<p class="search-unavailable">Search index not available in this build. ' +
            '<a href="/search/">Open the full search page</a>, or run <code>npm run build</code> to generate it.</p>';
    }

    function initPagefind() {
        if (pagefindState !== "idle") return;
        pagefindState = "loading";

        if (!document.querySelector('link[href="/pagefind/pagefind-ui.css"]')) {
            var css = document.createElement("link");
            css.rel = "stylesheet";
            css.href = "/pagefind/pagefind-ui.css";
            document.head.appendChild(css);
        }

        var script = document.createElement("script");
        script.src = "/pagefind/pagefind-ui.js";
        script.onload = function () {
            if (typeof PagefindUI !== "function") {
                pagefindState = "failed";
                pagefindUnavailable();
                return;
            }
            pagefindState = "ready";
            new PagefindUI({
                element: "#navbar-search",
                showSubResults: true,
                showImages: false,
                autofocus: true,
                translations: { placeholder: "Search posts…" }
            });
            window.setTimeout(function () {
                var input = searchTarget && searchTarget.querySelector("input");
                if (input) input.setAttribute("aria-label", "Search posts");
                focusSearchInput();
            }, 60);
        };
        script.onerror = function () {
            pagefindState = "failed";
            pagefindUnavailable();
        };
        document.head.appendChild(script);
    }

    function openSearch(event) {
        if (!searchDialog || typeof searchDialog.showModal !== "function") return false;
        /* Another modal (the lightbox) owns the screen; do not stack on top. */
        if (document.querySelector("dialog[open]") && !searchDialog.open) return false;
        if (event) event.preventDefault();
        if (!searchDialog.open) searchDialog.showModal();
        initPagefind();
        focusSearchInput();
        return true;
    }

    if (searchDialog) {
        Array.prototype.forEach.call(searchDialog.querySelectorAll("[data-dialog-close]"), function (button) {
            button.addEventListener("click", function () { searchDialog.close(); });
        });
        searchDialog.addEventListener("click", function (event) {
            if (event.target !== searchDialog) return;
            var rect = searchDialog.getBoundingClientRect();
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
                searchDialog.close();
            }
        });
    }

    if (searchLink) {
        searchLink.addEventListener("click", function (event) {
            if (openSearch(event)) return;
            /* no dialog support: let the link navigate to /search/ */
        });
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-open-search]"), function (button) {
        button.addEventListener("click", function (event) {
            if (!openSearch(event)) return;
        });
    });

    var isApple = /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
    Array.prototype.forEach.call(document.querySelectorAll("[data-search-key]"), function (el) {
        el.textContent = isApple ? "⌘K" : "Ctrl+K";
    });

    document.addEventListener("keydown", function (event) {
        var target = event.target;
        var typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
        var slash = event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey;
        var chord = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
        if ((slash || chord) && !event.defaultPrevented && !event.repeat) {
            if (!searchDialog || !searchDialog.open) openSearch(event);
        }
    });

    /* ---------------------------------------------------------------------
       Reading progress: 32 segments, plus a gold "cleared" state.
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
            progress.classList.toggle("is-done", ratio > 0.995 && max > 120);
        };
        var requestProgress = function () {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(updateProgress);
            }
        };
        window.addEventListener("scroll", requestProgress, { passive: true });
        window.addEventListener("resize", requestProgress);
        window.addEventListener("load", requestProgress);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(requestProgress);
        updateProgress();
    }

    /* ---------------------------------------------------------------------
       Table of contents: scroll spy that also handles the end of the page.
       ------------------------------------------------------------------ */

    var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc__link"));
    var headings = Array.prototype.slice.call(document.querySelectorAll(".prose h2[id], .prose h3[id], .prose h4[id]"));
    if (tocLinks.length && headings.length) {
        var decodeId = function (href) {
            if (!href || href.charAt(0) !== "#") return "";
            try { return decodeURIComponent(href.slice(1)); } catch (e) { return href.slice(1); }
        };
        var setActiveHeading = function (id) {
            tocLinks.forEach(function (link) {
                var active = decodeId(link.getAttribute("href")) === id;
                link.classList.toggle("is-active", active);
                if (active) link.setAttribute("aria-current", "location");
                else link.removeAttribute("aria-current");
            });
        };
        var tocQueued = false;
        var syncToc = function () {
            tocQueued = false;
            var offset = (header ? header.offsetHeight : 72) + 72;
            var current = headings[0].id;
            for (var i = 0; i < headings.length; i++) {
                if (headings[i].getBoundingClientRect().top - offset <= 0) current = headings[i].id;
            }
            var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
            if (atBottom) current = headings[headings.length - 1].id;
            setActiveHeading(current);
        };
        var requestToc = function () {
            if (tocQueued) return;
            tocQueued = true;
            window.requestAnimationFrame(syncToc);
        };
        window.addEventListener("scroll", requestToc, { passive: true });
        window.addEventListener("resize", requestToc);
        setActiveHeading(headings[0].id);
        syncToc();
    }

    /* ---------------------------------------------------------------------
       Scroll reveal.
       ------------------------------------------------------------------ */

    var revealTargets = Array.prototype.slice.call(
        document.querySelectorAll(".sec, .post-card, .year-block, .tool-card, .page-head")
    );

    if (revealTargets.length && !reducedMotion && "IntersectionObserver" in window) {
        revealTargets.forEach(function (el) { el.classList.add("reveal"); });
        revealTargets.forEach(function (el) {
            var index = 0;
            var node = el;
            while ((node = node.previousElementSibling)) {
                if (node.classList.contains("reveal")) index += 1;
            }
            el.style.setProperty("--i", String(Math.min(index, 5)));
        });

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
        }, 2600);
    }

    /* ---------------------------------------------------------------------
       Prose: scrollable tables, code labels, copy buttons.
       ------------------------------------------------------------------ */

    Array.prototype.forEach.call(document.querySelectorAll(".prose table"), function (table, index) {
        if (table.parentElement && table.parentElement.classList.contains("table-scroll")) return;
        var wrapper = document.createElement("div");
        wrapper.className = "table-scroll";
        wrapper.setAttribute("role", "region");
        wrapper.setAttribute("aria-label", "Scrollable table " + (index + 1));
        wrapper.tabIndex = 0;
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });

    function legacyCopy(text) {
        var area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.top = "-1000px";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        area.remove();
        return ok;
    }

    function copyText(text, done) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            navigator.clipboard.writeText(text).then(
                function () { done(true); },
                function () { done(legacyCopy(text)); }
            );
            return;
        }
        done(legacyCopy(text));
    }

    var copyStatus = document.getElementById("copy-status");

    function announceCopy(message) {
        if (!copyStatus) return;
        copyStatus.textContent = "";
        window.setTimeout(function () { copyStatus.textContent = message; }, 40);
    }

    Array.prototype.forEach.call(document.querySelectorAll(".prose pre"), function (pre) {
        if (pre.parentElement && pre.parentElement.classList.contains("code-block")) return;

        var code = pre.querySelector("code");
        var source = pre.className + " " + (code ? code.className : "");
        var match = source.match(/language-([a-z0-9+#-]+)/i);
        var language = match ? match[1] : "";

        var wrapper = document.createElement("div");
        wrapper.className = "code-block";
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        if (language) {
            var label = document.createElement("span");
            label.className = "code-lang";
            label.textContent = language;
            wrapper.appendChild(label);
        }

        var button = document.createElement("button");
        button.className = "code-copy";
        button.type = "button";
        button.setAttribute("aria-label", "Copy code");
        var copyIcon = '<svg class="ico" aria-hidden="true" style="width:16px;height:16px"><use href="#i-copy"></use></svg>';
        var checkIcon = '<svg class="ico" aria-hidden="true" style="width:16px;height:16px"><use href="#i-check"></use></svg>';
        button.innerHTML = copyIcon;
        wrapper.appendChild(button);

        var resetTimer = null;
        function showState(state) {
            button.classList.remove("is-copied", "is-failed", "copied", "failed");
            if (state === "copied") {
                button.classList.add("is-copied", "copied");
                button.setAttribute("aria-label", "Code copied to clipboard");
                button.innerHTML = checkIcon;
                announceCopy("Code copied to clipboard");
                toast("Copied " + (language ? language + " code" : "code") + " to clipboard");
            } else if (state === "failed") {
                button.classList.add("is-failed", "failed");
                button.setAttribute("aria-label", "Copy failed — select and copy manually");
                announceCopy("Copy failed. Select the code and copy it manually.");
                toast("Copy failed — select the code manually");
            } else {
                button.setAttribute("aria-label", "Copy code");
                button.innerHTML = copyIcon;
            }
            window.clearTimeout(resetTimer);
            if (state !== "idle") {
                resetTimer = window.setTimeout(function () { showState("idle"); }, 1600);
            }
        }

        button.addEventListener("click", function () {
            var text = (code ? code.innerText : pre.innerText).replace(/\n$/, "");
            copyText(text, function (ok) { showState(ok ? "copied" : "failed"); });
        });

        var scrollHint = document.createElement("span");
        scrollHint.className = "code-scroll";
        scrollHint.setAttribute("aria-hidden", "true");
        scrollHint.textContent = "\u2192";
        wrapper.appendChild(scrollHint);

        var syncCodeScroll = function () {
            var scrollable = pre.scrollWidth > pre.clientWidth + 2;
            wrapper.classList.toggle("is-scrollable", scrollable);
            wrapper.classList.toggle("is-at-end", !scrollable || pre.scrollLeft + pre.clientWidth >= pre.scrollWidth - 4);
        };

        pre.addEventListener("scroll", syncCodeScroll, { passive: true });
        window.addEventListener("resize", syncCodeScroll);

        window.requestAnimationFrame(function () {
            syncCodeScroll();
            if (wrapper.classList.contains("is-scrollable")) {
                pre.tabIndex = 0;
                pre.setAttribute("role", "region");
                pre.setAttribute("aria-label", (language ? language + " code" : "Code") + " (scrolls horizontally)");
            }
        });
    });

    /* ---------------------------------------------------------------------
       Lightbox: keyboard, arrows, swipe, counter.
       ------------------------------------------------------------------ */

    var lightbox = document.getElementById("lightbox");
    var lightboxImg = document.getElementById("lightbox-img");
    var lightboxCaption = document.getElementById("lightbox-caption");
    var lightboxCounter = document.getElementById("lightbox-counter");
    var lightboxPrev = lightbox ? lightbox.querySelector("[data-lightbox-prev]") : null;
    var lightboxNext = lightbox ? lightbox.querySelector("[data-lightbox-next]") : null;

    if (lightbox && lightboxImg && typeof lightbox.showModal === "function") {
        var gallery = Array.prototype.slice.call(document.querySelectorAll(".prose img")).filter(function (img) {
            return img.getAttribute("src");
        });
        var lightboxIndex = -1;

        var paintLightbox = function (index) {
            if (index < 0 || index >= gallery.length) return;
            lightboxIndex = index;
            var img = gallery[index];
            lightboxImg.src = img.currentSrc || img.src;
            lightboxImg.alt = img.alt || "";
            var caption = img.getAttribute("alt") || "";
            if (lightboxCaption) {
                lightboxCaption.textContent = caption;
                lightboxCaption.hidden = caption === "";
            }
            if (lightboxCounter) lightboxCounter.textContent = (index + 1) + " / " + gallery.length;
            lightbox.setAttribute("aria-label", "Image preview " + (index + 1) + " of " + gallery.length);
            if (lightboxPrev) lightboxPrev.disabled = index === 0;
            if (lightboxNext) lightboxNext.disabled = index === gallery.length - 1;
        };

        var openLightbox = function (index) {
            paintLightbox(index);
            if (!lightbox.open) lightbox.showModal();
        };

        var stepLightbox = function (delta) {
            var next = lightboxIndex + delta;
            if (next < 0 || next >= gallery.length) return;
            paintLightbox(next);
        };

        gallery.forEach(function (img, index) {
            img.tabIndex = 0;
            img.setAttribute("role", "button");
            img.setAttribute("aria-label", img.alt ? "View image: " + img.alt : "View image");
            img.addEventListener("click", function () { openLightbox(index); });
            img.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
                    event.preventDefault();
                    openLightbox(index);
                }
            });
        });

        if (lightboxPrev) lightboxPrev.addEventListener("click", function () { stepLightbox(-1); });
        if (lightboxNext) lightboxNext.addEventListener("click", function () { stepLightbox(1); });

        lightbox.addEventListener("keydown", function (event) {
            if (event.key === "ArrowRight") { event.preventDefault(); stepLightbox(1); }
            else if (event.key === "ArrowLeft") { event.preventDefault(); stepLightbox(-1); }
        });

        Array.prototype.forEach.call(lightbox.querySelectorAll("[data-dialog-close]"), function (button) {
            button.addEventListener("click", function () { lightbox.close(); });
        });

        lightbox.addEventListener("click", function (event) {
            if (event.target !== lightbox) return;
            var rect = lightbox.getBoundingClientRect();
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
                lightbox.close();
            }
        });

        var touchStartX = null;
        var body = lightbox.querySelector(".dialog__body");
        if (body) {
            body.addEventListener("pointerdown", function (event) {
                if (event.pointerType === "mouse") return;
                touchStartX = event.clientX;
            });
            body.addEventListener("pointerup", function (event) {
                if (touchStartX === null) return;
                var delta = event.clientX - touchStartX;
                touchStartX = null;
                if (Math.abs(delta) < 48) return;
                stepLightbox(delta < 0 ? 1 : -1);
            });
        }

        lightbox.addEventListener("close", function () {
            lightboxImg.removeAttribute("src");
            lightboxIndex = -1;
        });
    }

    /* ---------------------------------------------------------------------
       Ticker: stop the belt while it is off screen.
       ------------------------------------------------------------------ */

    var ticker = document.querySelector(".ticker");
    if (ticker && "IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                ticker.classList.toggle("is-paused", !entry.isIntersecting);
            });
        }, { threshold: 0 }).observe(ticker);
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
            var main = document.getElementById("main-content");
            if (main) main.focus({ preventScroll: true });
        });
    }

    /* ---------------------------------------------------------------------
       Footer clock.
       ------------------------------------------------------------------ */

    var clock = document.getElementById("footer-clock");
    if (clock) {
        var pad = function (n) { return n < 10 ? "0" + n : String(n); };
        var tickClock = function () {
            var now = new Date();
            clock.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
            clock.setAttribute("title", now.toLocaleString());
        };
        tickClock();
        var clockTimer = window.setInterval(tickClock, 1000);
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                window.clearInterval(clockTimer);
                clockTimer = null;
            } else if (!clockTimer) {
                tickClock();
                clockTimer = window.setInterval(tickClock, 1000);
            }
        });
    }

    /* ---------------------------------------------------------------------
       Giscus: only talk to a frame that has actually loaded.
       ------------------------------------------------------------------ */

    /* ---------------------------------------------------------------------
       Tag index: filter rows as you type. The toolbar ships hidden, so a
       blocked script still leaves the full index readable.
       ------------------------------------------------------------------ */

    var termFilter = document.querySelector("[data-term-filter]");
    if (termFilter) {
        var termToolbar = document.querySelector("[data-term-toolbar]");
        var termRows = Array.prototype.slice.call(document.querySelectorAll("[data-term-row]"));
        var termBands = Array.prototype.slice.call(document.querySelectorAll("[data-term-band]"));
        var termEmpty = document.querySelector("[data-term-empty]");
        var termCount = document.querySelector("[data-term-count]");

        var filterTerms = function () {
            var raw = termFilter.value.trim();
            var query = raw.toLowerCase();
            var shown = 0;
            termRows.forEach(function (row) {
                var haystack = (row.getAttribute("data-name") || "") + " " + (row.getAttribute("data-slug") || "");
                var match = !query || haystack.indexOf(query) !== -1;
                row.hidden = !match;
                if (match) shown += 1;
            });
            termBands.forEach(function (band) {
                band.hidden = !band.querySelector("[data-term-row]:not([hidden])");
            });
            if (termCount) {
                termCount.textContent = query
                    ? shown + " of " + termRows.length + " tags match \u201c" + raw + "\u201d"
                    : termRows.length + " tags";
            }
            if (termEmpty) termEmpty.hidden = shown !== 0;
        };

        if (termToolbar) termToolbar.hidden = false;
        termFilter.addEventListener("input", filterTerms);
        termFilter.addEventListener("search", filterTerms);
        filterTerms();
    }

    /* ---------------------------------------------------------------------
       Search page: quick tags fill the Pagefind box instead of navigating.
       ------------------------------------------------------------------ */

    Array.prototype.forEach.call(document.querySelectorAll("[data-search-query]"), function (link) {
        link.addEventListener("click", function (event) {
            var input = document.querySelector(".pagefind-ui__search-input");
            if (!input) return;
            event.preventDefault();
            input.value = link.getAttribute("data-search-query") || "";
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.focus({ preventScroll: true });
            if (input.scrollIntoView) {
                input.scrollIntoView({ block: "center", behavior: reducedMotion ? "auto" : "smooth" });
            }
        });
    });

        var giscusContainer = document.getElementById("giscus-container");
    if (giscusContainer && "MutationObserver" in window) {
        new MutationObserver(function () {
            var iframe = giscusContainer.querySelector("iframe.giscus-frame");
            if (iframe && !iframe.getAttribute("data-theme-bound")) {
                iframe.setAttribute("data-theme-bound", "1");
                iframe.addEventListener("load", function () {
                    iframe.setAttribute("data-giscus-ready", "1");
                    syncGiscusTheme(root.getAttribute("data-theme"));
                });
                if (iframe.getAttribute("data-giscus-ready") === "1") {
                    syncGiscusTheme(root.getAttribute("data-theme"));
                }
            }
        }).observe(giscusContainer, { childList: true, subtree: true });
    }

    /* ---------------------------------------------------------------------
       bfcache / resize housekeeping.
       ------------------------------------------------------------------ */

    window.addEventListener("pageshow", function (event) {
        if (!event.persisted) return;
        setDrawer(false);
        lastY = window.scrollY;
        updateScrollUI();
        window.dispatchEvent(new Event("resize"));
    });
})();