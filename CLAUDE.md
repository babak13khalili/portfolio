# Project: My Personal Portfolio Website

## What this is
A personal portfolio/resume website. It already exists and works — this is not a
from-scratch build, it's ongoing improvements and maintenance.

## First-time setup instructions for Claude
I am not a developer, so before making changes:
1. Look through the project files and figure out what framework/language it's
   built with (e.g. plain HTML/CSS, React, Next.js, Vite, etc.) and how to run it
   locally.
2. Figure out the commands to run the site locally and to build it, and add them
   below under "Commands" so future sessions don't need to re-discover this.
3. Briefly summarize the folder structure below under "Structure" so you (Claude)
   remember it next time.

## Commands
This is a plain HTML/CSS/JS site — no framework, no build step, no
package.json. The only third-party code is the `marked` Markdown parser,
loaded from a CDN `<script>` tag in `index.html`.

- **Install dependencies:** None — there is no package manager in use.
- **Build:** None — there is no build/compile step. Edit the files directly
  and they're ready to deploy as-is.
- **Dev/preview:** Content (project text) is loaded at runtime
  via `fetch()` from the `content/` folder, which browsers block on
  `file://` pages (CORS). So don't just double-click `index.html` — serve
  the folder over local HTTP first, e.g. from the project root:
  ```
  python3 -m http.server 8000
  ```
  then open `http://localhost:8000` in a browser. (Any static file server
  works — `npx serve` is an alternative if Python isn't available.)

## Structure
- `index.html` — the single HTML page. All sections (Home, About, Projects,
  Contact) live here; navigation swaps which `<section>` is visible via JS
  rather than loading separate pages.
- `assets/css/style.css` — the one stylesheet, organized into numbered
  sections (variables, reset, typography, layout, navigation, per-page
  styles, cursor FX, utilities, responsive breakpoints — see the file's
  header comment for the full table of contents).
- `assets/js/script.js` — all site behavior: cursor effects, the text-glitch
  hover effect, and the main app (client-side nav, and fetching/rendering
  Markdown content for projects into the page).
- `assets/images/` — image assets (currently just the profile photos).
- `content/manifest.js` — the editorial index. Sets `window.SITE_MANIFEST`,
  a list of project entries (id, title, file path, sidebar media). This is
  the file to edit when adding new content — it's read before `script.js`
  and drives what shows up on the site.
- `content/projects/*.md` — one Markdown file per project, rendered into the
  Projects section detail view.
- `.nojekyll` — tells GitHub Pages not to run Jekyll processing on the site
  (needed because some file/folder names would otherwise be mangled).

## Hosting
- This site is hosted on **GitHub Pages**.
- When changes are ready to go live, make sure the build/deploy steps needed for
  GitHub Pages are followed (check if there's a GitHub Actions workflow already
  set up for this, or if it deploys from a specific branch like `gh-pages` or
  `main`).

## Working style
- I'm not a developer, so:
  - Explain what you're doing in plain, non-technical language before and after
    making changes.
  - You do NOT need to ask permission before making changes — go ahead and make
    them, I will review the results afterward.
  - If something is ambiguous or could break the live site, mention it clearly
    rather than guessing silently.
- **Yes to all — don't stop to ask for permission on routine actions.** This
  covers editing files, running local commands (dev server, npm/npx installs,
  screenshots/tests), and git branch work (creating branches, pushing to
  `develop`). Just do it and tell me what you did afterward. Exceptions —
  always ask first for these specifically:
  - Genuinely destructive/irreversible operations — force-push,
    `git reset --hard`, deleting branches or files you didn't create yourself.
  - **Creating a commit.** Always ask before committing, even routine changes —
    don't commit automatically just because a change is done.
- Keep changes focused — don't restructure or rewrite parts of the site I didn't
  ask about.
- After making changes, tell me in simple terms what to check (e.g. "open this
  page and look for X") to confirm it worked.

## Design & aesthetic direction
I'm open to visual changes, but the aesthetic must strictly follow these rules:

- **Color: strictly black and white only.** No color accents, no tinted grays used
  as "color," no gradients of any kind — not even black-to-white or white-to-black
  gradients. Flat black and flat white (and true grayscale if needed for
  images/photos only).
- **No gradients anywhere** — not in backgrounds, buttons, text, borders, or
  shadows.
- **Minimal and text-based.** Typography should carry the design. Favor
  whitespace, type hierarchy, and layout over decorative elements or graphics.
- **Creative, not generic.** This is a portfolio for a new media / multimedia
  fine art artist — the site should feel like an intentional creative work
  itself, not a template.
- **Avoid anything that reads as "AI-generated design."** Concretely, this means
  avoid:
  - Generic rounded cards with soft drop shadows
  - Purple/blue/pink gradient accents (common in AI-generated UI)
  - Overused hero sections with big centered headline + subtext + button pattern
  - Stock-looking icon sets, emoji as icons, or generic illustration styles
  - Excessive symmetry and predictable centered layouts everywhere
  - Glassmorphism / frosted-glass effects
  - When in doubt, favor unexpected, editorial, or gallery-like layouts over
    "safe" dashboard/SaaS-style layouts.
- **Simple over clever.** Don't over-engineer visuals — simplicity is a feature,
  not a placeholder for something fancier later.

## Animation & interaction
- Keep motion minimal and intentional — not "none," but nothing flashy or
  attention-seeking.
- Subtle transitions are welcome (e.g. fades, understated hover states, simple
  cursor or reveal effects) as long as they feel considered and match a fine art
  portfolio, not a marketing site.
- Avoid: bouncy/springy animations, parallax-heavy scroll effects, typing/typewriter
  text effects, confetti/particle effects, or anything that feels like a template
  demo animation.
- When adding any animation, ask: "would this feel at home in a gallery or artist's
  site, or does it feel like a SaaS landing page?" — favor the former.

## Content
- This site is about me — my background, skills, and work. When asked to add or
  edit content (bio, projects, contact info, etc.), ask me for the specific text/
  details if they're not already provided, rather than inventing things about me.

## Do NOT
- Don't add new frameworks, libraries, or tools without telling me first and
  explaining why in plain language.
- Don't touch any deployment/hosting configuration without explaining what it
  does and confirming with me first.
- Don't delete existing content, pages, or images unless I specifically ask.
