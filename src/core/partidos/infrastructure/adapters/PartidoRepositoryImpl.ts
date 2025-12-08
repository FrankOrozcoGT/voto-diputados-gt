import { supabase } from '@/lib/supabase';
import type { IPartidoRepository, PartidoRaw } from '../../domain/ports/IPartidoRepository';

export class PartidoRepositoryImpl implements IPartidoRepository {
  async obtenerPartidosActivos(): Promise<PartidoRaw[]> {
    const { data, error } = await supabase
      .from('partidos')
      .select(`
        id,
        nombre,
        prefijo,
        color,
        logo_url,
        facebook,
        twitter,
        instagram,
        youtube,
        sitio_web,
        diputados:diputados(count)
      `)
      .order('nombre', { ascending: true });

    if (error) throw new Error(error.message);
    
    // Transformar count de diputados
    return (data || []).map(partido => ({
      ...partido,
      total_diputados: partido.diputados?.[0]?.count || 0
    }));
  }

  async obtenerPartidoPorSlug(slug: string): Promise<PartidoRaw | null> {
    // El slug se genera del prefijo en minúsculas
    const { data, error } = await supabase
      .from('partidos')
      .select(`
        id,
        nombre,
        prefijo,
        color,
        logo_url,
        facebook,
        twitter,
        instagram,
        youtube,
        sitio_web,
        diputados:diputados(count)
      `)
      .ilike('prefijo', slug)
      .single();

    if (error) return null;
    
    return {
      ...data,
      total_diputados: data.diputados?.[0]?.count || 0
    };
  }
}
