# ADR 0001 — MapLibre para el MVP

- Estado: aceptada provisionalmente
- Fecha: 2026-09-24

## Contexto

Necesitamos validar rápidamente la ubicación, la ortofoto, el relieve, la cámara y la importación de GPX en móvil. Construir desde el primer día una malla Three.js propia añade procesamiento geoespacial y una cadena de publicación que aún no está validada.

## Decisión

Usar MapLibre GL JS como motor del MVP y mantener abierta una futura escena Three.js para la maqueta artística. La imagen procede de PNOA y la elevación provisional de Mapterhorn.

## Consecuencias

- Obtenemos un mapa geográfico funcional con poco código.
- Dependemos temporalmente de servicios externos.
- El MVP no reproduce aún un diorama con paredes visibles.
- La transición al MDT propio será una fase explícita y medible.
