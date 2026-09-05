import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTranslation } from 'react-i18next'
import { registerBaseMapLayer } from '../../../entities/base-map/map/registerBaseMapLayer'
import type { BaseMapVariantId } from '../../../shared/config/map'
import type { SupportedLanguage } from '../../../shared/config/i18n'
import { MAP_OPTIONS } from '../../../shared/config/map'
import {
  MapObjectLayersController,
  type MapObjectFeatureAtPointProvider,
  type MapObjectFeaturesProvider,
} from '../model/MapObjectLayersController'
import './MapCanvas.css'

type MapCanvasProps = {
  onMapReady: (map: maplibregl.Map | null) => void
  onSearchFeaturesReady: (provider: MapObjectFeaturesProvider | null) => void
  onObjectFeatureAtPointReady: (provider: MapObjectFeatureAtPointProvider | null) => void
  language: SupportedLanguage
  baseMapVariant: BaseMapVariantId
}

export function MapCanvas({ onMapReady, onSearchFeaturesReady, onObjectFeatureAtPointReady, language, baseMapVariant }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const objectLayersControllerRef = useRef<MapObjectLayersController | null>(null)
  const languageRef = useRef(language)
  const baseMapVariantRef = useRef(baseMapVariant)
  const { t } = useTranslation()

  languageRef.current = language
  baseMapVariantRef.current = baseMapVariant

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({ container: containerRef.current, ...MAP_OPTIONS })
    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    const onLoad = () => {
      registerBaseMapLayer(map)
      const controller = new MapObjectLayersController(map, languageRef.current, baseMapVariantRef.current)
      controller.initialize()
      objectLayersControllerRef.current = controller
      onSearchFeaturesReady(() => controller.getSearchFeatures())
      onObjectFeatureAtPointReady((point) => controller.getFeatureAtPoint(point))
      onMapReady(map)
    }
    map.once('load', onLoad)

    return () => {
      map.off('load', onLoad)
      objectLayersControllerRef.current?.destroy()
      objectLayersControllerRef.current = null
      onSearchFeaturesReady(null)
      onObjectFeatureAtPointReady(null)
      onMapReady(null)
      map.remove()
    }
  }, [onMapReady, onObjectFeatureAtPointReady, onSearchFeaturesReady])

  useEffect(() => {
    objectLayersControllerRef.current?.setLanguage(language)
  }, [language])

  useEffect(() => {
    objectLayersControllerRef.current?.setBaseMapVariant(baseMapVariant)
  }, [baseMapVariant])

  return <div ref={containerRef} className="map-canvas" aria-label={t('interface.map.ariaLabel')} />
}
