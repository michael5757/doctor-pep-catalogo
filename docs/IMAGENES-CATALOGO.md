# Imágenes temporales del catálogo Doctor Pep

La portada y las 36 tarjetas utilizan imágenes ilustrativas. Son referencias del tipo de envase o accesorio, no fotografías de unidades en venta ni evidencia de su composición, marca, concentración o disponibilidad.

## Dirección visual y referencias de internet

- [The Ordinary — Serums](https://theordinary.com/en-us/category/skincare/serums): referencia para fotografía aislada, nombres visibles y jerarquía de catálogo.
- [Aesop — Skin Care](https://www.aesop.com/skin-care.html): referencia para espacios, ritmo editorial y presentación de producto.

Se investigaron fotografías de Pexels y Wikimedia Commons, pero las candidatas mostraban marcas o medicamentos ajenos. No se incorporan esas fotos al sitio. Las imágenes finales de prueba son originales generadas con la herramienta integrada ImageGen, sin etiquetas de marcas ni texto comercial. No se extrajo contenido de TikTok o Instagram.

## Archivos que consume el sitio

Los archivos se encuentran en `assets/placeholders/`. El proceso de sincronización copia únicamente WebP a `public/assets/placeholders/`.

| Archivo | Ubicación y uso |
| --- | --- |
| `hero-1280.webp`, `hero-720.webp` | Portada, dos tamaños de la misma composición |
| `vial.webp` | Péptidos y fórmulas, compartido temporalmente |
| `water.webp` | Agua bacteriostática, distintos formatos |
| `syringe.webp` | Jeringa y jeringuilla |
| `pen.webp` | Aplicador Pen Peptide |
| `cartridge.webp` | Cartucho |
| `wipe.webp` | Alcohol pre pad |
| `roller.webp` | Derma Roller |
| `needle.webp` | Aguja Pen |

## Reemplazo por fotografías propias

1. Guardar las fotos definitivas en `assets/placeholders/` como WebP, preferentemente con encuadre cuadrado y al menos 640 × 640 px. Se puede utilizar otro nombre por producto, por ejemplo `bpc-157-real.webp`.
2. En `index.html`, localizar la tarjeta por su nombre y cambiar el `src` de la imagen dentro de `figure.product-photo`. Ajustar `alt`, `width` y `height` a la nueva fotografía. Una foto compartida no debe reemplazarse globalmente si corresponde solo a un producto.
3. Quitar “Imagen ilustrativa” únicamente de las tarjetas con fotografía propia confirmada. La ficha y la miniatura de Mi lista leen automáticamente la imagen de la tarjeta.
4. Para la portada, actualizar también `srcset` y la leyenda si se reemplaza por una fotografía propia.
5. Ejecutar el flujo habitual de sincronización y compilación. No editar manualmente `public/` ni `app/site-body.generated.ts`.

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
