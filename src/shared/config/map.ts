import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  StyleImageMetadata,
  SymbolLayerSpecification,
} from 'maplibre-gl'
import type { LayerTheme } from '../lib/map/layerTheme'

export type BaseMapVariantId = 'orig' | 'rus'

export const BASE_MAP_VARIANT_STORAGE_KEY = 'map-basemap-variant'

export type OverlayTheme = {
  /**
   * Named raster/SVG images usable from symbol `icon-image` expressions.
   * Image names are global to the MapLibre map, so use a stable, unique name.
   */
  images?: Record<string, { url: string; options?: Partial<StyleImageMetadata> }>
  buildings: {
    fill: LayerTheme<FillLayerSpecification>
    outline: LayerTheme<LineLayerSpecification>
    labels: LayerTheme<SymbolLayerSpecification>
  }
  streets: {
    yard: LayerTheme<LineLayerSpecification>
    street: LayerTheme<LineLayerSpecification>
    main: LayerTheme<LineLayerSpecification>
    labels: LayerTheme<SymbolLayerSpecification>
  }
  beers: {
    marker: LayerTheme<CircleLayerSpecification>
    labels: LayerTheme<SymbolLayerSpecification>
  }
  parks: {
    labels: LayerTheme<SymbolLayerSpecification>
  }
  squares: {
    labels: LayerTheme<SymbolLayerSpecification>
  }
}

/** A concise override for one base-map variant. Unspecified layers keep the defaults. */
export type OverlayThemePatch = {
  images?: OverlayTheme['images']
  buildings?: Partial<OverlayTheme['buildings']>
  streets?: Partial<OverlayTheme['streets']>
  beers?: Partial<OverlayTheme['beers']>
  parks?: Partial<OverlayTheme['parks']>
  squares?: Partial<OverlayTheme['squares']>
}

/*
 * Every nested value below is a native, type-checked MapLibre layer fragment.
 * `filter` narrows the domain layer: it is combined with its geometry/class
 * filter using `all`, so a building-label filter cannot accidentally include a
 * point from the same GeoJSON source.
 *
 * Example for a building type (the source property is `build_type`):
 *
 * overlayTheme: createOverlayTheme({
 *   buildings: { labels: {
 *     filter: ['!=', ['get', 'build_type'], 'house'],
 *     layout: {
 *       'text-field': ['case',
 *         ['==', ['get', 'build_type'], 'guild'],
 *         ['concat', '⚔ ', ['coalesce', ['get', 'label'], '']],
 *         ['coalesce', ['get', 'label'], ''],
 *       ],
 *     },
 *     paint: {
 *       'text-color': ['match', ['get', 'build_type'], 'guild', '#8b1e3f', '#201914'],
 *     },
 *   } },
 * })
 *
 * For an image instead of a Unicode glyph, add its URL under `images` and set
 * `layout['icon-image']` to its name or a MapLibre `case`/`match` expression.
 */
