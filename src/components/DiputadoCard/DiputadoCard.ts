export interface DiputadoCardProps {
  diputado: {
    id: string;
    nombre: string;
    apellidos: string;
    partido_politico: string;
    distrito: string;
    departamento: string;
    numero_lista: number;
    foto_url?: string;
  };
}

export function formatearNombreCompleto(nombre: string, apellidos: string): string {
  return `${nombre} ${apellidos}`;
}

export function obtenerIniciales(nombre: string, apellidos: string): string {
  const primeraLetraNombre = nombre.charAt(0).toUpperCase();
  const primeraLetraApellido = apellidos.split(' ')[0]?.charAt(0).toUpperCase() || '';
  return `${primeraLetraNombre}${primeraLetraApellido}`;
}

export function formatearUbicacion(distrito: string, departamento: string): string {
  return `${distrito}, ${departamento}`;
}