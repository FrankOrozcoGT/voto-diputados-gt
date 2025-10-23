import type { PartidoDTO } from '@backend/partidos/dtos/partido.dto';

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

  convertirAPartidoDTO(agrupados: Map<string, number>): PartidoDTO[] {
    return Array.from(agrupados.entries())
      .map(([nombre, total], index) => ({
        nombre,
        slug: encodeURIComponent(nombre),
        totalDiputados: total,
        colorGradient: this.colores[index % this.colores.length],
      }))
      .sort((a, b) => b.totalDiputados - a.totalDiputados);
  }
}
