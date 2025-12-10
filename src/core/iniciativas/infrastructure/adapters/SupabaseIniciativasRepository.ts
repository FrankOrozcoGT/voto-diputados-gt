import { createClient } from '@supabase/supabase-js';
import type { IniciativasRepository } from '../../domain/ports/IniciativasRepository';
import type { Iniciativa, IniciativaListItem } from '../../domain/models/Iniciativa';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseIniciativasRepository implements IniciativasRepository {
  async getAll(): Promise<IniciativaListItem[]> {
    const { data, error } = await supabase
      .from('iniciativas')
      .select('numero, titulo, tiene_votaciones, libertad_economica, libertad_cultural, alcance_social, riesgo_corrupcion')
      .order('numero', { ascending: false });

    if (error) {
      console.error('Error fetching iniciativas:', error);
      throw new Error('Failed to fetch iniciativas');
    }

    return (data || []).map(row => ({
      numero: row.numero,
      titulo: row.titulo,
      tieneVotaciones: row.tiene_votaciones,
      libertadEconomica: row.libertad_economica,
      libertadCultural: row.libertad_cultural,
      alcanceSocial: row.alcance_social,
      riesgoCorrupcion: row.riesgo_corrupcion,
    }));
  }

  async getByNumero(numero: string): Promise<Iniciativa | null> {
    const { data, error } = await supabase
      .from('iniciativas')
      .select('*')
      .eq('numero', numero)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching iniciativa:', error);
      throw new Error('Failed to fetch iniciativa');
    }

    if (!data) return null;

    return {
      id: data.id,
      numero: data.numero,
      fecha: data.fecha,
      titulo: data.titulo,
      descripcion: data.descripcion,
      descripcionAnalisis: data.descripcion_analisis,
      pdfUrl: data.pdf_url,
      detalleUrl: data.detalle_url,
      tieneVotaciones: data.tiene_votaciones,
      libertadEconomica: data.libertad_economica,
      libertadCultural: data.libertad_cultural,
      alcanceSocial: data.alcance_social,
      riesgoCorrupcion: data.riesgo_corrupcion,
      justificacionMetricas: data.justificacion_metricas,
      ultimaActualizacion: data.ultima_actualizacion,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
