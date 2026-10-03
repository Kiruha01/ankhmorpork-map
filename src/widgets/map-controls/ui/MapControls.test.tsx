// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type maplibregl from 'maplibre-gl'
import { MapControls } from './MapControls'
import { createInitialLayerVisibility, getVisibleOverlayTheme, type BaseMapVariantId } from '../../../shared/config/map'
import { MARKER_CATEGORIES } from '../../../features/map-markers/model/catalog'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { resolvedLanguage: 'en' } }) }))
vi.mock('../../../shared/config/i18n', () => ({
  AVAILABLE_LANGUAGES: [{ code: 'en', name: 'English', flag: '🇬🇧' }, { code: 'ru', name: 'Русский', flag: '🇷🇺' }],
  changeLanguage: vi.fn(),
}))
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
let root: Root | undefined
let container: HTMLDivElement
const changed = vi.fn()
function Harness() {
  const [variant, setVariant] = useState<BaseMapVariantId>('orig')
  const [visibility, setVisibility] = useState(createInitialLayerVisibility)
  const [markers, setMarkers] = useState<Record<string, boolean>>({})
  const [showZoom, setShowZoom] = useState(true)
  return <MapControls layers={{ map: {} as maplibregl.Map, variant, onVariantChange: setVariant, visibility: visibility[variant],
    onVisibilityChange: (id, value) => setVisibility(current => ({ ...current, [variant]: { ...current[variant], [id]: value } })),
    showAttributes: true, onShowAttributesChange: vi.fn(), showZoom, onShowZoomChange: setShowZoom,
    showNavigation: true, onShowNavigationChange: vi.fn(),
  }} markers={{ categories: MARKER_CATEGORIES, visibility: markers, onChange: (id, value) => {
    changed(id, value); setMarkers(current => ({ ...current, [id]: value }))
  } }} />
}
function mount() {
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  act(() => root!.render(<Harness />))
}
function button(label: string) {
  const element = Array.from(container.querySelectorAll('button')).find(item => item.getAttribute('aria-label') === label || item.textContent === label)
  if (!element) throw new Error(`Missing button ${label}`)
  return element
}
function checkbox(label: string) {
  const element = Array.from(container.querySelectorAll('label')).find(item => item.textContent === label)?.querySelector('input')
  if (!element) throw new Error(`Missing checkbox ${label}`)
  return element
}
afterEach(() => { act(() => root?.unmount()); container?.remove(); changed.mockClear() })

describe('Map settings interactions', () => {
  it('keeps each basemap selection independent and global zoom across switches', () => {
    mount()
    act(() => button('interface.layers.title').click())
    act(() => checkbox('interface.layers.buildings').click())
    act(() => checkbox('interface.layers.showZoom').click())
    act(() => button('interface.basemap.landscape').click())
    expect(checkbox('interface.layers.buildings').checked).toBe(true)
    expect(checkbox('interface.layers.showZoom').checked).toBe(false)
    act(() => button('interface.basemap.original').click())
    expect(checkbox('interface.layers.buildings').checked).toBe(false)
  })

  it('opens one menu, toggles a category exactly once from its text, and restores focus on Escape', () => {
    mount()
    act(() => button('interface.layers.title').click())
    const trigger = button('interface.markers.title')
    act(() => trigger.click())
    expect(container.querySelectorAll('aside')).toHaveLength(1)
    expect(container.textContent).not.toContain('interface.layers.mapType')
    const category = container.querySelector('label')!
    act(() => category.querySelector('small')!.click())
    expect(changed).toHaveBeenCalledTimes(1)
    expect(category.querySelector('input')!.checked).toBe(true)
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(container.querySelector('aside')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
})

describe('Map visibility contract', () => {
  it('hides configured geometry and labels without changing paint or leaking into another theme', () => {
    const original = getVisibleOverlayTheme('orig', {})
    const hidden = getVisibleOverlayTheme('orig', { 'orig-buildings': false })
    expect(hidden.buildings.fill.layout?.visibility).toBe('none')
    expect(hidden.buildings.outline.layout?.visibility).toBe('none')
    expect(hidden.buildings.labels.layout?.visibility).toBe('none')
    expect(hidden.buildings.fill.paint).toEqual(original.buildings.fill.paint)
    expect(hidden.streets).toEqual(original.streets)
    expect(getVisibleOverlayTheme('orig', {})).toEqual(original)
    expect(getVisibleOverlayTheme('rus', {}).buildings.fill.layout?.visibility).not.toBe('none')
  })
})
