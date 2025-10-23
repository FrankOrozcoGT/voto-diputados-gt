import { supabase } from '@/lib/supabase';
import type { DiputadoRaw } from '@backend/partidos/dtos/diputado.dto';

export class DiputadosRepository {
  async buscarPorPartido(partido: string): Promise<DiputadoRaw[]> {
    const { data, error } = await supabase
      .from('diputados')
      .select('*')
      .eq('activo', true)
      .eq('partido_politico', partido)
      .order('numero_lista', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async obtenerTodos(): Promise<DiputadoRaw[]> {
    const { data, error } = await supabase
      .from('diputados')
      .select('*')
      .eq('activo', true)
      .order('numero_lista', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }
}
