import type maplibregl from 'maplibre-gl'
import type { FillLayerSpecification, LineLayerSpecification, SymbolLayerSpecification } from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'
import { applyLayerTheme } from '../../../shared/lib/map/layerTheme'
import { BUILDINGS_SOURCE_ID } from './source'

export const BUILDINGS_FILL_LAYER_ID = 'buildings-fill'
export const BUILDINGS_OUTLINE_LAYER_ID = 'buildings-outline'
export const BUILDINGS_LABEL_LAYER_ID = 'buildings-labels'

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
}

export function applyBuildingTheme(map: maplibregl.Map, theme: OverlayTheme): void {
  getBuildingLayers(theme).forEach((layer) => {
    if (map.getLayer(layer.id)) map.removeLayer(layer.id)
    map.addLayer(layer)
  })
}
