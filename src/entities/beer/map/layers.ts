import type maplibregl from 'maplibre-gl'
import type { CircleLayerSpecification, SymbolLayerSpecification } from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'
import { applyLayerTheme } from '../../../shared/lib/map/layerTheme'
import { BEERS_SOURCE_ID } from './source'

export const BEERS_CIRCLE_LAYER_ID = 'beers-points'
export const BEERS_LABEL_LAYER_ID = 'beers-labels'
export const BEERS_SEARCH_RESULT_LAYER_ID = 'beers-search-results'
const EMPTY_SEARCH_FEATURE_ID = '__map-search-no-results__'

function getSearchResultFilter(featureIds: readonly (string | number)[]): maplibregl.FilterSpecification {
  const featureFilter = featureIds.length > 0
    ? ['in', '$id', ...featureIds]
    : ['==', '$id', EMPTY_SEARCH_FEATURE_ID]

  return ['all', ['==', '$type', 'Point'], featureFilter] as unknown as maplibregl.FilterSpecification
}

export function getBeerLayers(theme: OverlayTheme): [CircleLayerSpecification, SymbolLayerSpecification] {
  return [
    applyLayerTheme({
      id: BEERS_CIRCLE_LAYER_ID,
      type: 'circle',
      source: BEERS_SOURCE_ID,
      filter: ['==', '$type', 'Point'],
    }, theme.beers.marker),
    applyLayerTheme({
      id: BEERS_LABEL_LAYER_ID,
      type: 'symbol',
      source: BEERS_SOURCE_ID,
      filter: ['==', '$type', 'Point'],
    }, theme.beers.labels),
  ]
}

export function registerBeerLayers(map: maplibregl.Map, theme: OverlayTheme): void {
  getBeerLayers(theme).forEach((layer) => map.addLayer(layer))
  map.addLayer({
    id: BEERS_SEARCH_RESULT_LAYER_ID,
    type: 'circle',
    source: BEERS_SOURCE_ID,
    filter: getSearchResultFilter([]),
    paint: {
      'circle-radius': 8,
      'circle-color': 'rgba(0, 0, 0, 0)',
      'circle-stroke-color': '#dc2626',
      'circle-stroke-width': 3,
    },
  })
}

export function applyBeerSearchResults(map: maplibregl.Map, featureIds: readonly (string | number)[]): void {
  if (!map.getLayer(BEERS_SEARCH_RESULT_LAYER_ID)) return
  map.setFilter(BEERS_SEARCH_RESULT_LAYER_ID, getSearchResultFilter(featureIds))
  map.moveLayer(BEERS_SEARCH_RESULT_LAYER_ID)
}

export function applyBeerTheme(map: maplibregl.Map, theme: OverlayTheme): void {
  getBeerLayers(theme).forEach((layer) => {
    if (map.getLayer(layer.id)) map.removeLayer(layer.id)
    map.addLayer(layer)
  })
  if (map.getLayer(BEERS_SEARCH_RESULT_LAYER_ID)) map.moveLayer(BEERS_SEARCH_RESULT_LAYER_ID)
}
