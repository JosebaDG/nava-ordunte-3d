'use strict';

const CONFIG = {
  version: '0.2.0',
  plaza: [-3.269525, 43.1545417],
  overview: { center: [-3.272, 43.145], zoom: 12.35, pitch: 74, bearing: -28 },
  mapLibre: [
    'https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.js',
    'https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js'
  ],
  orthophoto: 'https://www.ign.es/wmts/pnoa-ma?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=OI.OrthoimageCoverage&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg',
  terrain: 'https://tiles.mapterhorn.com/{z}/{x}/{y}.webp',
  fallback: 'https://www.ign.es/wms-inspire/pnoa-ma?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=OI.OrthoimageCoverage&STYLES=&CRS=EPSG:4326&BBOX=43.11,-3.33,43.19,-3.21&WIDTH=1200&HEIGHT=1000&FORMAT=image/jpeg'
};

const ui = {
  status: document.querySelector('#status'), text: document.querySelector('#status-text'),
  log: document.querySelector('#diagnostic-log'), details: document.querySelector('#diagnostics'),
  fallback: document.querySelector('#fallback'), fallbackImage: document.querySelector('#fallback-image'),
  fly: document.querySelector('#fly'), home: document.querySelector('#home'), layer: document.querySelector('#layer'),
  gpx: document.querySelector('#gpx'), retry: document.querySelector('#retry'), copy: document.querySelector('#copy-log')
};
let map = null;
let mapReady = false;
let plainRelief = false;
const logLines = [];

