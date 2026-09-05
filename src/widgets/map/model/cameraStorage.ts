import type maplibregl from 'maplibre-gl'
import type { MapOptions } from 'maplibre-gl'

export const MAP_CAMERA_STORAGE_KEY = 'map-camera'

type StoredMapCamera = Pick<MapOptions, 'center' | 'zoom' | 'bearing' | 'pitch'>

type CameraMap = Pick<maplibregl.Map, 'getBearing' | 'getCenter' | 'getPitch' | 'getZoom'>

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isStoredMapCamera(value: unknown): value is StoredMapCamera {
  if (!value || typeof value !== 'object') return false

  const camera = value as Record<string, unknown>
  return Array.isArray(camera.center)
    && camera.center.length === 2
    && isFiniteNumber(camera.center[0])
    && isFiniteNumber(camera.center[1])
    && camera.center[1] >= -90
    && camera.center[1] <= 90
    && isFiniteNumber(camera.zoom)
    && isFiniteNumber(camera.bearing)
    && isFiniteNumber(camera.pitch)
}

/** Returns a valid persisted camera, or leaves the configured MapLibre defaults intact. */
export function getStoredMapCamera(): StoredMapCamera | undefined {
  if (typeof window === 'undefined') return undefined

  try {
    const storedCamera = window.localStorage.getItem(MAP_CAMERA_STORAGE_KEY)
    if (storedCamera === null) return undefined

    const camera: unknown = JSON.parse(storedCamera)
    return isStoredMapCamera(camera) ? camera : undefined
  } catch {
    return undefined
  }
}

/** Saves the final camera state after any user or programmatic map movement. */
export function saveMapCamera(map: CameraMap): void {
  if (typeof window === 'undefined') return

  const center = map.getCenter()
  const camera: StoredMapCamera = {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  }

  try {
    window.localStorage.setItem(MAP_CAMERA_STORAGE_KEY, JSON.stringify(camera))
  } catch {
    // A disabled or full storage must not make the map unusable.
  }
}
