#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const diputadosFile = path.join(__dirname, '../data/diputados.json');
const outputFile = path.join(__dirname, '../data/mapeo-nombres-diputados.json');

console.log('📋 Generando mapeo de nombres → id_diputado...\n');

const diputados = JSON.parse(fs.readFileSync(diputadosFile, 'utf-8'));

const mapeo = {};
const duplicados = {};

// Función para normalizar nombres
function normalizarNombre(nombre) {
  return nombre
    .trim()                    // Eliminar espacios al inicio/fin
    .replace(/\s+/g, '')       // ELIMINAR TODOS LOS ESPACIOS
    .toLowerCase()             // Convertir a minúsculas
    .normalize('NFD')          // Separar caracteres base de diacríticos
    .replace(/[\u0300-\u036f]/g, ''); // Eliminar diacríticos (tildes, diéresis, etc)
}

for (const diputado of diputados) {
  // Formato del Congreso: "Apellidos Nombres"
  const nombreCompleto = `${diputado.apellidos} ${diputado.nombres}`.trim();
  const nombreNormalizado = normalizarNombre(nombreCompleto);
  
  // Agregar mapeo principal
  if (mapeo[nombreNormalizado]) {
    if (!duplicados[nombreNormalizado]) {
      duplicados[nombreNormalizado] = [mapeo[nombreNormalizado]];
    }
    duplicados[nombreNormalizado].push(diputado.id_diputado);
  } else {
    mapeo[nombreNormalizado] = diputado.id_diputado;
  }
}

// Mapeos manuales para apellidos de casada (ambos apuntan al mismo ID)
mapeo[normalizarNombre('Cardona Arreaga de Pojoy Karla Betzaida')] = '919';
mapeo[normalizarNombre('De León De León de Pérez Greicy Domenica')] = '895';
mapeo[normalizarNombre('Villagrán Antón Andrea Beatriz')] = '904';
mapeo[normalizarNombre('Guardado Linares de Nájera Mercedes Cristabel')] = '904';
mapeo[normalizarNombre('Marroquín Godoy de Palomo Ana Lucrecia')] = '179';
mapeo[normalizarNombre('Archila Cordón Manuel de Jesús')] = '907';

console.log(`✅ ${Object.keys(mapeo).length} nombres mapeados`);

if (Object.keys(duplicados).length > 0) {
  console.log(`⚠️  ${Object.keys(duplicados).length} nombres duplicados encontrados:\n`);
  for (const [nombre, ids] of Object.entries(duplicados)) {
    console.log(`   "${nombre}": IDs [${ids.join(', ')}]`);
  }
}

const resultado = {
  generado: new Date().toISOString(),
  total: Object.keys(mapeo).length,
  duplicados: Object.keys(duplicados).length,
  mapeo,
  conflictos: duplicados
};

fs.writeFileSync(outputFile, JSON.stringify(resultado, null, 2));
console.log(`\n💾 Guardado en: ${outputFile}`);
