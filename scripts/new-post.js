const fs = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2);

if (args.length === 0) {
    console.error("Error: no filename argument provided\nUsage: npm run new-post -- <filename>");
    process.exit(1);
}

let fileName = args.join(" ").trim();
if (!/\.md$/i.test(fileName)) fileName += ".md";

const targetDir = path.join(__dirname, "..", "src", "content", "posts");
const fullPath = path.join(targetDir, fileName);

if (fs.existsSync(fullPath)) {
    console.error(`Error: ${fullPath} already exists`);
    process.exit(1);
}

const today = new Date();
const pad = (n) => String(n).padStart(2, "0");
const date = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
const title = path.basename(fileName, ".md");

const frontmatter = `---
title: ${title}
published: ${date}
pinned: false
description: ""
tags: []
category: ""
draft: true
---

`;

fs.mkdirSync(path.dirname(fullPath), { recursive: true });
fs.writeFileSync(fullPath, frontmatter);
console.log(`Created ${path.relative(process.cwd(), fullPath)}`);
