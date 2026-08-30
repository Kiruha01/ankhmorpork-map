import maplibregl from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'
import './style.css'
import { addBuildingsLayer } from './layers/buildings'
import { addStreetsLayer } from './layers/streets'

const geojson: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Москва' },
      geometry: { type: 'Point', coordinates: [0.003, -0.003] },
    },
    // {
    //   type: 'Feature',
    //   properties: { name: 'Маршрут' },
    //   geometry: {
    //     type: 'LineString',
    //     coordinates: [
    //       [37.58, 55.74],
    //       [37.6173, 55.7558],
    //       [37.66, 55.77],
    //     ],
    //   },
    // },
    {
      type: 'Feature',
      properties: { name: 'Район' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [37.59, 55.75],
          [37.63, 55.75],
          [37.63, 55.77],
          [37.59, 55.77],
          [37.59, 55.75],
        ]],
      },
    },
  ],
}

const map = new maplibregl.Map({
  container: 'map',
  style:{
      version: 8,
      sources: {},
      layers: []
  },
  center: [0.02, -0.01],
  zoom: 15,
  renderWorldCopies: false,
})

map.addControl(new maplibregl.NavigationControl(), 'top-right')

map.on('load', () => {
  const zoomInfo = document.getElementById('zoom-info')
  const updateZoomInfo = () => {
    if (zoomInfo) zoomInfo.textContent = `Зум: ${map.getZoom().toFixed(2)}`
  }

  updateZoomInfo()
  map.on('zoom', updateZoomInfo)

  map.addSource('fictional-map-source', {
      type: 'raster',
      tiles: [

          'http://192.168.0.197:8000/tiles/{z}/{x}/{y}.jpg'
      ],
      tileSize: 512, // Размер тайла, который вы указали в MapTiler (256 или 512)
      maxzoom: 20,    // Максимальный уровень зума, который сгенерировал MapTiler
      minzoom: 15     // Минимальный уровень зума
  });

  // 3. Отображаем источник на карте
  map.addLayer({
      id: 'fictional-map-layer',
      type: 'raster',
      source: 'fictional-map-source',
      paint: {
          'raster-fade-duration': 0 // Отключаем размытие при переключении зума
      }
  });

  addBuildingsLayer(map)
  addStreetsLayer(map)

  map.addSource('sample-geojson', { type: 'geojson', data: geojson })

  // map.addLayer({
  //   id: 'geojson-polygons',
  //   type: 'fill',
  //   source: 'sample-geojson',
  //   filter: ['==', '$type', 'Polygon'],
  //   paint: { 'fill-color': '#3b82f6', 'fill-opacity': 1 },
  // })
  // map.addLayer({
  //   id: 'geojson-lines',
  //   type: 'line',
  //   source: 'sample-geojson',
  //   filter: ['==', '$type', 'LineString'],
  //   paint: { 'line-color': '#f97316', 'line-width': 4 },
  // })
  map.addLayer({
    id: 'geojson-points',
    type: 'circle',
    source: 'sample-geojson',
    filter: ['==', '$type', 'Point'],
    paint: {
      'circle-radius': 8,
      'circle-color': '#e11d48',
      'circle-stroke-color': '#fff',
      'circle-stroke-width': 2,
    },
  })

  // map.on('click', 'geojson-points', (event) => {
  //   const feature = event.features?.[0]
  //   const name = feature?.properties?.name ?? 'Точка'
  //   new maplibregl.Popup().setLngLat(event.lngLat).setHTML(`<strong>${name}</strong>`).addTo(map)
  // })
  // map.on('mouseenter', 'geojson-points', () => { map.getCanvas().style.cursor = 'pointer' })
  // map.on('mouseleave', 'geojson-points', () => { map.getCanvas().style.cursor = '' })
  const info = document.getElementById('info')
  if (info) {
    map.on('mousemove', (e) => {
        info.innerHTML =
            // e.point is the x, y coordinates of the mousemove event relative
            // to the top-left corner of the map
            `${JSON.stringify(e.point)
            }<br />${
                // e.lngLat is the longitude, latitude geographical position of the event
                JSON.stringify(e.lngLat.wrap())}`;
    })
  }




})
