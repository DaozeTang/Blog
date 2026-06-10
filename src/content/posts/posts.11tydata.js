const GithubSlugger = require("github-slugger");

// Post URL slug is derived from the filename: /posts/<kebab-case-filename>/.
const ghSlug = (value) => new GithubSlugger().slug(String(value));

module.exports = {
    layout: "post.liquid",
    // Post bodies are plain Markdown — never run them through Liquid.
    templateEngineOverride: "md",
    eleventyComputed: {
        date: (data) => data.published || data.page.date,
        permalink: (data) => {
            if (data.draft) return false;
            return `/posts/${ghSlug(data.page.fileSlug)}/`;
        },
        eleventyExcludeFromCollections: (data) => !!data.draft,
    },
};
