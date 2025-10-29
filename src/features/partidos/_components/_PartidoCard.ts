import type { PartidoDTO } from '../../../core/partidos/application/dtos/PartidoDTO';

/**
 * Genera el slug del partido para la URL
 * @param partido - DTO del partido
 * @returns Slug para URL (ya viene en el DTO)
 */
export function getPartidoSlug(partido: PartidoDTO): string {
  return partido.slug;
}

/**
 * Genera el texto de cantidad de diputados con pluralización
 * @param totalDiputados - Total de diputados del partido
 * @returns Texto formateado con singular o plural
 */
export function formatCantidadDiputados(totalDiputados: number): string {
  return `${totalDiputados} ${totalDiputados === 1 ? 'diputado' : 'diputados'}`;
}

/**
 * Genera la URL completa para el partido
 * @param partido - DTO del partido
 * @returns URL del partido
 */
export function getPartidoUrl(partido: PartidoDTO): string {
  return `/partidos/${partido.slug}`;
}

/**
 * Genera las clases CSS para el gradiente del partido
 * @param partido - DTO del partido
 * @returns Clases CSS completas para el gradiente
 */
export function getGradientClasses(partido: PartidoDTO): string {
  return `bg-gradient-to-r ${partido.colorGradient}`;
}
