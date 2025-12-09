#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as cheerio from 'cheerio';

const execAsync = promisify(exec);
const MAX_BUFFER = 50 * 1024 * 1024; // 50MB

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../data/votaciones-raw');
const COOKIES_FILE = path.join(__dirname, '../.tmp/cookies.json');
const MAPEO_FILE = path.join(__dirname, '../data/mapeo-nombres-diputados.json');

let cookies = 'nlbi_1649317=cJdLCsVHDVKMIseH52lTOQAAAAA1eEruphg4Q57/11xPTEjI; incap_ses_1409_1649317=xi3MHkTFHBBUJ6q7eMaNEyMwN2kAAAAApkmEBiyxTAVnieYrZn8gmQ==; _gid=GA1.3.708708698.1765224495; visid_incap_1649317=hp9sEDpWRCuu2LfQ1dErmiMwN2kAAAAAQkIPAAAAAACAeOvAAb6PupfAyRLSydIIlD9L1RKwjIug; incap_ses_1606_1649317=zPf4InHDR15d6Ko58qhJFl5HN2kAAAAAavHczYB3clgD5MPHSyAZ8w==; ci_sessions=ipga74vodjdg8vprli5jj1icblismk9f; _ga_5PBQM5BVPH=GS2.1.s1765230431$o2$g1$t1765241329$j60$l0$h0; _ga=GA1.3.1544424311.1765224495; _gat_gtag_UA_90716026_1=1';

// Cargar mapeo de nombres → id_diputado
let mapeoNombres = {};
if (fs.existsSync(MAPEO_FILE)) {
  const data = JSON.parse(fs.readFileSync(MAPEO_FILE, 'utf-8'));
  mapeoNombres = data.mapeo;
  console.log(`📋 Mapeo de diputados cargado: ${Object.keys(mapeoNombres).length} nombres\n`);
} else {
  console.warn('⚠️  Archivo de mapeo no encontrado. Ejecutar: node scripts/generar-mapeo-diputados.js\n');
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Cargar cookies
if (fs.existsSync(COOKIES_FILE)) {
  const data = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'));
  cookies = data.cookie;
}

async function fetchUrl(url) {
  const cookieFile = '/tmp/cookies_votaciones.txt';
  
  const curlCmd = `curl -s "${url}" \
    -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' \
    -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \
    -H 'Accept-Encoding: gzip, deflate, br, zstd' \
    -H 'Cookie: ${cookies}' \
    --compressed -c "${cookieFile}" -b "${cookieFile}"`;
  
  const { stdout } = await execAsync(curlCmd, { maxBuffer: MAX_BUFFER });
  
  // DETECTAR SI LA COOKIE MURIÓ
  if (stdout.length < 1000) {
    console.error('\n❌❌❌ ERROR CRÍTICO: LA COOKIE EXPIRÓ ❌❌❌');
    console.error('Respuesta muy pequeña:', stdout.length, 'bytes');
    console.error('URL que falló:', url);
    console.error('\n🔴 NECESITAS ACTUALIZAR LA COOKIE EN EL SCRIPT');
    console.error('1. Abre el navegador en: https://www.congreso.gob.gt/seccion_informacion_legislativa/votaciones_pleno');
    console.error('2. Abre DevTools (F12) → Application → Cookies');
    console.error('3. Copia TODAS las cookies y actualiza la variable "cookies" en el script\n');
    throw new Error('COOKIE EXPIRADA - Script detenido');
  }
  
  return stdout;
}

// Función para normalizar nombres
function normalizarNombre(nombre) {
  return nombre
    .trim()                    // Eliminar espacios al inicio/fin
    .replace(/\s+/g, '')       // ELIMINAR TODOS LOS ESPACIOS
    .toLowerCase()             // Convertir a minúsculas
    .normalize('NFD')          // Separar caracteres base de diacríticos
    .replace(/[\u0300-\u036f]/g, ''); // Eliminar diacríticos (tildes, diéresis, etc)
}

// Extraer sesiones de votaciones
async function obtenerSesiones() {
  console.log('📥 Descargando lista de sesiones...');
  const html = await fetchUrl('https://www.congreso.gob.gt/seccion_informacion_legislativa/votaciones_pleno');
  
  const regex = /<td>(\w+)<\/td>\s*<td>(\d+)<\/td>\s*<td>([^<]+)<\/td>\s*<td><a href="https:\/\/www\.congreso\.gob\.gt\/eventos_votaciones\/(\d+)">/g;
  const sesiones = [];
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const [, tipo, numero, descripcion, eventoId] = match;
    const fechaMatch = descripcion.match(/Fecha (\d{2}\/\d{2}\/\d{4})/);
    const fecha = fechaMatch ? fechaMatch[1] : null;
    
    // Convertir fecha a objeto Date para filtrar
    if (fecha) {
      const [dia, mes, anio] = fecha.split('/');
      const fechaObj = new Date(`${anio}-${mes}-${dia}`);
      const inicioMandato = new Date('2024-01-14');
      
      if (fechaObj >= inicioMandato) {
        sesiones.push({
          eventoId,
          tipo,
          numero,
          descripcion: descripcion.trim(),
          fecha
        });
      }
    }
  }
  
  console.log(`✅ Encontradas ${sesiones.length} sesiones desde el 14/01/2024`);
  return sesiones.reverse(); // Más antiguas primero
}

// Extraer IDs de votaciones de una sesión
async function obtenerVotacionesDeSesion(eventoId) {
  const html = await fetchUrl(`https://www.congreso.gob.gt/eventos_votaciones/${eventoId}`);
  
  const regex = /detalle_de_votacion\/(\d+)\/\d+/g;
  const votacionIds = new Set();
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    votacionIds.add(match[1]);
  }
  
  return Array.from(votacionIds);
}

