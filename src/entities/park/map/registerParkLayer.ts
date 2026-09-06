import type maplibregl from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'
import { registerParkLayers } from './layers'
import { EMPTY_PARKS_SOURCE, PARKS_SOURCE_ID } from './source'

export { PARKS_GEOJSON_URL, PARKS_SOURCE_ID } from './source'

export function registerParkLayer(map: maplibregl.Map, theme: OverlayTheme): void {
  map.addSource(PARKS_SOURCE_ID, EMPTY_PARKS_SOURCE)
  registerParkLayers(map, theme)
}
