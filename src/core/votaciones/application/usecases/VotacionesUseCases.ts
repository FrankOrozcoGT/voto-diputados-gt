import type { VotacionesRepository } from '../domain/ports/VotacionesRepository';
import type { Votacion, VotacionListItem } from '../domain/models/Votacion';

export class GetVotacionesByIniciativaUseCase {
  constructor(private readonly repository: VotacionesRepository) {}

  async execute(numeroIniciativa: string): Promise<VotacionListItem[]> {
    return await this.repository.getByIniciativa(numeroIniciativa);
  }
}

export class GetAllVotacionesUseCase {
  constructor(private readonly repository: VotacionesRepository) {}

  async execute(): Promise<VotacionListItem[]> {
    return await this.repository.getAll();
  }
}
