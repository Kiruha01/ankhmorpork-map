# Contributing to the Ankh-Morpork map

[Читать на русском](CONTRIBUTING.ru.md)

You can help improve the map by correcting object outlines, adding missing places, and updating names, descriptions, and translations. This guide covers map data and translations; you do not need to change the application code to contribute these updates.

## What you will need

- A local copy of this repository.
- QGIS to edit map geometry. Translation-only changes can be made in a text editor.
- The raster map from the [raster map source release](https://github.com/Kiruha01/ankhmorpork-map/releases/tag/raster_map_source), to use as a reference in QGIS.
- Python 3 if you want to generate missing translation entries with the included script.

## 1. Open the map in QGIS

1. Start QGIS and select **Project → New**.
2. Open **Layer → Data Source Manager → Raster**, select the downloaded raster map, and add it to the project.
3. In **Layer → Data Source Manager → Vector**, add the GeoJSON files you want to edit from [`public/geojsons/`](public/geojsons/).
4. Keep the vector layers above the raster layer so that you can see their geometry over the reference image.

Commonly edited files:

| Map objects | File |
| --- | --- |
| Buildings | `public/geojsons/build.geojson` |
| Streets | `public/geojsons/street.geojson` |
| Parks | `public/geojsons/parks.geojson` |
| Squares | `public/geojsons/squares.geojson` |
| Beer locations | `public/geojsons/beers.geojson` |
| Water features in the vector basemap | `public/geojsons/landscape/water.geojson` |

## 2. Edit objects and their identifiers

Enable editing for the relevant vector layer, then adjust existing geometry or draw new objects. Use the layer's attribute table to fill in their properties. Follow the fields and geometry types already used in that layer, and preserve existing attributes when editing an object.

For every new named place, set **`name_id`**. This is the link between its geometry and the entries in the translation files; it is not the displayed name.

- Choose a unique identifier for each distinct place, using a type prefix and a descriptive suffix, such as `build_example_library`.
- Reuse a `name_id` only when several features represent parts of the same place and should share its name and description.
- Keep existing identifiers when correcting an outline or a translation. Renaming an identifier also requires updating its references in the translation files.

Use these prefixes for new named objects:

| Object type | Prefix | Example |
| --- | --- | --- |
| Building | `build_` | `build_example_library` |
| Park | `park_` | `park_example_garden` |
| Water feature | `water_` | `water_example_canal` |
| Square | `sq_` | `sq_example_market` |
| Street | `street_` | `street_example_lane` |

These examples illustrate the naming convention; they are not actual places to add to the map.

Keep **`fid`** separate from `name_id`: the application uses `fid` to identify individual features for interaction and highlighting. Preserve existing values and give each new feature a value that is unique within its layer, including when multiple features share a `name_id`.

## 3. Export the edited layer

Save your edits, then right-click the vector layer and select **Export → Save Features As…**. Set **Format** to `GeoJSON` and **CRS** to `EPSG:4326 — WGS 84`. Export the full layer, including its attributes, rather than only selected features. See the [QGIS export documentation](https://documentation.qgis.org/3.44/en/docs/user_manual/managing_data_source/create_layers.html) for details.

Export to a temporary file first, check the result, then replace the corresponding file in `public/geojsons/`. Repeat for each edited layer. The QGIS project file alone does not update the application's map data.

## 4. Update names and translations

Object text is stored in [`translates/`](translates/), with one JSON file per language: [`en.json`](translates/en.json) for English and [`ru.json`](translates/ru.json) for Russian.

Each object's entry belongs inside the top-level **`items`** object, under a key that exactly matches its GeoJSON `name_id`. Keep the same key in every language; translate the values, not the identifier.

### Edit entries manually

For example, an entry inside `items` could look like this:

```json
"build_example_library": {
  "title": "Example Library",
  "description": "A short description of the place.",
  "fandom_wiki": null,
  "aliases": ["Example Reading Room", "Library of Examples"]
}
```

- **`title`**: the name displayed on the map and in search results.
- **`description`**: additional information about the place.
- **`fandom_wiki`**: a link to the relevant Fandom wiki article, if available.
- **`aliases`**: an array of alternative names or spellings that help people find the place.

Add this entry to the existing `items` object, keeping the surrounding JSON and commas valid. Optional fields can remain `null` when you have no information to add. UI text belongs under `interface` and is separate from map object translations.

### Generate missing entries

From the repository root, run the helper once for each translation file you want to update. For example, after adding buildings:

```sh
python3 utils/update_transtale/update_translations.py public/geojsons/build.geojson translates/en.json
python3 utils/update_transtale/update_translations.py public/geojsons/build.geojson translates/ru.json
```

The directory is named `update_transtale` in the repository; use that exact spelling in commands.

The script adds missing `name_id` entries to `items`, leaving existing entries and other top-level fields unchanged. Each new entry starts with `title`, `description`, `fandom_wiki`, and `aliases` set to `null`. **It creates placeholders, not translations:** fill in their text afterward. Repeat with the appropriate GeoJSON path for other edited layers.

To write the result to a separate file, append `--output updated-translations.json`. More details are in the [script's README](utils/update_transtale/README.md).

## 5. Check and submit your contribution

Before opening a pull request:

- Check that the exported GeoJSON contains the full layer and preserves existing attributes and identifiers.
- Check that every new named place has a matching translation entry, with the same `name_id` in each language you updated.
- Fill in the English title and any translations you can provide; mention incomplete translations in the pull request.
- Review the changed files for accidental geometry changes or unrelated edits.

If you can run the application locally, install dependencies with `npm install`, then start it with `npm run dev`. Check the edited area, search for the new names and aliases, and switch languages to check the labels and object details. You can also run `npm run build` to check that the application still builds.

Open a pull request containing the edited GeoJSON and translation files. Briefly describe what changed, list any sources used for names or descriptions, and include a screenshot when it helps explain a geometry change. For translation-only contributions, submit just the relevant translation files.
