# Imágenes del catálogo Doctor Pep

Estas imágenes son maquetas ilustrativas, no fotografías de existencias ni etiquetas verificadas del fabricante.

- Una imagen por producto y presentación. Las 41 presentaciones visibles del catálogo tienen una imagen propia; los nombres de archivo coinciden con `data/catalog.mjs`.
- Nombres y contenidos se muestran como identificadores del catálogo, no como instrucciones de dosificación.
- Las proporciones, colores y envases son conceptuales; no acreditan dimensiones o compatibilidad reales.
- Las imágenes iniciales de TIRZEPATIDE 10 mg y NAD 500 mg se conservan sin modificación.
- Las nuevas imágenes se generan con la herramienta integrada `image_gen`, siguiendo la habilidad `imagegen`. No se utiliza el modo CLI/API alternativo.
- Los prompts exactos de cada nueva imagen están en `data/product-image-prompts.json` en la raíz del proyecto.
- La conversión a WebP optimiza tamaño y carga sin retocar nombres, etiquetas o contenido del diseño.

Las imágenes definitivas deben guardarse aquí. `npm run sync` las integra en `index.html` y en la versión web. La revisión completa se ejecuta con `node scripts/check-product-images.mjs` después de sincronizar.
