import type { PartidoDTO } from '../../application/dtos/PartidoDTO';
import type { PartidoRaw } from '../ports/IPartidoRepository';

export class PartidosService {
  /**
   * Genera estilos inline para gradiente basado en color hex
   * @param hexColor - Color en formato hex (#RRGGBB)
   * @returns String de estilo CSS con gradiente
   */
  private hexToGradient(hexColor: string): string {
    // No usamos clases de Tailwind, sino estilos inline directos
    // El gradiente va del color original a una versión más oscura
    return `background: linear-gradient(135deg, ${hexColor} 0%, ${this.darkenColor(hexColor, 20)} 100%)`;
  }

  /**
   * Oscurece un color hex por un porcentaje
   * @param hex - Color hex (#RRGGBB)
   * @param percent - Porcentaje a oscurecer (0-100)
   * @returns Color hex oscurecido
   */
  private darkenColor(hex: string, percent: number): string {
    // Remover el #
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return '#' + (
      0x1000000 +
      (R < 0 ? 0 : R > 255 ? 255 : R) * 0x10000 +
      (G < 0 ? 0 : G > 255 ? 255 : G) * 0x100 +
      (B < 0 ? 0 : B > 255 ? 255 : B)
    ).toString(16).slice(1);
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
        logoUrl: partido.logo_url ? `https://www.congreso.gob.gt/assets/uploads/bloques/${partido.logo_url}` : null,
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
