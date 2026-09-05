import type maplibregl from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'
import { registerBeerLayers } from './layers'
import { BEERS_SOURCE_ID, EMPTY_BEERS_SOURCE } from './source'

export { BEERS_GEOJSON_URL, BEERS_SOURCE_ID } from './source'

export function registerBeerLayer(map: maplibregl.Map, theme: OverlayTheme): void {
  map.addSource(BEERS_SOURCE_ID, EMPTY_BEERS_SOURCE)
  registerBeerLayers(map, theme)
}
