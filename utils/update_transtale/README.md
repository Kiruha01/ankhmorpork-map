# Update translations

Скрипт добавляет в `items` JSON-файла переводов отсутствующие значения
`properties.name_id` из GeoJSON `FeatureCollection`. Существующие записи и все
остальные верхнеуровневые поля JSON не изменяются.

Для добавленной записи создаётся шаблон:

```json
{
  "title": null,
  "description": null,
  "fandom_wiki": null,
  "aliases": null
}
```

## Запуск

```sh
python3 utils/update_transtale/update_translations.py objects.geojson translations.json
```

По умолчанию обновляется `translations.json`. Чтобы сохранить результат в другой
файл, укажите `--output`:

```sh
python3 utils/update_transtale/update_translations.py objects.geojson translations.json --output updated-translations.json
```

Пустые, нестроковые и повторяющиеся `name_id` пропускаются.
