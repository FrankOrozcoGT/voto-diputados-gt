import { DiputadoRepositoryImpl } from '../../infrastructure/adapters/DiputadoRepositoryImpl';
import { DiputadosService } from '../../domain/services/DiputadosService';
import type { DiputadoDTO } from '../../application/dtos/DiputadoDTO';

export class DiputadosOrchestrator {
  private repository = new DiputadoRepositoryImpl();
  private service = new DiputadosService();

  async obtenerDiputadosPorPartido(partido: string): Promise<DiputadoDTO[]> {
    try {
      // 1. Repository obtiene datos optimizados
      const diputadosRaw = await this.repository.obtenerDiputadosPorPartido(partido);
      
      // 2. Inyecta en Service para transformación
      const diputadosDTO = this.service.convertirMultiples(diputadosRaw);
      return diputadosDTO;
    } catch (error) {
      console.error('Error en obtenerDiputadosPorPartido:', error);
      throw error;
    }
  }

  async obtenerTodos(): Promise<DiputadoDTO[]> {
    try {
      const diputadosRaw = await this.repository.obtenerTodosDiputados();
      const diputadosDTO = this.service.convertirMultiples(diputadosRaw);
      return diputadosDTO;
    } catch (error) {
      console.error('Error en obtenerTodos:', error);
      throw error;
    }
  }
}
