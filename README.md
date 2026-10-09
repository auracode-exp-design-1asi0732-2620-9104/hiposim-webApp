# HipoSim Web (Advisor Portal)

Web application of **HipoSim**, the independent mortgage simulator for first-time home buyers in Peru. This repository is
the portal for **real estate advisors**: they sign in, see the leads that buyers authorized to share, open each lead card
and track it with a status and notes. Buyers use the Android app and the public Landing Page instead.

Stack: Vue 3, Vite, TypeScript, PrimeVue 4 (Material-style theme with the HipoSim tokens), Pinia, Vue Router, vue-i18n
and axios.

## Scope of this delivery (Sprint 2)

| Story | What it does | Status |
|---|---|---|
| US22 | Advisor login with JWT (only advisor accounts can enter) | Done, against the API contract v0 |
| US23 | Lead inbox with a status filter | Done, lead endpoints are a proposal (see below) |
| US24 | Lead card: contact data, shared simulation, follow-up history, WhatsApp and call links | Done, same note |
| US25 | Change the lead status and add follow-up notes | Done, same note |

Dashboard, My agency, Notifications and Settings show a "Coming soon" page: they have no user story in this delivery.

## Getting started

Requirements: Node.js `^22.18.0` or `>=24.12.0`.

```sh
npm install
npm run dev
```

By default `npm run dev` uses **sample data in the browser** (`VITE_USE_MOCK=true` in `.env.development`), so the screens
work without the API. Any email and password sign in as a sample advisor.

### Using the real API

Create `.env.development.local` (not versioned; it overrides `.env.development`) with:

```sh
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=false
```

`VITE_API_URL` is the port of the backend launch profile. The API must allow the origin of the dev server (CORS).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type check and production build |
| `npm run lint` | ESLint (Vue and TypeScript rules) |
| `npm run type-check` | `vue-tsc` |
| `npm test` | Unit and component tests with Vitest (they always use sample data) |

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint, type check, tests and build on every push and pull
request to `main` and `develop`.

## Deployment (Vercel)

The web app is a static single-page app, so it is published on Vercel. `vercel.json` sends every route (`/leads`,
`/login`, ...) to `index.html`, otherwise a page refresh would give a 404.

1. In Vercel, choose **Add New... > Project** and import this GitHub repository. The Vite preset is detected on its own.
   The Vercel GitHub app must be installed on the organization that owns the repository (this needs an organization admin).
2. Set these **Environment Variables** for Production (they are not stored in the repository):

   | Name | Value |
   |---|---|
   | `VITE_API_URL` | Public HTTPS URL of the API, without a trailing slash |
   | `VITE_USE_MOCK` | `false` |

3. Deploy. Every push to `main` publishes a new production version.
4. Add the production URL (`https://<project>.vercel.app`) to `Cors__AllowedOrigins` in the API. Preview deployments of
   pull requests have other URLs, so the API blocks them unless they are added as well.

Vercel Hobby is free for personal, non-commercial use and has no team features: the project belongs to the account
that connects it.

## Project structure

```
src/
  features/
    auth/        login view, session store (Pinia) and the auth API call
    leads/       inbox and card views, API client, types, sample data
  layouts/       advisor layout: sidebar, top bar, legal footer
  shared/
    api/         axios client, token handling, 401 handling
    components/  logo, language switcher
    views/       "Coming soon" page
  i18n/          English (default) and Spanish (es-419) messages
  router/        routes and the advisor-only guard
```

## API contract

- Auth follows `hiposim-backEnd/docs/api-contract/openapi.v0.yaml` (`POST /api/auth/login`).
- **Leads are not in that contract yet.** The client in `src/features/leads/api/` assumes:
  `GET /api/leads?status=`, `GET /api/leads/{id}`, `PATCH /api/leads/{id}/status`, `POST /api/leads/{id}/notes`.
  Statuses: `new`, `contacted`, `appointmentScheduled`, `closed`, `discarded`. Rates are fractions (`0.0885` = 8.85%).
  Everything that depends on the contract lives in `leads.api.ts` and `leads.types.ts`, so adjusting it is local.
- The login response needs `agencyName` for the top bar (optional, falls back to "Agency").

## Languages and accessibility

English is the default language; Spanish (es-419) is available from the language switcher, and the choice is remembered.
The app has a skip link, keyboard-reachable controls, labelled forms, announced errors and AA-contrast text colors.

## Git workflow

GitFlow: `main` and `develop` are protected; work happens in `feature/<story>-<topic>` branches and goes through pull
requests. Commits follow Conventional Commits.
