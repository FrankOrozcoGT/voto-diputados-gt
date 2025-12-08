export interface PartidoRaw {
  id: string;
  nombre: string;
  prefijo: string;
  color: string;
  logo_url: string | null;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  youtube: string | null;
  sitio_web: string | null;
  total_diputados?: number;
}

export interface IPartidoRepository {
  obtenerPartidosActivos(): Promise<PartidoRaw[]>;
  obtenerPartidoPorSlug(slug: string): Promise<PartidoRaw | null>;
}
