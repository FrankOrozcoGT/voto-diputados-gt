#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const MAX_BUFFER = 50 * 1024 * 1024; // 50MB
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, '../.tmp/congreso-html');
const COOKIES_FILE = path.join(__dirname, '../.tmp/cookies.json');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

let cookies = 'nlbi_1649317=cJdLCsVHDVKMIseH52lTOQAAAAA1eEruphg4Q57/11xPTEjI; incap_ses_1409_1649317=xi3MHkTFHBBUJ6q7eMaNEyMwN2kAAAAApkmEBiyxTAVnieYrZn8gmQ==; _gid=GA1.3.708708698.1765224495; visid_incap_1649317=hp9sEDpWRCuu2LfQ1dErmiMwN2kAAAAAQkIPAAAAAACAeOvAAb6PupfAyRLSydIIlD9L1RKwjIug; incap_ses_1606_1649317=zPf4InHDR15d6Ko58qhJFl5HN2kAAAAAavHczYB3clgD5MPHSyAZ8w==; ci_sessions=3fv9i4t1624uqrc4u3cn2g58gfr4o9j6; _gat_gtag_UA_90716026_1=1; _ga_5PBQM5BVPH=GS2.1.s1765230431$o2$g1$t1765239018$j53$l0$h0; _ga=GA1.3.1544424311.1765224495';

// Cargar cookies
function loadCookies() {
  if (fs.existsSync(COOKIES_FILE)) {
    const data = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'));
    cookies = data.cookie;
    console.log(`📦 Cookies cargadas (${data.timestamp})`);
  }
}

// Guardar cookies
function saveCookies() {
  fs.writeFileSync(COOKIES_FILE, JSON.stringify({
    cookie: cookies,
    timestamp: new Date().toISOString()
  }, null, 2));
}

// Fetch genérico con curl
async function fetchUrl(url) {
  console.log(`\n🌐 ${url}`);
  
  const cookieFile = '/tmp/cookies_scrape.txt';
  
  const curlCmd = `curl -s "${url}" \\
    -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36' \\
    -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \\
    -H 'Accept-Encoding: gzip, deflate, br, zstd' \\
    -H 'Accept-Language: en,es-419;q=0.9,es;q=0.8' \\
    -H 'Cache-Control: max-age=0' \\
    -H 'Cookie: ${cookies}' \\
    -H 'sec-ch-ua: "Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"' \\
    -H 'sec-ch-ua-mobile: ?0' \\
    -H 'sec-ch-ua-platform: "Linux"' \\
    --compressed -c "${cookieFile}" -b "${cookieFile}"`;
  
  const { stdout } = await execAsync(curlCmd, { maxBuffer: MAX_BUFFER });
  
  // Actualizar cookies desde el archivo que curl guardó
  if (fs.existsSync(cookieFile)) {
    const cookieLines = fs.readFileSync(cookieFile, 'utf-8').split('\n');
    const newCookies = [];
    
    for (const line of cookieLines) {
      if (line.startsWith('#') || !line.trim()) continue;
      const parts = line.split('\t');
      if (parts.length >= 7) {
        newCookies.push(`${parts[5]}=${parts[6]}`);
      }
    }
    
    if (newCookies.length > 0) {
      cookies = newCookies.join('; ');
      saveCookies();
      console.log('🍪 Cookies actualizadas automáticamente');
    }
  }
  
  return stdout;
}

// Guardar HTML
function saveHtml(filename, content) {
  const filepath = path.join(TEMP_DIR, filename);
  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`💾 ${filepath}`);
  return filepath;
}

// Buscar en HTML
function grepHtml(html, pattern) {
  const lines = html.split('\n');
  const matches = [];
  const regex = new RegExp(pattern, 'gi');
  
  lines.forEach((line, index) => {
    if (regex.test(line)) {
      matches.push({ lineNumber: index + 1, line: line.trim() });
    }
  });
  
  return matches;
}

// MAIN
async function main() {
  const command = process.argv[2];
  
  loadCookies();
  
  if (command === 'get') {
    const url = process.argv[3];
    const filename = process.argv[4];
    
    if (!url || !filename) {
      console.error('❌ Uso: npm run scrape get <url> <filename>');
      process.exit(1);
    }
    
    const html = await fetchUrl(url);
    saveHtml(filename, html);
    
  } else if (command === 'grep') {
    const filename = process.argv[3];
    const pattern = process.argv[4];
    
    if (!filename || !pattern) {
      console.error('❌ Uso: npm run scrape grep <filename> <pattern>');
      process.exit(1);
    }
    
    const filepath = path.join(TEMP_DIR, filename);
    if (!fs.existsSync(filepath)) {
      console.error(`❌ Archivo no existe: ${filepath}`);
      process.exit(1);
    }
    
    const html = fs.readFileSync(filepath, 'utf-8');
    const matches = grepHtml(html, pattern);
    
    console.log(`\n🔍 "${pattern}" en ${filename}:`);
    matches.slice(0, 20).forEach(m => {
      console.log(`  ${m.lineNumber}: ${m.line}`);
    });
    console.log(`\nTotal: ${matches.length} resultados`);
    
  } else {
    console.log(`
🕷️  Scraper Genérico del Congreso

Comandos:
  get <url> <filename>     - Descargar cualquier URL
  grep <filename> <pattern> - Buscar en HTML descargado

Ejemplos:
  npm run scrape get "https://www.congreso.gob.gt/decretos" decretos.html
  npm run scrape get "https://www.congreso.gob.gt/acuerdos" acuerdos.html
  npm run scrape grep decretos.html "sesión"
  npm run scrape grep decretos.html "votación"

📁 Archivos en: ${TEMP_DIR}
    `);
  }
}

main().catch(console.error);
