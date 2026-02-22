# Solwards

**Sustainability track — Hopper Hacks 2026**

Visualize solar panel impact on rooftops using map-based polygon selection. Draw your roof on the map and get instant solar potential, cost savings, and CO₂ reduction estimates.

## Tech stack

- **React 18** (Vite) + **TypeScript**
- **Tailwind CSS** for styling
- **React Router** for `/` and `/map`
- **Google Maps JavaScript API** (map + Places autocomplete)
- Component-based architecture, responsive layout

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Google Maps API key

The map and address search require a Google Maps API key with **Maps JavaScript API** and **Places API** enabled.

**Option A — Recommended (env):**

Create a `.env` file in the project root:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Option B:** Replace the placeholder in `index.html`:

```html
<script>
  window.__GOOGLE_MAPS_API_KEY__ = 'your_google_maps_api_key_here';
</script>
```

Get a key: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create API key. Enable **Maps JavaScript API** and **Places API**.

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Project structure

```
src/
├── components/     # Reusable UI (Hero, MapSearch, ResultsModal, etc.)
├── pages/          # HomePage, MapPage
├── services/       # Mock solar API (replace with real backend)
├── hooks/          # useGoogleMaps, usePolygonDrawing
├── types/          # LatLng, Polygon, AnalysisResult
├── utils/          # geometry helpers
├── App.tsx
├── main.tsx
└── index.css
```

## Flow

1. **Homepage (`/`)** — Hero, benefits, environmental impact, CTA **“Analyze My Roof”** → `/map`.
2. **Map (`/map`)** — Full-screen Google Map, address search, **“Draw Roof Area”** to place polygon points (click to add, lines connect, polygon auto-closes). Use **Clear** / **Done** to redraw or finish. When a polygon exists, **“Analyze Solar Potential”** appears.
3. **Analyze** — Calls mock `analyzeSolarArea(polygon)` (delay ~1.5s), then opens a **results modal** with Solar Score, energy/day, cost savings, CO₂ reduction, roof area.

## Backend (mock)

- **Service:** `src/services/solarApi.ts`
- **Function:** `analyzeSolarArea(polygon: Polygon): Promise<AnalysisResult>`
- Currently returns fake data after a short delay. Replace the implementation with a real API call when ready (e.g. `POST /api/analyze-solar` with `{ polygon }`).

## Notes

- Placeholders: Google Maps API key (see above), backend endpoint (in `solarApi.ts`).
- Comments in code mark where to plug in a real backend.
- UI uses a sustainability palette (greens, solar yellow, neutrals), smooth transitions, and is mobile-friendly.
