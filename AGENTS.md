# AGENTS.md

## Project Overview

Personal portfolio & blog site for **r**. Built with Astro v7, deployed to **Cloudflare Workers** via `@astrojs/cloudflare`. The visual theme is a "deep-sea dive" motif with dark blue backgrounds, scroll-driven depth effects, and Japanese typography.

**This is NOT a monorepo.** It is a single Astro project with `npm` as the package manager.

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Astro 7 (SSR mode via Cloudflare adapter) |
| Content | Astro Content Collections (Markdown / MDX) |
| Styling | Vanilla CSS (`src/styles/global.css` + scoped `<style>` in `.astro` files) |
| Fonts | Google Fonts — Shippori Mincho, Zen Kaku Gothic New, IBM Plex Mono |
| Hosting | Cloudflare Workers + Assets (`wrangler.jsonc`, worker name: `home`) |
| Image Processing | `sharp` (with Cloudflare `passthrough` image service) |
| Integrations | `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss` |

## Directory Structure

```
├── public/                  # Static assets served as-is
│   ├── favicon.svg          # SVG favicon
│   ├── ai-driven-development/ # Blog post images
│   ├── mars/                # Mars colonization game (standalone HTML)
│   ├── othello/             # Othello AI simulator (standalone HTML)
│   ├── sound/               # Sound generator mini-app
│   ├── pressure/            # Pressure simulator mini-app
│   ├── password/            # Password generator mini-app
│   ├── copycraft/           # AI CopyCraft mini-app
│   ├── models/              # AI model reference page assets
│   └── assets/              # Shared static assets
├── src/
│   ├── assets/fonts/        # Local font files (Atkinson woff)
│   ├── components/          # Astro components (BaseHead, Header, Footer, etc.)
│   ├── content/blog/        # Blog posts (Markdown)
│   ├── content.config.ts    # Content collection schema (title, description, pubDate, heroImage)
│   ├── consts.ts            # Site-wide constants (SITE_TITLE, SITE_DESCRIPTION)
│   ├── layouts/             # BlogPost.astro layout
│   ├── pages/               # Route pages
│   │   ├── index.astro      # Homepage (portfolio with deep-sea scroll UI)
│   │   ├── about.astro      # About page
│   │   ├── people.astro     # People page
│   │   ├── ai-driven-development.astro  # AI development article page
│   │   ├── blog/            # Blog listing & [slug] routes
│   │   └── rss.xml.js       # RSS feed endpoint
│   └── styles/global.css    # Global CSS (color tokens, typography, resets)
├── astro.config.mjs         # Astro config (MDX, sitemap, fonts, Cloudflare adapter)
├── wrangler.jsonc           # Cloudflare Workers config
├── tsconfig.json            # TypeScript (strict, extends astro/tsconfigs/strict)
└── package.json             # npm scripts & dependencies
```

## Commands

| Command | Description |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start Astro dev server (`localhost:4321`) |
| `npm run build` | Production build → `./dist/` |
| `npm run preview` | Build + `wrangler dev` (local Cloudflare preview) |
| `npm run deploy` | Build + `wrangler deploy` (deploy to Cloudflare) |
| `npm run generate-types` | Generate Cloudflare Worker types via Wrangler |

Do **not** use `pnpm`, `yarn`, or other package managers. This project uses `npm`.

## Coding Conventions

### Language & Locale
- The site language is **Japanese** (`<html lang="ja">`).
- Code comments are in Japanese where they already exist. Match the surrounding style.

### Styling
- **No Tailwind.** Use vanilla CSS only.
- Global design tokens are defined in `src/styles/global.css` under `:root`.
- Page-specific styles go in scoped `<style>` blocks inside `.astro` files.
- The color palette follows a dark deep-sea theme (blues, grays, light text on dark).
- Key CSS variables: `--bg-deep`, `--ink`, `--ink-body`, `--ink-sub`, `--font-display`, `--font-body`, `--font-mono`.

### Content
- Blog posts live in `src/content/blog/` as `.md` or `.mdx` files.
- Frontmatter schema: `title` (string), `description` (string), `pubDate` (date), `updatedDate` (date, optional), `heroImage` (string, optional).
- Images for blog posts go in `public/` and are referenced with absolute paths (e.g., `/ai-driven-development/hero.webp`).

### Components
- All components are `.astro` files (no React/Vue/Svelte currently in use).
- `BaseHead.astro` handles `<head>` meta tags, OGP, and favicon.
- `Header.astro` / `Footer.astro` provide the global navigation shell.

### Mini-Apps
- Several standalone HTML mini-apps live under `public/` (mars, othello, sound, pressure, password, copycraft).
- These are self-contained (HTML + inline JS/CSS) and are **not** part of the Astro build pipeline.
- They are linked from the homepage (`index.astro`).

## Commit Convention

Follow **Conventional Commits** with a lowercase verb prefix:

```
feat: add new feature
fix: bug fix
docs: documentation only
refactor: code change without feature/fix
chore: maintenance tasks
```

Use scoped prefixes for mini-apps: `feat(mars):`, `fix(othello):`, etc.

## Deployment

1. `npm run build` — Astro builds to `./dist/`
2. `wrangler deploy` — Uploads to Cloudflare Workers

The Wrangler config (`wrangler.jsonc`) uses `@astrojs/cloudflare/entrypoints/server` as the main entry and serves `./dist` as static assets.