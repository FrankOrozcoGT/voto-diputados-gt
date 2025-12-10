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

const OUTPUT_FILE = path.join(__dirname, '../data/iniciativas.json');
const TMP_HTML = '/tmp/iniciativas.html';

// Cookie actualizada - REEMPLAZAR cuando expire
let cookies = 'nlbi_1649317=cJdLCsVHDVKMIseH52lTOQAAAAA1eEruphg4Q57/11xPTEjI; incap_ses_1409_1649317=xi3MHkTFHBBUJ6q7eMaNEyMwN2kAAAAApkmEBiyxTAVnieYrZn8gmQ==; _gid=GA1.3.708708698.1765224495; visid_incap_1649317=hp9sEDpWRCuu2LfQ1dErmiMwN2kAAAAAQkIPAAAAAACAeOvAAb6PupfAyRLSydIIlD9L1RKwjIug; incap_ses_1606_1649317=zPf4InHDR15d6Ko58qhJFl5HN2kAAAAAavHczYB3clgD5MPHSyAZ8w==; ci_sessions=n8v7dmilqcaa3r1o8a6lddlfmnsmoup3; incap_ses_1866_1649317=k1mYahkF/DU0wJ4kJF3lGRF7OWkAAAAAHl3/1CPmVKlIxi06k94Wnw==; _ga=GA1.3.1544424311.1765224495; _ga_5PBQM5BVPH=GS2.1.s1765374739$o4$g0$t1765374740$j59$l0$h0';

console.log('📋 DESCARGADOR DE INICIATIVAS DEL CONGRESO\n');

// Función para validar que la respuesta no sea error de cookie
function validarRespuesta(html) {
  if (html.length < 5000) {
    console.error('\n❌ ERROR: Respuesta muy corta (posible cookie expirada)');
    console.error('\n🔑 Para renovar la cookie:');
    console.error('1. Abre el navegador en: https://www.congreso.gob.gt/seccion_informacion_legislativa/iniciativas');
    console.error('2. Abre DevTools (F12) → Application → Cookies');
    console.error('3. Copia TODAS las cookies y actualiza la variable "cookies" en el script\n');
    throw new Error('COOKIE EXPIRADA - Script detenido');
  }
  
  if (html.includes('Request unsuccessful. Incapsula incident ID')) {
    console.error('\n❌ ERROR: Bloqueado por Incapsula/Imperva WAF');
    console.error('La cookie ha expirado o el servidor detectó comportamiento automatizado.\n');
    throw new Error('BLOQUEADO POR WAF - Script detenido');
  }
}

// Descargar página de iniciativas
async function descargarPagina() {
  console.log('📥 Descargando página de iniciativas...');
  
  const cmd = `curl -s 'https://www.congreso.gob.gt/seccion_informacion_legislativa/iniciativas' \\
    -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8' \\
    -H 'accept-language: en,es-419;q=0.9,es;q=0.8' \\
    -H 'cookie: ${cookies}' \\
    -H 'priority: u=0, i' \\
    -H 'referer: https://www.congreso.gob.gt/consulta_legislativa' \\
    -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'`;
  
  const { stdout } = await execAsync(cmd, { maxBuffer: MAX_BUFFER });
  
  validarRespuesta(stdout);
  
  // Guardar temporalmente
  fs.writeFileSync(TMP_HTML, stdout);
  
  return stdout;
}

// Extraer iniciativas del HTML
function extraerIniciativas(html) {
  console.log('🔍 Extrayendo iniciativas del HTML...\n');
  
  const $ = cheerio.load(html);
  const iniciativas = [];
  
  // Buscar todos los bloques de iniciativa
  $('.card').each((index, card) => {
    const $card = $(card);
    
    // Extraer número de iniciativa
    const numeroTexto = $card.find('.card-header strong').last().text().trim();
    if (!numeroTexto || !/^\d+$/.test(numeroTexto)) return;
    
    const numero = numeroTexto;
    
    // Extraer fecha
    const fechaTexto = $card.find('p.card-text').first().text().trim();
    
    // Extraer resumen (está dentro del div con scroll) - SOLO el primero
    const resumen = $card.find('div[style*="overflow-y: scroll"] p.card-text').first().text().trim();
    
    // Extraer URL del PDF
    const pdfUrl = $card.find('a[download]').attr('href') || null;
    
    // Extraer URL de detalle
    const detalleUrl = $card.find('a.btn-primary[href*="detalle_pdf"]').attr('href') || null;
    
    if (numero && resumen) {
      iniciativas.push({
        numero,
        fecha: fechaTexto || null,
        resumen,
        pdfUrl,
        detalleUrl
      });
      
      console.log(`  ✅ ${numero}: ${resumen.substring(0, 80)}...`);
    }
  });
  
  return iniciativas;
}

// Main
async function main() {
  try {
    // Descargar página
    const html = await descargarPagina();
    console.log(`✅ Página descargada (${Math.round(html.length / 1024)} KB)\n`);
    
    // Extraer iniciativas
    const iniciativas = extraerIniciativas(html);
    
    console.log(`\n✅ TOTAL: ${iniciativas.length} iniciativas extraídas\n`);
    
    // Guardar JSON
    const resultado = {
      generado: new Date().toISOString(),
      total: iniciativas.length,
      iniciativas
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(resultado, null, 2));
    console.log(`💾 Guardado en: ${OUTPUT_FILE}`);
    
    // Limpiar archivo temporal
    if (fs.existsSync(TMP_HTML)) {
      fs.unlinkSync(TMP_HTML);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
