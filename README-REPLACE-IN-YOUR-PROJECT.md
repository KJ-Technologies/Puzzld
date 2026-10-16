# Puzzld website revamp — install into your existing project

This is a frontend replacement for the existing Puzzld / KJ Technologies app. It intentionally does **not** include `.env`, Supabase credentials, your database schema, or a replacement server.js.

## Install safely

1. In VS Code, stop the local server with `Ctrl+C`.
2. Make a backup/commit first: `git add .` then `git commit -m "Backup before Puzzld redesign"`.
3. Extract this ZIP into the **root of your existing project folder** (the same folder that contains `server.js` and `package.json`). Allow it to replace `public/index.html`, `public/styles.css`, `package.json`, and `render.yaml` when asked. It adds `public/js/app.js`, `public/js/puzzles.js`, and `public/js/puzzle-engine.js`.
4. Keep your existing `server.js`, `.env`, and `db/schema.sql`. Do not upload `.env` to GitHub.
5. Run `npm run check`, then `npm start` and open `http://localhost:3000`.
6. Try Play at 50 pieces first. Confirm photo loads, pieces can be dragged, tabs look like jigsaw cutouts, snap-to-place works, timer/progress update, and restart/difficulty/reference controls work.
7. If all looks good: `git add .`, `git commit -m "Revamp Puzzld brand and jigsaw experience"`, `git push`. Render should deploy from GitHub.

## What changed
- Puzzld fun-loving identity; KJ Technologies company credit in footer.
- Responsive homepage, collection cards, categories, playful colour system and clearer game UI.
- Separate JavaScript modules for catalogue/photo data, puzzle engine, and app orchestration.
- Real photo URLs for puzzle art (loaded from Unsplash); replace with your own licensed/approved images before commercial launch.
- Interlocking jigsaw tab-and-socket shapes with matching neighbour edges, drag interaction, snap, reference image, timer, progress and completion overlay.
- Fixed engine initialisation order by creating the grid before laying out cells.
- Render Node version set to 22.

## Notes
- The current puzzle engine keeps all pieces in a single canvas for a lightweight v1. For 500–1,000 pieces, desktop performance will be better than on older phones.
- The remote photo URLs require an internet connection. For launch reliability, download properly licensed images and serve them from your own `public/images/` folder.
- Keep existing Supabase environment variables in Render. The front end still uses `/api/puzzles` and `/api/events` from your existing server.
