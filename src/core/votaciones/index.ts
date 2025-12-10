import { SupabaseVotacionesRepository } from './infrastructure/adapters/SupabaseVotacionesRepository';
import {
  GetVotacionesByIniciativaUseCase,
  GetAllVotacionesUseCase,
} from './application/usecases/VotacionesUseCases';

const repository = new SupabaseVotacionesRepository();

export const getVotacionesByIniciativa = new GetVotacionesByIniciativaUseCase(
  repository
);

export const getAllVotaciones = new GetAllVotacionesUseCase(repository);
