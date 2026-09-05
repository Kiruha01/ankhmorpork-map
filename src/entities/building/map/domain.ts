import { applyBuildingSearchResults, applyBuildingTheme } from './layers'
import { registerBuildingsLayer } from './registerBuildingsLayer'
import { BUILDINGS_GEOJSON_URL, BUILDINGS_SOURCE_ID } from './source'
import type { MapObjectDomain } from '../../map-object/map/types'

export const buildingMapDomain = {
  sourceId: BUILDINGS_SOURCE_ID,
  geoJsonUrl: BUILDINGS_GEOJSON_URL,
  register: registerBuildingsLayer,
  applyTheme: applyBuildingTheme,
  applySearchResults: applyBuildingSearchResults,
} satisfies MapObjectDomain

