// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { vi } from 'vitest'
import { getSafeExternalUrl } from './ObjectInspector'
import { ObjectInspector } from './ObjectInspector'
import type { InspectableObject } from '../model/InspectableObject'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

class TestResizeObserver {
  observe() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', { value: TestResizeObserver, writable: true })
Object.defineProperty(window, 'matchMedia', {
  value: () => ({ matches: false }),
  writable: true,
})
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const inspectorObject: InspectableObject = {
  sourceId: 'buildings-geojson',
  id: 1,
  feature: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [0, 0] } },
  title: 'Inspector object',
  description: '',
  fandomWiki: '',
}

describe('getSafeExternalUrl', () => {
  it('accepts only http and https Fandom links', () => {
    expect(getSafeExternalUrl('https://discworld.fandom.com/wiki/Ankh-Morpork')).toBe('https://discworld.fandom.com/wiki/Ankh-Morpork')
    expect(getSafeExternalUrl('http://example.test/object')).toBe('http://example.test/object')
    expect(getSafeExternalUrl('javascript:alert(1)')).toBeNull()
    expect(getSafeExternalUrl('data:text/html,unsafe')).toBeNull()
    expect(getSafeExternalUrl('not a URL')).toBeNull()
  })
})

describe('ObjectInspector exit animation', () => {
  it('makes the retained closing panel inert and hidden, then unmounts it after animation end', () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    const props = {
      onSelect: vi.fn(),
      onBack: vi.fn(),
      onClose: vi.fn(),
      placement: 'left' as const,
      onSizeChange: vi.fn(),
      onVisibilityChange: vi.fn(),
    }

    act(() => {
      root.render(createElement(ObjectInspector, { ...props, view: { kind: 'details', object: inspectorObject } }))
    })
    act(() => {
      root.render(createElement(ObjectInspector, { ...props, view: null }))
    })

    const panel = container.querySelector('aside')
    expect(panel).not.toBeNull()
    expect(panel?.classList.contains('object-inspector--closing')).toBe(true)
    expect(panel?.getAttribute('aria-hidden')).toBe('true')
    expect(panel?.hasAttribute('inert')).toBe(true)
    expect(props.onVisibilityChange).toHaveBeenLastCalledWith(true)

    act(() => {
      const event = new Event('animationend', { bubbles: true })
      Object.defineProperty(event, 'animationName', { value: 'object-inspector-slide-out' })
      panel?.dispatchEvent(event)
    })
    expect(container.querySelector('aside')).toBeNull()
    expect(props.onVisibilityChange).toHaveBeenLastCalledWith(false)

    act(() => root.unmount())
    container.remove()
  })
})
