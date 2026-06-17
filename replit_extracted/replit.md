# Virtual Zawiyah — Online Islamic Academy

A marketing website for Virtual Zawiyah, an online Islamic Academy offering live Quran, Tajweed, Hifz, Arabic, and Islamic Studies courses to students worldwide.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter routing
- UI: shadcn/ui + Tailwind CSS
- Animations: Framer Motion
- Forms: react-hook-form + Zod
- Data fetching: @tanstack/react-query
- Carousel: embla-carousel-react
- Icons: lucide-react, react-icons/fa
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/virtual-zawiyah/src/pages/` — all page components (home, about, courses, teachers, admission, contact, faq, privacy, terms, not-found)
- `artifacts/virtual-zawiyah/src/components/layout.tsx` — Navbar, Footer, FloatingWhatsApp, GeometricPattern
- `artifacts/virtual-zawiyah/src/lib/animations.ts` — shared Framer Motion variants
- `artifacts/virtual-zawiyah/public/` — static assets (hero image, favicon, OG image, teacher photos)
- `artifacts/virtual-zawiyah/index.html` — SEO meta tags, OG tags, font preloads
- `lib/db/src/schema.ts` — DB schema (admissions, contacts tables)
- `lib/api-spec/` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed React Query hooks + Zod schemas used on both client and server
- All WhatsApp links use +923355777312 (primary); +923255777312 is secondary contact
- Serif font: Cormorant Garamond (headings); Sans: Inter (body) — loaded via Google Fonts in both index.html (preload) and index.css (@import)
- Gender-segregated teaching is a core policy — reflected throughout copy and the Admission form
- Islamic star geometric pattern reused across section backgrounds via GeometricPattern component

## Product

Virtual Zawiyah is an online Islamic Academy with:
- 8 courses: Quran Reading, Hifz, Applied Tajweed, Noorani Qaida, Islamic Studies, Arabic Grammar, Seerah, Fiqh
- 6 teachers (male and female) with traditional qualifications (Hafiz, Alim, Ijazah)
- Multi-step Admission form wired to POST /api/admissions
- Contact form wired to POST /api/contacts
- 8 pages: Home, About, Courses, Teachers, Admission, Contact, FAQ, Privacy Policy, Terms of Service, 404
- Target markets: US, UK, Europe, Canada, Australia, Hong Kong, and global Muslim communities

## User preferences

- Primary WhatsApp: +923355777312 | Secondary: +923255777312
- Colors: primary #1B6B3A (green), secondary #C9A84C (gold), background #FAFAF7, card #E8F5EE
- Keep font pairing: Cormorant Garamond (serif) + Inter (sans-serif)
- All WhatsApp pre-filled messages should start with "Assalamu Alaikum"
- Footer "Our Policies" links to /terms (not /about)

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change before editing client code
- Run `pnpm --filter @workspace/db run push` after schema changes in development
- The embla carousel requires both `[emblaRef, emblaApi]` destructuring — `emblaApi` is needed for prev/next navigation buttons
- GeometricPattern uses a unique SVG `id="islamic-star"` — if used multiple times on the same page, duplicate IDs can conflict; each instance should ideally have a unique patternId (not yet refactored)
- `pnpm run typecheck` is authoritative; trust it over editor LSP when they disagree

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
