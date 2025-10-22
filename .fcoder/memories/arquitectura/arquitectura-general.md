# Arquitectura - Voto Diputados GT

## Stack
- Astro 5.14.8 + TypeScript
- Tailwind CSS 4.1.15
- Supabase PostgreSQL 17.6

## Estructura

```
src/
├── components/        # HTML + CSS inline, reciben DTOs
├── dtos/             # Objetos de transferencia
├── repositories/     # Queries DB (solo retorna raw)
├── services/         # Convierte raw → DTO
├── orchestrators/    # Coordina repo + service
└── pages/            # Usa orchestrators
```

## Reglas
- **Pages**: Solo llaman orchestrators
- **Orchestrators**: Coordinan repo + service
- **Repositories**: Solo queries DB, retorna raw
- **Services**: Solo convierten raw → DTO
- **Components**: Solo renderizan DTOs
