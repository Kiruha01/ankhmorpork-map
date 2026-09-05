import type maplibregl from 'maplibre-gl'
import type { CircleLayerSpecification, SymbolLayerSpecification } from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'
import { applyLayerTheme } from '../../../shared/lib/map/layerTheme'
import { BEERS_SOURCE_ID } from './source'

export const BEERS_CIRCLE_LAYER_ID = 'beers-points'
export const BEERS_LABEL_LAYER_ID = 'beers-labels'

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
}

export function applyBeerTheme(map: maplibregl.Map, theme: OverlayTheme): void {
  getBeerLayers(theme).forEach((layer) => {
    if (map.getLayer(layer.id)) map.removeLayer(layer.id)
    map.addLayer(layer)
  })
}
