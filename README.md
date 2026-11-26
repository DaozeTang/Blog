# blog.dztang.net

Personal blog of **Daoze Tang**. Built with [Eleventy](https://www.11ty.dev/) and a hand-rolled, false-colour "aerial survey" SCSS system shared with my [homepage](https://github.com/DaozeTang/DaozeTang.github.io); full-text search by [Pagefind](https://pagefind.app/), comments by [giscus](https://giscus.app/); deployed to GitHub Pages via GitHub Actions on every push to `main`.

## Develop

```bash
npm install
npm run serve     # dev server with live reload (search index not built)
npm run build     # production build into _site/ + Pagefind index
npm run new-post -- "Post Title"
npm run theme:check   # pixel design-system guard (also runs before build)
```

Fenced code blocks need a Prism language tag to be highlighted, e.g. ``` `bash` ``, ``` `python` ``, ``` `yaml` ``, ``` `ini` `` for systemd/screenrc/registry files, ``` `batch` ``, ``` `powershell` ``, ``` `latex` ``. Use ``` `text` `` for command output, error messages, URLs and other non-code samples so they stay deliberately unhighlighted instead of appearing broken.

## Edit

| What | Where |
| --- | --- |
| Posts | `src/content/posts/*.md` |
| Post images | `src/content/posts/images/<post-slug>/` |
| Site metadata, analytics, giscus | `src/data/site.yml` |
| Navbar links | `src/data/navigation.yml` |
| Old-URL redirects | `src/data/redirects.yml` |
| Tools on /tools/ | `src/data/tools.yml` |
| Pagefind tuning, search copy | `src/search.liquid` |

Post front matter: `title`, `published`, `pinned`, `description`, `tags`, `category` (single), `draft`. Filenames are English kebab-case and become the URL slug (`/posts/<filename>/`).

## Design system — GROUND TRUTH

The blog shares its whole visual core with the [homepage](https://github.com/DaozeTang/DaozeTang.github.io):
one hand-rolled SCSS system for a **nocturnal low-altitude survey console**.
The blog reads as the same instrument's field notebook — the cover is an aerial
plate of the field station at night, the feed is an annotation ledger, and
articles are long-form notes on the same void-blue ground. Hard edges, a 4px
grid, stepped motion, self-hosted pixel type; no blur, no rounded corners.

The shared partials must stay byte-identical with the homepage —
`npm run build` refuses to build on drift.

| Partial | Role |
| --- | --- |
| `src/styles/_tokens.scss` | Palette, type scale, spacing, hard shadows, stepped motion |
| `src/styles/_fonts.scss` | Self-hosted @font-face declarations |
| `src/styles/_base.scss` | Reset, stage (control points, scanlines, glow), icons, print rules |
| `src/styles/_pixel.scss` | Plates, frames, detection boxes, reticle, screens, annotation labels |
| `src/styles/_layout.scss` | Shell, section headers, record stamps, sticky rails |
| `src/styles/_chrome.scss` | Sensor-bar masthead, navigation, footer downlink |
| `src/styles/_ui.scss` | Buttons, chips, dialogs, pager, forms, code chrome |
| `src/styles/_prose.scss` | Long-form article typography and syntax colours |
| `src/styles/_animations.scss` | Stepped keyframes, reveal, toast |
| `src/styles/_responsive.scss` | Breakpoints, touch targets |
| `src/styles/_a11y.scss` | High-contrast and forced-colours overrides (imported last) |

Blog-only partials: `_cover`, `_feed`, `_post`, `_archive`, `_tools`,
`_search`, `_pages`.

**Palette.** False-colour remote sensing on a void ground: NDVI chartreuse
(`--accent`) for signal and links, false-colour magenta (`--coral`) for
alerts, sensor cyan (`--blue`) for information, thermal amber (`--gold`) for
warm highlights. Light mode is a daylight ortho paper with a deep olive accent.
Colours only come from tokens; body text clears WCAG AA in both themes.

**Type.** `Silkscreen` (8px grid) for display and controls, `Cubic 11`
(12px grid) for CJK display and headings, `Noto Sans SC` for body copy,
`VT323` for oversized readouts (dates, counts, years), mono for metadata.
Pixel fonts are self-hosted from `src/assets/fonts/` (SIL OFL 1.1, licence
files included) so Chinese readers never wait on Google Fonts.

**Art.** The cover plate is painted by `src/scripts/pixel-scene.js` at 8 fps —
a false-colour aerial of the field station: lab building with lit skylights, a
dish antenna, a solar array, a truck, a pond, and one cat on the gravel, with
DOM detection boxes and a scene-space reticle that reports coordinates and the
class under the pointer. The favicon and the 1200×630 social card are generated
by `python3 scripts/pixel-art.py` (Pillow).

**Motion.** Every transition runs on `steps()`; `prefers-reduced-motion`
freezes the scene and the reveals. Theme switches use a stepped
dither shutter. The search affordance is a real link to `/search/` that
upgrades into a dialog when scripts run; the lightbox supports arrows, keyboard
and swipe; code blocks are wrapped so their copy button stays put while the
code scrolls.

**Index pages.** `/archive/` is the hub: category rows carry an NDVI share bar
and a destination arrow, the tag cloud collapses, and the timeline is a
numbered ledger. `/tags/` and `/categories/` list every term with counts; the
tag index has a live filter that hides empty bands (the toolbar ships hidden,
so a blocked script still shows the full index). Term pages carry the same
record stamp as the rest of the site. Code blocks that overflow horizontally
get a right-edge fade and a "→" cue until scrolled to the end; touch devices
always show the row arrows that hover normally reveals.

**Accessibility.** Theme colours come from tokens measured at AA contrast;
headings are normalised, decorative permalinks are out of the tab order, prose
links are underlined rather than colour-only, and the theme icon is selected by
CSS from `data-theme-mode` so it is correct even without JavaScript.
`prefers-contrast: more` and forced-colours overrides live in `_a11y.scss`.

---

© Daoze Tang · MIT License
