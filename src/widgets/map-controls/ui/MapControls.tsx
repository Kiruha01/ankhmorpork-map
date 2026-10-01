import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { AVAILABLE_LANGUAGES } from '../../../shared/config/i18n'
import { MapLanguageSwitcher } from '../../../features/map-language/ui/MapLanguageSwitcher'
import { MapLayers } from '../../../features/map-layers/ui/MapLayers'
import { MapMarkerOptions } from '../../../features/map-markers/ui/MapMarkers'
import './MapControls.css'

type Menu = 'language' | 'markers' | 'layers'
type Props = { layers: ComponentProps<typeof MapLayers>; markers: ComponentProps<typeof MapMarkerOptions> }
export function MapControls({ layers, markers }: Props) {
  const { t, i18n } = useTranslation()
  const [menu, setMenu] = useState<Menu | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const panel = useRef<HTMLElement>(null)
  const language = AVAILABLE_LANGUAGES.find(item => item.code === i18n.resolvedLanguage) ?? AVAILABLE_LANGUAGES[0]
  const close = () => { setMenu(null); trigger.current?.focus() }
  useEffect(() => {
    if (!menu) return
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const onOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setMenu(null)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setMenu(null); trigger.current?.focus() }
    }
    document.addEventListener('pointerdown', onOutside)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onOutside); document.removeEventListener('keydown', onKey) }
  }, [menu])
  const labels = { language: t('interface.language.menuLabel'), markers: t('interface.markers.title'), layers: t('interface.layers.title') }
  return <div ref={root} className="map-controls">
    <div className="map-controls__buttons">
      {(['language', 'markers', 'layers'] as const).map(name => <button type="button" className="map-controls__trigger" key={name}
        aria-label={labels[name]} aria-expanded={menu === name} aria-controls={menu === name ? 'map-controls-panel' : undefined}
        onClick={event => { trigger.current = event.currentTarget; setMenu(current => current === name ? null : name) }}>
        <span className="map-controls__circle" aria-hidden="true">
          {name === 'language' ? <span className="map-controls__flag">{language?.flag}</span>
            : name === 'markers' ? <span className="map-search__pin" /> : <svg className="map-controls__layers-icon" viewBox="0 0 24 24"><path d="m12 3 10 6-10 6L2 9l10-6Z M3 13l9 5 9-5 M3 17l9 5 9-5" /></svg>}
        </span>
        <span className="map-controls__caption">{name === 'language' ? language?.code.toUpperCase() : t(`interface.${name}.button`)}</span>
      </button>)}
    </div>
    {menu && <aside ref={panel} id="map-controls-panel" className={`map-controls__panel map-controls__panel--${menu}`} aria-label={labels[menu]}>
      <header className="map-controls__heading"><h2>{labels[menu]}</h2>
        <button className="map-controls__close" type="button" aria-label={t('interface.inspector.close')} onClick={close}>×</button>
      </header>
      {menu === 'language' ? <MapLanguageSwitcher onSelect={close} /> : menu === 'markers' ? <MapMarkerOptions {...markers} /> : <MapLayers {...layers} />}
    </aside>}
  </div>
}
