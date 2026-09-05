import maplibregl from 'maplibre-gl'
import type { Geometry } from 'geojson'

function extendFromCoordinates(bounds: maplibregl.LngLatBounds, value: unknown): boolean {
  if (!Array.isArray(value)) return false

  if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
    bounds.extend([value[0], value[1]])
    return true
  }

  return value.reduce((hasCoordinates, nestedValue) => extendFromCoordinates(bounds, nestedValue) || hasCoordinates, false)
}

/** Extends bounds with every valid coordinate in a GeoJSON geometry. */
export function extendGeometryBounds(bounds: maplibregl.LngLatBounds, geometry: Geometry | null): boolean {
  if (!geometry) return false

  if (geometry.type === 'GeometryCollection') {
    return geometry.geometries.reduce((hasCoordinates, nestedGeometry) => extendGeometryBounds(bounds, nestedGeometry) || hasCoordinates, false)
  }

  return extendFromCoordinates(bounds, geometry.coordinates)
}

