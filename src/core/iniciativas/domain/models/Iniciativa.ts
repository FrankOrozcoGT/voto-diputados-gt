export interface Iniciativa {
  id: string;
  numero: string;
  fecha: string; // ISO date
  titulo: string;
  descripcion: string | null;
  descripcionAnalisis: string | null;
  pdfUrl: string | null;
  detalleUrl: string | null;
  tieneVotaciones: boolean;
  libertadEconomica: number | null;
  libertadCultural: number | null;
  alcanceSocial: number | null;
  riesgoCorrupcion: number | null;
  justificacionMetricas: {
    libertad_economica?: string;
    libertad_cultural?: string;
    alcance_social?: string;
    riesgo_corrupcion?: string;
  } | null;
  ultimaActualizacion: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IniciativaListItem {
  numero: string;
  titulo: string;
  tieneVotaciones: boolean;
  libertadEconomica: number | null;
  libertadCultural: number | null;
  alcanceSocial: number | null;
  riesgoCorrupcion: number | null;
}
