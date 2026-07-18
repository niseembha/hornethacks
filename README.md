# Hornet Hacks

The first public-facing site for Hornet Hacks, a beginner-friendly hackathon for high-school students.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
npm run build:worker
npm run build:sites
```

`build:worker` writes OpenNext's intermediate worker to `.open-next/`.
`build:sites` also runs Wrangler's final bundling pass and replaces
`.open-next/worker.js` with the self-contained worker used by Sites.

## Routes

- `/` — event landing page and beginner launchpad
- `/login` — non-persistent portal preview
- `/register` — non-persistent registration preview
- `/rules` — preliminary rules placeholder
- `/code-of-conduct` — preliminary community expectations
- `/privacy` — preliminary minor-focused privacy approach

## Details to replace before registration opens

- Date, time zone, venue, transit, event hours, and cost
- Eligibility, capacity, team size, guardian consent, and registration deadline
- Meals, allergies, accessibility requests, supervision, emergency, drop-off, pickup, and overnight policies
- Organizer identity and official contact, safety, and accommodation addresses
- Social handles and moderated community invite policy
- Sponsor information, tracks, prizes, and any tax or eligibility terms
- Final rules, AI policy, Code of Conduct, privacy notice, judging weights, submission checklist, and judging platform link

Unconfirmed details intentionally appear as clear “coming soon” states instead of invented logistics.

## Project canvas

The downloadable beginner worksheet lives at `public/hornet-hacks-project-canvas.txt`.
