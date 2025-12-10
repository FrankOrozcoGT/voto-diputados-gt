// Script para actualizar tiene_votaciones en base a las votaciones existentes
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function actualizarTieneVotaciones() {
  // Obtener todas las iniciativas que tienen votaciones
  const { data: iniciativasConVotaciones, error: errorVotaciones } = await supabase
    .from('votaciones')
    .select('iniciativa_numero')
    .distinct();

  if (errorVotaciones) {
    console.error('Error obteniendo votaciones:', errorVotaciones);
    return;
  }

  const numerosConVotaciones = new Set(iniciativasConVotaciones.map(v => v.iniciativa_numero));

  // Obtener todas las iniciativas
  const { data: iniciativas, error: errorIniciativas } = await supabase
    .from('iniciativas')
    .select('id, numero');

  if (errorIniciativas) {
    console.error('Error obteniendo iniciativas:', errorIniciativas);
    return;
  }

  // Actualizar tiene_votaciones
  let actualizadas = 0;
  for (const init of iniciativas) {
    const tieneVotaciones = numerosConVotaciones.has(init.numero);
    
    const { error } = await supabase
      .from('iniciativas')
      .update({ tiene_votaciones: tieneVotaciones })
      .eq('id', init.id);

    if (error) {
      console.error(`Error actualizando iniciativa ${init.numero}:`, error);
    } else if (tieneVotaciones) {
      actualizadas++;
      console.log(`✓ ${init.numero} - tiene votaciones`);
    }
  }

  console.log(`\nTotal actualizadas: ${actualizadas}`);
}

actualizarTieneVotaciones().catch(console.error);
