export interface DiputadoDTO {
  id: string;
  nombreCompleto: string;
  iniciales: string;
  partido: string;
  ubicacion: string;
  numeroLista: number;
  fotoUrl?: string;
  email?: string;
  telefono?: string;
}

export interface DiputadoRaw {
  id: string;
  nombre: string;
  apellidos: string;
  partido_politico: string;
  distrito: string;
  departamento: string;
  numero_lista: number;
  foto_url?: string;
  email?: string;
  telefono?: string;
  activo: boolean;
}
