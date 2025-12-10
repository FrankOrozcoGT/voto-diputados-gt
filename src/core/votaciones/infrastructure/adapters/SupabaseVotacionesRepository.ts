import { createClient } from '@supabase/supabase-js';
import type { VotacionesRepository } from '../../domain/ports/VotacionesRepository';
import type { Votacion, VotacionListItem } from '../../domain/models/Votacion';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseVotacionesRepository implements VotacionesRepository {
  async getByIniciativa(numeroIniciativa: string): Promise<VotacionListItem[]> {
    const { data, error } = await supabase
      .from('votaciones')
      .select('id_congreso, titulo, tipo, fecha_votacion, votos_favor, votos_contra, votos_abstencion, votos_ausentes')
      .eq('iniciativa', numeroIniciativa)
      .order('fecha_votacion', { ascending: false });

    if (error) {
      console.error('Error fetching votaciones by iniciativa:', error);
      throw new Error('Failed to fetch votaciones');
    }

    return (data || []).map(row => ({
      idCongreso: row.id_congreso,
      titulo: row.titulo,
      tipo: row.tipo,
      fechaVotacion: row.fecha_votacion,
      votosFavor: row.votos_favor || 0,
      votosContra: row.votos_contra || 0,
      votosAbstencion: row.votos_abstencion || 0,
      votosAusentes: row.votos_ausentes || 0,
    }));
  }

  async getAll(): Promise<VotacionListItem[]> {
    const { data, error } = await supabase
      .from('votaciones')
      .select('id_congreso, titulo, tipo, fecha_votacion, votos_favor, votos_contra, votos_abstencion, votos_ausentes')
      .order('fecha_votacion', { ascending: false });

    if (error) {
      console.error('Error fetching votaciones:', error);
      throw new Error('Failed to fetch votaciones');
    }

    return (data || []).map(row => ({
      idCongreso: row.id_congreso,
      titulo: row.titulo,
      tipo: row.tipo,
      fechaVotacion: row.fecha_votacion,
      votosFavor: row.votos_favor || 0,
      votosContra: row.votos_contra || 0,
      votosAbstencion: row.votos_abstencion || 0,
      votosAusentes: row.votos_ausentes || 0,
    }));
  }
}
