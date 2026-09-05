import { describe, expect, it, vi } from 'vitest'
import {
  closeInspectorCamera,
  openInspectorCamera,
  ZERO_CAMERA_PADDING,
  type CameraPadding,
} from './camera'
import { OBJECT_INSPECTOR_MOTION } from './motion'

const padding: CameraPadding = { top: 80, right: 80, bottom: 80, left: 400 }
const bounds: [[number, number], [number, number]] = [[0, 0], [1, 1]]

function createMap() {
  return {
    stop: vi.fn(),
    setPadding: vi.fn(),
    easeTo: vi.fn(),
    fitBounds: vi.fn(),
    getZoom: vi.fn(() => 12),
    jumpTo: vi.fn(),
  }
}

describe('object inspector camera policy', () => {
  it('resets initial close instantly without starting an animation', () => {
    const map = createMap()

    closeInspectorCamera(map as never, false, false)

    expect(map.setPadding).toHaveBeenCalledWith(ZERO_CAMERA_PADDING)
    expect(map.stop).not.toHaveBeenCalled()
    expect(map.easeTo).not.toHaveBeenCalled()
  })

  it('closes a real panel with only zero padding and shared motion', () => {
    const map = createMap()

    closeInspectorCamera(map as never, true, false)

    expect(map.stop).toHaveBeenCalledOnce()
    expect(map.easeTo).toHaveBeenCalledWith({
      padding: ZERO_CAMERA_PADDING,
      duration: OBJECT_INSPECTOR_MOTION.durationMs,
      easing: OBJECT_INSPECTOR_MOTION.easing,
    })
  })

  it('opens bounds with linear fitBounds and shared padding and motion', () => {
    const map = createMap()

    openInspectorCamera(map as never, { kind: 'bounds', bounds }, padding, false)

    expect(map.stop).toHaveBeenCalledOnce()
    expect(map.fitBounds).toHaveBeenCalledWith(bounds, {
      padding,
      maxZoom: 18.5,
      duration: OBJECT_INSPECTOR_MOTION.durationMs,
      easing: OBJECT_INSPECTOR_MOTION.easing,
      linear: true,
    })
  })

  it('opens a point with easeTo and preserves unspecified view fields', () => {
    const map = createMap()

    openInspectorCamera(map as never, { kind: 'point', center: [1, 2], zoom: 18.5 }, padding, false)

    expect(map.easeTo).toHaveBeenCalledWith({
      center: [1, 2],
      zoom: 18.5,
      padding,
      duration: OBJECT_INSPECTOR_MOTION.durationMs,
      easing: OBJECT_INSPECTOR_MOTION.easing,
    })
  })

  it('does not animate when reduced motion is requested', () => {
    const map = createMap()

    openInspectorCamera(map as never, { kind: 'point', center: [1, 2], zoom: 18.5 }, padding, true)

    expect(map.jumpTo).toHaveBeenCalledWith({ center: [1, 2], zoom: 18.5, padding })
    expect(map.easeTo).not.toHaveBeenCalled()
  })

  it('stops an existing transition before replacing it', () => {
    const map = createMap()

    openInspectorCamera(map as never, { kind: 'empty' }, padding, false)
    openInspectorCamera(map as never, { kind: 'empty' }, padding, false)

    expect(map.stop).toHaveBeenCalledTimes(2)
    expect(map.easeTo).toHaveBeenCalledTimes(2)
  })
})
