import { useState } from 'react'
import type maplibregl from 'maplibre-gl'
import { useTranslation } from 'react-i18next'
import {
  BASE_MAP_VARIANT_STORAGE_KEY,
  getInitialBaseMapVariant,
  type BaseMapVariantId,
} from '../shared/config/map'
import { MapBasemapSwitcher } from '../features/map-basemap-switcher/ui/MapBasemapSwitcher'
import { MapLanguageSwitcher } from '../features/map-language/ui/MapLanguageSwitcher'
import { MapPointerInfo } from '../features/map-pointer/ui/MapPointerInfo'
import { MapZoomIndicator } from '../features/map-zoom/ui/MapZoomIndicator'
import { MapCanvas } from '../widgets/map/ui/MapCanvas'
import './styles/global.css'

export function App() {
  const { i18n } = useTranslation()
  const [map, setMap] = useState<maplibregl.Map | null>(null)
  const [baseMapVariant, setBaseMapVariant] = useState<BaseMapVariantId>(getInitialBaseMapVariant)

  const changeBaseMapVariant = (variant: BaseMapVariantId) => {
    setBaseMapVariant(variant)
    window.localStorage.setItem(BASE_MAP_VARIANT_STORAGE_KEY, variant)
  }

  return (
    <main className="app">
      <MapCanvas
        onMapReady={setMap}
        language={i18n.resolvedLanguage ?? i18n.language ?? 'en'}
        baseMapVariant={baseMapVariant}
      />
      <MapZoomIndicator map={map} />
      <MapLanguageSwitcher />
      {/* <MapPointerInfo map={map} /> */}
      <MapBasemapSwitcher map={map} selectedVariant={baseMapVariant} onVariantChange={changeBaseMapVariant} />
    </main>
  )
}
