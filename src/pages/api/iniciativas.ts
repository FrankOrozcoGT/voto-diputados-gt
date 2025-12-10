import type { APIRoute } from 'astro';
import { getIniciativas } from '@/core/iniciativas';

export const GET: APIRoute = async () => {
  try {
    const iniciativas = await getIniciativas.execute();
    return new Response(JSON.stringify(iniciativas), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5 minutos
      },
    });
  } catch (error) {
    console.error('Error fetching iniciativas:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