const DEFAULT_OVERLAY_THEME: OverlayTheme = {
  buildings: {
    fill: {
      paint: {
        'fill-color': ['case', ['get', 'is_landmark'], '#b39b0038', '#56360038'],
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.2, 16, 0.52, 19, 0.72],
      },
    },
    outline: {
      paint: {
        'line-color': '#666633',
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.3, 17, 0.85],
        'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.4, 17, 1.4, 20, 2.5],
      },
    },
    labels: {
      minzoom: 15,
      layout: {
        'text-field': ['coalesce', ['get', 'label'], ''],
        'text-font': ['Open Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 16, 13, 19, 18],
        'text-max-width': 10,
        'text-allow-overlap': false,
      },
      paint: { 'text-color': '#201914', 'text-halo-color': '#feffe4', 'text-halo-width': 1.2 },
    },
  },
  streets: {
    yard: {
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#f3e8b0',
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 13, 0.44, 15, 1.44, 17, 5.6, 20, 22.4],
      },
    },
    street: {
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#f3e3b0',
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 13, 0.55, 15, 1.8, 17, 7, 20, 28],
      },
    },
    main: {
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#d0a57a',
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 13, 0.99, 15, 3.24, 17, 12.6, 20, 50.4],
      },
    },
    labels: {
      minzoom: 15,
      layout: {
        'symbol-placement': 'line',
        'text-field': ['coalesce', ['get', 'label'], ''],
        'text-font': ['Open Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 15, 10, 18, 17],
        'text-max-angle': 30,
        'text-keep-upright': true,
        'text-padding': 3,
      },
      paint: { 'text-color': '#201914', 'text-halo-color': '#feffe4', 'text-halo-width': 1.4 },
    },
  },
  beers: {
    marker: {
      minzoom: 15,
      paint: {
        'circle-color': '#c77622',
        'circle-stroke-color': '#fff6d3',
        'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 15, 1, 19, 2],
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 15, 3, 18, 6],
      },
    },
    labels: {
      minzoom: 17,
      layout: {
        'text-field': ['coalesce', ['get', 'label'], ''],
        'text-font': ['Open Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 17, 10, 20, 14],
        'text-offset': [0, 1],
        'text-anchor': 'top',
      },
      paint: { 'text-color': '#201914', 'text-halo-color': '#feffe4', 'text-halo-width': 1.2 },
    },
  },
  parks: {
    labels: {
      minzoom: 14,
      layout: {
        'text-field': ['coalesce', ['get', 'label'], ''],
        'text-font': ['Open Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 14, 11, 18, 16],
        'text-max-width': 12,
        'text-allow-overlap': false,
      },
      paint: { 'text-color': '#436033', 'text-halo-color': '#feffe4', 'text-halo-width': 1.2 },
    },
  },
  squares: {
    labels: {
      minzoom: 14,
      layout: {
        'text-field': ['coalesce', ['get', 'label'], ''],
        'text-font': ['Open Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 14, 11, 18, 16],
        'text-max-width': 12,
        'text-allow-overlap': false,
      },
      paint: { 'text-color': '#6d4c33', 'text-halo-color': '#feffe4', 'text-halo-width': 1.2 },
    },
  },
}

function mergeLayerTheme<T extends FillLayerSpecification | LineLayerSpecification | CircleLayerSpecification | SymbolLayerSpecification>(
  base: LayerTheme<T>,
  patch: LayerTheme<T> | undefined,
): LayerTheme<T> {
  if (patch === undefined) return { ...base, layout: { ...base.layout }, paint: { ...base.paint } }

  return {
    ...base,
    ...patch,
    layout: { ...base.layout, ...patch.layout },
    paint: { ...base.paint, ...patch.paint },
  }
}

/** Creates an independent complete theme while keeping a variant declaration small. */
export function createOverlayTheme(patch: OverlayThemePatch = {}): OverlayTheme {
  const { buildings, streets, beers, parks, squares } = DEFAULT_OVERLAY_THEME

  return {
    images: patch.images,
    buildings: {
      fill: mergeLayerTheme(buildings.fill, patch.buildings?.fill),
      outline: mergeLayerTheme(buildings.outline, patch.buildings?.outline),
      labels: mergeLayerTheme(buildings.labels, patch.buildings?.labels),
    },
    streets: {
      yard: mergeLayerTheme(streets.yard, patch.streets?.yard),
      street: mergeLayerTheme(streets.street, patch.streets?.street),
      main: mergeLayerTheme(streets.main, patch.streets?.main),
      labels: mergeLayerTheme(streets.labels, patch.streets?.labels),
    },
    beers: {
      marker: mergeLayerTheme(beers.marker, patch.beers?.marker),
      labels: mergeLayerTheme(beers.labels, patch.beers?.labels),
    },
    parks: {
      labels: mergeLayerTheme(parks.labels, patch.parks?.labels),
    },
    squares: {
      labels: mergeLayerTheme(squares.labels, patch.squares?.labels),
    },
  }
}

export const BASE_MAP_VARIANTS: Record<BaseMapVariantId, { tilesUrl: string; previewUrl: string; overlayTheme: OverlayTheme }> = {
  orig: {
    tilesUrl: 'https://tiles.klisov.ru/orig/{z}/{x}/{y}.jpg',
    previewUrl: `${import.meta.env.BASE_URL}assets/images/map_orig.jpg`,
    overlayTheme: createOverlayTheme(),
  },
  rus: {
    tilesUrl: 'https://tiles.klisov.ru/rus/{z}/{x}/{y}.jpg',
    previewUrl: `${import.meta.env.BASE_URL}assets/images/map_rus.jpg`,
    overlayTheme: createOverlayTheme(),
  },
}

export function getInitialBaseMapVariant(): BaseMapVariantId {
  const storedVariant = typeof window === 'undefined' ? null : window.localStorage.getItem(BASE_MAP_VARIANT_STORAGE_KEY)

  return storedVariant !== null && storedVariant in BASE_MAP_VARIANTS
    ? storedVariant as BaseMapVariantId
    : 'orig'
}

export const MAP_OPTIONS: Omit<import('maplibre-gl').MapOptions, 'container'> = {
  style: {
    version: 8,
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    sources: {},
    layers: [],
  },
  center: [0.02, -0.01],
  zoom: 15,
  renderWorldCopies: false,
  minZoom: 13,
  maxZoom: 21,
}
