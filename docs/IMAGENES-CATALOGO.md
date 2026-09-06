# Imágenes temporales del catálogo Doctor Pep

La portada y las 36 tarjetas utilizan imágenes ilustrativas. Las 41 presentaciones del catálogo ya cuentan con un recurso propio en `assets/products/`; son referencias visuales del tipo de envase o accesorio, no fotografías de unidades en venta ni evidencia de su composición, marca, concentración o disponibilidad.

## Dirección visual y referencias de internet

- [The Ordinary — Serums](https://theordinary.com/en-us/category/skincare/serums): referencia para fotografía aislada, nombres visibles y jerarquía de catálogo.
- [Aesop — Skin Care](https://www.aesop.com/skin-care.html): referencia para espacios, ritmo editorial y presentación de producto.

Se investigaron fotografías de Pexels y Wikimedia Commons, pero las candidatas mostraban marcas o medicamentos ajenos. No se incorporan esas fotos al sitio. Las imágenes finales de prueba son originales generadas con la herramienta integrada ImageGen, sin etiquetas de marcas ni texto comercial. No se extrajo contenido de TikTok o Instagram.

## Archivos que consume el sitio

Las tarjetas del catálogo consumen los WebP de `assets/products/`, con nombres derivados del producto y la presentación. El proceso de sincronización los copia a `public/assets/products/`. Los recursos genéricos de `assets/placeholders/` se conservan únicamente como respaldo para la maqueta original.

| Archivo | Ubicación y uso |
| --- | --- |
| `assets/products/*.webp` | Una imagen por producto y presentación, con texto identificativo cuando hace falta distinguir formatos |
| `assets/placeholders/hero-1280.webp`, `hero-720.webp` | Recursos genéricos heredados de la maqueta; la portada actual usa los activos editoriales de `assets/` |

## Reemplazo por fotografías propias

1. Guardar cada foto definitiva en `assets/products/` como WebP, preferentemente con encuadre cuadrado y al menos 640 × 640 px. Usar el patrón `producto-presentacion.webp`, por ejemplo `bpc-157-10-mg.webp`.
2. Actualizar la ruta correspondiente en `data/catalog.mjs`; no editar manualmente `index.html`, `public/` ni `app/site-body.generated.ts`. Una foto compartida no debe reemplazarse globalmente si corresponde solo a un producto.
3. Quitar “Imagen ilustrativa” únicamente de las tarjetas con fotografía propia confirmada. La ficha y la miniatura de Mi lista leen automáticamente la imagen de la tarjeta.
4. Para la portada, actualizar también el recurso editorial de `assets/` y la leyenda si se reemplaza por una fotografía propia.
5. Ejecutar el flujo habitual de sincronización y compilación.

## Prompts de generación

Herramienta: ImageGen integrada; modo generación, sin API/CLI de respaldo. Activos optimizados posteriormente a WebP sin cambiar la composición.

Estilo compartido: product-mockup; fotografía ilustrativa de estudio, materiales realistas, luz suave, fondo gris azulado claro #edf2f6, objeto completo centrado ocupando aproximadamente 60–70% del cuadro, sin palabras, cifras, logos ni marcas de agua.

- Vial: un vial transparente sellado de 10 ml, cápsula de aluminio plateado y tapa azul cobalto, etiqueta blanca vacía con una línea azul, pequeña cantidad de polvo blanco, vista frontal cuadrada.
- Portada: naturaleza muerta horizontal de tres viales sellados (dos tapas azules y una plateada), etiquetas blancas con línea azul y una caja blanca sin marca; superficie azul hielo, luz natural lateral y sombras suaves, cámara a la altura de los productos.
- Jeringa: jeringa desechable de plástico transparente de 3 ml, émbolo negro y aguja protegida, posición diagonal; sin estructura metálica de jeringa dental.
- Aplicador: aplicador reutilizable azul marino mate, cerrado, diagonal, pequeña ventana de dosis vacía y sin marca.
- Cartucho: cartucho vacío de cristal transparente, borde metálico y tapón de goma, diagonal.
- Toallita: sobre blanco sellado de lámina junto a una toallita blanca doblada, sin texto.
- Rodillo: rodillo dérmico genérico con mango blanco y cabezal azul, diagonal, sin personas.
- Agua: vial transparente sellado con líquido transparente, tapa plateada, etiqueta blanca vacía, sin polvo.
- Aguja Pen: conjunto pequeño de aguja para aplicador, capuchón protector al lado, base azul/transparente, sin personas.
