import type maplibregl from 'maplibre-gl'
import { BASE_MAP_VARIANTS } from '../../../shared/config/map'
import { registerBuildingLayers } from './layers'
import { BUILDINGS_SOURCE_ID, EMPTY_BUILDINGS_SOURCE } from './source'

export { BUILDINGS_GEOJSON_URL, BUILDINGS_SOURCE_ID } from './source'

export function registerBuildingsLayer(map: maplibregl.Map): void {
  map.addSource(BUILDINGS_SOURCE_ID, EMPTY_BUILDINGS_SOURCE)
  registerBuildingLayers(map, BASE_MAP_VARIANTS.orig.overlayTheme)
}
