import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import { config } from 'dotenv';
import { promises as fs } from 'fs';

config();

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

const BASE_URL = 'https://www.congreso.gob.gt';
const VOTACIONES_URL = `${BASE_URL}/votaciones-congreso`;

/**
 * Parsear descripción para extraer número, fase y fecha
 * Ejemplo: "No. 13, Fase 1, Fecha 04/12/2025 08:47:00"
 */
function parsearDescripcion(descripcion) {
  const match = descripcion.match(/No\.\s*(\d+),\s*Fase\s*(\d+),\s*Fecha\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/);
  
  if (match) {
    const [, numero, fase, fechaStr] = match;
    // Convertir formato DD/MM/YYYY HH:MM:SS a ISO
    const [fecha, hora] = fechaStr.split(' ');
    const [dia, mes, anio] = fecha.split('/');
    const fechaISO = `${anio}-${mes}-${dia}T${hora}`;
    
    return {
      numero: parseInt(numero),
      fase: parseInt(fase),
      fecha: fechaISO
    };
  }
  
  return null;
}

/**
 * Extraer ID de congreso de la URL
 * Ejemplo: "https://www.congreso.gob.gt/eventos_votaciones/41321" -> 41321
 */
function extraerIdCongreso(url) {
  const match = url.match(/eventos_votaciones\/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Parsear HTML local con regex (archivo incompleto sin tags de apertura)
 */
async function scrapearSesionesVotacion() {
  console.log('🔍 Leyendo sesiones de votación desde votaciones.html...\n');
  
  try {
    const html = await fs.readFile('data/votaciones.html', 'utf-8');
    
    const sesiones = [];
    const PERIODO_INICIO = new Date('2024-01-14'); // Inicio del período 2024-2028
    
    // Regex para extraer cada fila completa
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    const matches = [...html.matchAll(trRegex)];
    
    console.log(`📝 Encontrados ${matches.length} registros en el HTML\n`);
    
    for (const match of matches) {
      const trContent = match[1];
      
      // Extraer celdas
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
      const cells = [...trContent.matchAll(tdRegex)].map(m => m[1].trim());
      
      if (cells.length >= 4) {
        const tipoSesion = cells[0].replace(/<[^>]+>/g, '').trim();
        const numero = cells[1].replace(/<[^>]+>/g, '').trim();
        const descripcion = cells[2].replace(/<[^>]+>/g, '').trim();
        
        // Extraer URL del link
        const linkMatch = cells[3].match(/href="([^"]+)"/);
        const urlVotaciones = linkMatch ? linkMatch[1] : null;
        
        const parsed = parsearDescripcion(descripcion);
        const idCongreso = extraerIdCongreso(urlVotaciones);
        
        // Filtrar solo sesiones del período actual (2024-2028)
        if (parsed && idCongreso && tipoSesion) {
          const fechaSesion = new Date(parsed.fecha);
          
          if (fechaSesion >= PERIODO_INICIO) {
            sesiones.push({
              id_congreso: idCongreso,
              tipo_sesion: tipoSesion,
              numero: parsed.numero,
              descripcion: descripcion,
              fecha: parsed.fecha,
              fase: parsed.fase,
              url_votaciones: urlVotaciones,
              activa: true
            });
          }
        }
      }
    }
    
    console.log(`📊 Total de sesiones del período 2024-2028: ${sesiones.length}\n`);
    return sesiones;
    
  } catch (error) {
    console.error('❌ Error leyendo archivo:', error.message);
    return [];
  }
}

/**
 * Importar sesiones a Supabase
 */
async function importarSesiones(sesiones) {
  console.log('💾 Importando sesiones a Supabase...\n');
  
  let exitosos = 0;
  
  for (const sesion of sesiones) {
    // Verificar si ya existe
    const { data: existente } = await supabase
      .from('sesiones_votacion')
      .select('id')
      .eq('id_congreso', sesion.id_congreso)
      .single();
    
    if (existente) {
      console.log(`  ⏭️  Sesión ${sesion.tipo_sesion} No. ${sesion.numero} ya existe`);
      continue;
    }
    
    const { error } = await supabase
      .from('sesiones_votacion')
      .insert([sesion]);
    
    if (error) {
      console.error(`  ❌ ${sesion.descripcion}:`, error.message);
    } else {
      console.log(`  ✅ ${sesion.tipo_sesion} No. ${sesion.numero} - ${sesion.fecha}`);
      exitosos++;
    }
  }
  
  console.log(`\n📊 Total: ${exitosos} sesiones insertadas\n`);
}

/**
 * Scraping de votaciones específicas de una sesión
 * TODO: Implementar cuando se defina la estructura de la página individual
 */
async function scrapearVotacionesDeSesion(urlVotaciones) {
  console.log(`🔍 Scraping votaciones de: ${urlVotaciones}`);
  
  try {
    const response = await fetch(urlVotaciones);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // TODO: Parsear la estructura específica de la página de votaciones
    // Esto dependerá de cómo esté estructurada la página individual
    
    return [];
  } catch (error) {
    console.error('❌ Error scraping votaciones:', error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Iniciando importación de votaciones\n');
  
  try {
    // Fase 1: Scraping de sesiones
    const sesiones = await scrapearSesionesVotacion();
    
    if (sesiones.length === 0) {
      console.log('⚠️  No se encontraron sesiones para importar');
      return;
    }
    
    // Fase 2: Importar a Supabase
    await importarSesiones(sesiones);
    
    console.log('✅ Importación completada!\n');
    
    // TODO: Fase 3: Importar votaciones individuales
    // Para cada sesión, hacer scraping de sus votaciones específicas
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
