import { describe, expect, it } from 'vitest'
import { createInspectableObject } from './InspectableObject'
import type { SearchMapObjectFeature } from '../../../widgets/map/model/MapObjectLayersController'

function rawFeature(properties: Record<string, unknown>): SearchMapObjectFeature {
  return {
    sourceId: 'buildings-geojson',
    id: 42,
    feature: {
      type: 'Feature',
      properties: { fid: 42, ...properties },
      geometry: { type: 'Point', coordinates: [0, 0] },
    },
  }
}

describe('createInspectableObject', () => {
  it('keeps the source and fid identity and localizes an object', () => {
    const object = createInspectableObject(rawFeature({ name_id: 'build_assassins' }), 'ru')

    expect(object.sourceId).toBe('buildings-geojson')
    expect(object.id).toBe(42)
    expect(object.title).toBe('Гильдия убийц')
  })

  it('falls back field-by-field to English and then to name_id', () => {
    expect(createInspectableObject(rawFeature({ name_id: 'street_attic_bee' }), 'ru').title).toBe('Attic bee street')
    expect(createInspectableObject(rawFeature({ name_id: 'not-translated' }), 'ru').title).toBe('not-translated')
  })

  it('uses the localized untitled fallback when a feature has no name_id', () => {
    expect(createInspectableObject(rawFeature({}), 'ru').title).toBe('Без названия')
  })
})
