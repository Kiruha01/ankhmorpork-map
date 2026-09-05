import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getStoredMapCamera, MAP_CAMERA_STORAGE_KEY, saveMapCamera } from './cameraStorage'

let values: Map<string, string>
let localStorage: Storage

beforeEach(() => {
  values = new Map()
  localStorage = {
    get length() { return values.size },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: () => null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  }
  vi.stubGlobal('window', { localStorage })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('map camera storage', () => {
  it('returns a valid persisted camera', () => {
    localStorage.setItem(MAP_CAMERA_STORAGE_KEY, JSON.stringify({
      center: [37.62, 55.75], zoom: 16.5, bearing: 10, pitch: 20,
    }))

    expect(getStoredMapCamera()).toEqual({
      center: [37.62, 55.75], zoom: 16.5, bearing: 10, pitch: 20,
    })
  })

  it('ignores malformed and impossible stored values', () => {
    localStorage.setItem(MAP_CAMERA_STORAGE_KEY, '{not JSON')
    expect(getStoredMapCamera()).toBeUndefined()

    localStorage.setItem(MAP_CAMERA_STORAGE_KEY, JSON.stringify({
      center: [37.62, 100], zoom: 16.5, bearing: 10, pitch: 20,
    }))
    expect(getStoredMapCamera()).toBeUndefined()
  })

  it('stores every camera component', () => {
    const map = {
      getCenter: () => ({ lng: 37.62, lat: 55.75 }),
      getZoom: () => 16.5,
      getBearing: () => 10,
      getPitch: () => 20,
    }

    saveMapCamera(map as never)

    expect(JSON.parse(localStorage.getItem(MAP_CAMERA_STORAGE_KEY)!)).toEqual({
      center: [37.62, 55.75], zoom: 16.5, bearing: 10, pitch: 20,
    })
  })
})
