# Cykel Tracker – project rules

Bike tracker web app: ride logging, XP/levels, trophies, component wear, and a
Google Maps route planner. Everything lives in `App.jsx`.

## Talking to the owner

The owner is brand new to coding. Explain things like you would to a
15-year-old: short sentences, simple words, no jargon (or explain it in a few
words). Keep replies short.

## Ground rules (do not break)

- **Single file.** All logic, components, translations and UI stay in `App.jsx`
  (default-exported `App`). It runs in StackBlitz/CodeSandbox with no build
  setup, so the only imports allowed are `react` and `lucide-react`. No extra
  files, no new dependencies. The one exception is `index.html`, a static
  loader for GitHub Pages: it fetches `App.jsx`, compiles the JSX in the
  browser (Babel standalone), resolves `react`/`lucide-react` via an import map
  to esm.sh, and mounts `<App />`. If you add an import to `App.jsx`, add it to
  the import map too.
- **Design system.** Dark theme (`bg-slate-950`, `bg-slate-900`,
  `text-slate-100`) with `emerald-500` / `emerald-400` accents. Tailwind utility
  classes only.
- **English only, km only.** No language picker and no mi toggle. Reusable
  UI labels live in the `TEXT` object (aliased as `t` in the component);
  one-off messages can be inline English. All distances are km; display via
  `formatDist` / `formatDistNum` (rounded to 1 decimal).
- **No persistence yet.** State is in-memory `useState` only; storage is a
  planned later step.

## Features to preserve

- **Component wear** (chain, tires, gears, disc brakes):
  `calculateEffectiveWear` scales ride distance by weather (`dry`/`rain`) ×
  terrain (`asphalt`/`gravel`/`mud`) multipliers (up to 4× for chain in rain +
  mud). Limits: `MAX_*_KM`. Resetting a component gives XP (chain +100,
  tires +200, gears +300, brakes +150) only when km since last service ≥
  `MIN_*_XP_KM`; otherwise it resets without XP.
- **XP / levels:** 1 XP per km ridden, `XP_PER_LEVEL = 500`. Deleting a ride
  reverses its stats and XP.
- **16 trophies** in `badgesList`, unlocked automatically from history (First
  Ride, Mud Warrior, Century 100+ km, Speedster > 30 km/h, Hat Trick 3 rides,
  Trailblazer mud ride, Grand Master level 10, …).
- **Route planner:**
  - GPS loop: `buildLoopMapsUrl` places the start plus `LOOP_POINTS` (3) turn
    points evenly on a circle through the start, in a random direction and
    rotation, so the route is a real loop, not an out-and-back. The circle is
    sized so straight-line length × `ROAD_FACTOR` (1.3) ≈ the desired distance.
    Opens Google Maps `travelmode=bicycling` with origin = destination = start. The window is opened
    synchronously before the GPS call so pop-up blockers don't stop it, with a
    clickable-link fallback.
  - Address fallback: geocodes a typed start location via Nominatim, then
    uses the same `buildLoopMapsUrl`.
  - Manual planner: start, outbound waypoint, home waypoint → Google Maps.

## Checking changes

There is no package.json. To confirm the file still compiles, bundle it with
esbuild in a scratch directory that has `react` and `lucide-react` installed:

```sh
npm i esbuild react lucide-react
cp /path/to/App.jsx . && npx esbuild App.jsx --bundle --jsx=automatic --outfile=out.js
```
