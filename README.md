# Frontend Service

Frontend project for the tutorial ecosystem, built with React + Vite and integrated with a free open-source CMS (Decap CMS).

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## CMS integration (Decap CMS)

- Admin URL: `/admin/`
- CMS config: `public/admin/config.yml`
- Editable homepage content source: `public/content/site.json`

### Notes for GitHub-backed CMS auth

Decap CMS is free/open-source, but GitHub backend editing requires an OAuth flow provider.
Typical options:

- Netlify Identity + Git Gateway (if hosted via Netlify)
- Self-hosted OAuth proxy for GitHub (if hosted elsewhere, including GitHub Pages)

The current config is ready for GitHub repo wiring and content structure, and can be finalized once your auth flow choice is made.
