import type { Iniciativa, IniciativaListItem } from '../models/Iniciativa';

export interface IniciativasRepository {
  getAll(): Promise<IniciativaListItem[]>;
  getByNumero(numero: string): Promise<Iniciativa | null>;
}
