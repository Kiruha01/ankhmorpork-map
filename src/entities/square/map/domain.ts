import { applySquareSearchResults, applySquareTheme } from './layers'
import { SQUARES_INTERACTION_LAYER_ID, SQUARES_LABEL_LAYER_ID } from './layers'
import { registerSquareLayer } from './registerSquareLayer'
import { SQUARES_GEOJSON_URL, SQUARES_SOURCE_ID } from './source'
import type { MapObjectDomain } from '../../map-object/map/types'

export const squareMapDomain = {
  sourceId: SQUARES_SOURCE_ID,
  geoJsonUrl: SQUARES_GEOJSON_URL,
  register: registerSquareLayer,
  applyTheme: applySquareTheme,
  applySearchResults: applySquareSearchResults,
  interactiveLayerIds: [SQUARES_INTERACTION_LAYER_ID, SQUARES_LABEL_LAYER_ID],
} satisfies MapObjectDomain
