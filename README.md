# tracking-waldo
a beta test for tracking Waldo's location

---

# 🚐 Waldo Expedition Tracking System

A static web system for tracking the **Arctic overlanding expedition** of Waldo — a 2024 Toyota Tacoma TRD Off-Road with Tune M1 camper. The system combines raw GPS movement data with a narrative personality layer called "Waldo Events."

Hosted via **GitHub Pages** from the `/docs` folder. Mobile-first, usable in remote conditions with intermittent Starlink connectivity.

---

## 🗺️ Live Map

The site is deployed at: `https://toddringler.github.io/tracking-waldo/`

---

## 🧱 Architecture

```
/docs/routes/        ← Route GeoJSON files used by the live map (truth layer)
/data/tracks/        ← Optional GPX source files (for one-time conversion)
/data/events/        ← Daily JSON event logs (narrative layer)
/scripts/            ← Node.js build pipeline
/docs/               ← Frontend source files and GitHub Pages deployment root
```

---

## 🚀 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Mapbox token

Edit `docs/config.js` and replace `YOUR_MAPBOX_PUBLIC_TOKEN_HERE` with your [Mapbox public token](https://account.mapbox.com/).

> Mapbox public tokens are designed for client-side use. Restrict yours to your GitHub Pages domain in the Mapbox dashboard.

### 3. Add route GeoJSON data

Place route files in `/docs/routes/*.geojson`.

If needed, you can still convert GPX tracks from [Gaia GPS](https://www.gaiagps.com/) with:

```bash
npm run gpx
```

### 4. Add Waldo events

Create daily JSON files in `/data/events/YYYY-MM-DD.json`:

```json
{
  "day": 14,
  "date": "2026-06-14",
  "events": [
    {
      "type": "fuel",
      "lat": 64.8431,
      "lon": -147.7222,
      "title": "Fuel Stop — Fairbanks",
      "thought": "Waldo distrusts all range estimates north of civilization.",
      "mood": "cautious",
      "status": "Fuel: 28 gal @ $5.45/gal."
    }
  ]
}
```

**Event types:** `fuel` · `camp` · `sighting` · `incident` · `ferry`

**Moods:** `optimistic` · `cautious` · `concerned` · `content` · `feral`

> Use the **Waldo Entry Tool** (`/waldo-entry.html`) to generate event JSON by clicking the map — no manual coordinate editing required.

### 5. Build

```bash
npm run build
```

This runs three scripts:
1. `build-route-manifest.js` — reads `docs/routes/*.geojson` and writes `docs/route-files.json`
2. `build-waldo-events.js` — converts event JSONs → `docs/waldo-events.geojson`
3. `build-site.js` — finalizes `docs/` for GitHub Pages

Optional mtime cutoff filtering:
```bash
DELTA_SECONDS=200000 npm run build
```
`DELTA_SECONDS` only applies to `npm run gpx` (GPX conversion), not `npm run build`.

### 6. Deploy

Commit and push. GitHub Pages serves from `/docs`.

---

## ✍️ Waldo Entry Tool

Open `/waldo-entry.html` in a browser:
1. Click the map to set coordinates
2. Fill in event details
3. Click **Generate JSON**
4. Click **Copy** and paste into a new `/data/events/YYYY-MM-DD.json` file

---

## 🎭 Waldo

Waldo is a narrative persona representing the expedition vehicle:

- 2024 Toyota Tacoma TRD Off-Road
- Tune M1 camper setup
- KO3 tires (white letters out)
- Drawn irresistibly to remote wilderness
- Prefers gravel over pavement
- Mildly dramatic, highly capable
- Communicates through field reports
