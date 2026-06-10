# blog.dztang.net

Personal blog of **Daoze Tang**. Built with [Eleventy](https://www.11ty.dev/) and the same hand-rolled SCSS design system as my [homepage](https://github.com/DaozeTang/DaozeTang.github.io); full-text search by [Pagefind](https://pagefind.app/), comments by [giscus](https://giscus.app/); deployed to GitHub Pages via GitHub Actions on every push to `main`.

## Develop

```bash
npm install
npm run serve   # dev server with live reload (search index not built)
npm run build   # production build into _site/ + Pagefind index
npm run new-post -- "Post Title"
```

## Edit

| What | Where |
| --- | --- |
| Posts | `src/content/posts/*.md` |
| Post images | `src/content/posts/images/<post-slug>/` |
| Site metadata, analytics, giscus | `src/data/site.yml` |
| Navbar links | `src/data/navigation.yml` |
| Old-URL redirects | `src/data/redirects.yml` |

Post front matter: `title`, `published`, `pinned`, `description`, `tags`, `category` (single), `draft`. Filenames are English kebab-case and become the URL slug (`/posts/<filename>/`).

---

© Daoze Tang · MIT License
