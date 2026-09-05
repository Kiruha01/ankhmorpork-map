import type maplibregl from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'
import { BEERS_SOURCE_ID } from './source'

export const BEERS_CIRCLE_LAYER_ID = 'beers-points'
export const BEERS_LABEL_LAYER_ID = 'beers-labels'

export function registerBeerLayers(map: maplibregl.Map, theme: OverlayTheme): void {
  map.addLayer({
    id: BEERS_CIRCLE_LAYER_ID,
    type: 'circle',
    source: BEERS_SOURCE_ID,
    minzoom: 15,
    filter: ['==', '$type', 'Point'],
    paint: {
      'circle-color': theme.beerMarker,
      'circle-stroke-color': theme.beerMarkerStroke,
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 15, 1, 19, 2],
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 15, 3, 18, 6],
    },
  })
  map.addLayer({
    id: BEERS_LABEL_LAYER_ID,
    type: 'symbol',
    source: BEERS_SOURCE_ID,
    minzoom: 17,
    filter: ['==', '$type', 'Point'],
    layout: {
      'text-field': ['coalesce', ['get', 'label'], ''],
      'text-font': ['Open Sans Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 17, 10, 20, 14],
      'text-offset': [0, 1],
      'text-anchor': 'top',
    },
    paint: {
      'text-color': theme.labelText,
      'text-halo-color': theme.labelHalo,
      'text-halo-width': 1.2,
    },
  })
}

export function applyBeerTheme(map: maplibregl.Map, theme: OverlayTheme): void {
  if (map.getLayer(BEERS_CIRCLE_LAYER_ID)) {
    map.setPaintProperty(BEERS_CIRCLE_LAYER_ID, 'circle-color', theme.beerMarker)
    map.setPaintProperty(BEERS_CIRCLE_LAYER_ID, 'circle-stroke-color', theme.beerMarkerStroke)
  }

  if (map.getLayer(BEERS_LABEL_LAYER_ID)) {
    map.setPaintProperty(BEERS_LABEL_LAYER_ID, 'text-color', theme.labelText)
    map.setPaintProperty(BEERS_LABEL_LAYER_ID, 'text-halo-color', theme.labelHalo)
  }
}
