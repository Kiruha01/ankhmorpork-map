import { applyStreetSearchResults, applyStreetTheme } from './layers'
import { registerStreetsLayer } from './registerStreetsLayer'
import { STREETS_GEOJSON_URL, STREETS_SOURCE_ID } from './source'
import type { MapObjectDomain } from '../../map-object/map/types'

export const streetMapDomain = {
  sourceId: STREETS_SOURCE_ID,
  geoJsonUrl: STREETS_GEOJSON_URL,
  register: registerStreetsLayer,
  applyTheme: applyStreetTheme,
  applySearchResults: applyStreetSearchResults,
} satisfies MapObjectDomain

