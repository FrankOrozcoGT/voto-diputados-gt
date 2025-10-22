# 🏛️ Diputados Guatemala

> Sistema web para visualizar información de los diputados del Congreso de la República de Guatemala

[![Astro](https://img.shields.io/badge/Built%20with-Astro-ff5d01?style=flat&logo=astro)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)

## 📖 Descripción

**Diputados Guatemala** es una plataforma web que permite a los ciudadanos guatemaltecos acceder fácilmente a información actualizada sobre los diputados del Congreso de la República. El sistema proporciona datos transparentes sobre representantes políticos, incluyendo su afiliación partidaria, distrito electoral y departamento que representan.

### ¿Por qué este proyecto?

- **Transparencia democrática**: Facilitar el acceso a información pública sobre representantes políticos
- **Tecnología moderna**: Demostrar el uso de tecnologías web actuales en proyectos de interés social
- **Experiencia de usuario**: Ofrecer una interfaz intuitiva y responsiva para consulta ciudadana

## ✨ Características

- 📋 **Listado completo** de diputados activos
- 🔍 **Búsqueda y filtrado** por nombre, partido o ubicación
- 📱 **Diseño responsivo** optimizado para móvil y desktop
- ⚡ **Carga rápida** con renderizado del lado del servidor
- 🎨 **Interfaz moderna** con componentes reutilizables
- 📊 **Datos en tiempo real** conectados a Supabase

## 🛠️ Tecnologías

- **Frontend**: [Astro](https://astro.build/) - Framework web moderno
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) - JavaScript con tipos
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitario
- **Base de datos**: [Supabase](https://supabase.com/) - Backend como servicio
- **Hosting**: [Vercel](https://vercel.com/) - Plataforma de despliegue

## 🚀 Inicio rápido

### Prerrequisitos

- Node.js 18+ instalado
- Cuenta en Supabase (gratuita)
- Git

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/voto-diputados-gt.git
   cd voto-diputados-gt
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Edita `.env` con tus credenciales de Supabase.

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

¡Visita [http://localhost:4321](http://localhost:4321) para ver la aplicación!

## 📁 Estructura del proyecto

```
src/
├── components/
│   └── DiputadoCard/      # Componente de tarjeta de diputado
├── hooks/
│   └── useListadoDiputados.ts  # Hook para manejo de datos
├── lib/
│   └── supabase.ts        # Configuración de Supabase
├── pages/
│   └── index.astro        # Página principal
├── styles/
│   └── global.css         # Estilos globales
└── types/
    └── diputado.ts        # Tipos TypeScript
```

## 🔧 Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Construir para producción
npm run preview    # Previsualizar construcción
npm run astro      # Comandos CLI de Astro
```

## 🌐 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio en [vercel.com](https://vercel.com)
2. Configura las variables de entorno
3. ¡Despliega automáticamente!

### Otras plataformas

- **Netlify**: Compatible con configuración automática
- **GitHub Pages**: Requiere configuración adicional para SSR

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar el proyecto:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Confirma tus cambios (`git commit -m 'Agrega nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## � Reconocimientos

- **Congreso de Guatemala** - Por la información pública disponible
- **Supabase** - Por proporcionar una excelente plataforma de backend
- **Astro Team** - Por crear un framework increíble
- **Comunidad open source** - Por las herramientas y recursos

## 📞 Soporte

¿Tienes preguntas o problemas? 

- 🐛 [Reporta un bug](../../issues/new?template=bug_report.md)
- 💡 [Solicita una característica](../../issues/new?template=feature_request.md)
- 📧 [Contacto directo](mailto:tu-email@ejemplo.com)

---

<p align="center">
  <strong>Desarrollado con ❤️ para promover la transparencia democrática en Guatemala</strong>
</p>

<p align="center">
  <a href="#top">⬆️ Volver arriba</a>
</p>
