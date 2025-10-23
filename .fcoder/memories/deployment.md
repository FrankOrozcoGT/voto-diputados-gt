# Deployment a Producción - Voto Diputados GT

## 🚀 Plataforma: Vercel

El proyecto está configurado para desplegar en Vercel con SSR automático.

## Pre-requisitos

- Cuenta en Vercel (gratis)
- Proyecto conectado a GitHub
- Variables de entorno configuradas

## Variables de Entorno

### En Vercel Dashboard

1. Ve a tu proyecto → **Settings** → **Environment Variables**
2. Agrega las siguientes variables:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**¿Dónde obtener estos valores?**
- Supabase Dashboard → Project Settings → API
- `SUPABASE_URL` = Project URL
- `SUPABASE_ANON_KEY` = anon/public key

### Ámbitos (Scopes)

- **Production**: Variables para producción
- **Preview**: Variables para previews (ramas)
- **Development**: Variables para desarrollo local

**Recomendación**: Marca las 3 opciones para todas las variables.

## Proceso de Deployment

### 1. Commit y Push

```bash
# Verificar cambios
git status

# Agregar archivos
git add .

# Commit con mensaje descriptivo
git commit -m "feat: migrar backend a src/backend/ con alias @backend/"

# Push a GitHub
git push origin master
```

### 2. Deployment Automático

Vercel detecta el push automáticamente y:

1. ✅ Instala dependencias (`npm install`)
2. ✅ Ejecuta build (`npm run build`)
3. ✅ Despliega a producción
4. ✅ Asigna URL de producción

**Tiempo estimado**: 1-2 minutos

### 3. Verificar Deployment

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Verifica el estado en **Deployments**
4. Haz clic en la URL de producción para probar

## Estructura de Deployments

```
master branch
    ↓
Production Deployment
    ↓
https://voto-diputados-gt.vercel.app

otras ramas
    ↓
Preview Deployment
    ↓
https://voto-diputados-gt-git-{branch}.vercel.app
```

## Comandos Útiles

### Build Local (Verificar antes de push)

```bash
# Construir para producción
npm run build

# Previsualizar build
npm run preview
```

**IMPORTANTE**: Si `npm run build` falla localmente, también fallará en Vercel.

### Logs de Deployment

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Ver logs en tiempo real
vercel logs
```

## Checklist Pre-Deployment

Antes de hacer push a producción, verifica:

- [ ] ✅ `npm run build` funciona sin errores
- [ ] ✅ `npm run preview` muestra el sitio correctamente
- [ ] ✅ Variables de entorno configuradas en Vercel
- [ ] ✅ Cambios commiteados con mensaje descriptivo
- [ ] ✅ Código revisado (sin console.logs innecesarios)

## Troubleshooting

### Error: "Module not found"

**Causa**: Imports incorrectos o alias mal configurado

**Solución**:
1. Verifica `tsconfig.json` tenga los paths correctos
2. Verifica imports usen `@backend/` o `@/`
3. No uses imports relativos profundos (`../../../../`)

### Error: "Supabase connection failed"

**Causa**: Variables de entorno no configuradas

**Solución**:
1. Vercel Dashboard → Settings → Environment Variables
2. Verifica `SUPABASE_URL` y `SUPABASE_ANON_KEY`
3. Redeploy desde Vercel Dashboard

### Build exitoso pero página en blanco

**Causa**: Error en runtime no detectado en build

**Solución**:
1. Vercel Dashboard → Deployment → Function Logs
2. Identifica el error en logs
3. Revisa orchestrators/repositories (punto de falla común)

## Rollback

Si el deployment falla o tiene problemas:

### Opción 1: Rollback en Vercel

1. Vercel Dashboard → Deployments
2. Encuentra el deployment anterior que funcionaba
3. Click en **⋮** → **Promote to Production**

### Opción 2: Revert Git

```bash
# Ver historial de commits
git log --oneline

# Revertir al commit anterior
git revert HEAD

# Push para deployar versión anterior
git push origin master
```

## Dominio Personalizado

### Configurar dominio propio

1. Vercel Dashboard → Settings → Domains
2. Click **Add Domain**
3. Ingresa tu dominio (ej: `diputados.gt`)
4. Sigue instrucciones para configurar DNS

### DNS Records (Ejemplo)

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

## Monitoreo Post-Deployment

### Verificaciones

1. **Funcionalidad**:
   - [ ] Página principal carga
   - [ ] Lista de partidos se muestra
   - [ ] Página de diputados por partido funciona
   - [ ] Datos vienen de Supabase

2. **Performance**:
   - [ ] Lighthouse Score > 90
   - [ ] Tiempo de carga < 2s
   - [ ] Sin errores en consola del navegador

3. **SEO**:
   - [ ] Meta tags presentes
   - [ ] Títulos descriptivos
   - [ ] Open Graph tags configurados

## URLs del Proyecto

- **Producción**: https://voto-diputados-gt.vercel.app
- **GitHub**: https://github.com/FrankOrozcoGT/voto-diputados-gt
- **Vercel Dashboard**: https://vercel.com/frank-orozco/voto-diputados-gt

## Notas Importantes

1. **SSR Automático**: Vercel detecta que es Astro y configura SSR automáticamente
2. **Edge Functions**: Las páginas se ejecutan en Edge (rápido globalmente)
3. **Caching**: Vercel cachea assets estáticos automáticamente
4. **Zero Config**: No necesitas `vercel.json` con Astro

## Próximos Pasos

Después del deployment exitoso:

1. Configurar Analytics (Vercel Analytics)
2. Agregar monitoreo de errores (Sentry)
3. Configurar dominio personalizado
4. Implementar CI/CD con tests automáticos
