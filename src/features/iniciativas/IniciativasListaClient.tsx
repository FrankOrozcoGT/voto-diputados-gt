import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import type { Iniciativa } from '@/core/iniciativas/domain/models/Iniciativa';

interface IniciativasListaClientProps {
  initialData: Iniciativa[];
}

export function IniciativasListaClient({ initialData }: IniciativasListaClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVotaciones, setFilterVotaciones] = useState<'all' | 'con' | 'sin'>('all');
  const [filterCategoria, setFilterCategoria] = useState<'all' | 'economia' | 'cultura' | 'social' | 'corrupcion'>('all');

  // TanStack Query - llamado sin condicionales (respeta rules of hooks)
  const query = useQuery({
    queryKey: ['iniciativas'],
    queryFn: async () => {
      const res = await fetch('/api/iniciativas');
      if (!res.ok) throw new Error('Failed to fetch iniciativas');
      return res.json();
    },
    initialData: initialData,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });

  const iniciativas = query.data ?? initialData;
  const isLoading = query.isLoading;

  // Filtrado y búsqueda client-side
  const filtradas = useMemo(() => {
    let resultado: typeof iniciativas = iniciativas;

    // Filtrar por votaciones
    if (filterVotaciones === 'con') {
      resultado = resultado.filter((i: Iniciativa) => i.tieneVotaciones);
    } else if (filterVotaciones === 'sin') {
      resultado = resultado.filter((i: Iniciativa) => !i.tieneVotaciones);
    }

    // Filtrar por categoría
    if (filterCategoria !== 'all') {
      resultado = resultado.filter((i: Iniciativa) => {
        switch (filterCategoria) {
          case 'economia':
            return i.libertadEconomica && i.libertadEconomica !== 0;
          case 'cultura':
            return i.libertadCultural && i.libertadCultural !== 0;
          case 'social':
            return i.alcanceSocial && i.alcanceSocial !== 0;
          case 'corrupcion':
            return i.riesgoCorrupcion && i.riesgoCorrupcion !== 0;
          default:
            return true;
        }
      });
    }

    // Buscar por número, título o resumen
    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      resultado = resultado.filter(
        (i: Iniciativa) =>
          i.numero.toLowerCase().includes(termo) ||
          i.titulo.toLowerCase().includes(termo) ||
          (i.descripcion?.toLowerCase().includes(termo) ?? false)
      );
    }

    return resultado;
  }, [iniciativas, searchTerm, filterVotaciones, filterCategoria]);

  return (
    <div className="space-y-6">
      {/* Controles de búsqueda y filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <input
            type="text"
            placeholder="Buscar por número, título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <select
            value={filterVotaciones}
            onChange={(e) => setFilterVotaciones(e.target.value as 'all' | 'con' | 'sin')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las iniciativas</option>
            <option value="con">Con votaciones</option>
            <option value="sin">Sin votaciones</option>
          </select>
        </div>

        <div>
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value as 'all' | 'economia' | 'cultura' | 'social' | 'corrupcion')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            <option value="economia">Libertad Económica</option>
            <option value="cultura">Libertad Cultural</option>
            <option value="social">Alcance Social</option>
            <option value="corrupcion">Riesgo de Corrupción</option>
          </select>
        </div>

        <div className="text-right text-sm text-gray-600 py-2">
          {filtradas.length} de {iniciativas.length} iniciativas
        </div>
      </div>

      {/* Tabla de iniciativas */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtradas.map((iniciativa: Iniciativa) => (
              <tr
                key={iniciativa.numero}
                className="hover:bg-gray-50 transition cursor-pointer"
                onClick={() => {
                  window.location.href = `/iniciativas/${iniciativa.numero}`;
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                  <a href={`/iniciativas/${iniciativa.numero}`}>{iniciativa.numero}</a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(iniciativa.fecha).toLocaleDateString('es-GT')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                  <a href={`/iniciativas/${iniciativa.numero}`} className="hover:text-blue-600">
                    {iniciativa.titulo}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">
                  {iniciativa.tieneVotaciones && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Votaciones
                    </span>
                  )}
                  {iniciativa.descripcionAnalisis && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📊 Análisis
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtradas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron iniciativas que coincidan con los criterios de búsqueda.
        </div>
      )}
    </div>
  );
}
