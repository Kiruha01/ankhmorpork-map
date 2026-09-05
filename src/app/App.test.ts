import { describe, expect, it } from 'vitest'
import {
  clearSearchInspectorSession,
  getInspectorBackAction,
  openDirectObjectDetails,
  toSearchMapObjectFeature,
  type InspectorState,
} from './App'

const firstObject = {
  sourceId: 'buildings-geojson',
  id: 1,
  feature: {} as never,
  title: 'First',
  description: '',
  fandomWiki: '',
}
const secondObject = { ...firstObject, sourceId: 'streets-geojson', id: 2, title: 'Second' }

const searchSession = {
  objects: [firstObject, secondObject],
  bounds: {} as never,
}

describe('clearSearchInspectorSession', () => {
  it('closes stale results and details opened from those results', () => {
    const results: InspectorState = { kind: 'results', session: searchSession }
    const details: InspectorState = {
      kind: 'details',
      object: {} as never,
      returnToResults: searchSession,
    }

    expect(clearSearchInspectorSession(results)).toBeNull()
    expect(clearSearchInspectorSession(details)).toBeNull()
  })

  it('does not close a direct map selection', () => {
    const directDetails: InspectorState = { kind: 'details', object: {} as never }
    expect(clearSearchInspectorSession(directDetails)).toBe(directDetails)
  })
})

describe('inspector selection and Back', () => {
  it('opens a direct-detail without a return search session', () => {
    expect(openDirectObjectDetails(firstObject)).toEqual({ kind: 'details', object: firstObject })
  })

  it('restores every result identity on Back, while direct detail clears highlights', () => {
    const searchDetail: InspectorState = {
      kind: 'details',
      object: firstObject,
      returnToResults: searchSession,
    }

    expect(getInspectorBackAction(searchDetail)).toEqual({
      inspector: { kind: 'results', session: searchSession },
      highlights: [
        { sourceId: 'buildings-geojson', id: 1, feature: firstObject.feature },
        { sourceId: 'streets-geojson', id: 2, feature: secondObject.feature },
      ],
    })
    expect(getInspectorBackAction(openDirectObjectDetails(firstObject))).toEqual({ inspector: null, highlights: [] })
  })

  it('maps a selected tile to exactly one feature identity', () => {
    expect([toSearchMapObjectFeature(secondObject)]).toEqual([
      { sourceId: 'streets-geojson', id: 2, feature: secondObject.feature },
    ])
  })
})
