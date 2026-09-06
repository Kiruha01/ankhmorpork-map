import type maplibregl from 'maplibre-gl'
import type { FillLayerSpecification, SymbolLayerSpecification } from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'
import { applyLayerTheme } from '../../../shared/lib/map/layerTheme'
import { PARKS_SOURCE_ID } from './source'

export const PARKS_LABEL_LAYER_ID = 'parks-labels'
export const PARKS_INTERACTION_LAYER_ID = 'parks-interaction'
export const PARKS_SEARCH_FILL_LAYER_ID = 'parks-search-fill'
export const PARKS_SEARCH_OUTLINE_LAYER_ID = 'parks-search-outline'
const EMPTY_SEARCH_FEATURE_ID = '__map-search-no-results__'

function getSearchResultFilter(featureIds: readonly (string | number)[]): maplibregl.FilterSpecification {
  const featureFilter = featureIds.length > 0
    ? ['in', '$id', ...featureIds]
    : ['==', '$id', EMPTY_SEARCH_FEATURE_ID]

  return ['all', ['==', '$type', 'Polygon'], featureFilter] as unknown as maplibregl.FilterSpecification
}

function placeParkSearchHighlights(map: maplibregl.Map): void {
  if (!map.getLayer(PARKS_SEARCH_FILL_LAYER_ID) || !map.getLayer(PARKS_SEARCH_OUTLINE_LAYER_ID)) return
  if (map.getLayer(PARKS_LABEL_LAYER_ID)) {
    map.moveLayer(PARKS_SEARCH_FILL_LAYER_ID, PARKS_LABEL_LAYER_ID)
    map.moveLayer(PARKS_SEARCH_OUTLINE_LAYER_ID, PARKS_LABEL_LAYER_ID)
    return
  }
  map.moveLayer(PARKS_SEARCH_FILL_LAYER_ID)
  map.moveLayer(PARKS_SEARCH_OUTLINE_LAYER_ID)
}

export function getParkLayers(theme: OverlayTheme): [FillLayerSpecification, SymbolLayerSpecification] {
  return [
    {
      id: PARKS_INTERACTION_LAYER_ID,
      type: 'fill',
      source: PARKS_SOURCE_ID,
      filter: ['==', '$type', 'Polygon'],
      // A rendered but transparent fill makes the complete polygon clickable.
      paint: { 'fill-opacity': 0 },
    },
    applyLayerTheme({
      id: PARKS_LABEL_LAYER_ID,
      type: 'symbol',
      source: PARKS_SOURCE_ID,
      filter: ['==', '$type', 'Polygon'],
    }, theme.parks.labels),
  ]
}

export function registerParkLayers(map: maplibregl.Map, theme: OverlayTheme): void {
  getParkLayers(theme).forEach((layer) => map.addLayer(layer))
  map.addLayer({
    id: PARKS_SEARCH_FILL_LAYER_ID,
    type: 'fill',
    source: PARKS_SOURCE_ID,
    filter: getSearchResultFilter([]),
    paint: { 'fill-color': '#dc2626', 'fill-opacity': 0.22 },
  }, PARKS_LABEL_LAYER_ID)
  map.addLayer({
    id: PARKS_SEARCH_OUTLINE_LAYER_ID,
    type: 'line',
    source: PARKS_SOURCE_ID,
    filter: getSearchResultFilter([]),
    paint: { 'line-color': '#dc2626', 'line-width': 3 },
  }, PARKS_LABEL_LAYER_ID)
}

export function applyParkSearchResults(map: maplibregl.Map, featureIds: readonly (string | number)[]): void {
  if (!map.getLayer(PARKS_SEARCH_FILL_LAYER_ID) || !map.getLayer(PARKS_SEARCH_OUTLINE_LAYER_ID)) return
  map.setFilter(PARKS_SEARCH_FILL_LAYER_ID, getSearchResultFilter(featureIds))
  map.setFilter(PARKS_SEARCH_OUTLINE_LAYER_ID, getSearchResultFilter(featureIds))
  placeParkSearchHighlights(map)
}

export function applyParkTheme(map: maplibregl.Map, theme: OverlayTheme): void {
  getParkLayers(theme).forEach((layer) => {
    if (map.getLayer(layer.id)) map.removeLayer(layer.id)
    map.addLayer(layer)
  })
  placeParkSearchHighlights(map)
}
