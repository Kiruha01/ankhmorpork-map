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

type SheetPosition = 'peek' | 'normal' | 'expanded'

function moveSheet(position: SheetPosition, direction: 'up' | 'down'): SheetPosition {
  if (direction === 'up') return position === 'peek' ? 'normal' : 'expanded'
  return position === 'expanded' ? 'normal' : 'peek'
}

function toggleSheet(position: SheetPosition): SheetPosition {
  return position === 'peek' ? 'normal' : position === 'expanded' ? 'normal' : 'peek'
}

type ObjectInspectorProps = {
  view: ObjectInspectorView | null
  showAttributes?: boolean
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

export function ObjectInspector({ showAttributes = true, view, onSelect, onBack, onClose, placement, onSizeChange, onVisibilityChange }: ObjectInspectorProps) {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLElement>(null)
  const [displayedView, setDisplayedView] = useState(view)
  const [closing, setClosing] = useState(false)
  const [sheetPosition, setSheetPosition] = useState<SheetPosition>('normal')
  const dragStartY = useRef<number | null>(null)
  const viewIdentity = view?.kind === 'details'
    ? `details:${view.object.sourceId}:${view.object.id}`
    : view?.kind === 'results'
      ? `results:${view.objects.map(({ sourceId, id }) => `${sourceId}:${id}`).join(',')}`
      : null
  const previousViewIdentity = useRef(viewIdentity)
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
    onVisibilityChange(Boolean(displayedView) && (placement !== 'bottom' || sheetPosition !== 'peek'))
  }, [displayedView, onVisibilityChange, placement, sheetPosition])

  useEffect(() => {
    if (!view) setSheetPosition('normal')
  }, [view])

  useEffect(() => {
    if (viewIdentity !== previousViewIdentity.current && viewIdentity !== null) {
      setSheetPosition('normal')
    }
    previousViewIdentity.current = viewIdentity
  }, [viewIdentity])

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

  const panelClassName = `object-inspector object-inspector--${placement}${placement === 'bottom' ? ` object-inspector--${sheetPosition}` : ''}${closing ? ' object-inspector--closing' : ''}`
  const accessibilityProps = closing ? { 'aria-hidden': true, inert: true } : {}
  const isPeek = placement === 'bottom' && sheetPosition === 'peek'
  const sheetHandle = placement === 'bottom' && (
    <button
      type="button"
      className="object-inspector__handle"
      aria-label={t(sheetPosition === 'peek' ? 'interface.inspector.show' : sheetPosition === 'expanded' ? 'interface.inspector.collapse' : 'interface.inspector.hide')}
      aria-expanded={sheetPosition !== 'peek'}
      onPointerDown={(event) => {
        dragStartY.current = event.clientY
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerUp={(event) => {
        if (dragStartY.current === null) return
        const movement = event.clientY - dragStartY.current
        dragStartY.current = null
        setSheetPosition((current) => Math.abs(movement) < 36
          ? toggleSheet(current)
          : moveSheet(current, movement < 0 ? 'up' : 'down'))
      }}
      onPointerCancel={() => { dragStartY.current = null }}
      onClick={(event) => {
        if (event.detail === 0) setSheetPosition(toggleSheet)
      }}
    >
      <span />
    </button>
  )
  if (displayedView.kind === 'results') {
    return (
      <aside ref={panelRef} className={panelClassName} style={motionStyle} aria-label={t('interface.inspector.resultsAriaLabel')} {...accessibilityProps}>
        {sheetHandle}
        {!isPeek && (
          <>
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
                  <span className="object-inspector__tile-icon" aria-hidden="true"><span className="map-search__pin" /></span>
                  <span className="object-inspector__tile-text">
                    <span className="object-inspector__tile-title">{object.title}</span>
                    {object.description && <span className="object-inspector__tile-description">{object.description}</span>}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </aside>
    )
  }

  const { object } = displayedView
  const url = getSafeExternalUrl(object.fandomWiki)
  const properties = object.feature.properties ?? {}

  return (
    <aside ref={panelRef} className={panelClassName} style={motionStyle} aria-label={t('interface.inspector.detailsAriaLabel')} {...accessibilityProps}>
      {sheetHandle}
      {!isPeek && (
        <>
          <header className="object-inspector__header">
            <button type="button" className="object-inspector__back" onClick={onBack}>← {t('interface.inspector.back')}</button>
            <button type="button" className="object-inspector__icon-button" aria-label={t('interface.inspector.close')} onClick={onClose}>×</button>
          </header>
          <div className="object-inspector__body">
            <div className="object-inspector__hero" aria-hidden="true"><span className="map-search__pin" /></div>
            <div className="object-inspector__details">
              <h2>{object.title}</h2>
              {object.description && <p className="object-inspector__description">{object.description}</p>}
              {url && <a className="object-inspector__fandom-link" href={url} target="_blank" rel="noreferrer noopener">{t('interface.inspector.fandomLink')}</a>}
            </div>
            {showAttributes && <section className="object-inspector__debug" aria-label={t('interface.inspector.geoJsonAttributes')}>
              <h3>{t('interface.inspector.geoJsonAttributes')}</h3>
              <dl>
                <div><dt>{t('interface.inspector.sourceId')}</dt><dd>{object.sourceId}</dd></div>
                <div><dt>{t('interface.inspector.featureId')}</dt><dd>{String(object.id)}</dd></div>
                {Object.entries(properties).map(([key, value]) => (
                  <div key={key}><dt>{key}</dt><dd>{formatProperty(value)}</dd></div>
                ))}
              </dl>
            </section>}
          </div>
        </>
      )}
    </aside>
  )
}
