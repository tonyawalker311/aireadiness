# AI-Readiness Marketing Operations Checklist (GitHub Pages Ready)

**Repo:** `aireadiness` for user `tonyawalker311`  
**Live URL (after deploy):** `https://tonyawalker311.github.io/aireadiness/`

## 1) Create the repo
1. Go to GitHub → New repository → Name: **aireadiness** → Public → Create.
2. Do **not** initialize with a README (keeps history clean).

## 2) Upload these files
Upload **all** files from this package to the repo root (drag & drop in GitHub → Upload files):
- `index.html`, `package.json`, `vite.config.js`
- `postcss.config.js`, `tailwind.config.js`
- `src/` (folder with `App.jsx`, `index.css`, `main.jsx`)
- `.github/workflows/deploy.yml` (make sure the **.github** folder is included)

## 3) Enable Pages via Actions
- Repo → **Settings → Pages** → **Source = GitHub Actions**.

## 4) Deploy
- On push to `main`, the included workflow will:
  - install deps (`npm install`)
  - build with `--base=/aireadiness/`
  - publish `dist/` to GitHub Pages

## 5) Test
- Visit `https://tonyawalker311.github.io/aireadiness/`
- If blank/404, open **Actions → Deploy to GitHub Pages** to see logs.

## Lead capture
In `src/App.jsx`, set:
```js
const LEAD_CAPTURE_ENDPOINT = 'https://your-webhook-endpoint';
```
Your endpoint must accept CORS from `github.io`.

## Squarespace embed
```html
<div style="width:100%;max-width:1200px;margin:0 auto">
  <iframe
    src="https://tonyawalker311.github.io/aireadiness/"
    style="width:100%;min-height:1700px;border:0;"
    loading="lazy"
    title="AI-Readiness Marketing Operations Checklist"
  ></iframe>
</div>
```
