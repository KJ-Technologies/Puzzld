# Puzzle Play — Version 1

A lightweight online jigsaw game built with Node.js, Express, Canvas and Supabase-ready event analytics. Intended for deployment as one Render Web Service and one Git repository.

## Features
- 10 themed puzzle designs: Jungle Safari, Kolkata, Paris, Mumbai, Golden Sunrise, Ocean Sunset, Mountain Escape, Underwater World, Cosmic Journey and Secret Garden.
- 50, 100, 300, 500 and 1,000 pieces.
- Drag-and-drop, snap-to-place, timer, progress, restart, and completed-image reference toggle.
- Responsive layout with mouse and touch support.
- Express API for puzzle catalogue, health check and analytics events.
- Supabase schema and seed data in `db/schema.sql`.
- No accounts, checkout, discounts or physical-store functionality in v1.

## Run locally
1. Install Node.js 20+.
2. `npm install`
3. Copy `.env.example` to `.env` and optionally set `SUPABASE_URL` and `SUPABASE_SECRET_KEY`.
4. `npm run dev` or `npm start`.
5. Open `http://localhost:3000`.

Without Supabase credentials the app uses a local puzzle catalogue and the game still works; analytics events are accepted but not persisted.

## Supabase setup
Use a dedicated Supabase project for this app if possible. Run `db/schema.sql` in the SQL Editor. Then set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` as server-side environment variables. The secret key must never be added to frontend JavaScript or committed to Git.

## Render deployment
- Create a new **Web Service** in Render connected to this repository.
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`
- Add `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in Render Environment if using Supabase.
- `render.yaml` is included as a Blueprint reference.

## Notes about the game engine
The piece count is exact for each level. Piece shapes are generated in-browser with deterministic shared edges so adjacent tabs fit together. At 1,000 pieces, use a desktop/tablet for the best experience; this level is more demanding on touch screens. The artwork is original vector illustration generated in code for the prototype; replace it with final licensed artwork before commercial launch.

## Analytics captured
`puzzle_started`, `puzzle_completed`, `puzzle_restarted`, `reference_toggled`, and `difficulty_changed`. The event endpoint validates event type, puzzle ID and piece-count options. Anonymous analytics do not include names, emails, or IP addresses intentionally.
