import type maplibregl from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'
import { BUILDINGS_SOURCE_ID } from './source'

export const BUILDINGS_FILL_LAYER_ID = 'buildings-fill'
export const BUILDINGS_OUTLINE_LAYER_ID = 'buildings-outline'
export const BUILDINGS_LABEL_LAYER_ID = 'buildings-labels'

export function registerBuildingLayers(map: maplibregl.Map, theme: OverlayTheme): void {
  map.addLayer({
    id: BUILDINGS_FILL_LAYER_ID,
    type: 'fill',
    source: BUILDINGS_SOURCE_ID,
    filter: ['==', '$type', 'Polygon'],
    paint: {
      'fill-color': ['case', ['get', 'is_landmark'], theme.buildingLandmarkFill, theme.buildingFill],
      'fill-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.2, 16, 0.52, 19, 0.72],
    },
  })
  map.addLayer({
    id: BUILDINGS_OUTLINE_LAYER_ID,
    type: 'line',
    source: BUILDINGS_SOURCE_ID,
    filter: ['==', '$type', 'Polygon'],
    paint: {
      'line-color': theme.buildingOutline,
      'line-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.3, 17, 0.85],
      'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.4, 17, 1.4, 20, 2.5],
    },
  })
  map.addLayer({
    id: BUILDINGS_LABEL_LAYER_ID,
    type: 'symbol',
    source: BUILDINGS_SOURCE_ID,
    minzoom: 15,
    filter: ['==', '$type', 'Polygon'],
    layout: {
      'text-field': ['coalesce', ['get', 'label'], ''],
      'text-font': ['Open Sans Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 16, 13, 19, 18],
      'text-max-width': 10,
      'text-allow-overlap': false,
    },
    paint: {
      'text-color': theme.labelText,
      'text-halo-color': theme.labelHalo,
      'text-halo-width': 1.2,
    },
  })
}

export function applyBuildingTheme(map: maplibregl.Map, theme: OverlayTheme): void {
  if (map.getLayer(BUILDINGS_FILL_LAYER_ID)) {
    map.setPaintProperty(BUILDINGS_FILL_LAYER_ID, 'fill-color', [
      'case', ['get', 'is_landmark'], theme.buildingLandmarkFill, theme.buildingFill,
    ])
  }

  if (map.getLayer(BUILDINGS_OUTLINE_LAYER_ID)) {
    map.setPaintProperty(BUILDINGS_OUTLINE_LAYER_ID, 'line-color', theme.buildingOutline)
  }

  if (map.getLayer(BUILDINGS_LABEL_LAYER_ID)) {
    map.setPaintProperty(BUILDINGS_LABEL_LAYER_ID, 'text-color', theme.labelText)
    map.setPaintProperty(BUILDINGS_LABEL_LAYER_ID, 'text-halo-color', theme.labelHalo)
  }
}