function log(message, data) {
  const line = `${new Date().toLocaleTimeString('es-ES')} · ${message}${data ? ` · ${String(data)}` : ''}`;
  logLines.push(line);
  ui.log.textContent = logLines.join('\n');
  console.info('[Nava 3D]', message, data || '');
}
function status(message, type = 'loading') {
  ui.text.textContent = message;
  ui.status.className = `status ${type}`;
  log(message);
}
function enableControls(enabled) {
  [ui.fly, ui.home, ui.layer].forEach(button => { button.disabled = !enabled; });
}
function loadScript(url, timeout = 9000) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => { script.remove(); reject(new Error(`Tiempo agotado: ${url}`)); }, timeout);
    script.src = url;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => { clearTimeout(timer); resolve(url); };
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error(`No responde: ${url}`)); };
    document.head.appendChild(script);
  });
}
async function ensureMapLibre() {
  if (window.maplibregl) return;
  for (const source of CONFIG.mapLibre) {
    try {
      status(`Conectando con el motor 3D (${new URL(source).hostname})…`);
      await loadScript(source);
      if (window.maplibregl) { log('Motor cargado', source); return; }
    } catch (error) { log('CDN fallido', error.message); }
  }
  throw new Error('Los dos servidores del motor 3D han fallado o han sido bloqueados.');
}
function webGLReport() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return gl ? `WebGL disponible: ${gl.getParameter(gl.VERSION)}` : 'WebGL no disponible';
  } catch (error) { return `Prueba WebGL fallida: ${error.message}`; }
}
function showFallback(reason) {
  log('Activando respaldo 2D', reason);
  ui.fallbackImage.src = CONFIG.fallback;
  ui.fallback.hidden = false;
  document.querySelector('#map').hidden = true;
  enableControls(false);
  status(`Modo seguro: ortofoto oficial disponible, pero el 3D no arrancó. Abre “Diagnóstico” para ayudarnos a corregirlo.`, 'error');
  ui.details.open = true;
}
function styleDefinition() {
  return {
    version: 8,
    sources: {
      pnoa: { type: 'raster', tiles: [CONFIG.orthophoto], tileSize: 256, minzoom: 6, maxzoom: 19, attribution: 'Ortofotos PNOA © <a href="https://www.ign.es/">IGN/CNIG</a> · CC BY 4.0' },
      elevation: { type: 'raster-dem', tiles: [CONFIG.terrain], tileSize: 512, maxzoom: 14, encoding: 'terrarium', attribution: 'Elevación © <a href="https://mapterhorn.com/attribution">Mapterhorn y fuentes</a>' }
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#173633' } },
      { id: 'orthophoto', type: 'raster', source: 'pnoa', paint: { 'raster-saturation': -0.08, 'raster-contrast': 0.08 } },
      { id: 'hillshade', type: 'hillshade', source: 'elevation', paint: { 'hillshade-exaggeration': 0.38, 'hillshade-shadow-color': '#122c2a', 'hillshade-highlight-color': '#f1d9ae' } }
    ]
  };
}
async function start() {
  if (map) { try { map.remove(); } catch (_) {} map = null; }
  mapReady = false;
  document.querySelector('#map').hidden = false;
  ui.fallback.hidden = true;
  enableControls(false);
  status('Preparando el motor cartográfico…');
  log(`Versión ${CONFIG.version}`);
  log(navigator.userAgent);
  log(webGLReport());
  try {
    await ensureMapLibre();
    if (!maplibregl.supported()) throw new Error('MapLibre informa de que WebGL no está disponible.');
    map = new maplibregl.Map({
      container: 'map', style: styleDefinition(), center: CONFIG.plaza, zoom: 13.45,
      pitch: 66, bearing: -22, minZoom: 9, maxZoom: 18, renderWorldCopies: false,
      attributionControl: false, fadeDuration: 0, antialias: true
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    const marker = document.createElement('div'); marker.className = 'nava-marker';
    new maplibregl.Marker({ element: marker }).setLngLat(CONFIG.plaza)
      .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML('<strong>Plaza de Nava de Ordunte</strong><br>Punto de partida del proyecto.')).addTo(map);
    const timeout = setTimeout(() => {
      if (!mapReady) { status('El motor arrancó, pero las capas tardan demasiado. Revisa el diagnóstico o reintenta.', 'error'); ui.details.open = true; }
    }, 18000);
    map.on('load', () => {
      clearTimeout(timeout);
      try { map.setTerrain({ source: 'elevation', exaggeration: 1.22 }); log('Terreno 3D activado'); }
      catch (error) { log('Terreno no activado', error.message); }
      mapReady = true; enableControls(true);
      status('Mapa listo. Toca “Revelar el valle” o abre una ruta GPX.', 'ready');
    });
    map.on('error', event => {
      const message = event?.error?.message || 'Error cartográfico sin detalle';
      log('Error de capa', message);
      if (!mapReady) status(`Una fuente está fallando: ${message}`, 'error');
    });
  } catch (error) { showFallback(error.message); }
}
function camera(target) {
  if (!mapReady) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  map[reduced ? 'jumpTo' : 'flyTo']({ ...target, duration: reduced ? 0 : (target.duration || 6500), essential: true });
}
function parseGPX(text) {
  const xml = new DOMParser().parseFromString(text, 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('El archivo no contiene XML válido.');
  let groups = [...xml.getElementsByTagName('trkseg')].map(segment => [...segment.getElementsByTagName('trkpt')]);
  if (!groups.length) groups = [[...xml.getElementsByTagName('rtept')]];
  const lines = groups.map(group => group.map(point => [Number(point.getAttribute('lon')), Number(point.getAttribute('lat'))])
    .filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat) && Math.abs(lon) <= 180 && Math.abs(lat) <= 90)).filter(line => line.length > 1);
  if (!lines.length) throw new Error('No se han encontrado puntos de track o ruta.');
  return lines;
}
function drawRoute(lines, filename) {
  const geojson = { type: 'FeatureCollection', features: lines.map(coordinates => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } })) };
  if (map.getSource('community-route')) map.getSource('community-route').setData(geojson);
  else {
    map.addSource('community-route', { type: 'geojson', data: geojson });
    map.addLayer({ id: 'route-shadow', type: 'line', source: 'community-route', paint: { 'line-color': '#102a28', 'line-width': 9, 'line-opacity': .7 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
    map.addLayer({ id: 'route', type: 'line', source: 'community-route', paint: { 'line-color': '#ffd08d', 'line-width': 5 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
  }
  const bounds = new maplibregl.LngLatBounds(); lines.flat().forEach(point => bounds.extend(point));
  map.fitBounds(bounds, { padding: 70, pitch: 58, maxZoom: 15, duration: 2200 });
  status(`Ruta “${filename}” cargada localmente; no se ha subido a ningún servidor.`, 'ready');
}
ui.fly.addEventListener('click', () => camera({ ...CONFIG.overview, duration: 7200 }));
ui.home.addEventListener('click', () => camera({ center: CONFIG.plaza, zoom: 13.45, pitch: 66, bearing: -22, duration: 2600 }));
ui.layer.addEventListener('click', () => {
  if (!mapReady) return; plainRelief = !plainRelief;
  map.setLayoutProperty('orthophoto', 'visibility', plainRelief ? 'none' : 'visible');
  map.setPaintProperty('hillshade', 'hillshade-exaggeration', plainRelief ? .85 : .38);
  ui.layer.textContent = plainRelief ? '▧ Mostrar ortofoto' : '◈ Solo relieve';
});
ui.gpx.addEventListener('change', async event => {
  const file = event.target.files?.[0]; if (!file || !mapReady) return;
  try { drawRoute(parseGPX(await file.text()), file.name); }
  catch (error) { status(`No se pudo leer el GPX: ${error.message}`, 'error'); }
  event.target.value = '';
});
ui.retry.addEventListener('click', start);
ui.copy.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(logLines.join('\n')); ui.copy.textContent = 'Copiado'; setTimeout(() => { ui.copy.textContent = 'Copiar informe'; }, 1500); }
  catch (_) { status('No se pudo copiar; mantén pulsado sobre el registro.', 'error'); }
});
window.addEventListener('error', event => log('Error JavaScript global', event.message));
window.addEventListener('unhandledrejection', event => log('Promesa rechazada', event.reason?.message || event.reason));
window.addEventListener('orientationchange', () => setTimeout(() => map?.resize(), 250));
start();
