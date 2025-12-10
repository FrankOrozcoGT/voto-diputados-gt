const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { PDFParse } = require('pdf-parse');

const execPromise = promisify(exec);

// Cookie de autenticación (actualizar si expira)
const COOKIE = 'nlbi_1649317=cJdLCsVHDVKMIseH52lTOQAAAAA1eEruphg4Q57/11xPTEjI; incap_ses_1409_1649317=xi3MHkTFHBBUJ6q7eMaNEyMwN2kAAAAApkmEBiyxTAVnieYrZn8gmQ==; _gid=GA1.3.708708698.1765224495; visid_incap_1649317=hp9sEDpWRCuu2LfQ1dErmiMwN2kAAAAAQkIPAAAAAACAeOvAAb6PupfAyRLSydIIlD9L1RKwjIug; incap_ses_1606_1649317=zPf4InHDR15d6Ko58qhJFl5HN2kAAAAAavHczYB3clgD5MPHSyAZ8w==; ci_sessions=vctgk0c807cclmj48no1c3ecdeddi0e8; incap_ses_1866_1649317=s4cHf/2AtwI80fEkJF3lGY6vOWkAAAAA5RFlJ0FP3064iLzk5BcM1w==; _ga_5PBQM5BVPH=GS2.1.s1765388175$o7$g1$t1765388190$j45$l0$h0; _ga=GA1.3.1544424311.1765224495';

const DIR_PDF = path.join(__dirname, '..', 'data', 'iniciativas-pdf');
const DIR_VOTACIONES = path.join(__dirname, '..', 'data', 'votaciones-raw');
const FILE_INICIATIVAS = path.join(__dirname, '..', 'data', 'iniciativas.json');

// Asegurar que existe el directorio
if (!fs.existsSync(DIR_PDF)) {
  fs.mkdirSync(DIR_PDF, { recursive: true });
}

/**
 * Obtener lista de iniciativas del período actual (2024+)
 */
function obtenerTodasLasIniciativas() {
  const data = JSON.parse(fs.readFileSync(FILE_INICIATIVAS, 'utf-8'));
  return data.iniciativas
    .filter(i => {
      if (!i.fecha) return false;
      // Parsear fecha: "Jueves, 22 de septiembre de 2022" → extraer año
      const match = i.fecha.match(/(\d{4})/);
      const year = match ? parseInt(match[1]) : 0;
      return year >= 2024;
    })
    .map(i => i.numero)
    .sort((a, b) => parseInt(a) - parseInt(b));
}

/**
 * Buscar URL del PDF para una iniciativa
 */
function obtenerUrlPdf(numero) {
  const data = JSON.parse(fs.readFileSync(FILE_INICIATIVAS, 'utf-8'));
  const iniciativa = data.iniciativas.find(i => i.numero === numero);
  return iniciativa ? iniciativa.pdfUrl : null;
}

/**
 * Descargar PDF de una iniciativa
 */
async function descargarPDF(numero, url) {
  const rutaPdf = path.join(DIR_PDF, `${numero}.pdf`);
  
  // Si ya existe, no descargar de nuevo
  if (fs.existsSync(rutaPdf)) {
    console.log(`  ⏭️  Ya existe: ${numero}.pdf`);
    return rutaPdf;
  }

  try {
    const comando = `curl -s -L "${url}" \
      -H "Cookie: ${COOKIE}" \
      -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
      -o "${rutaPdf}"`;
    
    await execPromise(comando);
    
    // Verificar que el archivo descargado sea un PDF válido
    const buffer = fs.readFileSync(rutaPdf);
    if (!buffer.toString('utf-8', 0, 5).includes('%PDF-')) {
      fs.unlinkSync(rutaPdf);
      throw new Error('El archivo descargado no es un PDF válido');
    }
    
    const stats = fs.statSync(rutaPdf);
    const tamanoKB = Math.round(stats.size / 1024);
    console.log(`  ✅ Descargado: ${tamanoKB} KB`);
    
    return rutaPdf;
  } catch (error) {
    console.error(`  ❌ Error descargando: ${error.message}`);
    return null;
  }
}

