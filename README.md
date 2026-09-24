# Nava de Ordunte 3D

Laboratorio **abierto, comunitario y no comercial** para narrar Nava de Ordunte y el Valle de Mena mediante relieve 3D, ortofotografía pública, rutas GPX, fotografía, vídeo y futuros enclaves reconstruidos en 3D.

> Estado: **MVP v0.2 — infraestructura y diagnóstico móvil**. No es todavía la maqueta artística final.

## Ver el prototipo

**Web:** https://josebadg.github.io/nava-ordunte-3d/

La aplicación carga un terreno interactivo alrededor de la plaza de Nava de Ordunte, permite revelar el valle con una cámara inclinada, alternar ortofoto/relieve y abrir un GPX sin subirlo a ningún servidor.

## La ambición

El objetivo no es dibujar una línea sobre un mapa genérico. Queremos construir una experiencia geográfica y narrativa que:

- revele el efecto de anfiteatro entre los Montes de Ordunte y la Peña de Mena;
- preserve y comparta rutas caminadas por la comunidad;
- conecte paisaje, calzadas históricas, Camino de Santiago, canales hidroeléctricos y memoria local;
- combine vuelos de cámara, fotografías, vídeo y, cuando aporte valor, Gaussian splats de enclaves concretos;
- documente cada decisión para que otras comunidades rurales puedan reproducir el método.

## Arquitectura actual

| Capa | Tecnología | Motivo |
|---|---|---|
| Render cartográfico | MapLibre GL JS 5.24 | WebGL, terreno, cámara y capas abiertas |
| Imagen | WMTS PNOA máxima actualidad (IGN/CNIG) | Ortofotografía pública y oficial |
| Elevación del MVP | Mapterhorn, teselas Terrarium | Arranque rápido sin alojar aún un MDT propio |
| Rutas | GPX leído en el navegador | Privacidad y prototipado sin backend |
| Hosting | GitHub Pages | Código y proceso públicos |

MapLibre se carga con **dos CDN alternativos**. Si ambos fallan o WebGL no está disponible, la página muestra una ortofoto oficial de respaldo y un diagnóstico copiable, en lugar de quedarse vacía.

## Fuentes y atribución

- Ortofotos PNOA máxima actualidad: © IGN/CNIG, servicio WMTS, licencia indicada por el servicio **CC BY 4.0 scne.es**.
- Elevación provisional: © Mapterhorn y las fuentes detalladas en https://mapterhorn.com/attribution/.
- Motor: MapLibre GL JS, licencia BSD-3-Clause.

No se utilizan teselas de Google. Antes de incorporar una fuente nueva se documentarán licencia, atribución, límites de caché y compatibilidad con distribución pública.

## Hoja de ruta

### Fase 0 — Base reproducible

- [x] Repositorio y GitHub Pages públicos.
- [x] Punto de partida en la plaza.
- [x] Ortofoto PNOA y terreno 3D provisional.
- [x] Importación local de GPX.
- [x] Diagnóstico visible y respaldo 2D.
- [ ] Pruebas automatizadas en Safari/iOS, Chromium y Firefox.
- [ ] Auditoría de accesibilidad y rendimiento.

### Fase 1 — Terreno soberano

- [ ] Delimitar el recorte narrativo del valle.
- [ ] Identificar y descargar MDT del CNIG para el área.
- [ ] Reproyectar, unir, recortar y validar el modelo con GDAL/QGIS.
- [ ] Crear pirámide de detalle y teselas propias.
- [ ] Comparar alturas con hitos conocidos y documentar incertidumbre.

### Fase 2 — Maqueta

- [ ] Terreno con borde visible y materiales propios.
- [ ] Agua separada del MDT para el embalse.
- [ ] Iluminación, sombras, atmósfera y dirección artística.
- [ ] Vista inicial que explique el “efecto cráter”.
- [ ] Rendimiento adaptativo para móvil y escritorio.

### Fase 3 — Rutas narrativas

- [ ] Catálogo versionado de rutas y metadatos.
- [ ] Perfil de elevación, distancia, desnivel y puntos de interés.
- [ ] Editor de hitos, fotografías y fragmentos de vídeo.
- [ ] Travelings diseñados, no simples seguimientos automáticos del GPX.
- [ ] Modo accesible sin animación y ficha descargable de cada ruta.

### Fase 4 — Patrimonio inmersivo

- [ ] Piloto fotogramétrico/Gaussian splat de un enclave pequeño.
- [ ] Flujo de captura móvil, limpieza, compresión y georreferenciación.
- [ ] Integración progresiva con límites de peso y dispositivos compatibles.
- [ ] Fichas de procedencia, permisos y conservación digital.

## Método académico

Cada fase producirá cuatro evidencias públicas:

1. **Pregunta:** qué intentamos resolver.
2. **Datos:** origen, licencia, resolución y límites.
3. **Experimento:** código y parámetros reproducibles.
4. **Evaluación:** capturas, métricas, errores y decisión final.

Las decisiones importantes se registrarán como ADR en `docs/decisions/`. Los fallos no se ocultarán: formarán parte del aprendizaje y del manual replicable.

## Ejecutar localmente

```bash
git clone https://github.com/JosebaDG/nava-ordunte-3d.git
cd nava-ordunte-3d
python3 -m http.server 8080
```

Abre `http://localhost:8080`. La aplicación necesita Internet mientras use los servicios remotos de imagen y elevación.

## Cómo colaborar

- Abre un issue para errores, propuestas de rutas, patrimonio o documentación.
- No publiques coordenadas de elementos sensibles, propiedades privadas o patrimonio vulnerable.
- Para contribuir código, crea una rama y un pull request pequeño y explicable.
- Un GPX abierto desde la interfaz permanece en el dispositivo; solo entrará al repositorio mediante una contribución explícita y revisada.

Consulta `CONTRIBUTING.md` y `docs/ROADMAP.md` para el flujo completo.

## Ética

Este proyecto pretende ampliar el conocimiento del territorio, no convertirlo en un parque temático digital. Priorizaremos consentimiento, contexto histórico, seguridad de senderistas, protección ambiental, accesibilidad y atribución correcta.
