import { DiputadosOrchestrator } from '../../../core/diputados/application/usecases/DiputadosOrchestrator';
import type { DiputadoDTO } from '../../../core/diputados/application/dtos/DiputadoDTO';

export async function obtenerDiputadosPorPartido(partido: string): Promise<DiputadoDTO[]> {
  const orchestrator = new DiputadosOrchestrator();
  return await orchestrator.obtenerDiputadosPorPartido(partido);
}

export async function obtenerTodosDiputados(): Promise<DiputadoDTO[]> {
  const orchestrator = new DiputadosOrchestrator();
  return await orchestrator.obtenerTodos();
}
