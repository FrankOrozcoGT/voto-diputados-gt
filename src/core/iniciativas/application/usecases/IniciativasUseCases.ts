import type { IniciativasRepository } from '../domain/ports/IniciativasRepository';
import type { Iniciativa, IniciativaListItem } from '../domain/models/Iniciativa';

export class GetIniciativasUseCase {
  constructor(private readonly repository: IniciativasRepository) {}

  async execute(): Promise<IniciativaListItem[]> {
    return await this.repository.getAll();
  }
}

export class GetIniciativaByNumeroUseCase {
  constructor(private readonly repository: IniciativasRepository) {}

  async execute(numero: string): Promise<Iniciativa | null> {
    return await this.repository.getByNumero(numero);
  }
}
