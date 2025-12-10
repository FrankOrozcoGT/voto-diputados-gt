import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Generar hash SHA256 de un objeto de análisis
 */
function generarHash(iniciativa) {
  const datosParaHash = {
    descripcion: iniciativa.descripcion,
    libertad_economica: iniciativa.libertad_economica,
    libertad_cultural: iniciativa.libertad_cultural,
    alcance_social: iniciativa.alcance_social,
    riesgo_corrupcion: iniciativa.riesgo_corrupcion,
    justificacion_metricas: iniciativa.justificacion_metricas
  };
  
  const json = JSON.stringify(datosParaHash);
  return crypto.createHash('sha256').update(json).digest('hex');
}

/**
 * Cargar análisis (descripcion + métricas) de iniciativas a Supabase
 */
async function cargarAnalisis() {
  const rutaJson = path.join(__dirname, '..', 'data', 'iniciativas.json');
  const datos = JSON.parse(fs.readFileSync(rutaJson, 'utf-8'));

  // Filtrar iniciativas que tienen análisis completo
  const iniciativasConAnalisis = datos.iniciativas.filter(i => {
    return i.descripcion && 
      i.libertad_economica !== undefined &&
      i.libertad_cultural !== undefined &&
      i.alcance_social !== undefined &&
      i.riesgo_corrupcion !== undefined &&
      i.justificacion_metricas;
  });

  console.log(`📊 Total iniciativas en JSON: ${datos.total}`);
  console.log(`📊 Con análisis completo: ${iniciativasConAnalisis.length}\n`);

  // Filtrar solo las que necesitan subirse (hash diferente o sin hash)
  const iniciativasParaSubir = iniciativasConAnalisis.filter(i => {
    const hashActual = generarHash(i);
    const hashAnterior = i.hash_analisis;
    
    // Subir si no tiene hash o si el hash cambió
    return !hashAnterior || hashAnterior !== hashActual;
  });

  console.log(`📥 Pendientes de subir: ${iniciativasParaSubir.length}\n`);

  if (iniciativasParaSubir.length === 0) {
    console.log('✅ Todos los análisis están actualizados');
    return;
  }

  console.log(`\n📤 Subiendo ${iniciativasParaSubir.length} iniciativas a Supabase...\n`);

  let subidas = 0;
  let errores = 0;
  const indicesActualizados = [];

  for (const iniciativa of iniciativasParaSubir) {
    const { error } = await supabase
      .from('iniciativas')
      .update({
        descripcion_analisis: iniciativa.descripcion,
        libertad_economica: iniciativa.libertad_economica,
        libertad_cultural: iniciativa.libertad_cultural,
        alcance_social: iniciativa.alcance_social,
        riesgo_corrupcion: iniciativa.riesgo_corrupcion,
        justificacion_metricas: iniciativa.justificacion_metricas
      })
      .eq('numero', iniciativa.numero);

    if (error) {
      console.error(`  ❌ ${iniciativa.numero} - Error: ${error.message}`);
      errores++;
    } else {
      console.log(`  ✅ ${iniciativa.numero} - Actualizado`);
      subidas++;
      
      const indiceEnDatos = datos.iniciativas.findIndex(i => i.numero === iniciativa.numero);
      if (indiceEnDatos !== -1) {
        indicesActualizados.push({
          indice: indiceEnDatos,
          numero: iniciativa.numero
        });
      }
    }
  }

  // Actualizar JSON solo para los que se subieron exitosamente
  if (indicesActualizados.length > 0) {
    console.log(`\n💾 Actualizando JSON con hashes...\n`);
    
    for (const item of indicesActualizados) {
      const hashNuevo = generarHash(datos.iniciativas[item.indice]);
      datos.iniciativas[item.indice].hash_analisis = hashNuevo;
      console.log(`  📝 ${item.numero} - Hash registrado`);
    }

    fs.writeFileSync(rutaJson, JSON.stringify(datos, null, 2));
    console.log(`\n✅ JSON actualizado correctamente`);
  }

  console.log(`\n🎉 Proceso completado:`);
  console.log(`  - Subidas: ${subidas}`);
  console.log(`  - Errores: ${errores}`);
}

cargarAnalisis().catch(console.error);
