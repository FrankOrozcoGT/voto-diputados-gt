import { obtenerDiputadosPorPartido, obtenerTodosDiputados } from '../_services/_diputadosService';
import type { DiputadoDTO } from '../../../core/diputados/application/dtos/DiputadoDTO';

export async function useDiputadosPorPartido(partido: string) {
  const diputados = await obtenerDiputadosPorPartido(partido);
  return { diputados };
}

export async function useTodosDiputados() {
  const diputados = await obtenerTodosDiputados();
  return { diputados };
}
