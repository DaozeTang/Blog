const GithubSlugger = require("github-slugger");

const ghSlug = (value) => new GithubSlugger().slug(String(value));

module.exports = {
    layout: "post.liquid",
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
