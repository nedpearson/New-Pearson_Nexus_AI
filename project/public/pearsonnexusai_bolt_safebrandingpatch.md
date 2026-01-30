# Pearson Nexus AI — Bolt.new Safe Branding + Theme Patch (High‑Res, Responsive)

**Goal**
- Replace **all branding** and the tagline **globally**.
- Replicate the attached dark “AI-tech” look across **desktop + mobile**.
- Use the **right logo variant in the right place** (no duplication).
- Make changes **UI-only** (no breaking auth, data, routing).

---

## Brand system (what goes where)

### Logo variants you provided
1) **Full lockup (logo + “Pearson Nexus AI” + slogan)**  
   File: `Logo with Slogan.png`  
   Use for **brand moments**:
   - Marketing/landing hero
   - Auth screens (login / signup)
   - Splash / loading screen
   - Empty states that need a “brand anchor”

2) **Emblem-only (PN mark)**  
   File: `Logo. Emblem Only.png`  
   Use for **product chrome**:
   - App top-left “app icon” in nav bar / sidebar header
   - Mobile top bar / drawer header
   - Favicon / PWA icon (exported sizes)
   - Compact contexts (cards, toasts, small headers)

### Anti-duplication rule (required)
- If the **sidebar/topbar already shows the emblem**, do **not** show the emblem again inside the page header.
- Page header should be either:
  - **Text-only**: “Pearson Nexus AI” + slogan, *or*
  - **Full lockup** for hero/auth/splash only.
- **Dashboard page**: use **text-only title** in the content area; keep emblem in chrome.

---

## Global slogan replacement

Replace everywhere the old tagline:
- OLD: “Forensic organization + legal-ready evidence”
- NEW: **“One Photo. Your Total Life Organized”**

Where the slogan should appear:
- Under the **large app title** on landing/auth/splash
- Under the **page title** on the dashboard (desktop), but only once
- On mobile: show slogan only on **Dashboard** and **Auth** (avoid clutter elsewhere)

---

## Theme (match the attached mockup)

### Layout & visuals
- Dark, premium “AI-tech” look: subtle starfield / particle gradient background.
- Panels/cards: glassy, soft borders, light inner highlights.
- Rounded corners: 16–24px depending on component size.
- Shadows: soft and deep (no harsh drop shadows).

### Typography
- Title: strong, clean sans (e.g., Inter / system default if already set).
- Keep hierarchy tight:
  - App title: 36–48px desktop, 22–28px mobile
  - Slogan: 16–18px desktop, 12–14px mobile
- Slogan letterspacing slightly positive; make it legible.

### Color tokens (implement as CSS variables)
- `--bg0`, `--bg1`, `--panel`, `--panel2`, `--border`, `--text`, `--muted`, `--accent`, `--accent2`
- Use a blue/cyan accent range consistent with the logo (avoid neon green/purple unless already present).

---

## Required implementation steps (Bolt should do these)

### 1) Create a single source of truth for branding
Add a module like:
- `src/branding/brand.ts`
  - exports: appName, slogan, logoPaths, favicons, usage rules
- `src/branding/BrandMark.tsx`
  - component supporting variants: `"emblem" | "full"`
  - responsive sizing props
  - alt text, aria labels

### 2) Update app chrome (top-left logo)
- Sidebar header: **emblem-only**, height ~28–34px (desktop), ~24–28px (mobile).
- Clicking it routes to Dashboard.
- Ensure retina crispness: use `image-rendering: auto;` and keep CSS sizing proportional.

### 3) Update key screens
- **Login/Signup**: centered **full lockup**, readable slogan.
- **Dashboard**: content header shows **text-only** title + slogan; no extra emblem.
- **Other pages**: content header is title-only (optional subtitle), no slogan unless it adds value.

### 4) Update metadata + icons
- `index.html` (or framework equivalent): update title, meta description, OpenGraph, Twitter cards.
- Use emblem-only for favicon/PWA icons.
- Generate: 16, 32, 48, 96, 192, 512. (If Bolt can’t generate, set 192/512 and let the rest be browser-scaled.)

### 5) Ensure mobile responsiveness matches mockup
- Sidebar collapses to drawer on small widths.
- Top bar contains: hamburger, page title (or none), actions (search/settings).
- Keep safe areas (iOS notch) padding.

### 6) Remove/replace old slogan everywhere
- Search repo for the old text string and replace with the new slogan **only where allowed** per rules above.
- If any component was using that old text for layout spacing, replace with spacing tokens rather than hidden text.

---

## Bolt.new “DO NOT BREAK” constraints
- Do **not** modify auth/session logic, API endpoints, data models, or routing semantics.
- Only modify:
  - assets
  - UI components/layout
  - CSS/tailwind/theme tokens
  - copy/text

---

## Troubleshooting: the errors you’re seeing in Bolt

These are almost always **Bolt/StackBlitz runtime + auth + blocked network** issues (not your app code).

### A) `Invalid token response 403` (StackBlitz GitHub tokens)
What to do:
1. In Bolt/StackBlitz, **disconnect GitHub** then reconnect (fresh OAuth).
2. **Clear site data** for:
   - `bolt.new`
   - `stackblitz.com`
   - `webcontainer.io`
3. Disable extensions temporarily (adblock/script blockers/privacy tools).
4. Try an **Incognito** window.
5. If on a work/school network, try a different network (some block OAuth/token endpoints).

### B) `meso.min.js 404` / `chmln.js 404`
Usually a transient asset path/CDN issue.
1. Hard refresh: `Ctrl+Shift+R`
2. Clear cache for `bolt.new`
3. If it persists, ignore if the app runs; these are often noncritical analytics/assist scripts.

### C) Supabase requests BLOCKED / “localStorage only”
Your Bolt environment is running in a restricted mode.
- Fix by ensuring the project is configured for **local/offline mode** OR explicitly re-enable Supabase integration in Bolt’s settings if you intended to use it.
- For now (safe): keep local storage auth and do not call Supabase from the client.

---

## What to paste into Bolt’s text box (short + safe)

Use this EXACT text:

“Apply the Pearson Nexus AI Safe Branding + Theme Patch. Replace the old slogan globally with: ‘One Photo. Your Total Life Organized’. Use emblem-only logo for app chrome and icons; use full logo lockup only on auth/landing/splash. Replicate the attached dark AI-tech mockup: glass panels, particle gradient background, responsive sidebar/drawer. Do UI-only changes; do not modify auth, API, routing, or data models. Ensure no duplicate logos on any screen.”
