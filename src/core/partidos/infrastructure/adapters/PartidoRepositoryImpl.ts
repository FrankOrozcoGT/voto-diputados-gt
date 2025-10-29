import { supabase } from '@/lib/supabase';
import type { IPartidoRepository, PartidoRaw } from '../../domain/ports/IPartidoRepository';

export class PartidoRepositoryImpl implements IPartidoRepository {
  async obtenerPartidosActivos(): Promise<PartidoRaw[]> {
    const { data, error } = await supabase
      .from('diputados')
      .select('partido_politico')
      .eq('activo', true);

    if (error) throw new Error(error.message);
    return data || [];
  }
}
