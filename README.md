# React + TypeScript + MapLibre GL JS

## Запуск

```bash
npm run dev
```

Сборка для production: `npm run build`.

## Деплой в GitHub Pages

Workflow [deploy-pages.yml](.github/workflows/deploy-pages.yml) запускается при каждом push в `master` и вручную из вкладки **Actions**. Он публикует собранное приложение в корень ветки `gh-pages`, сохраняя каталог `pr-preview`.

Workflow [pr-preview.yml](.github/workflows/pr-preview.yml) собирает отдельную версию для каждого PR, включая PR из форков, с токеном только для чтения. [publish-pr-preview.yml](.github/workflows/publish-pr-preview.yml) получает artifact успешной сборки, сверяет его с актуальной веткой PR и публикует по адресу `https://kiruha01.github.io/ankhmorpork-map/pr-preview/pr-<номер>/`. [close-pr-preview.yml](.github/workflows/close-pr-preview.yml) фиксирует закрытие PR с токеном только для чтения, а [remove-pr-preview.yml](.github/workflows/remove-pr-preview.yml) проверяет его artifact и удаляет превью. Ссылка появляется и обновляется в комментарии к PR. Для PR из форков GitHub может потребовать одобрения запуска workflow по правилам репозитория.

Для публикации настройте **Settings → Pages → Build and deployment → Source → Deploy from a branch**, выберите ветку `gh-pages` и каталог `/ (root)`. Если ветки ещё нет, сначала запустите workflow основного деплоя из **Actions**, затем выберите её в настройках Pages. В **Settings → Actions → General → Workflow permissions** включите **Read and write permissions**. Workflow публикации по `workflow_run` начнёт срабатывать после появления его файла в основной ветке репозитория.

## Устройство

Структура и правила её развития описаны в [AGENTS.md](AGENTS.md). MapLibre создаётся в `widgets/map`, доменные источники и стили лежат в `entities`, а React-интерфейс вокруг карты — в `features`.

Конфигурация CORS для сервера с тайлами и GeoJSON находится в [infra/nginx/cors.conf](infra/nginx/cors.conf).

## Как добавлять React-фичи, управляющие картой

`App` хранит единственный экземпляр `maplibregl.Map`, который предоставляет `MapCanvas`. Новая UI-фича принимает его через props (при росте приложения можно заменить это на `MapContext`) и применяет изменение в `useEffect`.

- Поиск: в `features/map-search` после события `sourcedata` индексируйте `map.querySourceFeatures(BUILDINGS_SOURCE_ID)` по полям `name`/`name_ru`. При выборе результата вызовите `map.fitBounds(...)`, а выделение задайте через `map.setFeatureState`. Для устойчивого выделения GeoJSON должен иметь `Feature.id` или свойство, указанное в `promoteId` у источника.
- Язык: в `features/map-language` храните locale в React state. Для подписей добавьте символьный слой и обновляйте его `text-field` через `map.setLayoutProperty`, выбирая, например, `name_ru` или `name_en`.
- Переключатель слоёв: в `features/map-layers` храните видимость каждого слоя и применяйте `map.setLayoutProperty(layerId, 'visibility', 'none' | 'visible')`. Конфигурация доступных слоёв должна оставаться у соответствующих доменов.
- Карточка объекта: `features/object-inspector` подписывается на `map.on('click', layerId, ...)`, сохраняет выбранные свойства в React state и рендерит выезжающую панель. При закрытии очищайте `feature-state` выделения.
