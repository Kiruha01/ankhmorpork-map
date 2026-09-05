import { applyBuildingSearchResults, applyBuildingTheme } from './layers'
import { BUILDINGS_FILL_LAYER_ID, BUILDINGS_OUTLINE_LAYER_ID } from './layers'
import { registerBuildingsLayer } from './registerBuildingsLayer'
import { BUILDINGS_GEOJSON_URL, BUILDINGS_SOURCE_ID } from './source'
import type { MapObjectDomain } from '../../map-object/map/types'

export const buildingMapDomain = {
  sourceId: BUILDINGS_SOURCE_ID,
  geoJsonUrl: BUILDINGS_GEOJSON_URL,
  register: registerBuildingsLayer,
  applyTheme: applyBuildingTheme,
  applySearchResults: applyBuildingSearchResults,
  interactiveLayerIds: [BUILDINGS_FILL_LAYER_ID, BUILDINGS_OUTLINE_LAYER_ID],
} satisfies MapObjectDomain
