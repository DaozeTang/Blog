const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

/* Pagination lives in JS rather than front matter because Liquid cannot
   interpolate `size:` from site data (a `"{{ site.posts_per_page }}"` string
   is passed to lodash.chunk verbatim and silently falls back to one page).
   site.yml stays the single source of truth so the feed and the sitemap's
   paginated URL list cannot disagree. */
const site = yaml.load(
    fs.readFileSync(path.join(__dirname, "data", "site.yml"), "utf8")
);

module.exports = {
    pagination: {
        data: "collections.postsPinnedFirst",
        size: Math.max(1, Number(site.posts_per_page) || 10),
        alias: "posts",
    },
};
