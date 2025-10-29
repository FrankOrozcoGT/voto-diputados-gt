import { PartidosOrchestrator } from '../../../core/partidos/application/usecases/PartidosOrchestrator';
import type { PartidoDTO } from '../../../core/partidos/application/dtos/PartidoDTO';

export async function obtenerPartidos(): Promise<PartidoDTO[]> {
  const orchestrator = new PartidosOrchestrator();
  return await orchestrator.obtenerListadoPartidos();
}

export async function obtenerNombresPartidos(): Promise<string[]> {
  const orchestrator = new PartidosOrchestrator();
  return await orchestrator.obtenerNombresPartidos();
}