// Descargar detalle de una votación
async function descargarVotacion(votacionId, eventoId, sesionInfo) {
  const outputFile = path.join(OUTPUT_DIR, `votacion_${votacionId}.json`);
  
  // Si ya existe, saltar
  if (fs.existsSync(outputFile)) {
    console.log(`  ⏭️  Ya existe: ${votacionId}`);
    return;
  }
  
  try {
    const html = await fetchUrl(`https://www.congreso.gob.gt/detalle_de_votacion/${votacionId}/${eventoId}`);
    
    const $ = cheerio.load(html);
    
    // Extraer pregunta/tema
    const pregunta = $('p:contains("Pregunta:")').text().replace('Pregunta:', '').trim();
    
    // Extraer número de iniciativa si existe
    const iniciativaMatch = pregunta ? pregunta.match(/INICIATIVA\s+(?:DE\s+LEY\s+)?(\d+)/i) : null;
    const iniciativa = iniciativaMatch ? iniciativaMatch[1] : null;
    
    // Extraer votos por tipo
    const votos = {
      favor: [],
      contra: [],
      ausente: [],
      abstencion: []
    };
    
    const diputadosSinId = [];
    
    $('#asesores_detalle tr').each((i, row) => {
      const $row = $(row);
      const nombreCompleto = $row.find('td').eq(0).text().trim();
      const voto = $row.find('.badge-success, .badge-danger, .badge-warning, .badge-secondary').last().text().trim();
      
      if (!nombreCompleto || !voto) return;
      
      // Buscar ID del diputado (usando nombre normalizado)
      const nombreNormalizado = normalizarNombre(nombreCompleto);
      const idDiputado = mapeoNombres[nombreNormalizado];
      
      const diputado = {
        nombre: nombreCompleto,
        id_diputado: idDiputado || null
      };
      
      // Marcar si no tiene ID
      if (!idDiputado) {
        diputadosSinId.push(nombreCompleto);
      }
      
      if (voto === 'A FAVOR') votos.favor.push(diputado);
      else if (voto === 'EN CONTRA') votos.contra.push(diputado);
      else if (voto === 'AUSENTE') votos.ausente.push(diputado);
      else if (voto === 'ABSTENCION') votos.abstencion.push(diputado);
    });
    
    const data = {
      votacionId,
      eventoId,
      sesion: sesionInfo,
      pregunta,
      iniciativa,
      votos,
      totales: {
        favor: votos.favor.length,
        contra: votos.contra.length,
        ausente: votos.ausente.length,
        abstencion: votos.abstencion.length
      },
      diputados_sin_id: diputadosSinId.length > 0 ? diputadosSinId : undefined
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    
    const warningIcon = diputadosSinId.length > 0 ? '⚠️ ' : '';
    console.log(`  ✅ ${votacionId}: ${pregunta?.substring(0, 60)}... (${data.totales.favor}F/${data.totales.contra}C) ${warningIcon}${diputadosSinId.length > 0 ? `${diputadosSinId.length} sin ID` : ''}`);
    
    // Pequeña pausa para no saturar el servidor
    await new Promise(resolve => setTimeout(resolve, 500));
    
  } catch (error) {
    console.error(`  ❌ Error en votación ${votacionId}:`, error.message);
    // Si es error de cookie expirada, re-lanzar para detener todo
    if (error.message.includes('COOKIE EXPIRADA')) {
      throw error;
    }
  }
}

// Main
async function main() {
  console.log('🗳️  DESCARGADOR DE VOTACIONES DEL CONGRESO\n');
  console.log('📅 Periodo: Desde 14/01/2024 (inicio mandato actual)\n');
  
  const sesiones = await obtenerSesiones();
  
  let totalVotaciones = 0;
  let ultimaSesionCompletada = null;
  let ultimaVotacionCompletada = null;
  
  try {
    for (const [index, sesion] of sesiones.entries()) {
      console.log(`\n[${index + 1}/${sesiones.length}] 📋 Sesión ${sesion.tipo} #${sesion.numero} - ${sesion.fecha}`);
      
      const votacionIds = await obtenerVotacionesDeSesion(sesion.eventoId);
      console.log(`  📊 ${votacionIds.length} votaciones en esta sesión`);
      
      for (const votacionId of votacionIds) {
        await descargarVotacion(votacionId, sesion.eventoId, sesion);
        totalVotaciones++;
        ultimaVotacionCompletada = votacionId;
      }
      
      ultimaSesionCompletada = sesion;
    }
    
    console.log(`\n✅ COMPLETADO: ${totalVotaciones} votaciones descargadas`);
    console.log(`📁 Guardadas en: ${OUTPUT_DIR}`);
    
  } catch (error) {
    console.error('\n\n💥 SCRIPT INTERRUMPIDO 💥');
    console.error('Error:', error.message);
    console.error('\n📊 PROGRESO HASTA EL ERROR:');
    console.error(`  ✅ Votaciones completadas: ${totalVotaciones}`);
    if (ultimaSesionCompletada) {
      console.error(`  ✅ Última sesión completada: ${ultimaSesionCompletada.tipo} #${ultimaSesionCompletada.numero} - ${ultimaSesionCompletada.fecha}`);
    }
    if (ultimaVotacionCompletada) {
      console.error(`  ✅ Última votación completada: ${ultimaVotacionCompletada}`);
    }
    console.error(`  📁 Archivos guardados en: ${OUTPUT_DIR}\n`);
    throw error;
  }
}

main().catch(() => process.exit(1));
