# Ankh-Morpork Map

[Читать на русском](README.ru.md)

An interactive map of Ankh-Morpork, the city from Terry Pratchett’s Discworld. Explore its streets, find familiar landmarks, and discover places through searchable names and descriptions.

**[Explore the map](https://kiruha01.github.io/ankhmorpork-map/)**

## Explore the city

- **Find a place.** Search by name, alternative spelling, or description. Choose a result to move to it on the map and highlight its location.
- **Look closer.** Select a map object to view its name, description, and Fandom wiki link where available.
- **Choose your map.** Switch between the original raster map, the Russian raster map, and the vector landscape view.
- **Adjust the detail.** Choose which overlays to display, including building labels, streets, parks, squares, and beer locations. Available controls depend on the selected basemap.
- **Switch languages.** Use the English or Russian interface and explore localized place names. Translations and descriptions are still being expanded.
- **Browse on desktop or mobile.** Object details appear beside the map on desktop and in a resizable bottom panel on smaller screens. Your map preferences are saved between visits.

## Help improve the map

The map grows through contributions: a corrected building outline, a missing street, a better description, or a translation can all make it more useful.

See the **[contribution guide](CONTRIBUTING.md)** for step-by-step instructions on editing map data in QGIS, naming objects, and updating translations. You do not need to change application code to contribute map data or text.

Found something wrong or have an idea? [Open an issue](https://github.com/Kiruha01/ankhmorpork-map/issues) and describe the place or improvement. Screenshots and references help explain the change.

## Run it locally

With Node.js and npm installed, run these commands from a local copy of the repository:

```sh
npm install
npm run dev
```

Open the local address printed by Vite in your terminal.

The application uses React, TypeScript, and MapLibre GL JS. See **[Development](DEVELOPMENT.md)** for build commands, project structure, and guidance on extending the application.
