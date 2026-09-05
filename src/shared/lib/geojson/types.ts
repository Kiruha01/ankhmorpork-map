import type { Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'

export type MapObjectProperties = GeoJsonProperties & {
  fid?: string | number
  name_id?: unknown
  label?: string | null
}

export type MapObjectFeature = Feature<Geometry, MapObjectProperties>
export type MapObjectFeatureCollection = FeatureCollection<Geometry, MapObjectProperties>
