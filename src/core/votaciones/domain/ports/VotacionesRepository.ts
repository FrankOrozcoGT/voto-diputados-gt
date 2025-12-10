import type { Votacion, VotacionListItem } from '../models/Votacion';

export interface VotacionesRepository {
  getByIniciativa(numeroIniciativa: string): Promise<VotacionListItem[]>;
  getAll(): Promise<VotacionListItem[]>;
}
