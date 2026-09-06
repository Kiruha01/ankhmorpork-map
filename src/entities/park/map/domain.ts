import { applyParkSearchResults, applyParkTheme } from './layers'
import { PARKS_INTERACTION_LAYER_ID, PARKS_LABEL_LAYER_ID } from './layers'
import { registerParkLayer } from './registerParkLayer'
import { PARKS_GEOJSON_URL, PARKS_SOURCE_ID } from './source'
import type { MapObjectDomain } from '../../map-object/map/types'

export const parkMapDomain = {
  sourceId: PARKS_SOURCE_ID,
  geoJsonUrl: PARKS_GEOJSON_URL,
  register: registerParkLayer,
  applyTheme: applyParkTheme,
  applySearchResults: applyParkSearchResults,
  interactiveLayerIds: [PARKS_INTERACTION_LAYER_ID, PARKS_LABEL_LAYER_ID],
} satisfies MapObjectDomain
