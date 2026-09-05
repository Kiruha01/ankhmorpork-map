import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import type { InspectableObject } from '../model/InspectableObject'
import { OBJECT_INSPECTOR_MOTION } from '../model/motion'
import type { InspectorPlacement } from '../../../shared/config/layout'
import './ObjectInspector.css'

export type ObjectInspectorView =
  | { kind: 'results'; objects: readonly InspectableObject[] }
  | { kind: 'details'; object: InspectableObject }

export type ObjectInspectorSize = {
  width: number
  height: number
  placement: InspectorPlacement
}

type ObjectInspectorProps = {
  view: ObjectInspectorView | null
  onSelect: (object: InspectableObject) => void
  onBack: () => void
  onClose: () => void
  placement: InspectorPlacement
  onSizeChange: (size: ObjectInspectorSize) => void
  onVisibilityChange: (visible: boolean) => void
}

export function getSafeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

function formatProperty(value: unknown): string {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function ObjectInspector({ view, onSelect, onBack, onClose, placement, onSizeChange, onVisibilityChange }: ObjectInspectorProps) {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLElement>(null)
  const [displayedView, setDisplayedView] = useState(view)
  const [closing, setClosing] = useState(false)
  const motionStyle = {
    '--object-inspector-motion-duration': `${OBJECT_INSPECTOR_MOTION.durationMs}ms`,
    '--object-inspector-motion-easing': OBJECT_INSPECTOR_MOTION.cssEasing,
  } as CSSProperties

  useLayoutEffect(() => {
    if (view) {
      setDisplayedView(view)
      setClosing(false)
      return
    }
    if (!displayedView) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setDisplayedView(null)
      setClosing(false)
      return
    }
    setClosing(true)
  }, [displayedView, view])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || !closing) return

    const finishClosing = () => {
      setDisplayedView(null)
      setClosing(false)
    }
    panel.addEventListener('animationend', finishClosing)
    return () => panel.removeEventListener('animationend', finishClosing)
  }, [closing])

  useEffect(() => {
    onVisibilityChange(Boolean(displayedView))
  }, [displayedView, onVisibilityChange])

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel || !displayedView || closing || !view) {
      onSizeChange({ width: 0, height: 0, placement })
      return
    }

    const notifySize = () => {
      const { width, height } = panel.getBoundingClientRect()
      onSizeChange({ width, height, placement })
    }
    notifySize()
    const observer = new ResizeObserver(notifySize)
    observer.observe(panel)
    return () => observer.disconnect()
  }, [closing, displayedView, onSizeChange, placement, view])

  if (!displayedView) return null

  const panelClassName = `object-inspector object-inspector--${placement}${closing ? ' object-inspector--closing' : ''}`
  const accessibilityProps = closing ? { 'aria-hidden': true, inert: true } : {}
  if (displayedView.kind === 'results') {
    return (
      <aside ref={panelRef} className={panelClassName} style={motionStyle} aria-label={t('interface.inspector.resultsAriaLabel')} {...accessibilityProps}>
        <header className="object-inspector__header">
          <h2>{t('interface.inspector.resultsTitle')}</h2>
          <button type="button" className="object-inspector__icon-button" aria-label={t('interface.inspector.close')} onClick={onClose}>×</button>
        </header>
        <div className="object-inspector__results">
          {displayedView.objects.map((object) => (
            <button
              key={`${object.sourceId}:${object.id}`}
              type="button"
              className="object-inspector__tile"
              onClick={() => onSelect(object)}
            >
              <span className="object-inspector__tile-title">{object.title}</span>
              {object.description && <span className="object-inspector__tile-description">{object.description}</span>}
            </button>
          ))}
        </div>
      </aside>
    )
  }

  const { object } = displayedView
  const url = getSafeExternalUrl(object.fandomWiki)
  const properties = object.feature.properties ?? {}

  return (
    <aside ref={panelRef} className={panelClassName} style={motionStyle} aria-label={t('interface.inspector.detailsAriaLabel')} {...accessibilityProps}>
      <header className="object-inspector__header">
        <button type="button" className="object-inspector__back" onClick={onBack}>← {t('interface.inspector.back')}</button>
        <button type="button" className="object-inspector__icon-button" aria-label={t('interface.inspector.close')} onClick={onClose}>×</button>
      </header>
      <div className="object-inspector__details">
        <h2>{object.title}</h2>
        {object.description && <p className="object-inspector__description">{object.description}</p>}
        {url && <a className="object-inspector__fandom-link" href={url} target="_blank" rel="noreferrer noopener">{t('interface.inspector.fandomLink')}</a>}
      </div>
      <section className="object-inspector__debug" aria-label={t('interface.inspector.geoJsonAttributes')}>
        <h3>{t('interface.inspector.geoJsonAttributes')}</h3>
        <dl>
          <div><dt>{t('interface.inspector.sourceId')}</dt><dd>{object.sourceId}</dd></div>
          <div><dt>{t('interface.inspector.featureId')}</dt><dd>{String(object.id)}</dd></div>
          {Object.entries(properties).map(([key, value]) => (
            <div key={key}><dt>{key}</dt><dd>{formatProperty(value)}</dd></div>
          ))}
        </dl>
      </section>
    </aside>
  )
}
