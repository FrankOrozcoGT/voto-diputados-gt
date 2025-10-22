export interface Diputado {
  id: string;
  nombre: string;
  apellidos: string;
  partido_politico: string;
  distrito: string;
  departamento: string;
  numero_lista: number;
  foto_url?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListadoDiputadosState {
  diputados: Diputado[];
  loading: boolean;
  error: string | null;
}