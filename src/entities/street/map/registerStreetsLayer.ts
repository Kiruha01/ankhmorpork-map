import type maplibregl from 'maplibre-gl'
import { BASE_MAP_VARIANTS } from '../../../shared/config/map'
import { registerStreetLayers } from './layers'
import { EMPTY_STREETS_SOURCE, STREETS_SOURCE_ID } from './source'

export { STREETS_GEOJSON_URL, STREETS_SOURCE_ID } from './source'

export function registerStreetsLayer(map: maplibregl.Map): void {
  map.addSource(STREETS_SOURCE_ID, EMPTY_STREETS_SOURCE)
  registerStreetLayers(map, BASE_MAP_VARIANTS.orig.overlayTheme)
}
