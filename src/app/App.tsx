import { useState } from 'react'
import type maplibregl from 'maplibre-gl'
import { type BaseMapVariantId } from '../entities/base-map/map/registerBaseMapLayer'
import { MapBasemapSwitcher } from '../features/map-basemap-switcher/ui/MapBasemapSwitcher'
import { MapLanguageSwitcher } from '../features/map-language/ui/MapLanguageSwitcher'
import { MapPointerInfo } from '../features/map-pointer/ui/MapPointerInfo'
import { MapZoomIndicator } from '../features/map-zoom/ui/MapZoomIndicator'
import { MapCanvas } from '../widgets/map/ui/MapCanvas'
import './styles/global.css'

export function App() {
  const [map, setMap] = useState<maplibregl.Map | null>(null)
  const [baseMapVariant, setBaseMapVariant] = useState<BaseMapVariantId>('orig')

  return (
    <main className="app">
      <MapCanvas onMapReady={setMap} />
      <MapZoomIndicator map={map} />
      <MapLanguageSwitcher />
      {/* <MapPointerInfo map={map} /> */}
      <MapBasemapSwitcher map={map} selectedVariant={baseMapVariant} onVariantChange={setBaseMapVariant} />
    </main>
  )
}
