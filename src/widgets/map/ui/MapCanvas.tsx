import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTranslation } from 'react-i18next'
import { registerBaseMapLayer } from '../../../entities/base-map/map/registerBaseMapLayer'
import { registerBuildingsLayer } from '../../../entities/building/map/registerBuildingsLayer'
import { registerStreetsLayer } from '../../../entities/street/map/registerStreetsLayer'
import { MAP_OPTIONS } from '../../../shared/config/map'
import './MapCanvas.css'

type MapCanvasProps = {
  onMapReady: (map: maplibregl.Map | null) => void
}

export function MapCanvas({ onMapReady }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({ container: containerRef.current, ...MAP_OPTIONS })
    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    map.once('load', () => {
      registerBaseMapLayer(map)
      registerBuildingsLayer(map)
      registerStreetsLayer(map)
      onMapReady(map)
    })

    return () => {
      onMapReady(null)
      map.remove()
    }
  }, [onMapReady])

  return <div ref={containerRef} className="map-canvas" aria-label={t('interface.map.ariaLabel')} />
}
