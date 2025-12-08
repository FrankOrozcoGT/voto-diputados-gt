import type { PartidoDTO } from '../../application/dtos/PartidoDTO';
import type { PartidoRaw } from '../ports/IPartidoRepository';

export class PartidosService {
  /**
   * Convierte hex color a gradiente de Tailwind
   * @param hexColor - Color en formato hex (#RRGGBB)
   * @returns Clase de gradiente de Tailwind o fallback
   */
  private hexToGradient(hexColor: string): string {
    // Mapeo básico de colores comunes
    const colorMap: Record<string, string> = {
      '#0000ff': 'from-blue-500 to-blue-700',
      '#ff0000': 'from-red-500 to-red-700',
      '#00ff00': 'from-green-500 to-green-700',
      '#ffff00': 'from-yellow-400 to-yellow-600',
      '#ff00ff': 'from-pink-500 to-pink-700',
      '#00ffff': 'from-cyan-500 to-cyan-700',
      '#ffa500': 'from-orange-500 to-orange-700',
      '#800080': 'from-purple-500 to-purple-700',
    };

    const normalized = hexColor.toLowerCase();
    return colorMap[normalized] || 'from-gray-500 to-gray-700';
  }

  /**
   * Transforma datos raw de partidos a DTOs
   * @param partidosRaw - Array de datos raw de partidos desde repository
   * @returns Array de PartidoDTO ordenados por total de diputados
   */
  convertirAPartidoDTOs(partidosRaw: PartidoRaw[]): PartidoDTO[] {
    return partidosRaw
      .map(partido => ({
        id: partido.id,
        nombre: partido.nombre,
        prefijo: partido.prefijo,
        slug: partido.prefijo.toLowerCase().replace(/\s+/g, '-'),
        color: partido.color,
        logoUrl: partido.logo_url ? `https://www.congreso.gob.gt/uploads/bloques/${partido.logo_url}` : null,
        totalDiputados: partido.total_diputados || 0,
        colorGradient: this.hexToGradient(partido.color),
        redesSociales: {
          facebook: partido.facebook,
          twitter: partido.twitter,
          instagram: partido.instagram,
          youtube: partido.youtube,
          website: partido.sitio_web,
        },
      }))
      .sort((a, b) => b.totalDiputados - a.totalDiputados);
  }

  /**
   * Extrae nombres únicos de partidos
   * @param partidosRaw - Array de datos raw de partidos
   * @returns Array de nombres de partidos únicos
   */
  extraerNombresUnicos(partidosRaw: PartidoRaw[]): string[] {
    return partidosRaw.map(p => p.nombre).sort();
  }
}
