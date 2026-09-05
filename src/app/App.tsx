import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { useTranslation } from 'react-i18next'
import {
  BASE_MAP_VARIANT_STORAGE_KEY,
  getInitialBaseMapVariant,
  type BaseMapVariantId,
} from '../shared/config/map'
import { MapBasemapSwitcher } from '../features/map-basemap-switcher/ui/MapBasemapSwitcher'
import { MapLanguageSwitcher } from '../features/map-language/ui/MapLanguageSwitcher'
import { MapPointerInfo } from '../features/map-pointer/ui/MapPointerInfo'
import { MapSearch } from '../features/map-search/ui/MapSearch'
import type { SearchIntent } from '../features/map-search/ui/MapSearch'
import { MapZoomIndicator } from '../features/map-zoom/ui/MapZoomIndicator'
import { ObjectInspector, type ObjectInspectorView } from '../features/object-inspector/ui/ObjectInspector'
import { createInspectableObject, relocalizeInspectableObject, type InspectableObject } from '../features/object-inspector/model/InspectableObject'
import {
  closeInspectorCamera,
  focusInspectorCamera,
  INSPECTOR_MAX_ZOOM,
  openInspectorCamera,
  type CameraPadding,
  type InspectorCameraTarget,
} from '../features/object-inspector/model/camera'
import { OBJECT_INSPECTOR_MOTION } from '../features/object-inspector/model/motion'
import { MapCanvas } from '../widgets/map/ui/MapCanvas'
import type {
  MapObjectFeatureAtPointProvider,
  MapObjectFeaturesProvider,
  SearchMapObjectFeature,
} from '../widgets/map/model/MapObjectLayersController'
import { extendGeometryBounds } from '../features/map-search/model/geometryBounds'
import './styles/global.css'

export type SearchSession = {
  objects: InspectableObject[]
  bounds: maplibregl.LngLatBounds
}

export type InspectorState =
  | null
  | { kind: 'results'; session: SearchSession }
  | { kind: 'details'; object: InspectableObject; returnToResults?: SearchSession }

const CAMERA_GUTTER = 24
const CAMERA_VERTICAL_PADDING = 80

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

function getInspectorCameraTarget(inspector: Exclude<InspectorState, null>): InspectorCameraTarget {
  if (inspector.kind === 'results') return { kind: 'bounds', bounds: inspector.session.bounds }

  const bounds = new maplibregl.LngLatBounds()
  extendGeometryBounds(bounds, inspector.object.feature.geometry)
  if (bounds.isEmpty()) return { kind: 'empty' }

  const southWest = bounds.getSouthWest()
  const northEast = bounds.getNorthEast()
  if (southWest.lng === northEast.lng && southWest.lat === northEast.lat) {
    return { kind: 'point', center: southWest, zoom: INSPECTOR_MAX_ZOOM }
  }
  return { kind: 'bounds', bounds }
}

/** Clears UI that belongs to a search without closing a direct map selection. */
export function clearSearchInspectorSession(current: InspectorState): InspectorState {
  if (current?.kind === 'results') return null
  if (current?.kind === 'details' && current.returnToResults) return null
  return current
}

export function toSearchMapObjectFeature(object: InspectableObject): SearchMapObjectFeature {
  return { sourceId: object.sourceId, id: object.id, feature: object.feature }
}

export function openDirectObjectDetails(object: InspectableObject): InspectorState {
  return { kind: 'details', object }
}

export function getInspectorBackAction(current: InspectorState): {
  inspector: InspectorState
  highlights: SearchMapObjectFeature[]
} {
  if (current?.kind === 'details' && current.returnToResults) {
    return {
      inspector: { kind: 'results', session: current.returnToResults },
      highlights: current.returnToResults.objects.map(toSearchMapObjectFeature),
    }
  }
  return { inspector: null, highlights: [] }
}

