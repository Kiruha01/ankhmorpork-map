import type maplibregl from 'maplibre-gl'
import type { FillLayerSpecification, LineLayerSpecification, SymbolLayerSpecification } from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'
import { applyLayerTheme } from '../../../shared/lib/map/layerTheme'
import { BUILDINGS_SOURCE_ID } from './source'

export const BUILDINGS_FILL_LAYER_ID = 'buildings-fill'
export const BUILDINGS_OUTLINE_LAYER_ID = 'buildings-outline'
export const BUILDINGS_LABEL_LAYER_ID = 'buildings-labels'
export const BUILDINGS_SEARCH_FILL_LAYER_ID = 'buildings-search-fill'
export const BUILDINGS_SEARCH_OUTLINE_LAYER_ID = 'buildings-search-outline'

const EMPTY_SEARCH_FEATURE_ID = '__map-search-no-results__'

function getSearchResultFilter(featureIds: readonly (string | number)[]): maplibregl.FilterSpecification {
  const featureFilter = featureIds.length > 0
    ? ['in', '$id', ...featureIds]
    : ['==', '$id', EMPTY_SEARCH_FEATURE_ID]

  return ['all', ['==', '$type', 'Polygon'], featureFilter] as unknown as maplibregl.FilterSpecification
}

function placeBuildingSearchHighlights(map: maplibregl.Map): void {
  if (!map.getLayer(BUILDINGS_SEARCH_FILL_LAYER_ID) || !map.getLayer(BUILDINGS_SEARCH_OUTLINE_LAYER_ID)) return

  if (map.getLayer(BUILDINGS_LABEL_LAYER_ID)) {
    map.moveLayer(BUILDINGS_SEARCH_FILL_LAYER_ID, BUILDINGS_LABEL_LAYER_ID)
    map.moveLayer(BUILDINGS_SEARCH_OUTLINE_LAYER_ID, BUILDINGS_LABEL_LAYER_ID)
    return
  }

  map.moveLayer(BUILDINGS_SEARCH_FILL_LAYER_ID)
  map.moveLayer(BUILDINGS_SEARCH_OUTLINE_LAYER_ID)
}

export function getBuildingLayers(theme: OverlayTheme): [
  FillLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
] {
  return [
    applyLayerTheme({
      id: BUILDINGS_FILL_LAYER_ID,
      type: 'fill',
      source: BUILDINGS_SOURCE_ID,
      filter: ['==', '$type', 'Polygon'],
    }, theme.buildings.fill),
    applyLayerTheme({
      id: BUILDINGS_OUTLINE_LAYER_ID,
      type: 'line',
      source: BUILDINGS_SOURCE_ID,
      filter: ['==', '$type', 'Polygon'],
    }, theme.buildings.outline),
    applyLayerTheme({
      id: BUILDINGS_LABEL_LAYER_ID,
      type: 'symbol',
      source: BUILDINGS_SOURCE_ID,
      filter: ['==', '$type', 'Polygon'],
    }, theme.buildings.labels),
  ]
}

export function registerBuildingLayers(map: maplibregl.Map, theme: OverlayTheme): void {
  getBuildingLayers(theme).forEach((layer) => map.addLayer(layer))
  map.addLayer({
    id: BUILDINGS_SEARCH_FILL_LAYER_ID,
    type: 'fill',
    source: BUILDINGS_SOURCE_ID,
    filter: getSearchResultFilter([]),
    paint: { 'fill-color': '#dc2626', 'fill-opacity': 0.22 },
  }, BUILDINGS_LABEL_LAYER_ID)
  map.addLayer({
    id: BUILDINGS_SEARCH_OUTLINE_LAYER_ID,
    type: 'line',
    source: BUILDINGS_SOURCE_ID,
    filter: getSearchResultFilter([]),
    paint: { 'line-color': '#dc2626', 'line-width': 3 },
  }, BUILDINGS_LABEL_LAYER_ID)
}

export function applyBuildingSearchResults(map: maplibregl.Map, featureIds: readonly (string | number)[]): void {
  if (!map.getLayer(BUILDINGS_SEARCH_FILL_LAYER_ID) || !map.getLayer(BUILDINGS_SEARCH_OUTLINE_LAYER_ID)) return
  map.setFilter(BUILDINGS_SEARCH_FILL_LAYER_ID, getSearchResultFilter(featureIds))
  map.setFilter(BUILDINGS_SEARCH_OUTLINE_LAYER_ID, getSearchResultFilter(featureIds))
  placeBuildingSearchHighlights(map)
}

export function applyBuildingTheme(map: maplibregl.Map, theme: OverlayTheme): void {
  getBuildingLayers(theme).forEach((layer) => {
    if (map.getLayer(layer.id)) map.removeLayer(layer.id)
    map.addLayer(layer)
  })
  placeBuildingSearchHighlights(map)
}
