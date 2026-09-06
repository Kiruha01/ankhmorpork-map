import type maplibregl from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'
import { registerSquareLayers } from './layers'
import { EMPTY_SQUARES_SOURCE, SQUARES_SOURCE_ID } from './source'

export { SQUARES_GEOJSON_URL, SQUARES_SOURCE_ID } from './source'

export function registerSquareLayer(map: maplibregl.Map, theme: OverlayTheme): void {
  map.addSource(SQUARES_SOURCE_ID, EMPTY_SQUARES_SOURCE)
  registerSquareLayers(map, theme)
}
