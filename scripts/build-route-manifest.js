#!/usr/bin/env node
/**
 * Build route manifest from existing GeoJSON files.
 *
 * Reads /docs/routes/*.geojson and writes /docs/route-files.json.
 * This does not create, convert, or delete route GeoJSON files.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const ROUTES_DIR = path.join(ROOT_DIR, 'docs', 'routes');
const INDEX_FILE = path.join(ROOT_DIR, 'docs', 'route-files.json');

function haversineDistanceKm(a, b) {
  const toRad = deg => (deg * Math.PI) / 180;
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;

  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function totalDistanceKm(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) return 0;

  let total = 0;
  for (let i = 1; i < coordinates.length; i += 1) {
    total += haversineDistanceKm(coordinates[i - 1], coordinates[i]);
  }
  return total;
}

function getPrimaryLineStringCoordinates(collection) {
  if (!collection || !Array.isArray(collection.features)) return [];

  for (const feature of collection.features) {
    if (feature?.geometry?.type === 'LineString' && Array.isArray(feature.geometry.coordinates)) {
      return feature.geometry.coordinates;
    }
  }

  return [];
}

function main() {
  if (!fs.existsSync(ROUTES_DIR)) {
    console.error(`Routes directory not found: ${ROUTES_DIR}`);
    process.exit(1);
  }

  const geojsonFiles = fs.readdirSync(ROUTES_DIR)
    .filter(name => name.toLowerCase().endsWith('.geojson'))
    .sort();

  if (geojsonFiles.length === 0) {
    console.warn(`No route GeoJSON files found in ${ROUTES_DIR}`);
  }

  const manifest = {
    generated: new Date().toISOString(),
    tracks: [],
  };

  for (const name of geojsonFiles) {
    const absolutePath = path.join(ROUTES_DIR, name);
    let collection;

    try {
      collection = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    } catch (error) {
      console.warn(`Skipping invalid GeoJSON file ${name}: ${error.message}`);
      continue;
    }

    const coords = getPrimaryLineStringCoordinates(collection);
    const distanceKm = totalDistanceKm(coords);

    manifest.tracks.push({
      sourceFile: name,
      geojson: `routes/${name}`,
      pointCount: coords.length,
      distanceKm: Number(distanceKm.toFixed(3)),
    });

    console.log(`Indexed: docs/routes/${name} (${coords.length} points)`);
  }

  fs.writeFileSync(INDEX_FILE, JSON.stringify(manifest, null, 2));
  console.log(`\nWrote manifest: ${path.relative(ROOT_DIR, INDEX_FILE)}`);
}

main();
