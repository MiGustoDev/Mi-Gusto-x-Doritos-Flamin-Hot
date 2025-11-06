

<div align="center">
  <h3>Mi Gusto x Flamin' Hot — CRUNCHY</h3>
  <p>Micrositio promocional responsive para el lanzamiento de la empanada CRUNCHY, con animaciones, modelo 3D, efectos visuales y medición avanzada. Desplegado en:</p>

  <a href="https://www.migusto.com.ar/crunchy" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Demo_Live-FF6B6B?style=for-the-badge" alt="https://migusto.com.ar/crunchy" />
  </a>
</div>

[![Demo](https://i.postimg.cc/yxcfF3RN/democrunch.png)](https://www.youtube.com/watch?v=_3uCLLhKz_A)

Durante 1 mes y medio trabajamos en conjunto con el equipo de Marketing, iterando sobre contenido y estética. Hubo intercambio continuo de ideas, pruebas visuales y ajustes finos hasta lograr una experiencia atractiva, coherente con campaña y marca.

---

### Características principales

- Hero con video/fondos y CTA animado (Lottie embebido)
- Sección de producto con overlay de explosión de chips, animaciones y efectos de revelado
- Visualizador 3D del producto con `model-viewer` y carga diferida por visibilidad
- Sección de ingredientes con animaciones por `IntersectionObserver`
- Fondo de “llamas” Canvas optimizado para mobile
- Confetti y líneas animadas para reforzar impacto visual
- Tracking GA4 integral: vistas de sección, interacciones, atención, CTAs y eventos por componente
- Construcción optimizada (Vite): code-splitting, vendor chunks, assets inline cuando corresponde
- Preparado para subcarpeta de deploy (`/crunchy/`)

---

### Tecnologías y librerías

- React 18 + TypeScript
- Vite 5 (build rápido, `base` configurado a `/crunchy/` para producción)
- Tailwind CSS 3
- Google `model-viewer` para el GLB
- Lottie (iframe embed) para CTA
- Google Analytics 4 (auto‑tracking y eventos por componente)
- Herramientas de optimización de imágenes (mozjpeg/pngquant) y `gltf-pipeline`

---

- Carga diferida del modelo 3D con `IntersectionObserver` y script dinámico de `model-viewer`
- Imágenes optimizadas (uso de WebP/PNG según caso) y nombres ASCII para evitar problemas en CDNs
- Animaciones CSS/Canvas con manejo de z-index y composición
- Separación de vendor chunks para mejorar caché en producción
- Linter/TypeScript para mantener calidad de código

---

### Cronograma y proceso de trabajo

El desarrollo tomó aproximadamente 1 mes y medio. Durante ese tiempo trabajamos iterativamente con el equipo de Marketing, validando dirección de arte, tipografías, paleta, densidad de efectos y animaciones. A través de demos semanales y feedback continuo, evolucionamos la estética y micro‑interacciones hasta lograr un resultado visualmente atractivo y alineado con la campaña.

---


### Créditos

- **Facundo Carrizo** — GitHub: [@facu14carrizo](https://github.com/facu14carrizo) · LinkedIn: [facu14carrizo](https://www.linkedin.com/in/facu14carrizo)
- **Ramiro Lacci** — GitHub: [@ramirolacci19](https://github.com/ramirolacci19) · LinkedIn: [ramiro-lacci](https://www.linkedin.com/in/ramiro-lacci)

---

### Licencia

© 2025 Mi Gusto. Todos los derechos reservados. Proyecto privado para uso comercial de la marca.

Mi Gusto ® es una empresa de La Honoria Alimentos SA - Argentina - CUIT: 30-71558654-8
