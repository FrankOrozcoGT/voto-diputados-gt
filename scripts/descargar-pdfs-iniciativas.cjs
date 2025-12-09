const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { PDFParse } = require('pdf-parse');

const execPromise = promisify(exec);

// Cookie de autenticación (actualizar si expira)
const COOKIE = 'nlbi_2893948=QqkkQAvUzkSDg3tjJxHjPQAAAADvMB60HSlW6nOBL1SY41vG; incap_ses_1597_2893948=lbJBd7/RQXUGrQKV3kJxFnzFEGcAAAAAc6B6V99KxqoQMaobJMUILw==; ci_sessions=29cd1a3bcedf4e57b39a0e32cf6a10e3513eee67; _ga=GA1.1.1267116925.1733756746; _ga_4K1NTJKVN6=GS1.1.1733756746.1.1.1733757055.0.0.0';

const DIR_PDF = path.join(__dirname, '..', 'data', 'iniciativas-pdf');
const DIR_VOTACIONES = path.join(__dirname, '..', 'data', 'votaciones-raw');
const FILE_INICIATIVAS = path.join(__dirname, '..', 'data', 'iniciativas.json');

// Asegurar que existe el directorio
if (!fs.existsSync(DIR_PDF)) {
  fs.mkdirSync(DIR_PDF, { recursive: true });
}

/**
 * Obtener lista de iniciativas únicas que fueron votadas
 */
function obtenerIniciativasVotadas() {
  const archivos = fs.readdirSync(DIR_VOTACIONES);
  const iniciativas = new Set();

  for (const archivo of archivos) {
    if (!archivo.startsWith('votacion_')) continue;
    
    const ruta = path.join(DIR_VOTACIONES, archivo);
    const contenido = JSON.parse(fs.readFileSync(ruta, 'utf-8'));
    
    if (contenido.iniciativa) {
      iniciativas.add(contenido.iniciativa);
    }
  }

  return Array.from(iniciativas).sort((a, b) => parseInt(a) - parseInt(b));
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
  console.log('🔍 Identificando iniciativas votadas...\n');
  
  const iniciativasVotadas = obtenerIniciativasVotadas();
  console.log(`📋 Total de iniciativas votadas: ${iniciativasVotadas.length}\n`);
  
  let exitosos = 0;
  let errores = 0;
  let saltados = 0;
  
  for (let i = 0; i < iniciativasVotadas.length; i++) {
    const numero = iniciativasVotadas[i];
    const progreso = `[${i + 1}/${iniciativasVotadas.length}]`;
    
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
    if (i < iniciativasVotadas.length - 1) {
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
  console.log(`📁 Total:      ${iniciativasVotadas.length}`);
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
