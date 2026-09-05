import type maplibregl from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'
import { registerStreetLayers } from './layers'
import { EMPTY_STREETS_SOURCE, STREETS_SOURCE_ID } from './source'

export { STREETS_GEOJSON_URL, STREETS_SOURCE_ID } from './source'

export function registerStreetsLayer(map: maplibregl.Map, theme: OverlayTheme): void {
  map.addSource(STREETS_SOURCE_ID, EMPTY_STREETS_SOURCE)
  registerStreetLayers(map, theme)
}
