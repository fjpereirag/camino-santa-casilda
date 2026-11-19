// El camino de las rosas · Santa Casilda, de Toledo a La Bureba
// Mapa ilustrado 3D (Three.js local, sin claves ni servicios de pago). Familia de «El paso».
// Coordenadas del mapa: x (oeste→este) y z (norte→sur). x = (lon + 3.6) · 4.59 ; z = −(lat − 41.2) · 6.06
import * as THREE from './three.module.min.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.remove('no-js');

/* ------------------------------------------------------------------ */
/* Geografía estilizada del centro y norte de la Península             */
/* ------------------------------------------------------------------ */
const TOLEDO = [-1.95, 8.14], SANT = [0.70, -8.49];
const ROUTE_2D = [
  [-1.95, 8.14],  // I · palacio
  [-1.99, 8.2],   // II · las rosas
  [-1.93, 8.08],  // III · la enfermedad
  [-1.86, 7.95],
  [-1.76, 7.78],  // IV · salida por el Tajo
  [-1.35, 6.6],
  [-0.69, 5.03],  // V · Carabanchel
  [-0.45, 3.4],
  [-0.2, 1.7],
  [0.09, 0.42],   // VI · Somosierra
  [-0.2, -1.4],
  [-0.41, -2.85], // Aranda de Duero
  [-0.73, -5.03], // Lerma
  [-0.45, -6.93], // VII · Burgos
  [0.05, -7.75],
  [0.6, -8.36],   // VIII · lagos de San Vicente
  [0.72, -8.53],  // IX · ermita
  [1.05, -8.42],
  [1.29, -8.18],  // X · Briviesca
  [1.0, -8.32],
  [0.70, -8.49],  // XI · santuario
];
// lab: desplazamiento del rótulo en el SVG · lift: altura de la etiqueta 3D · ov: visible en la vista general · tag: texto · zoom: cercanía de la cámara
const STATIONS = [
  { xz: [-1.95, 8.14], rn: 'I', name: 'Toledo', lab: [-9, 3], tag: 'I–IV', zoom: .45 },
  { xz: [-1.99, 8.2], rn: 'II', name: 'Las rosas', ov: false, zoom: .4 },
  { xz: [-1.93, 8.08], rn: 'III', name: 'La herida', ov: false, zoom: .4 },
  { xz: [-1.76, 7.78], rn: 'IV', name: 'El Tajo', ov: false, zoom: .5 },
  { xz: [-0.69, 5.03], rn: 'V', name: 'Carabanchel', lab: [-9, 3], zoom: .6 },
  { xz: [0.09, 0.42], rn: 'VI', name: 'Somosierra', lab: [9, 3], lift: 1.8 },
  { xz: [-0.45, -6.93], rn: 'VII', name: 'Burgos', lab: [-9, 3], zoom: .7 },
  { xz: [0.6, -8.36], rn: 'VIII', name: 'Los lagos', tag: 'VIII–XI', lab: [0, -7], zoom: .38, lift: 1.6 },
  { xz: [0.72, -8.53], rn: 'IX', name: 'La ermita', ov: false, zoom: .38 },
  { xz: [1.29, -8.18], rn: 'X', name: 'Briviesca', ov: false, zoom: .45 },
  { xz: [0.70, -8.49], rn: 'XI', name: 'El santuario', ov: false, zoom: .42 },
];

function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) { let s = 0, a = .5, f = 1; for (let o = 0; o < 4; o++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= .5; } return s; }
function seg(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az; let t = ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz);
  t = Math.max(0, Math.min(1, t)); const ex = ax + dx * t - px, ez = az + dz * t - pz; return Math.hypot(ex, ez);
}
const polyD = (x, z, P) => { let d = 1e9; for (let i = 0; i < P.length - 1; i++) d = Math.min(d, seg(x, z, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1])); return d; };
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const gauss = (x, z, cx, cz, s) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * s * s));

// Ríos (polilíneas en coordenadas del mapa)
const RIVERS = {
  Tajo: [[6.2, 6.3], [3.5, 6.6], [1.2, 6.95], [0, 7.15], [-1.2, 7.85], [-1.7, 8.4], [-2.1, 8.42], [-2.35, 8.15], [-3.4, 8.0], [-6.2, 7.5]],
  Jarama: [[0.9, 0.9], [0.55, 3.2], [0.35, 5.3], [0.05, 7.1]],
  Manzanares: [[-1.4, 2.7], [-0.8, 4.2], [-0.55, 5.1], [0.1, 6.1], [0.3, 6.2]],
  Duero: [[6.2, -2.2], [3.0, -2.25], [1.0, -2.45], [-0.41, -2.9], [-1.4, -2.55], [-2.4, -2.45], [-6.2, -2.7]],
  Arlanza: [[3.4, -5.6], [1.2, -5.15], [-0.73, -5.1], [-2.4, -4.7], [-6.2, -4.2]],
  'Arlanzón': [[2.6, -6.5], [0.8, -6.75], [-0.45, -6.98], [-2.2, -6.4], [-6.2, -5.7]],
  Oca: [[1.7, -7.2], [1.32, -8.0], [1.2, -8.9], [1.1, -10.4]],
  Ebro: [[-2.4, -10.4], [-0.5, -10.2], [2.2, -10.0], [6.2, -9.85]],
};
const RIVER_W = { Tajo: .09, Duero: .085, Ebro: .08, Jarama: .05, Manzanares: .035, Arlanza: .05, 'Arlanzón': .045, Oca: .035 };
const riverD = (x, z) => { let d = 1e9; for (const k in RIVERS) d = Math.min(d, polyD(x, z, RIVERS[k]) - RIVER_W[k] * .5); return d; };

