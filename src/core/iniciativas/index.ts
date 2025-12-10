import { SupabaseIniciativasRepository } from './infrastructure/adapters/SupabaseIniciativasRepository';
import { GetIniciativasUseCase, GetIniciativaByNumeroUseCase } from './application/usecases/IniciativasUseCases';

// Singleton repository
const iniciativasRepository = new SupabaseIniciativasRepository();

// Use cases
export const getIniciativas = new GetIniciativasUseCase(iniciativasRepository);
export const getIniciativaByNumero = new GetIniciativaByNumeroUseCase(iniciativasRepository);
