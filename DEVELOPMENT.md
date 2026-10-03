# Development

[Back to the project overview](README.md) · [Contributing map data and translations](CONTRIBUTING.md)

The application uses React and TypeScript for the interface, MapLibre GL JS for map rendering, and Vite for development and production builds. Fuse.js provides place search, and i18next manages localization.

## Local development

Install Node.js and npm, then run the following commands from the repository root:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. GeoJSON, icons, and fonts are served from `public/`. The original and Russian raster basemaps load tiles from the external URLs configured in `src/shared/config/map.ts`, so those views need network access.

## Build and checks

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Run the TypeScript build check and generate the production bundle in `dist/`. |
| `npm run preview` | Serve an existing production build locally; run the build first. |
| `npm test` | Run the Vitest suite. |

## Project structure

Code is organized by responsibility and domain:

| Location | Responsibility |
| --- | --- |
| [`src/app/`](src/app/) | Application composition, shared UI state, saved map preferences, and global styles. |
| [`src/widgets/map/`](src/widgets/map/) | MapLibre lifecycle, camera restoration, and coordination of GeoJSON domains. |
| [`src/widgets/map-controls/`](src/widgets/map-controls/) | Language, marker, and layer menus. |
| [`src/entities/`](src/entities/) | Domain sources, layer definitions, basemaps, and the shared domain registry. |
| [`src/features/`](src/features/) | Search, basemap selection, language and layer controls, markers, and the object inspector. |
| [`src/shared/`](src/shared/) | Shared configuration and utilities for GeoJSON and MapLibre. |
| [`translates/`](translates/) | Localized object data under `items` and UI text under `interface`. |
| [`public/geojsons/`](public/geojsons/) | Source GeoJSON and the vector basemap style. |
| [`public/assets/`](public/assets/) | Shared images, SVG icons, and local font glyphs. |
| [`utils/update_transtale/`](utils/update_transtale/) | Helper for adding missing object translation entries. |

[AGENTS.md](AGENTS.md) contains the detailed architecture and repository rules. Update it when adding, removing, or substantially changing a feature.

## Extend the map interface

### Keep one MapLibre instance

`MapCanvas` in `src/widgets/map/ui/MapCanvas.tsx` creates the application's only `maplibregl.Map`. `App` makes that instance available to the interface. New React features receive it through props and apply state changes through effects and MapLibre methods; they should not create another map.

React owns interface state, such as the selected basemap, language, search query, and open object card. MapLibre renders that state. Keep feature-specific behavior in `src/features/<feature>/`.

### Register map domains in one place

Each GeoJSON domain owns its source, layer IDs, styles, and descriptor under `src/entities/<domain>/map/`. Register descriptors in [`src/entities/map-object/map/domains.ts`](src/entities/map-object/map/domains.ts), the common registry used by map loading and search.

`MapObjectLayersController` coordinates loading, language changes, and overlay themes. Shared basemap configuration and typed layer theme patches belong in [`src/shared/config/map.ts`](src/shared/config/map.ts).

### Search and highlight existing data

`src/features/map-search/` builds a Fuse index from the selected language's `items`, using `title`, `description`, and `aliases`. Search runs through a shared action for Enter, the search button, and suggestion selection. Suggestions pass the exact item ID so identically named places remain distinct.

Result identities and bounds come from raw GeoJSON through the domain controller. Do not use `querySourceFeatures()` to build the search dataset: its results depend on the tiles loaded in the current viewport.

Search highlighting uses the existing domain sources and identifies features by source ID and feature ID. Domain search layers draw red outlines and translucent polygon fills; no separate GeoJSON copy is needed for search results.

### Localize data without changing the source

Localization is configured in [`src/shared/config/i18n.ts`](src/shared/config/i18n.ts). Languages are discovered from `translates/*.json`. Add UI strings under `interface` and object names, descriptions, wiki links, and aliases under `items`.

Raw GeoJSON remains unchanged. Before passing data to MapLibre, the loader creates a copy with `Feature.id` taken from `properties.fid` and `properties.label` resolved through `properties.name_id`. Labels use the selected language, then English; without either title, no label is displayed.

### Configure layers and object details

Basemap-specific visibility options belong in `BASE_MAP_VARIANTS`. The layer menu builds its controls from that configuration, and the controller applies visibility to a copy of the overlay theme. Search highlighting remains independent of those options.

`src/features/object-inspector/` handles result lists and object cards using raw feature references. `App` measures the panel and adjusts map padding so the selected content remains visible. On mobile, the inspector uses a bottom panel with three positions. Keep the search field above the inspector and use the shared breakpoint in `src/shared/config/layout.ts`.

Layer preferences, marker categories, and display flags are persisted through `useMapPreferences` in `src/app/model/mapPreferences.ts`. Extend the existing configuration and defaults when adding a setting.
