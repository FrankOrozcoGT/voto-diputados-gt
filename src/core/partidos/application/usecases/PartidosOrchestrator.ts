import { PartidoRepositoryImpl } from '../../infrastructure/adapters/PartidoRepositoryImpl';
import { PartidosService } from '../../domain/services/PartidosService';
import type { PartidoDTO } from '../../application/dtos/PartidoDTO';

export class PartidosOrchestrator {
  private repository = new PartidoRepositoryImpl();
  private service = new PartidosService();

  async obtenerListadoPartidos(): Promise<PartidoDTO[]> {
    try {
      // 1. Repository obtiene datos optimizados
      const partidosRaw = await this.repository.obtenerPartidosActivos();
      
      // 2. Inyecta en Service para transformación (Service hace agrupamiento + transformación)
      const partidosDTO = this.service.convertirAPartidoDTOs(partidosRaw);
      return partidosDTO;
    } catch (error) {
      console.error('Error en obtenerListadoPartidos:', error);
      throw error;
    }
  }

  async obtenerNombresPartidos(): Promise<string[]> {
    try {
      // 1. Repository obtiene datos
      const partidosRaw = await this.repository.obtenerPartidosActivos();
      
      // 2. Inyecta en Service para extracción de nombres únicos
      const nombres = this.service.extraerNombresUnicos(partidosRaw);
      return nombres;
    } catch (error) {
      console.error('Error en obtenerNombresPartidos:', error);
      throw error;
    }
  }
}
