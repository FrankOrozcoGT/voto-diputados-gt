/**
 * Script para importar partidos y diputados desde JSON
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function importarPartidos() {
  console.log('📦 Importando partidos...\n');
  
  const data = JSON.parse(await fs.readFile('data/bloques.json', 'utf-8'));
  const partidosMap = new Map();
  let exitosos = 0;
  
  for (const item of data) {
    const partido = {
      nombre: item.nombre_bloque,
      prefijo: item.prefijo,
      color: item.color,
      logo_url: item.logo_bloque,
      sitio_web: item.sitio_web,
      email: item.email,
      telefono: item.telefono,
      direccion: item.direccion,
      facebook: item.facebook,
      twitter: item.twitter,
      instagram: item.instagram,
      youtube: item.youtube,
      anio_creacion: item.anio_creacion ? parseInt(item.anio_creacion) : null,
      activo: item.status === '1'
    };
    
    // Verificar si existe
    const { data: existente } = await supabase
      .from('partidos')
      .select('id')
      .eq('prefijo', partido.prefijo)
      .single();
    
    if (existente) {
      partidosMap.set(item.id_bloque, existente.id);
      console.log(`  ⏭️  ${partido.nombre} ya existe`);
      continue;
    }
    
    const { data: nuevo, error } = await supabase
      .from('partidos')
      .insert([partido])
      .select()
      .single();
    
    if (error) {
      console.error(`  ❌ ${partido.nombre}:`, error.message);
    } else {
      partidosMap.set(item.id_bloque, nuevo.id);
      console.log(`  ✅ ${partido.nombre}`);
      exitosos++;
    }
  }
  
  console.log(`\n📊 Total: ${exitosos} partidos insertados\n`);
  return partidosMap;
}

async function importarDiputados(partidosMap) {
  console.log('👥 Importando diputados...\n');
  
  const data = JSON.parse(await fs.readFile('data/diputados.json', 'utf-8'));
  let exitosos = 0;
  
  for (const item of data) {
    const partidoId = partidosMap.get(item.id_bloque);
    
    if (!partidoId) {
      console.warn(`  ⚠️  No se encontró partido para: ${item.nombres} ${item.apellidos}`);
      continue;
    }
    
    const diputado = {
      id_congreso: item.id_diputado || item.id,
      nombre: item.nombres,
      apellidos: item.apellidos,
      partido_id: partidoId,
      partido_politico: item.nombre_bloque || item.prefijo,
      distrito: item.nombre_distrito || 'Sin especificar',
      departamento: item.nombre_distrito || 'Sin especificar',
      numero_lista: parseInt(item.id_distrito) || 0,
      foto_url: item.foto_perfil,
      fecha_nacimiento: item.fecha_nacimiento && item.fecha_nacimiento !== '0000-00-00' ? item.fecha_nacimiento : null,
      edad: parseInt(item.edad) || null,
      cv_url: item.cv,
      whatsapp: item.whatsapp,
      facebook: item.facebook,
      twitter: item.twitter,
      instagram: item.instagram,
      youtube: item.youtube,
      website: item.website,
      cargo_bloque: item.puesto_bloques,
      etiqueta: item.etiqueta,
      activo: item.status === '1'
    };
    
    const { error } = await supabase
      .from('diputados')
      .insert([diputado]);
    
    if (error) {
      if (error.code === '23505') {
        console.log(`  ⏭️  ${diputado.nombre} ${diputado.apellidos} ya existe`);
      } else {
        console.error(`  ❌ ${diputado.nombre} ${diputado.apellidos}:`, error.message);
      }
    } else {
      console.log(`  ✅ ${diputado.nombre} ${diputado.apellidos}`);
      exitosos++;
    }
  }
  
  console.log(`\n📊 Total: ${exitosos} diputados insertados\n`);
}

async function main() {
  console.log('🚀 Iniciando importación\n');
  
  try {
    const partidosMap = await importarPartidos();
    await importarDiputados(partidosMap);
    console.log('✅ Completado!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
