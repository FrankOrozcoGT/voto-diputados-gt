# Arquitectura - Voto Diputados GT

## Stack
- Astro 5.14.8 + TypeScript (SSR/SSG)
- Tailwind CSS 4.1.15
- Supabase PostgreSQL 17.6

## Estructura

```
src/
├── lib/                     # Utilidades compartidas
│   └── supabase.ts
├── backend/                 # Backend organizado por caso de uso
│   └── {caso-uso}/
│       ├── dtos/
│       │   └── {entidad}.dto.ts
│       ├── repositories/
│       │   └── {entidad}.repository.ts
│       ├── services/
│       │   └── {entidad}.service.ts
│       └── orchestrators/
│           └── {caso-uso}.orchestrator.ts
└── pages/                   # Frontend por caso de uso
    └── {caso-uso}/
        ├── _components/     # Componentes (prefijo _ para ignorar routing)
        │   └── {Componente}/
        │       ├── {Componente}.astro    # HTML
        │       ├── _{Componente}.ts      # Lógica
        │       └── _{Componente}.types.ts # Tipos
        └── {page}.astro
```

**IMPORTANTE**: 
- Carpetas de componentes en `pages/` deben tener prefijo `_` (ej: `_components/`)
- Archivos `.ts` dentro también necesitan prefijo `_` (ej: `_Card.ts`)
- Archivos `.astro` NO necesitan prefijo (se importan, no se enrutan)

## Imports con Alias

Configurado en `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@backend/*": ["src/backend/*"]
    }
  }
}
```

**Uso:**
```ts
// ✅ Backend con alias específico
import { PartidosOrchestrator } from '@backend/partidos/orchestrators/partidos.orchestrator';
import type { PartidoDTO } from '@backend/partidos/dtos/partido.dto';

// ✅ Lib compartidas con alias genérico
import { supabase } from '@/lib/supabase';

// ❌ NO usar imports relativos
import { PartidosOrchestrator } from '../../backend/partidos/orchestrators/partidos.orchestrator';
```

## Separación de Responsabilidades

### Backend (src/backend/{caso-uso}/)

Organizado por caso de uso, cada uno con su backend completo:

1. **DTOs** (`dtos/`): Interfaces TypeScript
   - Define shape de datos
   - Un archivo por entidad

2. **Repositories** (`repositories/`): Queries DB
   - Solo consultas a Supabase
   - Retorna raw data (sin transformar)
   - Un archivo por entidad

3. **Services** (`services/`): Transformación
   - Convierte raw → DTO
   - Sin lógica de negocio
   - Un archivo por entidad

4. **Orchestrators** (`orchestrators/`): Coordinación
   - Coordina repo + service
   - Maneja errores
   - Lógica de negocio
   - Un archivo por caso de uso

**Flujo**: Repository → Service → Orchestrator → Page

### Frontend (src/pages/{caso-uso}/)

Componentes específicos del caso de uso dentro de `pages/`:

**Estructura del componente:**
- **`.astro`**: Template HTML + imports (SIN prefijo `_`)
- **`_.ts`**: Lógica y funciones helper (CON prefijo `_`)
- **`_.types.ts`**: Interfaces de Props (CON prefijo `_`)

**¿Por qué el prefijo `_`?**
Astro convierte TODO en `pages/` en rutas. El prefijo `_` le indica a Astro que ignore estos archivos del routing.

**Ejemplo:**
```
pages/partidos/components/PartidoCard/
├── PartidoCard.astro      # ✅ Se importa, NO se convierte en ruta
├── _PartidoCard.ts        # ✅ Se ignora del routing
└── _PartidoCard.types.ts  # ✅ Se ignora del routing
```

**Imports:**
```ts
// En el .astro
import type { Props } from './_PartidoCard.types';
import { helper } from './_PartidoCard';
```

**Páginas** (`.astro`): Solo llaman orchestrators y renderizan

**REGLA**: Componentes dentro de su página en `pages/`, archivos `.ts` con prefijo `_`.
