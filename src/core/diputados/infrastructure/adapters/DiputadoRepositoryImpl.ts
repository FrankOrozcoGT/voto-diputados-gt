import { supabase } from '@/lib/supabase';
import type { DiputadoRaw } from '../../application/dtos/DiputadoDTO';
import type { IDiputadoRepository } from '../../domain/ports/IDiputadoRepository';

export class DiputadoRepositoryImpl implements IDiputadoRepository {
  async obtenerDiputadosPorPartido(partidoNombre: string): Promise<DiputadoRaw[]> {
    const { data, error } = await supabase
      .from('diputados')
      .select('*')
      .eq('activo', true)
      .eq('partido_politico', partidoNombre)
      .order('numero_lista', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async obtenerTodosDiputados(): Promise<DiputadoRaw[]> {
    const { data, error } = await supabase
      .from('diputados')
      .select('*')
      .eq('activo', true)
      .order('numero_lista', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }
}
