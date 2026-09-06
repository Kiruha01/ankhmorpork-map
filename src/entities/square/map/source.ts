import type maplibregl from 'maplibre-gl'

export const SQUARES_SOURCE_ID = 'squares-geojson'
export const SQUARES_GEOJSON_URL = `${import.meta.env.BASE_URL}geojsons/squares.geojson`

export const EMPTY_SQUARES_SOURCE: maplibregl.GeoJSONSourceSpecification = {
  type: 'geojson',
  data: { type: 'FeatureCollection', features: [] },
}
