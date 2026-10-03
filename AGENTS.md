# Project architecture

This is a React application using MapLibre. Code is organized by responsibility and domain rather than by file type.

```text
src/
├── app/                     # Application composition, global styles, and model/mapPreferences.ts for persisting toggles
├── widgets/map-controls/    # Right-hand language, marker, and layer menus; one open menu at a time, Escape handling, and focus restoration
├── widgets/map/             # MapLibre instance lifecycle, camera restoration, and GeoJSON layer composition controller
├── entities/                # Map domain data: buildings, streets, and raster and vector basemaps
│   ├── <domain>/map/        # GeoJSON/tile source and its layer specifications (building, street, beer, park, square)
│   └── map-object/map/      # Registry of pluggable GeoJSON domains and the shared descriptor contract
├── features/                # Standalone user-facing capabilities
│   ├── map-markers/         # JSON-compatible category catalog with two mocks, checkboxes, and MapLibre DOM markers
│   ├── map-layers/          # Dynamic basemap settings and feature flags: GeoJSON, zoom, and map controls
│   ├── map-language/        # Interface language selection
│   │   └── ui/              # React component and feature-local styles
│   ├── map-search/          # Fuse search over localized items, highlighting, camera focus, and a search bar pinned to the top with suggestions
│   │   ├── model/           # Search index and geometry bounds calculation
│   │   └── ui/              # Search input and relevant results list
│   ├── object-inspector/    # Non-modal panel for results and GeoJSON object details; a bottom panel with three positions on mobile
│   │   ├── model/           # Stable object identity and field localization from raw GeoJSON
│   │   └── ui/              # Tile list, object card, and responsive panel sizing
│   └── <feature>/ui/        # React components and local styles for other features
├── infra/nginx/             # Configuration for serving tiles and GeoJSON with CORS
└── shared/                  # Reusable configuration and utilities without domain logic
    ├── config/map.ts        # Raster and vector basemaps, typed MapLibre themes for GeoJSON overlays
    └── lib/
        ├── geojson/         # Raw GeoJSON loading, fid normalization, and label localization
        └── map/             # Merging domain specifications with themes and loading images, including SVG
translates/                  # Localized data; UI strings live under the interface key
public/                      # Vite static files served from the same origin
├── geojsons/                # Domain source GeoJSON and landscape/style.json with vector basemap data
└── assets/                  # Shared images, icons, and local Open Sans PBF glyphs
.github/workflows/           # Builds and PR closure recording without write permissions, artifact validation, and preview publication/removal in gh-pages
```

## Rules