const CENTRAL = [[-6.4, 4.7], [-3.6, 3.5], [-1.84, 2.42], [0.09, 0.42], [2.2, -0.45], [6.4, -1.1]];
const OBARENES = [[-2.2, -9.55], [0.2, -9.25], [2.6, -9.3], [4.8, -9.6]];
const MAP = { x0: -6, x1: 6, z0: -10.3, z1: 10.1 };
MAP.w = MAP.x1 - MAP.x0; MAP.d = MAP.z1 - MAP.z0;
function height(x, z) {
  const e = Math.min(x - MAP.x0, MAP.x1 - x, z - MAP.z0, MAP.z1 - z);   // a ras en los bordes del bloque
  return heightCore(x, z) * smooth(0, .7, e) * .75;
}
function heightCore(x, z) {
  const n = fbm(x * .7, z * .7), ridge = 1 - Math.abs(fbm(x * 1.6 + 7, z * 1.6) * 2 - 1);
  let h = .16 + n * .14;                                                     // la meseta
  h += Math.exp(-(polyD(x, z, CENTRAL) ** 2) / (2 * .7 ** 2)) * (.75 + ridge * .55);   // Sistema Central
  h += smooth(8.6, 10, z) * (.3 + ridge * .25);                              // Montes de Toledo
  h += gauss(x, z, 3.2, -6.2, 1.4) * (.65 + ridge * .3);                     // Sierra de la Demanda
  h += Math.exp(-(polyD(x, z, OBARENES) ** 2) / (2 * .38 ** 2)) * (.45 + ridge * .3);  // Montes Obarenes
  h += gauss(x, z, -3.4, -7.6, 1.5) * .18;                                   // páramos
  h -= gauss(x, z, 0.4, 5.6, 1.6) * .1;                                      // fosa del Tajo y del Jarama
  h -= gauss(x, z, 1.1, -8.2, .9) * .08;                                     // llanura de La Bureba
  h += gauss(x, z, TOLEDO[0], TOLEDO[1], .14) * .14;                         // el peñón de Toledo
  h += gauss(x, z, SANT[0], SANT[1], .11) * .2;                              // la peña del santuario
  const rd = riverD(x, z);
  h -= (1 - smooth(0, .35, rd)) * .1;                                        // los ríos excavan
  return Math.max(.02, h);
}

