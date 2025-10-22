import { supabase } from '../lib/supabase';

export class PartidosRepository {
  async obtenerPartidosActivos(): Promise<{ partido_politico: string }[]> {
    const { data, error } = await supabase
      .from('diputados')
      .select('partido_politico')
      .eq('activo', true);

    if (error) throw new Error(error.message);
    return data || [];
  }
}
