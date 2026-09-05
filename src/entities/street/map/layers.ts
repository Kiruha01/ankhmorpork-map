import type maplibregl from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'
import { STREETS_SOURCE_ID } from './source'

export const STREET_LAYER_IDS = {
  yard: 'streets-yards',
  street: 'streets-streets',
  main: 'streets-mains',
  labels: 'streets-labels',
} as const

function registerRoadLayer(
  map: maplibregl.Map,
  id: string,
  roadClass: string,
  color: string,
  zoomMultiplier: number,
): void {
  map.addLayer({
    id,
    type: 'line',
    source: STREETS_SOURCE_ID,
    filter: ['==', ['get', 'type'], roadClass],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': color,
      'line-width': [
        'interpolate', ['exponential', 1.5], ['zoom'],
        13, 0.55 * zoomMultiplier,
        15, 1.8 * zoomMultiplier,
        17, 7 * zoomMultiplier,
        20, 28 * zoomMultiplier,
      ],
    },
  })
}

export function registerStreetLayers(map: maplibregl.Map, theme: OverlayTheme): void {
  registerRoadLayer(map, STREET_LAYER_IDS.yard, 'yard', theme.roadYard, 0.8)
  registerRoadLayer(map, STREET_LAYER_IDS.street, 'street', theme.roadStreet, 1)
  registerRoadLayer(map, STREET_LAYER_IDS.main, 'main', theme.roadMain, 1.8)
  map.addLayer({
    id: STREET_LAYER_IDS.labels,
    type: 'symbol',
    source: STREETS_SOURCE_ID,
    minzoom: 15,
    filter: ['==', '$type', 'LineString'],
    layout: {
      'symbol-placement': 'line',
      'text-field': ['coalesce', ['get', 'label'], ''],
      'text-font': ['Open Sans Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 15, 10, 18, 17],
      'text-max-angle': 30,
      'text-keep-upright': true,
      'text-padding': 3,
    },
    paint: {
      'text-color': theme.labelText,
      'text-halo-color': theme.labelHalo,
      'text-halo-width': 1.4,
    },
  })
}

export function applyStreetTheme(map: maplibregl.Map, theme: OverlayTheme): void {
  if (map.getLayer(STREET_LAYER_IDS.yard)) {
    map.setPaintProperty(STREET_LAYER_IDS.yard, 'line-color', theme.roadYard)
  }

  if (map.getLayer(STREET_LAYER_IDS.street)) {
    map.setPaintProperty(STREET_LAYER_IDS.street, 'line-color', theme.roadStreet)
  }

  if (map.getLayer(STREET_LAYER_IDS.main)) {
    map.setPaintProperty(STREET_LAYER_IDS.main, 'line-color', theme.roadMain)
  }

  if (map.getLayer(STREET_LAYER_IDS.labels)) {
    map.setPaintProperty(STREET_LAYER_IDS.labels, 'text-color', theme.labelText)
    map.setPaintProperty(STREET_LAYER_IDS.labels, 'text-halo-color', theme.labelHalo)
  }
}
