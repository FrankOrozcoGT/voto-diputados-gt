import { PartidosRepository } from '../repositories/partidos.repository';
import { PartidosService } from '../services/partidos.service';
import type { PartidoDTO } from '../dtos/partido.dto';

export class PartidosOrchestrator {
  private repository = new PartidosRepository();
  private service = new PartidosService();

  async obtenerListadoPartidos(): Promise<PartidoDTO[]> {
    try {
      const diputadosRaw = await this.repository.obtenerPartidosActivos();
      
      const mapa = new Map<string, number>();
      diputadosRaw.forEach(row => {
        const partido = row.partido_politico || 'Sin Partido';
        mapa.set(partido, (mapa.get(partido) || 0) + 1);
      });

      const partidosDTO = this.service.convertirAPartidoDTO(mapa);
      return partidosDTO;
    } catch (error) {
      console.error('Error en obtenerListadoPartidos:', error);
      throw error;
    }
  }

  async obtenerNombresPartidos(): Promise<string[]> {
    try {
      const diputadosRaw = await this.repository.obtenerPartidosActivos();
      const partidos = new Set<string>();
      
      diputadosRaw.forEach(row => {
        if (row.partido_politico) partidos.add(row.partido_politico);
      });

      return Array.from(partidos);
    } catch (error) {
      console.error('Error en obtenerNombresPartidos:', error);
      throw error;
    }
  }
}
