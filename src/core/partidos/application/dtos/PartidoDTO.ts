export interface PartidoDTO {
  id: string;
  nombre: string;
  prefijo: string;
  slug: string;
  color: string;
  logoUrl: string | null;
  totalDiputados: number;
  colorGradient: string;
  redesSociales: {
    facebook: string | null;
    twitter: string | null;
    instagram: string | null;
    youtube: string | null;
    website: string | null;
  };
}
