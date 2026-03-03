# Frontend Service Instructions (Detailed)

Use this file as the repository-specific implementation contract for AI-assisted changes.

## 1) Repository role

- This repository delivers user-facing task planning and task management UX.
- Stack: React + Vite + TypeScript (strict mode) + Tailwind CSS.
- Visual planning output uses Mermaid diagrams.

## 2) Service boundaries

- Frontend consumes backend APIs; it must not call AI providers directly.
- Keep API assumptions aligned with backend-service v1 contracts.
- Treat ai-orchestrator-service as backend implementation detail, not direct frontend dependency.

## 3) Runtime and environment

- Read backend URL from VITE_API_BASE_URL.
- Local default backend URL: http://localhost:3000.
- Keep environment variable names stable to avoid deployment breakage.

## 4) Product behavior requirements

- Planner flow must support:
  - submitting a long-term goal,
  - receiving generated composite tasks,
  - bulk creation of generated tasks,
  - continued task CRUD management in list views.
- Diagram flow must render Goal -> Tasks representation for generated plans.

## 5) Backend contract compatibility

Assume backend endpoints:
- GET /api/v1/tasks (with filters).
- POST /api/v1/tasks.
- POST /api/v1/tasks/plan.
- PATCH /api/v1/tasks/{id}.
- DELETE /api/v1/tasks/{id}.

Avoid introducing frontend payload changes that require backend contract drift without coordinated updates.

## 6) Deployment constraints

- GitHub Pages workflow deploys built assets from dist/.
- Vite base path should remain compatible with /frontend-service/ unless deployment strategy is explicitly changed.
- Keep Decap CMS paths stable unless migration is requested:
  - /admin/ (dev)
  - /frontend-service/admin/ (Pages)
  - public/admin/config.yml
  - public/content/site.json

## 7) UI and code change guidance

- Keep changes minimal and consistent with current UI patterns.
- Preserve TypeScript strictness; avoid introducing any/unsafe casting without necessity.
- Maintain clear loading/error/empty states for API-driven views.
- Keep Mermaid generation deterministic from planner outputs.

## 8) Quality gates before completion

Run and pass:
- npm run build

If tests/lint scripts are available in package.json, run relevant ones for touched areas.

## 9) Documentation synchronization

When changing API usage, environment variables, routes, or CMS behavior:
- update README.md,
- verify deployment notes remain accurate,
- document any required operator setup changes.
