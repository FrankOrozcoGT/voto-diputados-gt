import type { DiputadoDTO } from '../../../core/diputados/application/dtos/DiputadoDTO';

/**
 * Obtiene las iniciales del diputado
 * @param diputado - DTO del diputado
 * @returns Iniciales (ya vienen en el DTO, esta función es helper por si se necesita calcular)
 */
export function getIniciales(diputado: DiputadoDTO): string {
  return diputado.iniciales;
}

/**
 * Formatea el número de lista con prefijo #
 * @param numeroLista - Número de lista del diputado
 * @returns Número formateado con #
 */
export function formatNumeroLista(numeroLista: number): string {
  return `#${numeroLista}`;
}

/**
 * Determina si el diputado tiene foto
 * @param diputado - DTO del diputado
 * @returns true si tiene foto, false si no
 */
export function tieneFoto(diputado: DiputadoDTO): boolean {
  return !!diputado.fotoUrl;
}
