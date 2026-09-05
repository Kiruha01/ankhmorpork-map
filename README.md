# React + TypeScript + MapLibre GL JS

## Запуск

```bash
npm run dev
```

Сборка для production: `npm run build`.

## Деплой в GitHub Pages

Workflow [deploy-pages.yml](.github/workflows/deploy-pages.yml) запускается при каждом push в `master` и вручную из вкладки **Actions**. Он публикует собранное приложение по пути репозитория, поэтому его нужно включить один раз в настройках репозитория: **Settings → Pages → Build and deployment → Source → GitHub Actions**.

## Устройство

Структура и правила её развития описаны в [AGENTS.md](AGENTS.md). MapLibre создаётся в `widgets/map`, доменные источники и стили лежат в `entities`, а React-интерфейс вокруг карты — в `features`.

Конфигурация CORS для сервера с тайлами и GeoJSON находится в [infra/nginx/cors.conf](infra/nginx/cors.conf).

## Как добавлять React-фичи, управляющие картой

`App` хранит единственный экземпляр `maplibregl.Map`, который предоставляет `MapCanvas`. Новая UI-фича принимает его через props (при росте приложения можно заменить это на `MapContext`) и применяет изменение в `useEffect`.

- Поиск: в `features/map-search` после события `sourcedata` индексируйте `map.querySourceFeatures(BUILDINGS_SOURCE_ID)` по полям `name`/`name_ru`. При выборе результата вызовите `map.fitBounds(...)`, а выделение задайте через `map.setFeatureState`. Для устойчивого выделения GeoJSON должен иметь `Feature.id` или свойство, указанное в `promoteId` у источника.
- Язык: в `features/map-language` храните locale в React state. Для подписей добавьте символьный слой и обновляйте его `text-field` через `map.setLayoutProperty`, выбирая, например, `name_ru` или `name_en`.
- Переключатель слоёв: в `features/map-layers` храните видимость каждого слоя и применяйте `map.setLayoutProperty(layerId, 'visibility', 'none' | 'visible')`. Конфигурация доступных слоёв должна оставаться у соответствующих доменов.
- Карточка объекта: `features/object-inspector` подписывается на `map.on('click', layerId, ...)`, сохраняет выбранные свойства в React state и рендерит выезжающую панель. При закрытии очищайте `feature-state` выделения.
