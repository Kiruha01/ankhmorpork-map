import type maplibregl from 'maplibre-gl'

export const BUILDINGS_SOURCE_ID = 'buildings-geojson'
export const BUILDINGS_GEOJSON_URL = '/build.geojson'

export const EMPTY_BUILDINGS_SOURCE: maplibregl.GeoJSONSourceSpecification = {
  type: 'geojson',
  data: { type: 'FeatureCollection', features: [] },
}
