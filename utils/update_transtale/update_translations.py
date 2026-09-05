#!/usr/bin/env python3
"""Add missing GeoJSON ``properties.name_id`` values to a translation file."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import tempfile
from typing import Any


def load_json(path: Path) -> Any:
    try:
        with path.open("r", encoding="utf-8") as source:
            return json.load(source)
    except FileNotFoundError as error:
        raise ValueError(f"Файл не найден: {path}") from error
    except json.JSONDecodeError as error:
        raise ValueError(f"Некорректный JSON в файле {path}: {error}") from error


def geojson_name_ids(document: Any) -> list[str]:
    if not isinstance(document, dict) or not isinstance(document.get("features"), list):
        raise ValueError("GeoJSON должен быть объектом FeatureCollection с массивом features")

    name_ids: list[str] = []
    seen: set[str] = set()
    for feature in document["features"]:
        if not isinstance(feature, dict):
            continue
        properties = feature.get("properties")
        if not isinstance(properties, dict):
            continue
        name_id = properties.get("name_id")
        if not isinstance(name_id, str):
            continue
        name_id = name_id.strip()
        if name_id and name_id not in seen:
            name_ids.append(name_id)
            seen.add(name_id)
    return name_ids


def add_missing_translations(translation: Any, name_ids: list[str]) -> int:
    if not isinstance(translation, dict):
        raise ValueError("Файл переводов должен содержать JSON-объект")
    items = translation.get("items")
    if not isinstance(items, dict):
        raise ValueError("В файле переводов поле items должно быть JSON-объектом")

    added = 0
    for name_id in name_ids:
        if name_id not in items:
            # A fresh dictionary/list for every item prevents shared mutable values.
            items[name_id] = {
                "title": None,
                "description": None,
                "fandom_wiki": None,
                "aliases": None,
            }
            added += 1
    return added


def write_json_atomically(path: Path, document: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_path = tempfile.mkstemp(
        dir=path.parent,
        prefix=f".{path.name}.",
        suffix=".tmp",
        text=True,
    )
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as target:
            json.dump(document, target, ensure_ascii=False, indent=2)
            target.write("\n")
        os.replace(temporary_path, path)
    except BaseException:
        try:
            os.unlink(temporary_path)
        except FileNotFoundError:
            pass
        raise


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Добавляет отсутствующие properties.name_id из GeoJSON в items файла переводов."
    )
    parser.add_argument("geojson", type=Path, help="путь к GeoJSON FeatureCollection")
    parser.add_argument("translations", type=Path, help="путь к JSON-файлу переводов")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="куда записать результат; по умолчанию обновляется файл переводов",
    )
    return parser.parse_args()


def main() -> int:
    arguments = parse_arguments()
    geojson = load_json(arguments.geojson)
    translations = load_json(arguments.translations)
    added = add_missing_translations(translations, geojson_name_ids(geojson))

    output = arguments.output or arguments.translations
    if added or arguments.output:
        write_json_atomically(output, translations)
    print(f"Добавлено переводов: {added}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ValueError as error:
        raise SystemExit(f"Ошибка: {error}")
