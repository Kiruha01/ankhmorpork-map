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
}

export function applyStreetTheme(map: maplibregl.Map, theme: OverlayTheme): void {
  getStreetLayers(theme).forEach((layer) => {
    if (map.getLayer(layer.id)) map.removeLayer(layer.id)
    map.addLayer(layer)
  })
}