export function App() {
  const { i18n } = useTranslation()
  const [map, setMap] = useState<maplibregl.Map | null>(null)
  const [getSearchFeatures, setSearchFeaturesProvider] = useState<MapObjectFeaturesProvider | null>(null)
  const [getObjectFeatureAtPoint, setObjectFeatureAtPointProvider] = useState<MapObjectFeatureAtPointProvider | null>(null)
  const [baseMapVariant, setBaseMapVariant] = useState<BaseMapVariantId>(getInitialBaseMapVariant)
  const [inspector, setInspector] = useState<InspectorState>(null)
  const [panelWidth, setPanelWidth] = useState(0)
  const clearSearchRef = useRef<(() => void) | null>(null)
  const applyHighlightsRef = useRef<((objects: readonly SearchMapObjectFeature[]) => void) | null>(null)
  const objectPickRunRef = useRef(0)
  const appliedInspectorRef = useRef<{ map: maplibregl.Map; inspector: Exclude<InspectorState, null> } | null>(null)
  const language = i18n.resolvedLanguage ?? i18n.language ?? 'en'

  const changeBaseMapVariant = (variant: BaseMapVariantId) => {
    setBaseMapVariant(variant)
    window.localStorage.setItem(BASE_MAP_VARIANT_STORAGE_KEY, variant)
  }

  const handleSearchFeaturesReady = useCallback((provider: MapObjectFeaturesProvider | null) => {
    setSearchFeaturesProvider(() => provider)
  }, [])

  const handleObjectFeatureAtPointReady = useCallback((provider: MapObjectFeatureAtPointProvider | null) => {
    setObjectFeatureAtPointProvider(() => provider)
  }, [])

  const handleSearchResults = useCallback((objects: SearchMapObjectFeature[], bounds: maplibregl.LngLatBounds, intent: SearchIntent) => {
    if (objects.length === 0 || bounds.isEmpty()) {
      applyHighlightsRef.current?.([])
      setInspector(clearSearchInspectorSession)
      return
    }

    if (intent === 'direct-detail') {
      const object = createInspectableObject(objects[0], language)
      applyHighlightsRef.current?.([toSearchMapObjectFeature(object)])
      setInspector(openDirectObjectDetails(object))
      return
    }

    applyHighlightsRef.current?.(objects)
    setInspector({
      kind: 'results',
      session: { objects: objects.map((object) => createInspectableObject(object, language)), bounds },
    })
  }, [language])

  const handleSearchReset = useCallback(() => {
    applyHighlightsRef.current?.([])
    setInspector((current) => {
      if (!current || current.kind === 'results') return null
      return { ...current, returnToResults: undefined }
    })
  }, [])

  const handleCloseInspector = useCallback(() => {
    applyHighlightsRef.current?.([])
    setInspector(null)
    clearSearchRef.current?.()
  }, [])

  const handleSelectObject = useCallback((object: InspectableObject) => {
    applyHighlightsRef.current?.([toSearchMapObjectFeature(object)])
    setInspector((current) => ({
      kind: 'details',
      object,
      returnToResults: current?.kind === 'results'
        ? current.session
        : current?.kind === 'details'
          ? current.returnToResults
          : undefined,
    }))
  }, [])

  const handleOpenDirectObject = useCallback((object: InspectableObject) => {
    applyHighlightsRef.current?.([toSearchMapObjectFeature(object)])
    setInspector(openDirectObjectDetails(object))
  }, [])

  const handleBackToResults = useCallback(() => {
    const action = getInspectorBackAction(inspector)
    applyHighlightsRef.current?.(action.highlights)
    setInspector(action.inspector)
  }, [inspector])

  const handleClearReady = useCallback((clear: (() => void) | null) => {
    clearSearchRef.current = clear
  }, [])

  const handleHighlightsReady = useCallback((apply: ((objects: readonly SearchMapObjectFeature[]) => void) | null) => {
    applyHighlightsRef.current = apply
  }, [])

  useEffect(() => {
    setInspector((current) => {
      if (!current || current.kind === 'results') return current
      return {
        kind: 'details',
        object: relocalizeInspectableObject(current.object, language),
        returnToResults: undefined,
      }
    })
  }, [language])

  useEffect(() => {
    if (!map || !getObjectFeatureAtPoint) return

    const handleMapClick = (event: maplibregl.MapMouseEvent) => {
      if (event.originalEvent.button !== 0) return
      const pickRun = ++objectPickRunRef.current
      const picker = getObjectFeatureAtPoint
      const selectedMap = map
      void picker(event.point)
        .then((feature) => {
          if (pickRun !== objectPickRunRef.current || map !== selectedMap || getObjectFeatureAtPoint !== picker) return
          if (feature) handleOpenDirectObject(createInspectableObject(feature, language))
        })
        .catch((error: unknown) => console.error('Unable to inspect map object', error))
    }
    map.on('click', handleMapClick)
    return () => {
      objectPickRunRef.current += 1
      map.off('click', handleMapClick)
    }
  }, [getObjectFeatureAtPoint, handleOpenDirectObject, language, map])

  useLayoutEffect(() => {
    if (!map || !inspector || panelWidth === 0) return

    const padding: CameraPadding = {
      top: CAMERA_VERTICAL_PADDING,
      right: CAMERA_VERTICAL_PADDING,
      bottom: CAMERA_VERTICAL_PADDING,
      left: panelWidth + CAMERA_GUTTER,
    }
    const target = getInspectorCameraTarget(inspector)
    const wasOpened = appliedInspectorRef.current?.map === map
    if (wasOpened) {
      focusInspectorCamera(map, target, padding, prefersReducedMotion(), OBJECT_INSPECTOR_MOTION)
    } else {
      openInspectorCamera(map, target, padding, prefersReducedMotion(), OBJECT_INSPECTOR_MOTION)
    }
    appliedInspectorRef.current = { map, inspector }
  }, [inspector, map, panelWidth])

  useLayoutEffect(() => {
    if (!map || inspector) return

    const wasOpened = appliedInspectorRef.current?.map === map
    closeInspectorCamera(map, wasOpened, prefersReducedMotion(), OBJECT_INSPECTOR_MOTION)
    if (wasOpened) {
      appliedInspectorRef.current = null
    }
  }, [inspector, map])

  const inspectorView: ObjectInspectorView | null = inspector?.kind === 'results'
    ? { kind: 'results', objects: inspector.session.objects }
    : inspector?.kind === 'details'
      ? { kind: 'details', object: inspector.object }
      : null

  return (
    <main className="app">
      <MapCanvas
        onMapReady={setMap}
        onSearchFeaturesReady={handleSearchFeaturesReady}
        onObjectFeatureAtPointReady={handleObjectFeatureAtPointReady}
        language={language}
        baseMapVariant={baseMapVariant}
      />
      <MapSearch
        map={map}
        getSearchFeatures={getSearchFeatures}
        language={language}
        onSearchResults={handleSearchResults}
        onSearchReset={handleSearchReset}
        onClearReady={handleClearReady}
        onHighlightsReady={handleHighlightsReady}
      />
      <ObjectInspector
        view={inspectorView}
        onSelect={handleSelectObject}
        onBack={handleBackToResults}
        onClose={handleCloseInspector}
        onWidthChange={setPanelWidth}
      />
      <MapZoomIndicator map={map} />
      <MapLanguageSwitcher />
      {/* <MapPointerInfo map={map} /> */}
      <MapBasemapSwitcher map={map} selectedVariant={baseMapVariant} onVariantChange={changeBaseMapVariant} />
    </main>
  )
}
