import { supabase } from '@/lib/supabase';
import type { DiputadoRaw } from '../../application/dtos/DiputadoDTO';
import type { IDiputadoRepository } from '../../domain/ports/IDiputadoRepository';

export class DiputadoRepositoryImpl implements IDiputadoRepository {
  async obtenerDiputadosPorPartido(partidoSlug: string): Promise<DiputadoRaw[]> {
    const { data, error } = await supabase
      .from('diputados')
      .select(`
        id,
        nombre,
        apellidos,
        partido_id,
        distrito,
        departamento,
        numero_lista,
        foto_url,
        whatsapp,
        facebook,
        twitter,
        instagram,
        fecha_nacimiento,
        edad,
        cv_url,
        cargo_bloque,
        activo,
        partidos!inner (
          id,
          nombre,
          prefijo,
          color
        )
      `)
      .eq('activo', true)
      .ilike('partidos.prefijo', partidoSlug)
      .order('numero_lista', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async obtenerTodosDiputados(): Promise<DiputadoRaw[]> {
    const { data, error } = await supabase
      .from('diputados')
      .select(`
        id,
        nombre,
        apellidos,
        partido_id,
        distrito,
        departamento,
        numero_lista,
        foto_url,
        whatsapp,
        facebook,
        twitter,
        instagram,
        fecha_nacimiento,
        edad,
        cv_url,
        cargo_bloque,
        activo,
        partidos (
          id,
          nombre,
          prefijo,
          color
        )
      `)
      .eq('activo', true)
      .order('numero_lista', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }
}
