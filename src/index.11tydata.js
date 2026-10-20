const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

// Pagination must live here: Liquid cannot interpolate `size:` from site data,
// and this keeps the feed and the sitemap's page list reading the same number.
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
