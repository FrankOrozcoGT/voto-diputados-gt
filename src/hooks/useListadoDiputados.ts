import { supabase } from '../lib/supabase';
import type { Diputado, ListadoDiputadosState } from '../types/diputado';

export class DiputadosService {
  private static state: ListadoDiputadosState = {
    diputados: [],
    loading: false,
    error: null
  };

  private static listeners: Array<(state: ListadoDiputadosState) => void> = [];

  static subscribe(listener: (state: ListadoDiputadosState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private static setState(newState: Partial<ListadoDiputadosState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  static async obtenerDiputados(): Promise<void> {
    try {
      this.setState({ loading: true, error: null });

      const { data, error } = await supabase
        .from('diputados')
        .select('*')
        .eq('activo', true)
        .order('partido_politico', { ascending: true })
        .order('numero_lista', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      this.setState({ 
        diputados: data || [], 
        loading: false 
      });
    } catch (error) {
      this.setState({ 
        error: error instanceof Error ? error.message : 'Error desconocido',
        loading: false 
      });
    }
  }

  static getState(): ListadoDiputadosState {
    return this.state;
  }
}

export function useListadoDiputados() {
  return {
    obtenerDiputados: () => DiputadosService.obtenerDiputados(),
    subscribe: (callback: (state: ListadoDiputadosState) => void) => 
      DiputadosService.subscribe(callback),
    getState: () => DiputadosService.getState()
  };
}