export interface DiputadoDTO {
  id: string;
  nombreCompleto: string;
  iniciales: string;
  partido: {
    id: string;
    nombre: string;
    prefijo: string;
    color: string;
    slug: string;
  };
  ubicacion: string;
  numeroLista: number;
  fotoUrl?: string;
  contacto: {
    email?: string;
    telefono?: string;
    whatsapp?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  datosPersonales: {
    fechaNacimiento?: string;
    edad?: number;
    cvUrl?: string;
  };
  cargoBloque?: string;
}

export interface DiputadoRaw {
  id: string;
  nombre: string;
  apellidos: string;
  partido_id: string;
  distrito: string;
  departamento: string;
  numero_lista: number;
  foto_url?: string;
  whatsapp?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  fecha_nacimiento?: string;
  edad?: number;
  cv_url?: string;
  cargo_bloque?: string;
  activo: boolean;
  // JOIN con partidos
  partidos?: {
    id: string;
    nombre: string;
    prefijo: string;
    color: string;
  };
}