- Create the MapLibre instance only in `widgets/map/ui/MapCanvas.tsx`. React components receive it through props or a future context; they must not create a second map.
- Keep sources, layer IDs, and their MapLibre styles alongside the corresponding domain in `entities/<domain>/map`.
- The `building`, `street`, `beer`, `park`, and `square` domains define their own sources and layers; `widgets/map/model/MapObjectLayersController` only coordinates loading, the current language, and the basemap theme. Parks and squares normally display labels only; their polygons appear only when highlighting a search result.
- Each GeoJSON domain exports a `map/domain.ts` descriptor containing its source, registration, theme, and search highlighting. `entities/map-object/map/domains.ts` is the single registry of these descriptors used by both the map controller and search; do not create a second source list when adding a domain.
- User-facing logic lives in `features/<feature>`: basemap selection with previews in `features/map-basemap-switcher`, search in `features/map-search`, language selection in `features/map-language`, layer selection in `features/map-layers`, and the object card in `features/object-inspector`. `entities/base-map/map` adds raster tiles or layers from the local `landscape/style.json` beneath domain layers without replacing the map instance. The search bar stays above the open inspector. The inspector receives only raw references from the domain registry; when it opens, App measures the panel's size and placement and uses them to set MapLibre padding. At widths up to 767px, App applies `app--mobile`: the inspector becomes a bottom sheet with handle-only, normal, and expanded positions; the map accounts for its current height.
- Search builds a Fuse index only from the selected locale's `items` (`title`, `description`, `aliases`). Highlighting belongs to `features/map-search`: it passes the `sourceId + Feature.id` identity to domain search layers, which draw a red outline and, for polygons, a translucent fill over the same GeoJSON sources. Do not create a separate GeoJSON copy for results.
- Search runs through a single action triggered by Enter, the magnifying-glass button, or suggestion selection. A suggestion passes its exact `items.id`, even when several objects have the same title.
- The controller obtains search result bounds and identities from the domains' raw GeoJSON, not from `querySourceFeatures()`: that method depends on the tiles loaded in the current viewport and the zoom level.
- Shared map settings live in `shared/config/map.ts`, and the shared responsive media query lives in `shared/config/layout.ts`; do not duplicate URLs, breakpoints, or layer settings in UI components. Themes define typed patches for specific layers (`filter`, `layout`, `paint`, zoom); expressions remain native MapLibre expressions. The ID, type, source, and base geometry filter belong to the domain layer module.
- The `i18next` configuration lives in `shared/config/i18n.ts`; the language list is built from `translates/<locale>.json` files, and the user's selection is saved in `localStorage`. If a key is missing from the selected locale, the value from the English file is used. Add all visible strings, the browser tab title (`interface.siteTitle`), and language metadata (`interface.language.name`, `interface.language.flag`) under the `interface` key.
- Store shared visual assets in `public/assets/images` and `public/assets/icons`; load them through same-origin URLs. Keep assets belonging to a single feature alongside that feature.
- Store UI SVG icons in `public/assets/icons` and load them as external files, without inline SVG. The layers icon, `layers.svg`, uses a CSS mask to inherit the button color, including when the menu is open; search uses `search.svg` through an `img` element.
- MapLibre labels use local PBF glyphs from `public/assets/glyphs/Open Sans Regular` through the URL in `shared/config/map.ts`. When introducing new characters in labels, add the corresponding range of 256 Unicode code points along with the font files; keep the license alongside them.
- Buildings with `build_type` values guild, temple, university, and citywatch use the corresponding SVG files from `public/assets/icons` through `icon-image`. Shared parameters are defined by `createMapIcon(fileName, size = 32)` in `shared/config/map.ts`: a same-origin URL, square rasterization dimensions, and `pixelRatio: 2`. The loader decodes the SVG and applies the size before registering it with MapLibre.
- Beer icons are transparent at zoom ≤16 and fade in from 16 to 16.1 through the theme's `icon-opacity`. The building label and icon layer is visible from zoom 14 without this opacity restriction.
- Points in the `beer` domain use the `beers-points` symbol layer with `public/assets/icons/beer.svg` (64×64, `pixelRatio: 2`, `icon-size: 0.8`) instead of ordinary circles. The loader supports an optional halo through `images.halo`, which is currently unset. The layer remains interactive; labels and red circular search result highlighting are added separately.
- Whenever a feature is added, removed, or substantially changed, update this `AGENTS.md`: include its location in the tree and briefly describe its responsibility.
- The `deploy-pages.yml` workflow updates the root of `gh-pages` while preserving `pr-preview`. `pr-preview.yml` builds PRs with a base URL specific to the PR number and without write permissions; `publish-pr-preview.yml` validates the artifact and checks that the PR is still current before publishing through `rossjrw/pr-preview-action`. `close-pr-preview.yml` records PR closure without write permissions, and `remove-pr-preview.yml` validates its artifact and removes the preview without `pull_request_target`. Publication and removal for the same PR run sequentially, without force-overwriting the `gh-pages` branch.

- `BASE_MAP_VARIANTS` defines independent `visibilityOptions` for each basemap: a localization key, a default value, and typed targets in the overlay theme. The UI builds checkboxes from this configuration; App stores values per basemap, and the controller applies them to a copy of the theme. Base styles and search highlighting remain unchanged. Raster labels embedded in tile images cannot be disabled.
- The display checkbox section in `MapLayers` is called **feature flags**: the global `showAttributes`, `showZoom`, and `showNavigation` values are stored in App through `useMapPreferences`. `showNavigation` is enabled by default and controls the visibility of MapLibre zoom buttons and the compass through CSS in `MapCanvas`, without recreating the map; the settings menu remains available. The marker menu is separate from layers. `features/map-markers/model/catalog.ts` contains JSON-compatible categories and two demonstration markers (disabled initially); a future local JSON loader must provide the same contract. Markers use the existing pin and shared object card; the card is localized again when the language changes.
- On desktop, the inspector is a rounded card below search; on mobile, retain the sheet's three positions and existing animations. Visible menu and mock names live under `interface`.

## MapLibre and React

MapLibre remains an imperative rendering adapter, while React stores interface state: the active layer, search query, selected object, language, and open card. React state changes are applied to the map through `useEffect` and MapLibre methods (`setFilter`, `setLayoutProperty`, `setPaintProperty`, `fitBounds`, `setFeatureState`). Do not keep GeoJSON copies in multiple places: the domain source module is the single source of its configuration. Raw GeoJSON is not modified: before passing it to MapLibre, create a client-side copy with `Feature.id = fid` and localized `properties.label`. For `label`, use the selected locale, then English; if neither title exists, no label is displayed.

- Basemap-specific layer toggles, marker categories, and feature flags (GeoJSON, zoom, map controls) are saved in `localStorage` under `map-ui-preferences-v1`. When restoring preferences, accept only known boolean fields; new settings receive defaults from the configuration. Corrupted or unavailable storage must not block the interface. The GeoJSON section uses compact “key — value” rows on a gray background.
