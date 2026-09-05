import type maplibregl from 'maplibre-gl'
import { OBJECT_INSPECTOR_MOTION, type ObjectInspectorMotion } from './motion'

export type CameraPadding = { top: number; right: number; bottom: number; left: number }
export type InspectorCameraTarget =
  | { kind: 'bounds'; bounds: maplibregl.LngLatBoundsLike }
  | { kind: 'point'; center: maplibregl.LngLatLike; zoom: number }
  | { kind: 'empty' }

type InspectorCameraMap = Pick<maplibregl.Map, 'easeTo' | 'fitBounds' | 'getZoom' | 'jumpTo' | 'setPadding' | 'stop'>

export const ZERO_CAMERA_PADDING: CameraPadding = { top: 0, right: 0, bottom: 0, left: 0 }
export const INSPECTOR_FOCUS_DURATION = 600
export const INSPECTOR_MAX_ZOOM = 18.5

function getPointZoom(map: InspectorCameraMap, target: Extract<InspectorCameraTarget, { kind: 'point' }>): number {
  return Math.max(map.getZoom(), target.zoom)
}

function applyTarget(
  map: InspectorCameraMap,
  target: InspectorCameraTarget,
  padding: CameraPadding,
  duration: number,
  reducedMotion: boolean,
  linearBounds: boolean,
  motion: ObjectInspectorMotion,
): void {
  if (reducedMotion) {
    if (target.kind === 'bounds') {
      map.fitBounds(target.bounds, { padding, maxZoom: INSPECTOR_MAX_ZOOM, animate: false })
      return
    }
    if (target.kind === 'point') {
      map.jumpTo({ center: target.center, zoom: getPointZoom(map, target), padding })
      return
    }
    map.jumpTo({ padding })
    return
  }

  if (target.kind === 'bounds') {
    map.fitBounds(target.bounds, {
      padding,
      maxZoom: INSPECTOR_MAX_ZOOM,
      duration,
      easing: motion.easing,
      ...(linearBounds ? { linear: true } : {}),
    })
    return
  }
  if (target.kind === 'point') {
    map.easeTo({
      center: target.center,
      zoom: getPointZoom(map, target),
      padding,
      duration,
      easing: motion.easing,
    })
    return
  }
  map.easeTo({ padding, duration, easing: motion.easing })
}

/** Starts the camera movement paired with the inspector entering the screen. */
export function openInspectorCamera(
  map: InspectorCameraMap,
  target: InspectorCameraTarget,
  padding: CameraPadding,
  reducedMotion: boolean,
  motion: ObjectInspectorMotion = OBJECT_INSPECTOR_MOTION,
): void {
  map.stop()
  applyTarget(map, target, padding, motion.durationMs, reducedMotion, true, motion)
}

/** Focuses an object while an inspector is already visible. */
export function focusInspectorCamera(
  map: InspectorCameraMap,
  target: InspectorCameraTarget,
  padding: CameraPadding,
  reducedMotion: boolean,
  motion: ObjectInspectorMotion = OBJECT_INSPECTOR_MOTION,
): void {
  map.stop()
  applyTarget(map, target, padding, INSPECTOR_FOCUS_DURATION, reducedMotion, false, motion)
}

/** Restores the viewport after a real inspector open without changing its view. */
export function closeInspectorCamera(
  map: InspectorCameraMap,
  wasOpened: boolean,
  reducedMotion: boolean,
  motion: ObjectInspectorMotion = OBJECT_INSPECTOR_MOTION,
): void {
  if (!wasOpened) {
    map.setPadding(ZERO_CAMERA_PADDING)
    return
  }

  map.stop()
  if (reducedMotion) {
    map.setPadding(ZERO_CAMERA_PADDING)
    return
  }
  map.easeTo({ padding: ZERO_CAMERA_PADDING, duration: motion.durationMs, easing: motion.easing })
}