/* ------------------------------------------------------------------ */
/* Ruta (compartida por el 3D y el mapa SVG)                           */
/* ------------------------------------------------------------------ */
const route2 = new THREE.CatmullRomCurve3(ROUTE_2D.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
const SAMPLES = 1400;
const samples = route2.getSpacedPoints(SAMPLES).map(p => new THREE.Vector3(p.x, height(p.x, p.z) + .035, p.z));
const route = new THREE.CatmullRomCurve3(samples);
let lastK = -1;
const stationU = STATIONS.map(s => {
  let best = lastK + 1, bd = 1e9;
  for (let k = lastK + 1; k < samples.length; k++) { const d = Math.hypot(samples[k].x - s.xz[0], samples[k].z - s.xz[1]); if (d < bd - 1e-6) { bd = d; best = k; } }
  lastK = best;
  return best / SAMPLES;
});

/* ------------------------------------------------------------------ */
/* Lámina de atlas: relieve sombreado, tintas hipsométricas y rótulos  */
/* ------------------------------------------------------------------ */
const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const HYPSO = [[0, hex('#cfc79a')], [.15, hex('#d6c48e')], [.3, hex('#cdb07c')], [.5, hex('#b99566')], [.75, hex('#9d7a55')], [1.1, hex('#806249')]];
const C_RIVER = hex('#6f97a3'), C_GREEN = hex('#a3ab72');
let atlasBase = null;
function paintBase(G) {
  const W = MAP.w, D = MAP.d, Hh = new Float32Array((G + 1) * (G + 1));
  for (let j = 0; j <= G; j++) for (let i = 0; i <= G; i++) Hh[j * (G + 1) + i] = height(MAP.x0 + i / G * W, MAP.z0 + j / G * D);
  const c = document.createElement('canvas'); c.width = c.height = G;
  const ctx = c.getContext('2d'), id = ctx.createImageData(G, G), S = .2 / (W / G);
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    const k = j * (G + 1) + i, x = MAP.x0 + i / G * W, z = MAP.z0 + j / G * D, h = Hh[k];
    let q = 0; while (q < HYPSO.length - 2 && h > HYPSO[q + 1][0]) q++;
    let col = mix3(HYPSO[q][1], HYPSO[q + 1][1], Math.min(1, (h - HYPSO[q][0]) / (HYPSO[q + 1][0] - HYPSO[q][0])));
    const rd = riverD(x, z);
    col = mix3(col, C_GREEN, (1 - smooth(0, .45, rd)) * .75 + gauss(x, z, 1.1, -8.2, .9) * .35);   // vegas y La Bureba
    const dx = Hh[k + 1] - Hh[k], dz = Hh[k + G + 1] - Hh[k];
    const sh = Math.max(.55, Math.min(1.3, 1 + (-dx - dz) * S * 2.2));
    col = [col[0] * sh, col[1] * sh, col[2] * sh];
    if (rd < 0) col = C_RIVER;
    const grain = .96 + hash(i * .37, j * .91) * .07, o = (j * G + i) * 4;
    id.data[o] = col[0] * grain; id.data[o + 1] = col[1] * grain; id.data[o + 2] = col[2] * grain; id.data[o + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  return c;
}
function paintAtlas(N, G) {
  if (!atlasBase || atlasBase.width !== G) atlasBase = paintBase(G);
  const c = document.createElement('canvas'); c.width = c.height = N;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(atlasBase, 0, 0, N, N);
  // el lienzo es cuadrado y el mapa no: escalas distintas en x y z
  const PX = x => (x - MAP.x0) / MAP.w * N, PZ = z => (z - MAP.z0) / MAP.d * N, UX = N / MAP.w, UZ = N / MAP.d;
  ctx.strokeStyle = 'rgba(110,80,45,.13)'; ctx.lineWidth = N / 1400;
  for (let x = -4; x <= 4; x += 2) { ctx.beginPath(); ctx.moveTo(PX(x), 0); ctx.lineTo(PX(x), N); ctx.stroke(); }
  for (let z = -8; z <= 8; z += 2) { ctx.beginPath(); ctx.moveTo(0, PZ(z)); ctx.lineTo(N, PZ(z)); ctx.stroke(); }
  // ríos con trazo fino
  ctx.strokeStyle = 'rgba(70,110,125,.85)'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const k in RIVERS) { ctx.lineWidth = RIVER_W[k] * UX * .55; ctx.beginPath(); RIVERS[k].forEach(([x, z], i) => i ? ctx.lineTo(PX(x), PZ(z)) : ctx.moveTo(PX(x), PZ(z))); ctx.stroke(); }
  const serif = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
  function txt(str, x, z, size, o = {}) {
    ctx.save();
    ctx.translate(PX(x), PZ(z)); ctx.scale(1, UZ / UX); if (o.rot) ctx.rotate(o.rot);
    ctx.font = `${o.italic ? 'italic ' : ''}${o.weight || 500} ${size * UX}px ${serif}`;
    const sp = (o.spacing || 0) * size * UX;
    const chars = [...str], widths = chars.map(ch => ctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + sp * (chars.length - 1);
    let cx = o.align === 'left' ? 0 : o.align === 'right' ? -total : -total / 2;
    ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    chars.forEach((ch, k) => {
      if (o.halo) { ctx.strokeStyle = o.halo; ctx.lineWidth = size * UX * .22; ctx.strokeText(ch, cx, 0); }
      ctx.fillStyle = o.color || 'rgba(92,62,36,.62)'; ctx.fillText(ch, cx, 0); cx += widths[k] + sp;
    });
    ctx.restore();
  }
  const RIV = 'rgba(52,88,104,.85)', REG = 'rgba(96,64,36,.5)', TOWN = 'rgba(58,38,22,.9)', HALO = 'rgba(232,222,190,.6)';
  txt('Tajo', 2.4, 6.55, .32, { italic: true, color: RIV, spacing: .2 });
  txt('Duero', 2.3, -2.6, .32, { italic: true, color: RIV, spacing: .2 });
  txt('Ebro', 3.6, -10.05, .26, { italic: true, color: RIV, spacing: .2 });
  txt('Jarama', 0.9, 3.6, .2, { italic: true, color: RIV, rot: -1.45 });
  txt('Manzanares', -1.25, 3.85, .17, { italic: true, color: RIV, rot: -1.1 });
  txt('Arlanza', -2.6, -4.95, .2, { italic: true, color: RIV });
  txt('Arlanzón', 1.6, -6.95, .18, { italic: true, color: RIV });
  txt('Oca', 1.5, -8.95, .16, { italic: true, color: RIV, rot: -1.5 });
  txt('TAIFA DE TOLEDO', -3.1, 6.2, .38, { spacing: .5, color: REG });
  txt('(al-Ándalus)', -3.1, 6.65, .24, { italic: true, color: REG });
  txt('REINO DE CASTILLA', -3.0, -3.8, .38, { spacing: .5, color: REG });
  txt('SIERRA DE GUADARRAMA', -3.2, 3.0, .24, { spacing: .35, color: REG, rot: -.42 });
  txt('MONTES DE TOLEDO', 0.6, 9.55, .24, { spacing: .4, color: REG });
  txt('SIERRA DE LA DEMANDA', 3.4, -5.2, .2, { spacing: .35, color: REG });
  txt('MONTES OBARENES', -.6, -9.75, .18, { spacing: .35, color: REG });
  txt('LA BUREBA', 2.55, -8.15, .24, { spacing: .5, color: REG });
  const towns = [
    ['Toledo', -1.95, 8.14, 'l', .3], ['Madrid', -0.4, 4.85, 'r', .26], ['Carabanchel', -0.69, 5.03, 'l', .2], ['Aranda de Duero', -0.41, -2.85, 'l', .2],
    ['Lerma', -0.73, -5.03, 'l', .2], ['Burgos', -0.45, -6.93, 'l', .28], ['Briviesca', 1.29, -8.18, 'r', .22], ['Segovia', -2.5, 1.55, 'l', .2],
  ];
  towns.forEach(([n, x, z, side, s]) => {
    ctx.fillStyle = '#9b2a1c'; ctx.strokeStyle = 'rgba(240,230,200,.8)'; ctx.lineWidth = UX * .02;
    ctx.beginPath(); ctx.ellipse(PX(x), PZ(z), UX * .055, UZ * .055, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    txt(n, x + (side === 'r' ? .12 : -.12), z - .14, s, { italic: true, color: TOWN, align: side === 'r' ? 'left' : 'right', halo: HALO });
  });
  // santuario: cruz roja
  ctx.fillStyle = '#7a2a1c';
  ctx.fillRect(PX(SANT[0]) - UX * .015, PZ(SANT[1]) - UZ * .09, UX * .03, UZ * .16); ctx.fillRect(PX(SANT[0]) - UX * .06, PZ(SANT[1]) - UZ * .05, UX * .12, UZ * .03);
  txt('Santuario de', SANT[0] - .14, SANT[1] - .26, .15, { italic: true, color: TOWN, align: 'right', halo: HALO });
  txt('Santa Casilda', SANT[0] - .14, SANT[1] - .1, .15, { italic: true, color: TOWN, align: 'right', halo: HALO });
  // puerto de Somosierra: triángulo
  ctx.beginPath(); ctx.moveTo(PX(.09), PZ(.42) - UZ * .14); ctx.lineTo(PX(.09) - UX * .1, PZ(.42) + UZ * .05); ctx.lineTo(PX(.09) + UX * .1, PZ(.42) + UZ * .05); ctx.closePath(); ctx.fill();
  txt('Puerto de Somosierra', .3, .3, .2, { italic: true, color: TOWN, align: 'left', halo: HALO });
  // rosa de los vientos sencilla
  ctx.save(); ctx.translate(PX(4.6), PZ(8.6)); ctx.scale(1, UZ / UX); ctx.fillStyle = 'rgba(90,60,34,.55)';
  ctx.beginPath(); ctx.moveTo(0, -UX * .5); ctx.lineTo(UX * .09, 0); ctx.lineTo(0, UX * .5); ctx.lineTo(-UX * .09, 0); ctx.closePath(); ctx.fill();
  ctx.font = `600 ${UX * .22}px ${serif}`; ctx.textAlign = 'center'; ctx.fillText('N', 0, -UX * .62); ctx.restore();
  ctx.strokeStyle = 'rgba(80,52,28,.55)'; ctx.lineWidth = N / 500; ctx.strokeRect(N * .008, N * .008, N * .984, N * .984);
  ctx.lineWidth = N / 1400; ctx.strokeRect(N * .016, N * .016, N * .968, N * .968);
  return c;
}

// Mapa SVG de respaldo
(function drawSvg() {
  const P = (x, z) => `${(x * 10 + 100).toFixed(1)} ${(z * 9.7 + 100).toFixed(1)}`;
  const path = document.getElementById('ruta-svg');
  if (path) path.setAttribute('d', 'M' + route2.getSpacedPoints(160).map(p => P(p.x, p.z)).join(' L'));
  const img = document.getElementById('mapa-img');
  const fill = () => {
    if (!img) return;
    img.setAttribute('x', MAP.x0 * 10 + 100); img.setAttribute('y', MAP.z0 * 9.7 + 100);
    img.setAttribute('width', MAP.w * 10); img.setAttribute('height', MAP.d * 9.7);
    img.setAttribute('preserveAspectRatio', 'none');
    img.setAttribute('href', paintAtlas(900, 360).toDataURL('image/jpeg', .85));
  };
  const hasGL = (() => { try { const t = document.createElement('canvas'); return !!(t.getContext('webgl2') || t.getContext('webgl')); } catch (e) { return false; } })();
  if (!hasGL) { fill(); if (document.fonts) document.fonts.ready.then(fill); }
  const g = document.getElementById('st-svg');
  if (g) g.innerHTML = STATIONS.filter(s => s.ov !== false).map(s => {
    const cx = s.xz[0] * 10 + 100, cy = s.xz[1] * 9.7 + 100;
    return `<circle cx="${cx}" cy="${cy}" r="2.6" fill="#C9A35B" stroke="#3a2614" stroke-width=".8"/><text x="${cx + s.lab[0]}" y="${cy + s.lab[1]}" stroke="#0B0A08" stroke-width="2.4" paint-order="stroke">${s.tag || s.rn}</text>`;
  }).join('');
})();

/* ------------------------------------------------------------------ */
/* Interfaz: revelados, navegación, compartir                          */
/* ------------------------------------------------------------------ */
requestAnimationFrame(() => document.body.classList.add('is-loaded'));
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

const menuBtn = document.querySelector('.top__btn'), menu = document.getElementById('menu-etapas'), curEl = document.getElementById('etapa-actual');
const setMenu = open => { menuBtn.setAttribute('aria-expanded', open); menu.hidden = !open; document.body.classList.toggle('menu-open', open); };
menuBtn.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

const dots = [...document.querySelectorAll('[data-dot]')];
const etapas = [...document.querySelectorAll('.etapa')];
const markActive = n => {
  dots.forEach(a => a.classList.toggle('is-active', a.dataset.dot === n));
  if (n) { const e = etapas[+n - 1]; curEl.textContent = e.querySelector('.etapa__rn').textContent + ' · ' + dots[+n - 1].querySelector('.nm').textContent; }
  else curEl.textContent = 'Etapas';
};
const navIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) markActive(e.target.id.startsWith('etapa-') ? e.target.id.split('-')[1] : null); }), { rootMargin: '-45% 0px -45% 0px' });
etapas.forEach(s => navIO.observe(s));
['inicio', 'prologo', 'final'].forEach(id => { const el = document.getElementById(id); if (el) navIO.observe(el); });

