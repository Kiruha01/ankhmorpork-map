import type maplibregl from 'maplibre-gl'
import { BASE_MAP_VARIANTS } from '../../../shared/config/map'
import { registerBeerLayers } from './layers'
import { BEERS_SOURCE_ID, EMPTY_BEERS_SOURCE } from './source'

export { BEERS_GEOJSON_URL, BEERS_SOURCE_ID } from './source'

export function registerBeerLayer(map: maplibregl.Map): void {
  map.addSource(BEERS_SOURCE_ID, EMPTY_BEERS_SOURCE)
  registerBeerLayers(map, BASE_MAP_VARIANTS.orig.overlayTheme)
}
