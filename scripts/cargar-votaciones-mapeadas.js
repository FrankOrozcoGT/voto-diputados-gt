import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Parsear fecha "14/01/2024" a timestamp
 */
function parseFecha(fechaStr) {
  if (!fechaStr) return null;
  const [dia, mes, año] = fechaStr.split('/');
  const fecha = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
  return fecha.toISOString();
}

/**
 * Validar que todas las votaciones tengan iniciativas mapeadas
 */
async function validarMapeoBefore() {
  const votacionesDir = path.join(__dirname, '..', 'data', 'votaciones-raw');
  const archivos = fs.readdirSync(votacionesDir).filter(f => f.endsWith('.json'));

  console.log(`🔍 VALIDACIÓN PRE-CARGA\n`);
  console.log(`📊 Total de archivos: ${archivos.length}\n`);

  const estadisticas = {
    total: 0,
    conIniciativa: 0,
    sinIniciativa: 0,
    conErrorJSON: 0,
    initiativasUnicas: new Set(),
  };

  // Analizar todas las votaciones
  for (const archivo of archivos) {
    try {
      const rutaArchivo = path.join(votacionesDir, archivo);
      const datos = JSON.parse(fs.readFileSync(rutaArchivo, 'utf-8'));

      estadisticas.total++;

      if (datos.iniciativa && String(datos.iniciativa).trim() !== '') {
        estadisticas.conIniciativa++;
        estadisticas.initiativasUnicas.add(String(datos.iniciativa).trim());
      } else {
        estadisticas.sinIniciativa++;
      }
    } catch (error) {
      estadisticas.conErrorJSON++;
      console.warn(`  ⚠️  Error leyendo ${archivo}:`, error.message);
    }
  }

  console.log(`📈 ESTADÍSTICAS:`);
  console.log(`  ✅ Con iniciativa: ${estadisticas.conIniciativa}`);
  console.log(`  ⚠️  Sin iniciativa: ${estadisticas.sinIniciativa}`);
  console.log(`  ❌ Con error JSON: ${estadisticas.conErrorJSON}`);
  console.log(`  🔢 Iniciativas únicas mapeadas: ${estadisticas.initiativasUnicas.size}\n`);

  // Verificar si hay iniciativas en BD
  const { data: iniciativasDB, error } = await supabase
    .from('iniciativas')
    .select('numero', { count: 'exact', head: true })
    .limit(1);

  if (error) {
    console.error(`❌ Error accediendo BD:`, error.message);
    return false;
  }

  console.log(`✅ BD accesible\n`);

  return true;
}

/**
 * Cargar votaciones desde archivos raw y mapearlas con iniciativas
 */
async function cargarVotacionesMapeadas() {
  // Validar antes de cargar
  const valido = await validarMapeoBefore();
  if (!valido) {
    console.error(`❌ Validación fallida. Abortando carga.`);
    process.exit(1);
  }

  const votacionesDir = path.join(__dirname, '..', 'data', 'votaciones-raw');
  const archivos = fs.readdirSync(votacionesDir).filter(f => f.endsWith('.json'));

  console.log(`\n📥 CARGANDO VOTACIONES\n`);

  const votacionesACargar = [];
  let conIniciativa = 0;
  let sinIniciativa = 0;

  // Leer todas las votaciones
  for (const archivo of archivos) {
    try {
      const rutaArchivo = path.join(votacionesDir, archivo);
      const datos = JSON.parse(fs.readFileSync(rutaArchivo, 'utf-8'));

      const votacion = {
        id_congreso: parseInt(datos.votacionId),
        titulo: datos.pregunta,
        descripcion: datos.pregunta,
        tipo: datos.sesion?.tipo || null,
        fecha_votacion: parseFecha(datos.sesion?.fecha),
        iniciativa: datos.iniciativa ? String(datos.iniciativa).trim() : null,
      };

      votacionesACargar.push(votacion);

      if (datos.iniciativa) {
        conIniciativa++;
      } else {
        sinIniciativa++;
      }
    } catch (error) {
      console.warn(`  ⚠️  Error leyendo ${archivo}:`, error.message);
    }
  }

  console.log(`✅ Votaciones con iniciativa: ${conIniciativa}`);
  console.log(`⚠️  Votaciones sin iniciativa: ${sinIniciativa}\n`);

  // Insertar en bloques
  const BATCH_SIZE = 50; // Reducido para evitar timeout
  let insertadas = 0;
  let errores = 0;
  const batchesConError = [];

  console.log(`📥 Insertando ${votacionesACargar.length} votaciones en batches de ${BATCH_SIZE}...\n`);

  for (let i = 0; i < votacionesACargar.length; i += BATCH_SIZE) {
    const batch = votacionesACargar.slice(i, i + BATCH_SIZE);
    const numBatch = Math.floor(i / BATCH_SIZE) + 1;

    try {
      const { error, data } = await supabase
        .from('votaciones')
        .insert(batch)
        .select();

      if (error) {
        console.error(`  ❌ Error en batch ${numBatch}:`, error.message);
        batchesConError.push({ batch: numBatch, error: error.message });
        errores += batch.length;
      } else {
        insertadas += batch.length;
        const conInit = batch.filter(v => v.iniciativa).length;
        console.log(`  ✅ Batch ${numBatch}: ${batch.length} votaciones (${conInit} con iniciativa)`);
      }
    } catch (err) {
      console.error(`  ❌ Excepción en batch ${numBatch}:`, err.message);
      batchesConError.push({ batch: numBatch, error: err.message });
      errores += batch.length;
    }

    // Pequeña pausa entre batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n🎉 Proceso completado:`);
  console.log(`  - Insertadas: ${insertadas}`);
  console.log(`  - Errores: ${errores}`);
  console.log(`  - Con iniciativa mapeada: ${conIniciativa}`);

  if (batchesConError.length > 0) {
    console.log(`\n⚠️  Batches con error:`);
    batchesConError.forEach(b => {
      console.log(`    - Batch ${b.batch}: ${b.error}`);
    });
  }

  // Verificar datos en BD después de carga
  console.log(`\n🔍 Verificando datos en BD...`);
  const { count, error: countError } = await supabase
    .from('votaciones')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error(`  ❌ Error verificando BD:`, countError.message);
  } else {
    console.log(`  ✅ Total de votaciones en BD: ${count}`);
  }
}

cargarVotacionesMapeadas().catch(console.error);
