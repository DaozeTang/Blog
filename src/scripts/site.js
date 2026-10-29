(function () {
    "use strict";

    var root = document.documentElement;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    var themeToggle = document.getElementById("theme-toggle");
    var THEME_COLORS = { light: "#e9e1c9", dark: "#14162b" };
    var MODE_ORDER = ["light", "dark", "system"];
    var MODE_ICONS = {
        light: "fas fa-sun",
        dark: "fas fa-moon",
        system: "fas fa-circle-half-stroke",
    };
    var MODE_LABELS = {
        light: "Theme: light (click for dark)",
        dark: "Theme: dark (click to follow system)",
        system: "Theme: follow system (click for light)",
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
            if (location.hostname === "dztang.net" || location.hostname.endsWith(".dztang.net")) {
                document.cookie = "dzt_theme=" + mode + "; Domain=.dztang.net; Path=/; Max-Age=31536000; SameSite=Lax";
            }
        } catch (e) {}
    }

    function syncGiscusTheme(theme) {
        var iframe = document.querySelector("iframe.giscus-frame");
        if (!iframe) return;
        iframe.contentWindow.postMessage(
            { giscus: { setConfig: { theme: theme === "dark" ? "noborder_dark" : "noborder_light" } } },
            "https://giscus.app"
        );
    }

    function watchGiscusFrame() {
        var container = document.getElementById("giscus-container");
        if (!container) return;

        function bind(iframe) {
            if (!iframe || iframe.getAttribute("data-theme-bound")) return;
            iframe.setAttribute("data-theme-bound", "1");
            iframe.addEventListener("load", function () {
                syncGiscusTheme(root.getAttribute("data-theme"));
            });
        }

        bind(container.querySelector("iframe.giscus-frame"));

        if ("MutationObserver" in window) {
            new MutationObserver(function () {
                bind(container.querySelector("iframe.giscus-frame"));
            }).observe(container, { childList: true, subtree: true });
        }
    }

    watchGiscusFrame();

    function applyMode(mode) {
        var theme = appliedTheme(mode);
        root.setAttribute("data-theme", theme);
        root.setAttribute("data-theme-mode", mode);

        var meta = document.getElementById("meta-theme-color");
        if (meta) meta.setAttribute("content", THEME_COLORS[theme]);

        if (themeToggle) {
            var icon = themeToggle.querySelector("i");
            if (icon) icon.className = MODE_ICONS[mode];
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

    darkQuery.addEventListener("change", function () {
        if (currentMode() === "system") applyMode("system");
    });

    var topbar = document.getElementById("topbar");
    var burger = document.getElementById("nav-burger");

    if (topbar) {
        var onScroll = function () {
            topbar.classList.toggle("nav-scrolled", window.scrollY > 16);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    var navLinks = document.getElementById("site-nav");
    var mobileNavQuery = window.matchMedia("(max-width: 959.98px)");
    var navFocusTimer = null;

    function syncNav() {
        if (!topbar || !burger || !navLinks) return;
        var mobile = mobileNavQuery.matches;
        var open = mobile && topbar.classList.contains("nav-open");
        var hidden = mobile && !open;
        if (!mobile) topbar.classList.remove("nav-open");
        burger.setAttribute("aria-expanded", String(open));
        navLinks.hidden = hidden;
        navLinks.inert = hidden;
        if (mobile) navLinks.setAttribute("aria-hidden", String(!open));
        else navLinks.removeAttribute("aria-hidden");
        if (hidden && navLinks.contains(document.activeElement)) burger.focus();
    }

    function closeNav(restoreFocus) {
        if (!topbar) return;
        window.clearTimeout(navFocusTimer);
        var hadFocus = navLinks && navLinks.contains(document.activeElement);
        topbar.classList.remove("nav-open");
        syncNav();
        if ((restoreFocus || hadFocus) && burger) burger.focus();
    }

    if (burger && topbar && navLinks) {
        burger.addEventListener("click", function (event) {
            event.stopPropagation();
            window.clearTimeout(navFocusTimer);
            if (!mobileNavQuery.matches) return;
            var open = !topbar.classList.contains("nav-open");
            topbar.classList.toggle("nav-open", open);
            syncNav();
            if (open) {
                var firstLink = navLinks.querySelector(".nav-link");
                if (firstLink) {
                    navFocusTimer = window.setTimeout(function () {
                        if (topbar.classList.contains("nav-open") && mobileNavQuery.matches) firstLink.focus();
                    }, 80);
                }
            }
        });

        document.addEventListener("click", function (event) {
            if (topbar.classList.contains("nav-open") && !topbar.contains(event.target)) closeNav(false);
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && topbar.classList.contains("nav-open")) closeNav(true);
        });

        navLinks.querySelectorAll(".nav-link").forEach(function (link) {
            link.addEventListener("click", function () { closeNav(false); });
        });

        window.addEventListener("resize", syncNav);
        syncNav();
    }

    var searchBtn = document.getElementById("nav-search-btn");
    var searchDialog = document.getElementById("search-dialog");
    var searchContainer = document.getElementById("navbar-search");
    var pagefindState = "idle";

    function focusSearchInput() {
        if (!searchDialog) return;
        var input = searchDialog.querySelector("input");
        if (input) { input.focus(); input.select(); }
    }

    function initPagefind() {
        if (pagefindState !== "idle") return;
        pagefindState = "loading";

        var css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "/pagefind/pagefind-ui.css";
        document.head.appendChild(css);

        var script = document.createElement("script");
        script.src = "/pagefind/pagefind-ui.js";
        script.onload = function () {
            pagefindState = "ready";
            new PagefindUI({
                element: "#navbar-search",
                showSubResults: true,
                showImages: false,
                autofocus: true,
                translations: { placeholder: "Search posts…" },
            });
            setTimeout(focusSearchInput, 50);
        };
        script.onerror = function () {
            pagefindState = "failed";
            if (searchContainer) {
                searchContainer.innerHTML =
                    '<p class="search-unavailable">Search index not available in this build. Run <code>npm run build</code> to generate it.</p>';
            }
        };
        document.head.appendChild(script);
    }

    function openSearch() {
        if (!searchDialog || typeof searchDialog.showModal !== "function") return false;
        if (searchDialog.open) return true;
        searchDialog.showModal();
        initPagefind();
        focusSearchInput();
        return true;
    }

    if (searchBtn && searchDialog) {
        searchBtn.addEventListener("click", function (event) {
            if (openSearch()) event.preventDefault();
        });

        searchDialog.addEventListener("click", function (event) {
            if (event.target !== searchDialog) return;
            var rect = searchDialog.getBoundingClientRect();
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
                searchDialog.close();
            }
        });

        searchDialog.querySelectorAll("[data-dialog-close]").forEach(function (btn) {
            btn.addEventListener("click", function () { searchDialog.close(); });
        });

        document.addEventListener("keydown", function (event) {
            var target = event.target;
            var typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
            var shortcut = (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing);
            if (!shortcut) return;
            event.preventDefault();
            if (!event.repeat && !searchDialog.open) openSearch();
        });
    }

    var tocLinks = document.querySelectorAll(".toc-link");

    if (tocLinks.length && "IntersectionObserver" in window) {
        var headings = document.querySelectorAll(".prose h1[id], .prose h2[id], .prose h3[id], .prose h4[id]");

        var setActiveToc = function (id) {
            tocLinks.forEach(function (link) {
                var active = link.getAttribute("href") === "#" + encodeURI(id);
                link.classList.toggle("active", active);
                if (active) link.setAttribute("aria-current", "true");
                else link.removeAttribute("aria-current");
            });
        };

        var tocObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) setActiveToc(entry.target.id);
            });
        }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });

        headings.forEach(function (h) { tocObserver.observe(h); });
        if (headings.length) setActiveToc(headings[0].id);
    }

    var revealTargets = document.querySelectorAll(".section, .post-item");

    if ("IntersectionObserver" in window && !reducedMotion) {
        revealTargets.forEach(function (el) { el.classList.add("reveal-item"); });

        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });

        revealTargets.forEach(function (el) { revealObserver.observe(el); });
        window.setTimeout(function () {
            revealTargets.forEach(function (el) { el.classList.add("revealed"); });
        }, 3200);
    }

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
        var button = document.createElement("button");
        button.className = "code-copy";
        button.type = "button";
        button.setAttribute("aria-label", "Copy code");
        button.innerHTML = '<i class="far fa-copy" aria-hidden="true"></i>';

        var resetTimer = null;
        var liveRegion = document.getElementById("copy-status");

        function announce(message) {
            if (!liveRegion) return;

            liveRegion.textContent = "";
            window.setTimeout(function () { liveRegion.textContent = message; }, 50);
        }

        function showState(state) {

            button.classList.remove("copied", "failed");
            if (state === "copied") {
                button.classList.add("copied");
                button.setAttribute("aria-label", "Code copied to clipboard");
                button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>';
                announce("Code copied to clipboard");
            } else if (state === "failed") {
                button.classList.add("failed");
                button.setAttribute("aria-label", "Copy failed — select and copy manually");
                button.innerHTML = '<i class="fas fa-triangle-exclamation" aria-hidden="true"></i>';
                announce("Copy failed. Select the code and copy it manually.");
            } else {
                button.setAttribute("aria-label", "Copy code");
                button.innerHTML = '<i class="far fa-copy" aria-hidden="true"></i>';
            }
            window.clearTimeout(resetTimer);
            if (state !== "idle") {
                resetTimer = window.setTimeout(function () { showState("idle"); }, 1600);
            }
        }

        button.addEventListener("click", function () {
            var code = pre.querySelector("code");
            var text = (code ? code.innerText : pre.innerText).replace(/\n$/, "");

            if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
                showState("failed");
                return;
            }
            navigator.clipboard.writeText(text).then(function () {
                showState("copied");
            }).catch(function () {
                showState("failed");
            });
        });

        pre.appendChild(button);
    });
})();
(function () {
    var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches || !window.matchMedia("(pointer: fine)").matches) return;
    var glow = document.querySelector(".canvas-grid");
    if (!glow) return;
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function tick() {
        cx += (tx - cx) * 0.06;
        cy += (ty - cy) * 0.06;
        glow.style.transform = "translate3d(" + (cx * 44).toFixed(2) + "px," + (cy * 44).toFixed(2) + "px,0)";
        if (Math.abs(tx - cx) > 0.0005 || Math.abs(ty - cy) > 0.0005) {
            raf = requestAnimationFrame(tick);
        } else { raf = null; }
    }
    window.addEventListener("pointermove", function (e) {
        tx = e.clientX / window.innerWidth - 0.5;
        ty = e.clientY / window.innerHeight - 0.5;
        if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
})();
(function () {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var sel = ".tool-card, a.post-nav-card";
    var cards = document.querySelectorAll(sel);
    if (!cards.length) return;
    cards.forEach(function (el) { el.classList.add("lq-glare"); });
    document.addEventListener("pointermove", function (e) {
        var t = e.target.closest ? e.target.closest(".lq-glare") : null;
        if (!t) return;
        var r = t.getBoundingClientRect();

        var grid = 4;
        var mx = Math.round((e.clientX - r.left) / grid) * grid;
        var my = Math.round((e.clientY - r.top) / grid) * grid;
        t.style.setProperty("--mx", mx + "px");
        t.style.setProperty("--my", my + "px");
    }, { passive: true });
})();