/**
 * Extraer texto de un PDF
 */
async function extraerTexto(rutaPdf, numero) {
  const rutaTxt = path.join(DIR_PDF, `${numero}.txt`);
  
  // Si ya existe el texto, no extraer de nuevo
  if (fs.existsSync(rutaTxt)) {
    const stats = fs.statSync(rutaTxt);
    const tamanoKB = Math.round(stats.size / 1024);
    console.log(`  ⏭️  Ya existe: ${numero}.txt (${tamanoKB} KB)`);
    return { numero, texto: fs.readFileSync(rutaTxt, 'utf-8') };
  }

  try {
    const dataBuffer = fs.readFileSync(rutaPdf);
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    
    const texto = result.text;
    const paginas = result.numpages || 0;
    const caracteres = texto.length;
    
    // Guardar texto
    fs.writeFileSync(rutaTxt, texto, 'utf-8');
    
    console.log(`  ✅ Extraído: ${paginas} páginas, ${caracteres.toLocaleString()} caracteres`);
    
    return { numero, texto, paginas, caracteres };
  } catch (error) {
    console.error(`  ❌ Error extrayendo texto: ${error.message}`);
    return null;
  }
}

/**
 * Esperar un tiempo (para no saturar el servidor)
 */
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Proceso principal
 */
async function main() {
  console.log('🔍 Descargando iniciativas del período actual (2024+)...\n');
  const iniciativas = obtenerTodasLasIniciativas();
  console.log(`📋 Total de iniciativas: ${iniciativas.length}\n`);
  
  let exitosos = 0;
  let errores = 0;
  let saltados = 0;
  
  for (let i = 0; i < iniciativas.length; i++) {
    const numero = iniciativas[i];
    const progreso = `[${i + 1}/${iniciativas.length}]`;
    
    console.log(`${progreso} 📄 Iniciativa ${numero}`);
    
    // Verificar si ya tenemos ambos archivos
    const pdfExiste = fs.existsSync(path.join(DIR_PDF, `${numero}.pdf`));
    const txtExiste = fs.existsSync(path.join(DIR_PDF, `${numero}.txt`));
    
    if (pdfExiste && txtExiste) {
      console.log(`  ⏭️  Ya procesada completamente\n`);
      saltados++;
      continue;
    }
    
    // Obtener URL del PDF
    const url = obtenerUrlPdf(numero);
    if (!url) {
      console.log(`  ⚠️  URL no encontrada en iniciativas.json\n`);
      errores++;
      continue;
    }
    
    // Descargar PDF
    const rutaPdf = await descargarPDF(numero, url);
    if (!rutaPdf) {
      errores++;
      console.log('');
      continue;
    }
    
    // Extraer texto
    const resultado = await extraerTexto(rutaPdf, numero);
    if (!resultado) {
      errores++;
      console.log('');
      continue;
    }
    
    exitosos++;
    console.log('');
    
    // Esperar entre 1-3 segundos para no saturar el servidor
    if (i < iniciativas.length - 1) {
      const delay = 1000 + Math.random() * 2000;
      await esperar(delay);
    }
  }
  
  // Resumen final
  console.log('═'.repeat(60));
  console.log('📊 RESUMEN');
  console.log('═'.repeat(60));
  console.log(`✅ Exitosos:  ${exitosos}`);
  console.log(`⏭️  Saltados:   ${saltados} (ya existían)`);
  console.log(`❌ Errores:    ${errores}`);
  console.log(`📁 Total:      ${iniciativas.length}`);
  console.log('═'.repeat(60));
  
  if (errores > 0) {
    console.log('\n⚠️  Revisa los errores. Posibles causas:');
    console.log('  • Cookie expirada (actualizar en línea 9)');
    console.log('  • URL no encontrada en iniciativas.json');
    console.log('  • PDF corrupto o no disponible');
  }
}

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
