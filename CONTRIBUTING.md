# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a **Diputados Guatemala**! Este proyecto busca promover la transparencia democrática a través de la tecnología.

## 🎯 Cómo Contribuir

### 🐛 Reportar Bugs

Si encuentras un problema:

1. **Verifica** que no exista un issue similar
2. **Crea un nuevo issue** usando la plantilla de bug
3. **Incluye** información detallada:
   - Pasos para reproducir el error
   - Comportamiento esperado vs actual
   - Screenshots si es posible
   - Información del navegador/dispositivo

### 💡 Sugerir Características

Para nuevas funcionalidades:

1. **Revisa** los issues existentes
2. **Crea un issue** usando la plantilla de feature request
3. **Describe** claramente:
   - El problema que resuelve
   - La solución propuesta
   - Beneficios para los usuarios

### 🔧 Contribuir con Código

#### Configuración del Entorno

1. **Fork** el repositorio
2. **Clona** tu fork:
   ```bash
   git clone https://github.com/tu-usuario/voto-diputados-gt.git
   cd voto-diputados-gt
   ```

3. **Instala** dependencias:
   ```bash
   npm install
   ```

4. **Configura** variables de entorno:
   ```bash
   cp .env.example .env
   # Edita .env con tus credenciales de Supabase
   ```

5. **Inicia** el servidor de desarrollo:
   ```bash
   npm run dev
   ```

#### Flujo de Trabajo

1. **Crea una rama** para tu cambio:
   ```bash
   git checkout -b feature/nombre-descriptivo
   # o
   git checkout -b fix/descripcion-del-bug
   ```

2. **Desarrolla** tu cambio siguiendo las convenciones del proyecto

3. **Prueba** tu código:
   ```bash
   npm run build  # Verifica que compile
   npm run preview  # Prueba la build
   ```

4. **Commit** tus cambios:
   ```bash
   git add .
   git commit -m "feat: descripción clara del cambio"
   ```

5. **Push** a tu fork:
   ```bash
   git push origin feature/nombre-descriptivo
   ```

6. **Crea un Pull Request** desde GitHub

## 📝 Convenciones

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan funcionalidad)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

**Ejemplos:**
```
feat: agregar filtro por departamento
fix: corregir problema de carga de imágenes
docs: actualizar README con instrucciones de despliegue
```

### Código

#### TypeScript
- Usar tipos explícitos siempre que sea posible
- Evitar `any` y `unknown`
- Interfaces para objetos complejos

```typescript
// ✅ Correcto
interface Diputado {
  id: string;
  nombre: string;
  partido_politico: string;
}

// ❌ Incorrecto
const diputado: any = { ... };
```

#### Componentes Astro
- Un componente por archivo
- Props tipadas con interfaces
- Estilos CSS en el mismo archivo cuando sean específicos

```astro
---
interface Props {
  diputado: Diputado;
  showDetails?: boolean;
}

const { diputado, showDetails = false } = Astro.props;
---

<div class="diputado-card">
  <!-- contenido -->
</div>

<style>
.diputado-card {
  /* estilos específicos */
}
</style>
```

#### CSS/Tailwind
- Preferir Tailwind sobre CSS custom
- Usar CSS custom solo para componentes complejos
- Clases semánticas y descriptivas

### Estructura de Archivos

```
src/
├── components/
│   └── NombreComponente/
│       ├── NombreComponente.astro
│       ├── NombreComponente.css (si es necesario)
│       └── NombreComponente.ts (tipos/lógica)
├── hooks/
│   └── useNombreHook.ts
├── lib/
│   └── utilidades.ts
├── pages/
│   └── pagina.astro
├── styles/
│   └── global.css
└── types/
    └── tipos.ts
```

## 🧪 Testing

### Tests de Componentes
```bash
# Cuando estén configurados
npm run test
```

### Tests Manuales
- Probar en diferentes navegadores
- Verificar responsividad en móvil
- Comprobar accesibilidad básica

## 📋 Checklist para Pull Requests

Antes de enviar tu PR, verifica:

- [ ] El código compila sin errores
- [ ] No hay errores de TypeScript
- [ ] Los cambios están probados manualmente
- [ ] Se actualizó la documentación si es necesario
- [ ] Los commits siguen las convenciones
- [ ] La descripción del PR es clara

## 🎨 Diseño y UX

### Principios
- **Simplicidad**: Interfaz clara y directa
- **Accesibilidad**: Usar etiquetas semánticas, contraste adecuado
- **Responsividad**: Mobile-first design
- **Performance**: Optimizar imágenes y cargas

### Recursos
- Paleta de colores del proyecto
- Tipografía: Sistema de fuentes del navegador
- Iconos: Preferir emoji o símbolos Unicode

## 🚫 Qué NO Hacer

- No hacer cambios masivos sin discusión previa
- No incluir dependencias innecesarias
- No romper funcionalidad existente
- No ignorar las convenciones del proyecto
- No hacer commits directos a `main`

## 🎉 Reconocimiento

Todos los contribuidores aparecerán en:
- README del proyecto
- Página de créditos (futura implementación)
- Release notes cuando corresponda

## 📞 Ayuda

¿Necesitas ayuda?

- 📖 Lee la [documentación completa](../README.md)
- 🐛 Revisa los [issues existentes](../../issues)
- 💬 Abre un [issue de discusión](../../issues/new)

## 📜 Código de Conducta

Este proyecto se rige por nuestro [Código de Conducta](CODE_OF_CONDUCT.md). Al participar, aceptas cumplir con estas directrices.

---

¡Gracias por contribuir a la transparencia democrática en Guatemala! 🇬🇹