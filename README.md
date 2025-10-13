## Medición GA4 implementada en el sitio

Este proyecto integra Google Analytics 4 con auto‑tracking global y métricas por componente/CTA. A continuación el resumen de eventos y disparadores:

- Pageview
  - `page_view`: enviado al cargar la página (sin `send_page_view` automático).

- Interacciones globales
  - `link_click`: clics en enlaces/salidas (navbar y redes). Parámetros: `link_url`, `link_domain`, `location`, `outbound`, `network` (si aplica).
  - `click`: clics genéricos en botones/enlaces detectados por el auto‑tracking global. Parámetros: `element_tag`, `element_id`, `element_text`, `href`, `page_path`.

- Scroll y atención
  - `scroll_depth`: milestones de scroll 25/50/75/90/100 (%). Parámetros: `percent`, `page_path`.
  - `first_interaction`: tiempo hasta la primera interacción del usuario. Parámetro: `time_to_first_interaction_ms`.
  - `engagement_ping`: ping periódico de engagement activo cada 10s. Parámetro: `engagement_time_msec` (acumulado aproximado).
  - `attention_milestone`: hitos de atención a 10s, 30s, 1m, 2m, 5m. Parámetro: `engagement_time_msec`.

- Vistas de secciones y componentes
  - `section_view`: cuando un elemento con `data-section` es visible ≥50% (hero, product, collab, cta).
  - `component_mount` / `component_unmount`: ciclo de vida de `Hero`, `Navbar`, `ProductShowcase`, `Collaboration`, `CallToAction`.
  - `component_view`: componente visible ≥50%.
  - `component_click`: clics dentro del contenedor del componente.

- CTAs y objetivos
  - `select_promotion`: CTA principal del hero y logo del producto.
    - Parámetros (ejemplos): `promotion_id` (p.ej. `hero_cta`, `product_logo`), `promotion_name`, `creative_name`, `location_id`.
  - `generate_lead`: envío de newsletter en `ProductShowcase`.
    - Parámetros: `method` = `newsletter`, `status` = `success` | `error` | `invalid` | `network_error`, `http` (si hubo respuesta con error).

Notas
- La configuración del ID se realiza con `VITE_GA_ID` en el entorno. Si no está definido, la capa de analytics no se inicializa.
- Los helpers están en `src/analytics.ts` y se inicializan en `src/main.tsx`.

