import { afterEach, describe, expect, it, vi } from 'vitest'
import type maplibregl from 'maplibre-gl'
import { MapObjectLayersController } from './MapObjectLayersController'

const rawCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: { fid: 7, name_id: 'build_assassins' },
    geometry: { type: 'Point', coordinates: [0, 0] },
  }],
}

afterEach(() => vi.unstubAllGlobals())

describe('MapObjectLayersController.getFeatureAtPoint', () => {
  it('uses rendered sourceId and id to return the matching raw feature', async () => {
    const queryRenderedFeatures = vi.fn(() => [{ source: 'buildings-geojson', id: 7 }])
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(rawCollection), { status: 200 })))
    const map = { queryRenderedFeatures } as unknown as maplibregl.Map
    const controller = new MapObjectLayersController(map, 'en', 'orig')

    const picked = await controller.getFeatureAtPoint([10, 20])

    expect(queryRenderedFeatures).toHaveBeenCalledWith([10, 20], expect.objectContaining({
      layers: expect.arrayContaining(['buildings-fill', 'buildings-outline']),
    }))
    expect(picked).toMatchObject({ sourceId: 'buildings-geojson', id: 7 })
    expect(picked?.feature.properties?.fid).toBe(7)
  })
})
