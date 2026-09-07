# Redes y visibilidad de Doctor Pep

## Publicaciones reales

La pestaña `videos.html` / `/videos` muestra únicamente las cuentas oficiales y las publicaciones aprobadas. Los reproductores se solicitan solo al pulsar reproducir. El perfil integrado de TikTok depende de lo que permita mostrar TikTok; no promete una selección «en tendencia» ni actualiza por sí solo las publicaciones de Instagram.

Añadir los enlaces permanentes aprobados a `data/publications.json`. Cada registro necesita:

- `id`: identificador interno único.
- `platform`: `tiktok` o `instagram`.
- `url`: enlace HTTPS permanente del video, reel o post sin parámetros. TikTok debe pertenecer a `@doctor.pep.26`; para Instagram el propietario debe confirmar que es suyo.
- `title`: título fiel a la publicación.
- `publishedAt`: fecha real `AAAA-MM-DD`.
- `ownerVerified`: `true` únicamente después de verificar autoría y datos.
- `featured`: `true` para la selección editorial de Doctor Pep. No significa popularidad ni tendencia.
- `relatedProductIds`: opcional, identificadores que existan en `data/catalog.mjs`; por ejemplo `selank-spray-nasal` o `bac-water`.
- `thumbnail`: opcional, imagen propia dentro de `/assets/`. Sin miniatura se usa el logo de Doctor Pep.

La sincronización rechaza fechas inválidas o futuras, URL incorrectas, IDs duplicados y productos desconocidos. Las publicaciones válidas se ordenan por fecha y admiten filtros de plataforma y destacados. No se han añadido publicaciones inventadas para rellenar la galería.

## Dirección pública y SEO

`data/site-config.mjs` centraliza las direcciones del paquete estático (GitHub Pages), la versión Sites y el campo opcional `googleVerification` de Search Console. Al cambiar un dominio, actualizar la dirección del alojamiento correspondiente y ejecutar `npm run sync` y `npm run build`.

Se generan `sitemap.xml` y `robots.txt` para ambas versiones, metadatos canónicos/sociales por página y datos estructurados de Organization y WebSite. El sitemap enumera páginas reales, no combinaciones de filtros, listas privadas o variantes con fragmentos. No se inventan precios ni valoraciones en los datos estructurados.

El sitemap público actual será `https://michael5757.github.io/doctor-pep-catalogo/sitemap.xml` después de publicar. Se puede enviar a Search Console. Google no utiliza `robots.txt` desde un subdirectorio de un dominio: en GitHub Pages por proyecto, el archivo debe estar en `https://michael5757.github.io/robots.txt` (sitio raíz del propietario) o en la raíz de un dominio propio. El archivo generado indica el sitemap correcto, pero subirlo solo a `/doctor-pep-catalogo/` no lo activa para el dominio raíz.

El sitio de Sites está actualmente limitado a su propietario. Mientras siga privado no será rastreable por Google. La publicación pública y cualquier cambio de audiencia se gestionan aparte; estas mejoras no cambian el acceso.

## Estadísticas reales

La integración está preparada para Google Analytics 4 y desactivada hasta conectar la cuenta del propietario. No crea un panel con visitas simuladas ni usa los contadores de un solo navegador como estadísticas globales.

1. Crear o seleccionar el flujo web de GA4 del dominio publicado.
2. Desactivar **Medición mejorada** del flujo completo. Esto evita eventos automáticos de búsquedas, cambios de historial y enlaces salientes, que podrían incluir el producto seleccionado o el texto del pedido.
3. En `data/site-config.mjs`, colocar el ID público `G-…` en `analytics.measurementId` y confirmar `analytics.enhancedMeasurementDisabled: true` solo después del paso anterior. Nunca incluir claves secretas.
4. Sincronizar y publicar. La integración funciona únicamente en HTTPS y en los orígenes configurados; no mide aperturas desde archivos locales ni pruebas en localhost.
5. Aceptar estadísticas en una visita de prueba y revisar Tiempo real en GA4. Los eventos son `page_view`, `whatsapp_click`, `social_click` y `video_open`. Los clics de WhatsApp indican intentos de abrir el canal, no mensajes enviados ni ventas.

Solo se envía el grupo de página (`catalog`, `videos` o `privacy`), URL sin búsqueda ni fragmento y título genérico. No se envían productos, contenido del mensaje, lista, palabras buscadas ni URL de procedencia. Google Analytics puede utilizar sus identificadores técnicos/cookies cuando se acepta. La decisión se puede cambiar en Privacidad; se respeta Do Not Track y Global Privacy Control. Los navegadores que bloqueen Analytics pueden no aparecer en los informes.

## Dominio personalizado

No hay un dominio propio confirmado en el proyecto. No crear un CNAME ni modificar DNS hasta que el propietario indique el dominio y el alojamiento elegido. Para GitHub Pages se configura primero el dominio en Settings → Pages y después los registros en el proveedor; para Sites se usa la conexión de dominios y los registros que devuelva. No se ha comprado ni conectado un dominio.

## Fuentes de implementación

- [Sitemaps — Google Search Central](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Ubicación de robots.txt — Google](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt)
- [Medición de páginas y eventos de historial — GA4](https://developers.google.com/analytics/devguides/collection/ga4/views)
- [Consentimiento — Google Tag Platform](https://developers.google.com/tag-platform/security/guides/consent)
- [Perfiles integrados de TikTok](https://developers.tiktok.com/doc/embed-creator-profiles)
- [Dominios propios en GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
