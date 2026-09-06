import type maplibregl from 'maplibre-gl'
import type { FillLayerSpecification, SymbolLayerSpecification } from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'
import { applyLayerTheme } from '../../../shared/lib/map/layerTheme'
import { SQUARES_SOURCE_ID } from './source'

export const SQUARES_LABEL_LAYER_ID = 'squares-labels'
export const SQUARES_INTERACTION_LAYER_ID = 'squares-interaction'
export const SQUARES_SEARCH_FILL_LAYER_ID = 'squares-search-fill'
export const SQUARES_SEARCH_OUTLINE_LAYER_ID = 'squares-search-outline'
const EMPTY_SEARCH_FEATURE_ID = '__map-search-no-results__'

function getSearchResultFilter(featureIds: readonly (string | number)[]): maplibregl.FilterSpecification {
  const featureFilter = featureIds.length > 0
    ? ['in', '$id', ...featureIds]
    : ['==', '$id', EMPTY_SEARCH_FEATURE_ID]

  return ['all', ['==', '$type', 'Polygon'], featureFilter] as unknown as maplibregl.FilterSpecification
}

function placeSquareSearchHighlights(map: maplibregl.Map): void {
  if (!map.getLayer(SQUARES_SEARCH_FILL_LAYER_ID) || !map.getLayer(SQUARES_SEARCH_OUTLINE_LAYER_ID)) return
  if (map.getLayer(SQUARES_LABEL_LAYER_ID)) {
    map.moveLayer(SQUARES_SEARCH_FILL_LAYER_ID, SQUARES_LABEL_LAYER_ID)
    map.moveLayer(SQUARES_SEARCH_OUTLINE_LAYER_ID, SQUARES_LABEL_LAYER_ID)
    return
  }
  map.moveLayer(SQUARES_SEARCH_FILL_LAYER_ID)
  map.moveLayer(SQUARES_SEARCH_OUTLINE_LAYER_ID)
}

export function getSquareLayers(theme: OverlayTheme): [FillLayerSpecification, SymbolLayerSpecification] {
  return [
    {
      id: SQUARES_INTERACTION_LAYER_ID,
      type: 'fill',
      source: SQUARES_SOURCE_ID,
      filter: ['==', '$type', 'Polygon'],
      // A rendered but transparent fill makes the complete polygon clickable.
      paint: { 'fill-opacity': 0 },
    },
    applyLayerTheme({
      id: SQUARES_LABEL_LAYER_ID,
      type: 'symbol',
      source: SQUARES_SOURCE_ID,
      filter: ['==', '$type', 'Polygon'],
    }, theme.squares.labels),
  ]
}

export function registerSquareLayers(map: maplibregl.Map, theme: OverlayTheme): void {
  getSquareLayers(theme).forEach((layer) => map.addLayer(layer))
  map.addLayer({
    id: SQUARES_SEARCH_FILL_LAYER_ID,
    type: 'fill',
    source: SQUARES_SOURCE_ID,
    filter: getSearchResultFilter([]),
    paint: { 'fill-color': '#dc2626', 'fill-opacity': 0.22 },
  }, SQUARES_LABEL_LAYER_ID)
  map.addLayer({
    id: SQUARES_SEARCH_OUTLINE_LAYER_ID,
    type: 'line',
    source: SQUARES_SOURCE_ID,
    filter: getSearchResultFilter([]),
    paint: { 'line-color': '#dc2626', 'line-width': 3 },
  }, SQUARES_LABEL_LAYER_ID)
}

export function applySquareSearchResults(map: maplibregl.Map, featureIds: readonly (string | number)[]): void {
  if (!map.getLayer(SQUARES_SEARCH_FILL_LAYER_ID) || !map.getLayer(SQUARES_SEARCH_OUTLINE_LAYER_ID)) return
  map.setFilter(SQUARES_SEARCH_FILL_LAYER_ID, getSearchResultFilter(featureIds))
  map.setFilter(SQUARES_SEARCH_OUTLINE_LAYER_ID, getSearchResultFilter(featureIds))
  placeSquareSearchHighlights(map)
}

export function applySquareTheme(map: maplibregl.Map, theme: OverlayTheme): void {
  getSquareLayers(theme).forEach((layer) => {
    if (map.getLayer(layer.id)) map.removeLayer(layer.id)
    map.addLayer(layer)
  })
  placeSquareSearchHighlights(map)
}
