const path = require("node:path");
const sass = require("sass");
const yaml = require("js-yaml");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const GithubSlugger = require("github-slugger");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

// Kebab-case slugs for URLs (github-slugger).
const ghSlug = (value) => new GithubSlugger().slug(String(value));

const CJK_RE = /[㐀-䶿一-鿿豈-﫿]/g;

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(syntaxHighlight);

    eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

    /* ---------------------------------------------------------------- *
     * Markdown
     * ---------------------------------------------------------------- */
    const md = markdownIt({ html: true, linkify: true });

    md.use(markdownItAnchor, {
        slugify: ghSlug,
        level: [1, 2, 3, 4],
        permalink: markdownItAnchor.permalink.ariaHidden({
            placement: "after",
            class: "heading-anchor",
            symbol: "#",
        }),
    });

    // Posts reference images relatively (./images/...). Output pages live at
    // /posts/<slug>/, while images are copied to /posts/images/ — rewrite to
    // absolute paths so both keep working.
    const defaultImageRule =
        md.renderer.rules.image ||
        function (tokens, idx, options, env, self) {
            return self.renderToken(tokens, idx, options);
        };
    md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const src = token.attrGet("src") || "";
        if (/^(?:\.\/)?images\//.test(src)) {
            token.attrSet("src", `/posts/${src.replace(/^\.\//, "")}`);
        }
        return defaultImageRule(tokens, idx, options, env, self);
    };

    eleventyConfig.setLibrary("md", md);

    /* ---------------------------------------------------------------- *
     * Collections
     * ---------------------------------------------------------------- */
    const POSTS_GLOB = "src/content/posts/**/*.md";
    const isLive = (item) => !item.data.draft;
    const postDate = (item) => item.data.published || item.date;
    const byDateDesc = (a, b) => postDate(b) - postDate(a);

    const livePosts = (api) => api.getFilteredByGlob(POSTS_GLOB).filter(isLive);

    eleventyConfig.addCollection("posts", (api) => livePosts(api).sort(byDateDesc));

    eleventyConfig.addCollection("postsPinnedFirst", (api) =>
        livePosts(api).sort(
            (a, b) =>
                (b.data.pinned === true) - (a.data.pinned === true) || byDateDesc(a, b)
        )
    );

    eleventyConfig.addCollection("postsByYear", (api) => {
        const groups = new Map();
        for (const item of livePosts(api).sort(byDateDesc)) {
            const year = String(postDate(item).getFullYear());
            if (!groups.has(year)) groups.set(year, []);
            groups.get(year).push(item);
        }
        return [...groups.entries()].map(([year, items]) => ({ year, items }));
    });

    const collectTerms = (items, key) => {
        const map = new Map();
        for (const item of items) {
            const raw = item.data[key];
            const values = (Array.isArray(raw) ? raw : [raw]).filter(
                (v) => typeof v === "string" && v.trim() !== ""
            );
            for (const name of values) {
                const slug = ghSlug(name);
                if (!map.has(slug)) map.set(slug, { name, slug, items: [] });
                map.get(slug).items.push(item);
            }
        }
        return [...map.values()].sort(
            (a, b) =>
                b.items.length - a.items.length ||
                a.name.localeCompare(b.name, "zh-Hans-CN")
        );
    };

    eleventyConfig.addCollection("categories", (api) =>
        collectTerms(livePosts(api).sort(byDateDesc), "category")
    );

    eleventyConfig.addCollection("tagList", (api) =>
        collectTerms(livePosts(api).sort(byDateDesc), "tags")
    );

    /* ---------------------------------------------------------------- *
     * Filters
     * ---------------------------------------------------------------- */
    eleventyConfig.addFilter("ghSlug", ghSlug);

    eleventyConfig.addFilter("readableDate", (value) => {
        const d = value instanceof Date ? value : new Date(value);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    });

    eleventyConfig.addFilter("monthDay", (value) => {
        const d = value instanceof Date ? value : new Date(value);
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    });

    eleventyConfig.addFilter("year", (value) => {
        const d = value instanceof Date ? value : new Date(value);
        return String(d.getUTCFullYear());
    });

    eleventyConfig.addFilter("rfc822", (value) => {
        const d = value instanceof Date ? value : new Date(value);
        return d.toUTCString();
    });

    eleventyConfig.addFilter("isoDate", (value) => {
        const d = value instanceof Date ? value : new Date(value);
        return d.toISOString();
    });

    eleventyConfig.addFilter("encodeUri", (value) => encodeURI(String(value)));

    eleventyConfig.addFilter("xmlEscape", (value) =>
        String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
    );

    eleventyConfig.addFilter("cdata", (value) =>
        `<![CDATA[${String(value).replace(/]]>/g, "]]]]><![CDATA[>")}]]>`
    );

    // Make root-relative URLs absolute (for the RSS feed content).
    eleventyConfig.addFilter("absoluteHtml", (html, base) =>
        String(html).replace(
            /(src|href)="\/(?!\/)/g,
            `$1="${String(base).replace(/\/$/, "")}/`
        )
    );

    eleventyConfig.addFilter("readingTime", (content) => {
        const text = String(content)
            .replace(/<[^>]*>/g, " ")
            .replace(/&[a-z#0-9]+;/gi, " ");
        const cjk = (text.match(CJK_RE) || []).length;
        const words = (text.replace(CJK_RE, " ").match(/[A-Za-z0-9_'-]+/g) || []).length;
        const minutes = Math.max(1, Math.round(cjk / 300 + words / 200));
        return `${minutes} min read`;
    });

    // Build a flat TOC list from rendered post HTML (h1-h4 with ids).
    eleventyConfig.addFilter("tocList", (content) => {
        const headings = [];
        const re = /<h([1234])[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
        let m;
        while ((m = re.exec(String(content))) !== null) {
            const text = m[3]
                .replace(/<a[^>]*class="heading-anchor"[\s\S]*?<\/a>/g, "")
                .replace(/<[^>]*>/g, "")
                .trim();
            if (text) headings.push({ level: Number(m[1]), id: m[2], text });
        }
        if (headings.length === 0) return "";
        const minLevel = Math.min(...headings.map((h) => h.level));
        return headings
            .map(
                (h) =>
                    `<li class="toc-item toc-l${h.level - minLevel + 1}"><a class="toc-link" href="#${encodeURI(h.id)}">${h.text}</a></li>`
            )
            .join("\n");
    });

    eleventyConfig.addFilter("wordCount", (content) => {
        const text = String(content)
            .replace(/<[^>]*>/g, " ")
            .replace(/&[a-z#0-9]+;/gi, " ");
        const cjk = (text.match(CJK_RE) || []).length;
        const words = (text.replace(CJK_RE, " ").match(/[A-Za-z0-9_'-]+/g) || []).length;
        return (cjk + words).toLocaleString("en-US");
    });

    /* ---------------------------------------------------------------- *
     * SCSS (same pipeline as the homepage project)
     * ---------------------------------------------------------------- */
    eleventyConfig.addTemplateFormats("scss");
    eleventyConfig.addExtension("scss", {
        outputFileExtension: "css",
        useLayouts: false,
        compile(inputContent, inputPath) {
            const parsed = path.parse(inputPath);
            if (parsed.name.startsWith("_")) return;

            const result = sass.compileString(inputContent, {
                loadPaths: [parsed.dir, "src/styles"],
                style: "compressed",
                sourceMap: false,
            });

            this.addDependencies(inputPath, result.loadedUrls);
            return () => result.css;
        },
    });

    /* ---------------------------------------------------------------- *
     * Passthrough copy
     * ---------------------------------------------------------------- */
    eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
    eleventyConfig.addPassthroughCopy({ "src/content/posts/images": "posts/images" });
    eleventyConfig.addPassthroughCopy({ "src/scripts": "scripts" });

    eleventyConfig.setServerOptions({ showAllHosts: true });

    return {
        dir: {
            input: "src",
            includes: "partials",
            layouts: "layouts",
            data: "data",
            output: "_site",
        },
        templateFormats: ["liquid", "md", "html"],
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid",
    };
};
