export interface PartidoRaw {
  partido_politico: string;
}

export interface IPartidoRepository {
  obtenerPartidosActivos(): Promise<PartidoRaw[]>;
}
