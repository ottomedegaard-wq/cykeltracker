# Cykel Tracker – project rules

Bike tracker web app: ride logging, XP/levels, trophies, component wear, and a
Google Maps route planner. Everything lives in `App.jsx`.

## Ground rules (do not break)

- **Single file.** All logic, components, translations and UI stay in `App.jsx`
  (default-exported `App`). It runs in StackBlitz/CodeSandbox with no build
  setup, so the only imports allowed are `react` and `lucide-react`. No extra
  files, no new dependencies.
- **Design system.** Dark theme (`bg-slate-950`, `bg-slate-900`,
  `text-slate-100`) with `emerald-500` / `emerald-400` accents. Tailwind utility
  classes only.
- **Five languages.** `da`, `en`, `de`, `fr`, `es` via the `TRANSLATIONS`
  object. Every user-visible string goes into `TRANSLATIONS` for all five
  languages, with identical key sets (including `badges.*`). Don't add new
  inline `lang === 'da' ? … : …` ternaries.
- **Units.** All state is stored in **km**. Convert only at the edges: input
  (`mi` → km via `KM_TO_MILES`) and display (`formatDist` / `formatDistNum`).
  The km/mi toggle must update every displayed distance and limit.

## Features to preserve

- **Component wear** (chain, tires, gears, disc brakes):
  `calculateEffectiveWear` scales ride distance by weather (`Tørt`/`Regn`) ×
  terrain (`Asfalt`/`Grus`/`Mudder`) multipliers (up to 4× for chain in rain +
  mud). Limits: `MAX_*_KM`. Resetting a component gives XP (chain +100,
  tires +200, gears +300, brakes +150) only when km since last service ≥
  `MIN_*_XP_KM`; otherwise it resets without XP.
- **XP / levels:** 1 XP per km ridden, `XP_PER_LEVEL = 500`. Deleting a ride
  reverses its stats and XP.
- **16 trophies** in `badgesList`, unlocked automatically from history (First
  Ride, Mud Warrior, Century 100+ km, Speedster > 30 km/h, Grand Master level
  10, …).
- **Route planner:**
  - GPS loop: turnaround point at `0.4 ×` the desired distance (road-curve
    compensation) in a random heading. Opens Google Maps `travelmode=bicycling`
    with origin = destination = the start point. The window is opened
    synchronously before the GPS call so pop-up blockers don't stop it, with a
    clickable-link fallback.
  - Address fallback: geocodes a typed start location via Nominatim, then
    applies the same loop math.
  - Manual planner: start, outbound waypoint, home waypoint → Google Maps.

## Checking changes

There is no package.json. To confirm the file still compiles, bundle it with
esbuild in a scratch directory that has `react` and `lucide-react` installed:

```sh
npm i esbuild react lucide-react
cp /path/to/App.jsx . && npx esbuild App.jsx --bundle --jsx=automatic --outfile=out.js
```
