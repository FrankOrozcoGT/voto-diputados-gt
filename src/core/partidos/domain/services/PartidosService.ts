import type { PartidoDTO } from '../../application/dtos/PartidoDTO';
import type { PartidoRaw } from '../ports/IPartidoRepository';

export class PartidosService {
  private colores = [
    'from-blue-500 to-blue-600',
    'from-red-500 to-red-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
  ];

  /**
   * Agrupa raw data de partidos y transforma a DTOs
   * @param partidosRaw - Array de datos raw de partidos desde repository
   * @returns Array de PartidoDTO ordenados por total de diputados
   */
  convertirAPartidoDTOs(partidosRaw: PartidoRaw[]): PartidoDTO[] {
    // 1. Agrupamiento - lógica de negocio
    const mapa = new Map<string, number>();
    partidosRaw.forEach(row => {
      const partido = row.partido_politico || 'Sin Partido';
      mapa.set(partido, (mapa.get(partido) || 0) + 1);
    });

    // 2. Transformación a DTOs
    return Array.from(mapa.entries())
      .map(([nombre, total], index) => ({
        nombre,
        slug: encodeURIComponent(nombre),
        totalDiputados: total,
        colorGradient: this.colores[index % this.colores.length],
      }))
      .sort((a, b) => b.totalDiputados - a.totalDiputados);
  }

  /**
   * Extrae nombres únicos de partidos
   * @param partidosRaw - Array de datos raw de partidos
   * @returns Array de nombres de partidos únicos
   */
  extraerNombresUnicos(partidosRaw: PartidoRaw[]): string[] {
    const partidos = new Set<string>();
    
    partidosRaw.forEach(row => {
      if (row.partido_politico) partidos.add(row.partido_politico);
    });

    return Array.from(partidos);
  }
}
