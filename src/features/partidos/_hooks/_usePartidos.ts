import { obtenerPartidos, obtenerNombresPartidos } from '../_services/_partidosService';
import type { PartidoDTO } from '../../../core/partidos/application/dtos/PartidoDTO';

export async function usePartidos() {
  const partidos = await obtenerPartidos();
  return { partidos };
}

export async function useNombresPartidos() {
  const nombres = await obtenerNombresPartidos();
  return { nombres };
}
