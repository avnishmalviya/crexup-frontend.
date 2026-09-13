# Crexup Frontend — Admin Dashboard + Public Forms

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4. Talks to the Crexup
backend over `NEXT_PUBLIC_API_URL`.

## Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local: point NEXT_PUBLIC_API_URL at your running backend
npm run dev
```

Requires internet access at build time for Google Fonts (Space Grotesk,
Inter, JetBrains Mono) — this was built/tested in a sandbox that blocks
`fonts.googleapis.com`, so the production build was verified with a
temporary system-font fallback and then restored to the real fonts. `npm
run build` will fail exactly the way it did here if run somewhere without
outbound internet access to Google Fonts; on a normal dev machine or CI
runner it will succeed.

## Design system

- **Palette**: ink (near-black navy), paper (cool off-white background),
  coral (primary action accent), teal/amber/red (semantic states), indigo
  (links/selection). Defined as CSS variables in `src/app/globals.css`.
- **Type**: Space Grotesk (display/headings), Inter (body), JetBrains Mono
  (creator IDs, campaign codes, stats — anywhere a number or code needs to
  read precisely).
- **Signature component**: `ScoreRing` (`src/components/shared/ScoreRing.tsx`)
  — a radial gauge that colors red→amber→teal as a creator's score rises.
  Used on creator cards, profile headers, and campaign rosters so quality
  reads at a glance.

## Pages

**Admin (behind `/login`, JWT stored in localStorage):**
- `/dashboard` — summary stats, recent registrations, campaign timeline
- `/creators` — smart search/filter + bulk-select → Create Campaign
- `/creators/[id]` — full profile: Instagram data, AI scores, performance
  history, internal notes
- `/campaigns` — list; `/campaigns/new` — create (pre-fills selected
  creators); `/campaigns/[id]` — pipeline stepper + tabs (Creators,
  WhatsApp, Shipping, Content, Reports)
- `/whatsapp`, `/reports` — campaign pickers into the relevant tab

**Public (no login):**
- `/register` — creator registration
- `/brand-inquiry` — brand inquiry
- `/confirm?id=<campaignCreatorId>` — accept/decline + shipping address
  (this is the link you'd put in the WhatsApp invitation template)
- `/submit-content?campaignId=<id>&creatorId=<id>` — content submission

## Not yet built

- File upload UI (profile pictures, screenshots) — currently URL-based;
  wire to a Supabase Storage upload endpoint on the backend, then swap the
  relevant `<Input type="url">` fields for real upload widgets.
- Bulk-select checkboxes on the campaign roster for multi-creator WhatsApp
  actions beyond "preview all shortlisted, then send."
- Toasts/inline validation polish — forms currently show a single error
  string; consider field-level validation for the public forms.
