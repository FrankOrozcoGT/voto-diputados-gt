export interface Votacion {
  id: string;
  idCongreso: number;
  titulo: string;
  descripcion: string | null;
  tipo: string | null;
  fechaVotacion: string | null; // ISO timestamp
  resultado: string | null;
  votosFavor: number;
  votosContra: number;
  votosAbstencion: number;
  votosAusentes: number;
  iniciativa: string | null; // Número de iniciativa
  createdAt: string;
  updatedAt: string;
}

export interface VotacionListItem {
  idCongreso: number;
  titulo: string;
  tipo: string | null;
  fechaVotacion: string | null;
  votosFavor: number;
  votosContra: number;
  votosAbstencion: number;
  votosAusentes: number;
}
