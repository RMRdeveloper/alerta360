# Alerta360 — Frontend

Vue 3 client for the Alerta360 platform: missing persons search, sighting reports, risk map, child registration, glossary, and authentication.

## Tech Stack

- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **Build**: Vite
- **Styling**: Tailwind CSS
- **UI**: PrimeVue
- **State**: Pinia
- **Routing**: Vue Router
- **i18n**: Vue I18n (ES/EN)
- **Maps**: Google Maps (Places, Geocoding)

## Main Views

| View | Description |
|------|-------------|
| Home | Landing and featured missing persons |
| Missing Persons | List and filters |
| Missing Person Detail | Profile, sightings, share |
| Report Sighting | Submit sighting with location and photos |
| Risk Map | Heatmap of high-risk areas |
| Register Child | Preemptive child registration |
| Glossary | Search terms and definitions |
| Login / Register | Auth with email or Google |
| Profile | User profile and registered persons |

## Commands

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GOOGLE_MAPS_API_KEY` | Yes | Google Maps API key (Places, Geocoding) |
| `VITE_API_URL` | No | Backend API URL (default: http://localhost:3000) |

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── composables/    # useGeolocation, useRiskMap, useShareProfile, etc.
│   ├── constants/      # API, routes, filter, map constants
│   ├── layouts/        # AuthLayout, MainLayout
│   ├── router/         # Vue Router
│   ├── services/       # API client
│   ├── stores/         # Pinia (auth)
│   ├── types/          # TypeScript types
│   ├── views/          # Page components (*View.vue)
│   ├── App.vue
│   ├── main.ts
│   └── i18n.ts
├── public/
├── .env.example
└── package.json
```

## License

MIT
