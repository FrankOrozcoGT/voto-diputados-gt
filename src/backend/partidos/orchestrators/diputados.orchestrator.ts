import { DiputadosRepository } from '@backend/partidos/repositories/diputados.repository';
import { DiputadosService } from '@backend/partidos/services/diputados.service';
import type { DiputadoDTO } from '@backend/partidos/dtos/diputado.dto';

export class DiputadosOrchestrator {
  private repository = new DiputadosRepository();
  private service = new DiputadosService();

  async obtenerDiputadosPorPartido(partido: string): Promise<DiputadoDTO[]> {
    try {
      const diputadosRaw = await this.repository.buscarPorPartido(partido);
      const diputadosDTO = diputadosRaw.map(raw => 
        this.service.convertirADiputadoDTO(raw)
      );
      return diputadosDTO;
    } catch (error) {
      console.error('Error en obtenerDiputadosPorPartido:', error);
      throw error;
    }
  }
}
