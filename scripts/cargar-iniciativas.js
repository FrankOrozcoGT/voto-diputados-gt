import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Parsear fecha en formato "Jueves, 04 de diciembre de 2025" a ISO
 */
function parseFecha(fechaTexto) {
  const meses = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
    'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
    'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
  };

  // Extraer: "04 de diciembre de 2025"
  const match = fechaTexto.match(/(\d+) de (\w+) de (\d+)/);
  if (!match) return null;

  const dia = parseInt(match[1]);
  const mes = meses[match[2].toLowerCase()];
  const año = parseInt(match[3]);

  if (mes === undefined) return null;

  const fecha = new Date(año, mes, dia);
  return fecha.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Limpiar resumen (quitar "Iniciativa que dispone aprobar ")
 */
function limpiarTitulo(resumen) {
  return resumen
    .replace(/^Iniciativa que dispone aprobar /i, '')
    .trim();
}

/**
 * Verificar si una iniciativa tiene votaciones
 */
async function tieneVotaciones(numero) {
  const { count, error } = await supabase
    .from('votaciones')
    .select('id', { count: 'exact', head: true })
    .eq('iniciativa', numero);

  if (error) {
    console.warn(`  ⚠️  Error verificando votaciones para ${numero}:`, error.message);
    return false;
  }

  return count > 0;
}

/**
 * Cargar iniciativas a la base de datos
 */
async function cargarIniciativas() {
  const rutaJson = path.join(__dirname, '..', 'data', 'iniciativas.json');
  const data = JSON.parse(fs.readFileSync(rutaJson, 'utf-8'));

  // Filtrar solo iniciativas del periodo actual (2024-2025)
  const iniciativasPeriodoActual = data.iniciativas.filter(i => 
    i.fecha && (i.fecha.includes('2024') || i.fecha.includes('2025'))
  );

  console.log(`📊 Total en JSON: ${data.total}`);
  console.log(`📊 Periodo actual (2024-2025): ${iniciativasPeriodoActual.length}\n`);

  const iniciativasACargar = [];

  for (const iniciativa of iniciativasPeriodoActual) {
    const fecha = parseFecha(iniciativa.fecha);
    if (!fecha) {
      console.warn(`  ⚠️  Fecha inválida para iniciativa ${iniciativa.numero}: ${iniciativa.fecha}`);
      continue;
    }

    iniciativasACargar.push({
      numero: iniciativa.numero,
      fecha: fecha,
      titulo: limpiarTitulo(iniciativa.resumen),
      descripcion: null,
      pdf_url: iniciativa.pdfUrl,
      detalle_url: iniciativa.detalleUrl,
      tiene_votaciones: false // Se actualizará cuando se suban votaciones
    });
  }

  console.log(`\n📥 Insertando ${iniciativasACargar.length} iniciativas...`);

  // Insertar en bloques de 100
  const BATCH_SIZE = 100;
  let insertadas = 0;
  let errores = 0;

  for (let i = 0; i < iniciativasACargar.length; i += BATCH_SIZE) {
    const batch = iniciativasACargar.slice(i, i + BATCH_SIZE);
    
    const { data, error } = await supabase
      .from('iniciativas')
      .insert(batch);

    if (error) {
      console.error(`  ❌ Error en batch ${i / BATCH_SIZE + 1}:`, error.message);
      errores += batch.length;
    } else {
      insertadas += batch.length;
      console.log(`  ✅ Batch ${i / BATCH_SIZE + 1}: ${batch.length} iniciativas`);
    }
  }

  console.log(`\n🎉 Proceso completado:`);
  console.log(`  - Insertadas: ${insertadas}`);
  console.log(`  - Errores: ${errores}`);
  console.log(`  - Con votaciones: ${iniciativasACargar.filter(i => i.tiene_votaciones).length}`);
}

// Ejecutar
cargarIniciativas().catch(console.error);
