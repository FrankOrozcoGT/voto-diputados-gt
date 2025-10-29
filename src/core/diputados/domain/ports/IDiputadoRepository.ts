import type { DiputadoRaw } from '../../application/dtos/DiputadoDTO';

export interface IDiputadoRepository {
  obtenerDiputadosPorPartido(partidoNombre: string): Promise<DiputadoRaw[]>;
  obtenerTodosDiputados(): Promise<DiputadoRaw[]>;
}
