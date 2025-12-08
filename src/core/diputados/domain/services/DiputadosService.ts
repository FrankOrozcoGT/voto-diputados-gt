import type { DiputadoDTO, DiputadoRaw } from '../../application/dtos/DiputadoDTO';

export class DiputadosService {
  convertirADiputadoDTO(raw: DiputadoRaw): DiputadoDTO {
    return {
      id: raw.id,
      nombreCompleto: this.formatearNombreCompleto(raw.nombre, raw.apellidos),
      iniciales: this.generarIniciales(raw.nombre, raw.apellidos),
      partido: {
        id: raw.partidos?.id || raw.partido_id,
        nombre: raw.partidos?.nombre || 'Independiente',
        prefijo: raw.partidos?.prefijo || 'IND',
        color: raw.partidos?.color || '#808080',
        slug: (raw.partidos?.prefijo || 'ind').toLowerCase().replace(/\s+/g, '-'),
      },
      ubicacion: this.formatearUbicacion(raw.distrito, raw.departamento),
      numeroLista: raw.numero_lista,
      fotoUrl: raw.foto_url,
      contacto: {
        whatsapp: raw.whatsapp,
        facebook: raw.facebook,
        twitter: raw.twitter,
        instagram: raw.instagram,
      },
      datosPersonales: {
        fechaNacimiento: raw.fecha_nacimiento,
        edad: raw.edad,
        cvUrl: raw.cv_url,
      },
      cargoBloque: raw.cargo_bloque,
    };
  }

  private formatearNombreCompleto(nombre: string, apellidos: string): string {
    return `${nombre} ${apellidos}`.trim();
  }

  private generarIniciales(nombre: string, apellidos: string): string {
    const inicial1 = nombre.charAt(0).toUpperCase();
    const inicial2 = apellidos.charAt(0).toUpperCase();
    return `${inicial1}${inicial2}`;
  }

  private formatearUbicacion(distrito: string, departamento: string): string {
    return distrito === 'Nacional' 
      ? 'Listado Nacional' 
      : `${distrito}, ${departamento}`;
  }

  convertirMultiples(raws: DiputadoRaw[]): DiputadoDTO[] {
    return raws.map(raw => this.convertirADiputadoDTO(raw));
  }
}