document.querySelectorAll('[data-share]').forEach(b => b.addEventListener('click', () => {
  const n = +b.dataset.share;
  let txt = 'El camino de las rosas · Santa Casilda, de Toledo a La Bureba. Un itinerario de fe en once etapas';
  if (n) { const e = etapas[n - 1]; txt = `El camino de las rosas · ${e.querySelector('.etapa__rn').textContent}. ${e.querySelector('.etapa__lugar').textContent}: ${e.querySelector('.panel__title').textContent}`; }
  const url = location.href.split('#')[0] + (n ? '#etapa-' + n : '');
  window.open('https://wa.me/?text=' + encodeURIComponent(txt + '\n' + url), '_blank', 'noopener');
}));

/* ------------------------------------------------------------------ */
/* Escena 3D                                                           */
/* ------------------------------------------------------------------ */
const stageEl = document.querySelector('.stage');
const canvas = document.getElementById('mapa3d');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' }); } catch (e) { renderer = null; }
if (!renderer) document.documentElement.classList.add('no-webgl'); else initScene();

function initScene() {
  const mobile = innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;

  const scene = new THREE.Scene();
  const BG = new THREE.Color('#0B0A08');
  scene.background = BG;
  scene.fog = new THREE.FogExp2(BG, .028);
  const camera = new THREE.PerspectiveCamera(40, 1, .02, 200);

  scene.add(new THREE.HemisphereLight('#fff2dc', '#3c2e1e', 1.25));
  const moon = new THREE.DirectionalLight('#ffe7c2', 1.7); moon.position.set(-6, 9, -6); scene.add(moon);
  const rim = new THREE.DirectionalLight('#c9a35b', .35); rim.position.set(8, 4, 10); scene.add(rim);

  // Terreno: lámina de atlas en relieve
  const SEGX = mobile ? 130 : 190, SEGZ = Math.round(SEGX * MAP.d / MAP.w);
  const geo = new THREE.PlaneGeometry(MAP.w, MAP.d, SEGX, SEGZ);
  geo.rotateX(-Math.PI / 2);
  geo.translate((MAP.x0 + MAP.x1) / 2, 0, (MAP.z0 + MAP.z1) / 2);
  const pos = geo.attributes.position;
  for (let k = 0; k < pos.count; k++) pos.setY(k, height(pos.getX(k), pos.getZ(k)));
  geo.computeVertexNormals();
  const TEX_N = mobile ? 2048 : 3072, TEX_G = mobile ? 420 : 560;
  const atlasTex = new THREE.CanvasTexture(paintAtlas(TEX_N, TEX_G));
  atlasTex.colorSpace = THREE.SRGBColorSpace;
  atlasTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  if (document.fonts) document.fonts.ready.then(() => { atlasTex.image = paintAtlas(TEX_N, TEX_G); atlasTex.needsUpdate = true; });
  scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: atlasTex, roughness: 1, metalness: 0 })));
  const slab = new THREE.Mesh(new THREE.BoxGeometry(MAP.w, .55, MAP.d), new THREE.MeshStandardMaterial({ color: '#3a2a1b', roughness: 1 }));
  slab.position.set((MAP.x0 + MAP.x1) / 2, -.285, (MAP.z0 + MAP.z1) / 2); scene.add(slab);

  // Ruta
  const TUBE_SEG = 1800, RAD = 6;
  const tube = new THREE.Mesh(new THREE.TubeGeometry(route, TUBE_SEG, mobile ? .022 : .018, RAD, false), new THREE.MeshBasicMaterial({ color: '#9b2a1c' }));
  scene.add(tube);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(route, 400, .01, 4, false), new THREE.MeshBasicMaterial({ color: '#9b2a1c', transparent: true, opacity: .3 })));

  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,240,200,1)'); r.addColorStop(.25, 'rgba(232,190,110,.6)'); r.addColorStop(1, 'rgba(201,163,91,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const walker = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  walker.scale.setScalar(.3); scene.add(walker);
  const walkerLight = new THREE.PointLight('#f0c47a', 1.6, 3, 2); scene.add(walkerLight);
  const stationPts = stationU.map(u => route.getPointAt(u));

  const stone = new THREE.MeshStandardMaterial({ color: '#e3d3ae', roughness: .9 });
  // Toledo en miniatura: el peñón con la muralla, las torres y el palacio
  (function toledo() {
    const [cx, cz] = TOLEDO, hy = height(cx, cz);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .04, 24, 1, true), stone); stone.side = THREE.DoubleSide;
    wall.position.set(cx, hy + .02, cz); scene.add(wall);
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, t = new THREE.Mesh(new THREE.CylinderGeometry(.018, .022, .07, 6), stone);
      t.position.set(cx + Math.cos(a) * .16, hy + .035, cz + Math.sin(a) * .16); scene.add(t); }
    const pal = new THREE.Mesh(new THREE.BoxGeometry(.09, .06, .07), stone); pal.position.set(cx + .03, hy + .04, cz - .02); scene.add(pal);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const t = new THREE.Mesh(new THREE.BoxGeometry(.018, .09, .018), stone); t.position.set(cx + .03 + a * .045, hy + .055, cz - .02 + b * .035); scene.add(t); });
  })();
  // El santuario en la peña, la ermita y los dos pozos (blanco y negro)
  const ponds = [];
  (function santuario() {
    const [cx, cz] = SANT, hy = height(cx, cz);
    const nave = new THREE.Mesh(new THREE.BoxGeometry(.05, .035, .1), stone); nave.position.set(cx, hy + .018, cz); scene.add(nave);
    const tower = new THREE.Mesh(new THREE.BoxGeometry(.028, .07, .028), stone); tower.position.set(cx, hy + .035, cz + .06); scene.add(tower);
    const ex = STATIONS[8].xz, ey = height(ex[0], ex[1]);
    const erm = new THREE.Mesh(new THREE.BoxGeometry(.025, .02, .03), stone); erm.position.set(ex[0], ey + .01, ex[1]); scene.add(erm);
    [[0.57, -8.35, '#9fc6cf'], [0.63, -8.33, '#4f6d78']].forEach(([x, z, c]) => {
      const m = new THREE.Mesh(new THREE.CircleGeometry(.026, 20).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: c, roughness: .2, metalness: .1, emissive: '#bfe6f0', emissiveIntensity: 0 }));
      m.position.set(x, height(x, z) + .004, z); scene.add(m); ponds.push(m);
    });
  })();
  const waterGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#cfefff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  waterGlow.position.set(.6, height(.6, -8.34) + .05, -8.34); waterGlow.scale.setScalar(.35); scene.add(waterGlow);

  // Pétalos de rosa (etapa II): el pan que se vuelve rosas
  const petalTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const r = g.createRadialGradient(28, 26, 2, 32, 32, 30); r.addColorStop(0, '#f6a7b0'); r.addColorStop(.6, '#c8424f'); r.addColorStop(1, 'rgba(160,30,45,0)');
    g.fillStyle = r; g.beginPath(); g.ellipse(32, 32, 28, 18, .5, 0, Math.PI * 2); g.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const PET = mobile ? 70 : 110, petals = [];
  for (let i = 0; i < PET; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: petalTex, transparent: true, depthWrite: false, opacity: 0, rotation: Math.random() * 6 }));
    s.scale.setScalar(.025 + Math.random() * .02); scene.add(s);
    petals.push({ s, a: Math.random() * 6.28, r: .02 + Math.random() * .14, h: Math.random(), v: .15 + Math.random() * .25, w: (Math.random() - .5) * 2 });
  }

  const beamMat = new THREE.MeshBasicMaterial({ color: '#f0cf8a', transparent: true, opacity: .5, depthWrite: false });
  stationPts.forEach((p, i) => {
    if (STATIONS[i].ov === false) return;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 1.4, 6, 1, true), beamMat); beam.position.set(p.x, p.y + .7, p.z); scene.add(beam);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .8 }));
    halo.position.set(p.x, p.y + .08, p.z); halo.scale.setScalar(.3); scene.add(halo);
  });

  // Etiquetas HTML proyectadas
  const labelsEl = document.getElementById('labels');
  const labels = STATIONS.map((s, k) => {
    const el = document.createElement('div'); el.className = 'lbl';
    el.innerHTML = `<b>${s.tag || s.rn}</b>`; if (s.ov === false) el.style.display = 'none';
    labelsEl.appendChild(el); return { el, p: stationPts[k].clone().add(new THREE.Vector3(0, s.lift || 1.45, 0)) };
  });

  /* ---------- Cámara guiada por el scroll ---------- */
  let keys = [], roseA = 0, roseB = 1, waterA = 0, waterB = 1, vh = innerHeight;
  function buildKeys() {
    vh = innerHeight; keys = [];
    const y0 = scrollY;
    document.querySelectorAll('[data-cam]').forEach(el => {
      const type = el.dataset.cam; if (type === 'travel') return;
      const r = el.getBoundingClientRect(), top = r.top + y0, bot = r.bottom + y0;
      let st;
      if (type === 'overview') st = { u: 0, w: 0 };
      else if (type === 'end') st = { u: 1, w: 0 };
      else st = { u: stationU[+el.dataset.station], w: 1 };
      const a = top - vh * .1, b = Math.max(a, bot - vh * .9);
      keys.push([a, st], [b, st]);
    });
    keys.sort((p, q) => p[0] - q[0]);
    const e2 = document.getElementById('etapa-2').getBoundingClientRect(), e3 = document.getElementById('etapa-3').getBoundingClientRect();
    roseA = e2.top + y0 - vh * .1; roseB = e3.top + y0 - vh * .3;
    const e8 = document.getElementById('etapa-8').getBoundingClientRect();
    waterA = e8.top + y0 - vh * .1; waterB = e8.top + y0 + vh * .7;
  }
  function targetAt(y) {
    if (y <= keys[0][0]) return { ...keys[0][1] };
    for (let k = 0; k < keys.length - 1; k++) {
      const [ya, a] = keys[k], [yb, b] = keys[k + 1];
      if (y <= yb) { const t = yb > ya ? smooth(0, 1, (y - ya) / (yb - ya)) : 1; return { u: a.u + (b.u - a.u) * t, w: a.w + (b.w - a.w) * t }; }
    }
    return { ...keys[keys.length - 1][1] };
  }

  const cur = { u: 0, w: 0, rose: 0, water: 0 };
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vT = new THREE.Vector3(), look = new THREE.Vector3(),
    camOver = new THREE.Vector3(), lookOver = new THREE.Vector3(), camFol = new THREE.Vector3(), lookFol = new THREE.Vector3(), proj = new THREE.Vector3();
  function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); buildKeys(); }
  addEventListener('resize', resize); addEventListener('load', buildKeys); resize();

  const clock = new THREE.Clock(); let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { clock.getDelta(); loop(); } });

  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime, mv = reduceMotion ? 0 : 1;
    const y = scrollY, tgt = targetAt(y);
    const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 3.2), k2 = reduceMotion ? 1 : 1 - Math.exp(-dt * 2.2);
    cur.u += (tgt.u - cur.u) * k; cur.w += (tgt.w - cur.w) * k;
    cur.rose += (smooth(roseA, roseA + vh * .8, y) * (1 - smooth(roseB, roseB + vh * .6, y)) - cur.rose) * k2;
    cur.water += (smooth(waterA, waterB, y) - cur.water) * k2;

    // Vista general (mapa alto: en vertical cabe casi entero)
    const aspect = camera.aspect;
    const dOver = aspect < 1 ? 29 + (1 - aspect) * 8 : 25;
    lookOver.set(aspect < 1 ? .5 : -5.2, 0, aspect < 1 ? 1.2 : .3);
    camOver.copy(lookOver).add(vB.set(0, 17, 6.5).normalize().multiplyScalar(dOver));
    if (!reduceMotion) camOver.x += Math.sin(t * .12) * .5;

    // Vista de seguimiento
    const u = Math.min(Math.max(cur.u, 0), 1);
    route.getPointAt(u, vA);
    route.getTangentAt(Math.min(u + .001, 1), vT); vT.y = 0; if (vT.lengthSq() < 1e-6) vT.set(0, 0, -1); vT.normalize();
    let zw = .04, zs = .04;
    STATIONS.forEach((st, i) => { const g = Math.exp(-((u - stationU[i]) ** 2) / (2 * .01 ** 2)); zw += g; zs += g * (st.zoom || 1); });
    const zoomK = zs / zw, port = (aspect < 1 ? 1.45 : 1) * zoomK;
    // mirar siempre hacia el norte (el camino sube), con la cámara al sur
    const hgt = 6.2 * port, back = 4.2 * port;
    camFol.copy(vA).add(vB.set(.9 * port * (aspect < 1 ? .3 : 1), hgt, back));
    if (!reduceMotion) camFol.y += Math.sin(t * .4) * .04 * zoomK;
    lookFol.copy(vA).add(vB.set(aspect < 1 ? 0 : .55 * zoomK, 0, -.5 * zoomK));

    const w = smooth(0, 1, cur.w);
    camera.position.lerpVectors(camOver, camFol, w);
    look.lerpVectors(lookOver, lookFol, w);
    camera.lookAt(look);
    scene.fog.density = THREE.MathUtils.lerp(.36 / dOver, .03, w);
    beamMat.opacity = .5 * (1 - w);

    tube.geometry.setDrawRange(0, Math.floor(u * TUBE_SEG) * RAD * 6);
    walker.position.copy(vA).add(vB.set(0, .1, 0));
    walker.material.opacity = smooth(.02, .2, w + (u > .001 ? .5 : 0)) * (u < .999 ? 1 : .5);
    walkerLight.position.copy(walker.position).add(vB.set(0, .3, 0));
    walker.scale.setScalar((.3 + Math.sin(t * 2) * .02) * (.35 + .65 * zoomK));

    // pétalos sobre Toledo
    const [tx, tz] = TOLEDO, ty = height(tx, tz);
    petals.forEach(p => {
      const q = (p.h + t * .08 * p.v * mv) % 1, a = p.a + q * 2 * p.w;
      p.s.position.set(tx + .03 + Math.cos(a) * (p.r + q * .1), ty + .5 - q * .45, tz - .02 + Math.sin(a) * (p.r + q * .1));
      p.s.material.opacity = cur.rose * Math.min(1, q * 5) * Math.min(1, (1 - q) * 4) * .95;
      p.s.material.rotation += dt * p.w * mv;
    });
    // agua que brilla
    ponds.forEach((m, i) => { m.material.emissiveIntensity = cur.water * (.5 + Math.sin(t * 2 + i) * .15); });
    waterGlow.material.opacity = cur.water * (.55 + Math.sin(t * 1.6) * .08);

    labels.forEach((L, i) => {
      proj.copy(L.p).project(camera);
      const vis = proj.z < 1 && Math.abs(proj.x) < 1.1 && Math.abs(proj.y) < 1.1;
      const op = vis && u < .02 ? Math.max(0, 1 - w * 2) : 0;
      L.el.style.opacity = op.toFixed(2);
      L.el.style.transform = `translate(${((proj.x + 1) / 2 * innerWidth).toFixed(1)}px,${((1 - proj.y) / 2 * innerHeight).toFixed(1)}px) translate(-50%,-100%)`;
    });

    renderer.render(scene, camera);
    if (renderMini) renderMini(t, dt);
  }

  /* ---------- Mapa 3D del final ---------- */
  let renderMini = null;
  (function initMini() {
    const wrap = document.getElementById('mapa3d-wrap'), cv = document.getElementById('mapa3d-final');
    if (!wrap || !cv) return;
    let r2;
    try { r2 = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'low-power' }); } catch (e) { return; }
    r2.setPixelRatio(Math.min(devicePixelRatio, 2));
    r2.outputColorSpace = THREE.SRGBColorSpace; r2.toneMapping = THREE.ACESFilmicToneMapping; r2.toneMappingExposure = 1.1;
    const cam = new THREE.PerspectiveCamera(38, 1, .05, 200);
    const target = new THREE.Vector3(0, 0, 0);
    let az = 0, el = 1.0, dist = 26, visible = false, dragging = false, lastX = 0, idle = 0;
    const size = () => { const w = wrap.clientWidth, h = wrap.clientHeight; dist = w < 480 ? 30 : 27; r2.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    size(); addEventListener('resize', size);
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(wrap);
    cv.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; wrap.classList.add('is-drag'); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!dragging) return; az -= (e.clientX - lastX) * .009; lastX = e.clientX; idle = 0; });
    const up = () => { dragging = false; wrap.classList.remove('is-drag'); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    const box = document.getElementById('mapa3d-labels');
    const tags = STATIONS.map((st, k) => {
      const a = document.createElement('a'); a.className = 'm3l'; a.href = '#etapa-' + (k + 1);
      a.setAttribute('aria-label', 'Etapa ' + st.rn + ': ' + st.name);
      a.innerHTML = '<span>' + (st.tag || st.rn) + '</span>'; box.appendChild(a); if (st.ov === false) a.style.display = 'none';
      return { a, p: stationPts[k].clone().add(new THREE.Vector3(0, (st.lift || 1.45) * .65, 0)) };
    });
    const pv = new THREE.Vector3();
    renderMini = (t, dt) => {
      if (!visible) return;
      idle += dt;
      if (!reduceMotion && !dragging && idle > 2.5) az += dt * .06;
      cam.position.set(target.x + Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist, target.z + Math.cos(az) * Math.cos(el) * dist);
      cam.lookAt(target);
      const keepRange = tube.geometry.drawRange.count, keepFog = scene.fog.density;
      tube.geometry.setDrawRange(0, Infinity); scene.fog.density = .012;
      beamMat.opacity = .5; walker.visible = false; walkerLight.visible = false;
      r2.render(scene, cam);
      tube.geometry.setDrawRange(0, keepRange); scene.fog.density = keepFog; walker.visible = true; walkerLight.visible = true;
      const W = wrap.clientWidth, H = wrap.clientHeight;
      tags.forEach(tg => {
        pv.copy(tg.p).project(cam);
        const vis = pv.z < 1 && Math.abs(pv.x) < 1 && Math.abs(pv.y) < 1;
        tg.a.style.opacity = vis ? 1 : 0; tg.a.tabIndex = vis ? 0 : -1;
        tg.a.style.transform = `translate(${((pv.x + 1) / 2 * W).toFixed(1)}px,${((1 - pv.y) / 2 * H).toFixed(1)}px)`;
      });
    };
  })();

  loop();
  requestAnimationFrame(() => stageEl.classList.add('is-ready'));
}
