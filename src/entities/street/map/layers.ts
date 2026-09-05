import type maplibregl from 'maplibre-gl'
import type { LineLayerSpecification, SymbolLayerSpecification } from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'
import { applyLayerTheme } from '../../../shared/lib/map/layerTheme'
import { STREETS_SOURCE_ID } from './source'

export const STREET_LAYER_IDS = {
  yard: 'streets-yards',
  street: 'streets-streets',
  main: 'streets-mains',
  labels: 'streets-labels',
} as const
export const STREETS_SEARCH_RESULT_LAYER_ID = 'streets-search-results'
const EMPTY_SEARCH_FEATURE_ID = '__map-search-no-results__'

function getSearchResultFilter(featureIds: readonly (string | number)[]): maplibregl.FilterSpecification {
  const featureFilter = featureIds.length > 0
    ? ['in', '$id', ...featureIds]
    : ['==', '$id', EMPTY_SEARCH_FEATURE_ID]

  return ['all', ['==', '$type', 'LineString'], featureFilter] as unknown as maplibregl.FilterSpecification
}

function placeStreetSearchHighlight(map: maplibregl.Map): void {
  if (!map.getLayer(STREETS_SEARCH_RESULT_LAYER_ID)) return

  if (map.getLayer(STREET_LAYER_IDS.labels)) {
    map.moveLayer(STREETS_SEARCH_RESULT_LAYER_ID, STREET_LAYER_IDS.labels)
    return
  }

  map.moveLayer(STREETS_SEARCH_RESULT_LAYER_ID)
}

export function getStreetLayers(theme: OverlayTheme): [
  LineLayerSpecification,
  LineLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
] {
  return [
    applyLayerTheme({
      id: STREET_LAYER_IDS.yard,
      type: 'line',
      source: STREETS_SOURCE_ID,
      filter: ['==', ['get', 'type'], 'yard'],
    }, theme.streets.yard),
    applyLayerTheme({
      id: STREET_LAYER_IDS.street,
      type: 'line',
      source: STREETS_SOURCE_ID,
      filter: ['==', ['get', 'type'], 'street'],
    }, theme.streets.street),
    applyLayerTheme({
      id: STREET_LAYER_IDS.main,
      type: 'line',
      source: STREETS_SOURCE_ID,
      filter: ['==', ['get', 'type'], 'main'],
    }, theme.streets.main),
    applyLayerTheme({
      id: STREET_LAYER_IDS.labels,
      type: 'symbol',
      source: STREETS_SOURCE_ID,
      filter: ['==', '$type', 'LineString'],
    }, theme.streets.labels),
  ]
}

export function registerStreetLayers(map: maplibregl.Map, theme: OverlayTheme): void {
  getStreetLayers(theme).forEach((layer) => map.addLayer(layer))
  map.addLayer({
    id: STREETS_SEARCH_RESULT_LAYER_ID,
    type: 'line',
    source: STREETS_SOURCE_ID,
    filter: getSearchResultFilter([]),
    paint: { 'line-color': '#dc2626', 'line-width': 4 },
  }, STREET_LAYER_IDS.labels)
}

export function applyStreetSearchResults(map: maplibregl.Map, featureIds: readonly (string | number)[]): void {
  if (!map.getLayer(STREETS_SEARCH_RESULT_LAYER_ID)) return
  map.setFilter(STREETS_SEARCH_RESULT_LAYER_ID, getSearchResultFilter(featureIds))
  placeStreetSearchHighlight(map)
}

export function applyStreetTheme(map: maplibregl.Map, theme: OverlayTheme): void {
  getStreetLayers(theme).forEach((layer) => {
    if (map.getLayer(layer.id)) map.removeLayer(layer.id)
    map.addLayer(layer)
  })
  placeStreetSearchHighlight(map)
}
