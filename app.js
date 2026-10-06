/* =====================================================================
   ASESORES TESIS · app.js
   Aquí vive todo el código de la página. index.html solo tiene un
   arranque de una línea, protegido por la Content-Security-Policy, que
   carga este archivo. Si hay que cambiar algo del código (IDs de
   anuncios, número de WhatsApp, música, figuras), se cambia aquí.
   ===================================================================== */

/* ============ SEGUIMIENTO DE ANUNCIOS (igual que en la versión anterior) ============ */
(function () {
  /* Google tag (gtag.js) - Google Ads */
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', 'AW-18173740188');
  var g = document.createElement('script');
  g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=AW-18173740188';
  document.head.appendChild(g);

  /* Meta Pixel Code */
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1533956934953596');
  fbq('track', 'PageView');
  /* End Meta Pixel Code */
})();

/* ============ LA PÁGINA ============ */
/* Este archivo puede llegar antes de que el HTML termine de leerse, así que
   la página arranca cuando el documento está listo. */
function arrancarPagina() {
(function () {
'use strict';
try {

/* =====================================================================
   FIGURAS
   Cada figura es una nube de N puntos (x, y, z, tono) que cabe en una
   esfera de radio ≈ 1. El tono va de 0 (oro) a 0.5 (tiza) a 1 (menta).
   ===================================================================== */
const TAU = Math.PI * 2;

function azar(semilla) {
  let a = semilla >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const giraX = (p, a) => { const c = Math.cos(a), s = Math.sin(a), y = p[1] * c - p[2] * s, z = p[1] * s + p[2] * c; p[1] = y; p[2] = z; return p; };
const giraY = (p, a) => { const c = Math.cos(a), s = Math.sin(a), x = p[0] * c + p[2] * s, z = -p[0] * s + p[2] * c; p[0] = x; p[2] = z; return p; };
const giraZ = (p, a) => { const c = Math.cos(a), s = Math.sin(a), x = p[0] * c - p[1] * s, y = p[0] * s + p[1] * c; p[0] = x; p[1] = y; return p; };
const mezc = (a, b, t) => a + (b - a) * t;

function enEsfera(r, c, R) {
  const u = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - u * u);
  return [c[0] + R * s * Math.cos(a), c[1] + R * u, c[2] + R * s * Math.sin(a)];
}

function elegir(r, pesos, suma) {
  let d = r() * suma;
  for (let i = 0; i < pesos.length; i++) { d -= pesos[i]; if (d <= 0) return i; }
  return pesos.length - 1;
}
const sumar = (v) => v.reduce((s, x) => s + x, 0);

/* Polvo que rodea a la figura para que no parezca un modelo cerrado */
const aura = (R, w) => ({
  w: w || 4, crudo: true,
  f: (r) => { const p = enEsfera(r, [0, 0, 0], R * (0.7 + r() * 0.65)); p.push(r() * 0.3); return p; }
});

/* Reparte N puntos entre las partes según su peso, aplica la pose y baraja */
function construir(N, semilla, partes, pose) {
  const r = azar(semilla);
  const out = new Float32Array(N * 4);
  const total = sumar(partes.map((p) => p.w));
  let i = 0;
  partes.forEach((parte, k) => {
    let n = k === partes.length - 1 ? N - i : Math.round(N * parte.w / total);
    n = Math.max(0, Math.min(n, N - i));
    for (let j = 0; j < n; j++, i++) {
      const v = parte.f(r);
      if (pose && !parte.crudo) pose(v);
      out[i * 4] = v[0]; out[i * 4 + 1] = v[1]; out[i * 4 + 2] = v[2]; out[i * 4 + 3] = v[3];
    }
  });
  for (let a = N - 1; a > 0; a--) {
    const b = Math.floor(r() * (a + 1));
    for (let k = 0; k < 4; k++) { const t = out[a * 4 + k]; out[a * 4 + k] = out[b * 4 + k]; out[b * 4 + k] = t; }
  }
  return out;
}

/* ---------- 0 · Birrete (la meta) ---------- */
function figBirrete(N) {
  const h = 0.78, y0 = 0.2, th = 0.05, yB = -0.36, rT = 0.5, rB = 0.56;
  const borde = (r, y) => {
    const t = (r() * 2 - 1) * h, k = (r() * 4) | 0, j = (r() - 0.5) * 0.008;
    return k === 0 ? [t, y + j, h] : k === 1 ? [t, y + j, -h] : k === 2 ? [h, y + j, t] : [-h, y + j, t];
  };
  const E = [0.22 * h, y0 + 0.012, h]; // borde por donde cae la borla
  const partes = [
    { w: 20, f: (r) => [(r() * 2 - 1) * h, y0, (r() * 2 - 1) * h, 0.04 + r() * 0.16] },
    { w: 14, f: (r) => { const p = borde(r, y0); p.push(0.42); return p; } },
    { w: 6, f: (r) => { const p = borde(r, y0 - th); p.push(0.2); return p; } },
    { w: 3, f: (r) => { const p = borde(r, y0 - r() * th); p.push(0.15); return p; } },
    { w: 22, f: (r) => { const u = r(), a = r() * TAU, R = mezc(rT, rB, u); return [R * Math.cos(a), mezc(y0 - th, yB, u), R * Math.sin(a), 0.05 + r() * 0.12]; } },
    { w: 8, f: (r) => { const a = r() * TAU, k = r() < 0.6 ? 0 : 1; return [rB * Math.cos(a), yB + (k ? 0.055 : 0) + (r() - 0.5) * 0.006, rB * Math.sin(a), 0.42]; } },
    { w: 2, f: (r) => { const p = enEsfera(r, [0, y0, 0], 0.07); p[1] = y0 + Math.abs(p[1] - y0) * 0.6; p.push(0.5); return p; } },
    { w: 3, f: (r) => { const t = r(); return [E[0] * t, y0 + 0.012, E[2] * t, 0.5]; } },
    { w: 4, f: (r) => { const t = r(); return [E[0] + Math.sin(t * 2.2) * 0.012, y0 - t * 0.5, E[2] + 0.02 + t * 0.015, 0.5]; } },
    { w: 9, f: (r) => { const v = r(), a = r() * TAU, R = (0.012 + 0.05 * v) * Math.sqrt(r()); return [E[0] + R * Math.cos(a), y0 - 0.5 - v * 0.26, E[2] + 0.027 + R * Math.sin(a), 0.5 + r() * 0.12]; } },
    aura(1.25)
  ];
  return construir(N, 11, partes, (p) => {
    giraY(p, Math.PI / 4); giraX(p, 0.42); giraZ(p, -0.1);
    p[0] *= 0.9; p[1] = p[1] * 0.9 + 0.07; p[2] *= 0.9;
  });
}

/* ---------- 1 · La pregunta ---------- */
function figPregunta(N) {
  const eje = [], C = [0, 0.4], R = 0.37;
  for (let k = 0; k <= 60; k++) { const a = (205 - 240 * k / 60) * Math.PI / 180; eje.push([C[0] + R * Math.cos(a), C[1] + R * Math.sin(a)]); }
  const p0 = eje[eje.length - 1], aF = -35 * Math.PI / 180, tg = [Math.sin(aF), -Math.cos(aF)];
  const p1 = [p0[0] + tg[0] * 0.2, p0[1] + tg[1] * 0.2], p2 = [0, 0.03], p3 = [0, -0.14];
  for (let k = 1; k <= 30; k++) {
    const t = k / 30, u = 1 - t;
    eje.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
  }
  for (let k = 1; k <= 10; k++) eje.push([0, -0.14 - 0.22 * k / 10]);
  const L = [0];
  for (let k = 1; k < eje.length; k++) L.push(L[k - 1] + Math.hypot(eje[k][0] - eje[k - 1][0], eje[k][1] - eje[k - 1][1]));
  const total = L[L.length - 1];
  const enEje = (s) => {
    const d = s * total; let k = 1;
    while (k < L.length - 1 && L[k] < d) k++;
    const t = (d - L[k - 1]) / (L[k] - L[k - 1] || 1), a = eje[k - 1], b = eje[k];
    const tx = b[0] - a[0], ty = b[1] - a[1], n = Math.hypot(tx, ty) || 1;
    return { x: mezc(a[0], b[0], t), y: mezc(a[1], b[1], t), nx: -ty / n, ny: tx / n };
  };
  const partes = [
    { w: 66, f: (r) => { const s = r(), e = enEje(s), a = r() * TAU, rad = mezc(0.09, 0.074, s), c = Math.cos(a); return [e.x + e.nx * rad * c, e.y + e.ny * rad * c, rad * Math.sin(a), 0.06 + 0.34 * Math.max(0, Math.sin(a))]; } },
    { w: 4, f: (r) => { const p = enEsfera(r, [eje[0][0], eje[0][1], 0], 0.09); p.push(0.1); return p; } },
    { w: 3, f: (r) => { const p = enEsfera(r, [0, -0.36, 0], 0.074); p.push(0.1); return p; } },
    { w: 15, f: (r) => { const p = enEsfera(r, [0, -0.67, 0], 0.108); p.push(0.78 + r() * 0.2); return p; } },
    aura(1.15)
  ];
  return construir(N, 23, partes, (p) => { p[1] += 0.045; p[0] *= 1.12; p[1] *= 1.12; p[2] *= 1.12; giraY(p, -0.25); });
}

/* ---------- 2 · El libro (marco teórico) ---------- */
function figLibro(N) {
  const W = 0.98, D = 1.24, J = 6, lineas = 13;
  const perfil = (u, j) => { const Lj = 0.3 * (1 - 0.72 * j / (J - 1)); return Lj * Math.sqrt(u) * (1 - 0.62 * u) + 0.02 - j * 0.014; };
  const pag = (lado, u, v, j) => [lado * (0.012 + u * (W + j * 0.008)), perfil(u, j), v * D];
  const renglon = (r, lado) => {
    const l = (r() * lineas) | 0, fin = (l % 5 === 4) ? 0.5 : 0.9;
    const p = pag(lado, mezc(0.13, fin, r()), -0.41 + l * (0.82 / (lineas - 1)) + (r() - 0.5) * 0.006, 0);
    p[1] += 0.004; p.push(0.5); return p;
  };
  const hojaAlzada = (r) => {
    const u = r(), v = r() - 0.5, t0 = 1.08, cur = 0.66, th = t0 + cur * u;
    return [0.02 + W * (Math.sin(th) - Math.sin(t0)) / cur, 0.03 + W * (Math.cos(t0) - Math.cos(th)) / cur, v * D * 0.98, 0.3 + (r() < 0.25 ? 0.2 : 0)];
  };
  const partes = [
    { w: 7, f: (r) => { const p = pag(-1, r(), r() - 0.5, 0); p.push(0.12); return p; } },
    { w: 7, f: (r) => { const p = pag(1, r(), r() - 0.5, 0); p.push(0.12); return p; } },
    { w: 13, f: (r) => renglon(r, -1) },
    { w: 13, f: (r) => renglon(r, 1) },
    { w: 16, f: (r) => { const j = (r() * J) | 0, lado = r() < 0.5 ? -1 : 1, k = r(); let u, v; if (k < 0.4) { u = 1; v = r() - 0.5; } else { u = r(); v = k < 0.7 ? -0.5 : 0.5; } const p = pag(lado, u, v, j); p.push(0.3); return p; } },
    { w: 9, f: (r) => { const lado = r() < 0.5 ? -1 : 1, k = r(); let u, v; if (k < 0.34) { u = 1.05; v = (r() - 0.5) * 1.07; } else { u = r() * 1.05; v = k < 0.67 ? -0.535 : 0.535; } return [lado * u * W, -0.07, v * D, 0.9]; } },
    { w: 4, f: (r) => { const lado = r() < 0.5 ? -1 : 1; return [lado * r() * W * 1.05, -0.07, (r() - 0.5) * D * 1.07, 0.82]; } },
    { w: 3, f: (r) => [(r() - 0.5) * 0.02, 0.012, (r() - 0.5) * 1.02 * D, 0.3] },
    { w: 9, f: hojaAlzada },
    { w: 5, crudo: true, f: (r) => { const t = Math.pow(r(), 1.7); return [(r() + r() - 1) * 0.5, 0.1 + t * 0.95, 0.2 + (r() + r() - 1) * 0.3, 0.45 + r() * 0.5]; } },
    aura(1.2)
  ];
  return construir(N, 37, partes, (p) => {
    giraX(p, 0.92); giraY(p, 0.52); giraZ(p, -0.04); giraX(p, -0.2);
    p[0] *= 0.95; p[1] = p[1] * 0.95 - 0.02; p[2] *= 0.95;
  });
}

/* ---------- 3 · Esfera armilar (el método como instrumento) ---------- */
function figArmilar(N) {
  const inc = 0.61, ecl = 0.41;
  const anillo = (r, R, g) => { const a = r() * TAU; return [R * Math.cos(a) + (r() - 0.5) * g, (r() - 0.5) * g, R * Math.sin(a) + (r() - 0.5) * g]; };
  const ejeT = (p) => giraZ(p, inc);
  const partes = [
    { w: 12, f: (r) => { const p = anillo(r, r() < 0.5 ? 0.9 : 0.862, 0.006); giraX(p, Math.PI / 2); p.push(0.25); return p; } },
    { w: 12, f: (r) => { const p = anillo(r, r() < 0.5 ? 0.9 : 0.862, 0.006); p.push(0.25); return p; } },
    { w: 4, f: (r) => { const a = ((r() * 24) | 0) * TAU / 24, R = mezc(0.8, 0.862, r()); return [R * Math.cos(a), 0, R * Math.sin(a), 0.5]; } },
    { w: 9, f: (r) => { const p = anillo(r, 0.74, 0.005); p[1] += (r() < 0.5 ? -0.016 : 0.016); ejeT(p); p.push(0.2); return p; } },
    { w: 7, f: (r) => { const s = r() < 0.5 ? -1 : 1, p = anillo(r, 0.74 * Math.cos(ecl), 0.005); p[1] += s * 0.74 * Math.sin(ecl); ejeT(p); p.push(0.15); return p; } },
    { w: 4, f: (r) => { const s = r() < 0.5 ? -1 : 1, p = anillo(r, 0.74 * Math.sin(ecl), 0.005); p[1] += s * 0.74 * Math.cos(ecl); ejeT(p); p.push(0.15); return p; } },
    { w: 10, f: (r) => { const p = anillo(r, 0.74, 0.004); p[1] += (((r() * 3) | 0) - 1) * 0.03; giraX(p, ecl); ejeT(p); p.push(0.5); return p; } },
    { w: 9, f: (r) => { const p = anillo(r, 0.74, 0.005); giraX(p, Math.PI / 2); if (r() < 0.5) giraY(p, Math.PI / 2); ejeT(p); p.push(0.2); return p; } },
    { w: 4, f: (r) => { const p = [0, (r() * 2 - 1) * 0.9, 0]; ejeT(p); p.push(0.45); return p; } },
    { w: 2, f: (r) => { const p = enEsfera(r, [0, r() < 0.5 ? 0.9 : -0.9, 0], 0.035); ejeT(p); p.push(0.5); return p; } },
    { w: 10, f: (r) => { const p = enEsfera(r, [0, 0, 0], 0.17); p.push(0.8 + r() * 0.2); return p; } },
    { w: 3, f: (r) => [(r() - 0.5) * 0.012, -0.9 - r() * 0.3, (r() - 0.5) * 0.012, 0.3] },
    { w: 2, f: (r) => { const p = enEsfera(r, [0, -1.04, 0], 0.05); p.push(0.4); return p; } },
    { w: 7, f: (r) => { const k = r(), p = anillo(r, k < 0.45 ? 0.36 : k < 0.8 ? 0.3 : 0.36 * Math.sqrt(r()), 0.005); p[1] = k < 0.45 ? -1.21 : -1.19; p.push(0.3); return p; } },
    aura(1.25)
  ];
  return construir(N, 41, partes, (p) => { giraY(p, 0.55); giraX(p, 0.26); p[0] *= 0.86; p[1] = p[1] * 0.86 + 0.13; p[2] *= 0.86; });
}

/* ---------- 4 · El gráfico (resultados) ---------- */
function figGrafico(N) {
  const yb = -0.62, n = 6, bw = 0.085, zf = 0.17, zb = -0.22;
  const xs = (i) => -0.76 + i * 0.3;
  const hf = [0.3, 0.47, 0.4, 0.7, 0.9, 1.22], hb = [0.2, 0.3, 0.52, 0.44, 0.62, 0.8];
  const pesoF = hf.map((h) => h + 0.25), pesoB = hb.map((h) => h + 0.25), sF = sumar(pesoF), sB = sumar(pesoB);
  const barra = (r, x, z, h, tono) => {
    const k = r(); let px, py, pz, t = tono;
    if (k < 0.34) { px = x + (r() < 0.5 ? -bw : bw); pz = z + (r() < 0.5 ? -bw : bw); py = yb + r() * h; }
    else if (k < 0.6) { const e = (r() * 4) | 0, s = (r() * 2 - 1) * bw; px = x + (e < 2 ? s : e === 2 ? bw : -bw); pz = z + (e === 0 ? bw : e === 1 ? -bw : s); py = yb + h; t = 0.5; }
    else if (k < 0.8) { px = x + (r() * 2 - 1) * bw; pz = z + (r() * 2 - 1) * bw; py = yb + h; t = tono + 0.18; }
    else { px = x + (r() * 2 - 1) * bw; pz = z + bw; py = yb + r() * h; }
    return [px, py, pz, t];
  };
  const nodos = hf.map((h, i) => [xs(i), yb + h + 0.2, zf]);
  const curva = (t) => {
    const m = nodos.length - 1, s = Math.min(m - 1e-6, t * m), i = Math.floor(s), u = s - i;
    const P = (k) => nodos[Math.max(0, Math.min(m, k))], a = P(i - 1), b = P(i), c = P(i + 1), d = P(i + 2), o = [];
    for (let k = 0; k < 3; k++) o.push(0.5 * (2 * b[k] + (c[k] - a[k]) * u + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * u * u + (3 * b[k] - a[k] - 3 * c[k] + d[k]) * u * u * u));
    return o;
  };
  const punta = (r) => {
    const a = nodos[n - 1], b = nodos[n - 2], dx = a[0] - b[0], dy = a[1] - b[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const tip = [a[0] + ux * 0.2, a[1] + uy * 0.2], t = r();
    if (r() < 0.4) return [mezc(a[0], tip[0], t), mezc(a[1], tip[1], t), zf, 0.5];
    const ang = 2.62 * (r() < 0.5 ? 1 : -1), c = Math.cos(ang), s = Math.sin(ang);
    return [tip[0] + (ux * c - uy * s) * 0.11 * t, tip[1] + (ux * s + uy * c) * 0.11 * t, zf, 0.5];
  };
  const partes = [
    { w: 40, f: (r) => { const i = elegir(r, pesoF, sF); return barra(r, xs(i), zf, hf[i], 0.08); } },
    { w: 18, f: (r) => { const i = elegir(r, pesoB, sB); return barra(r, xs(i), zb, hb[i], 0.85); } },
    { w: 8, f: (r) => (r() < 0.5 ? [(r() * 2 - 1) * 0.98, yb, -0.45 + ((r() * 7) | 0) * 0.15, 0.12] : [-0.98 + ((r() * 11) | 0) * 0.196, yb, -0.45 + r() * 0.9, 0.12]) },
    { w: 7, f: (r) => [(r() * 2 - 1) * 0.98, yb + ((r() * 6) | 0) * 0.28, -0.45, 0.14] },
    { w: 3, f: (r) => [-0.98, yb + r() * 1.5, -0.45, 0.4] },
    { w: 8, f: (r) => { const p = curva(r()), a = r() * TAU; p[1] += Math.cos(a) * 0.011; p[2] += Math.sin(a) * 0.011; p.push(0.5); return p; } },
    { w: 4, f: (r) => { const p = enEsfera(r, nodos[(r() * n) | 0], 0.036); p.push(0.55); return p; } },
    { w: 2, f: punta },
    aura(1.25)
  ];
  return construir(N, 53, partes, (p) => { p[1] -= 0.1; giraY(p, -0.5); giraX(p, 0.3); p[0] *= 0.9; p[1] *= 0.9; p[2] *= 0.9; });
}

/* ---------- 5 · Laurel (la sustentación) ---------- */
function figLaurel(N) {
  const R = 0.72, G = Math.PI / 180, hojas = [];
  [1, -1].forEach((lado) => {
    for (let k = 0; k < 12; k++) {
      const ext = k % 2 === 0;
      hojas.push({ lado, fi: (6 + k * 12.3) * G, ext, L: (ext ? 0.27 : 0.215) * (1 - 0.24 * k / 11), al: (ext ? 38 : -33) * G, z: ext ? 0.03 : -0.03 });
    }
    hojas.push({ lado, fi: 153 * G, ext: true, L: 0.2, al: 4 * G, z: 0 });
  });
  const pesoH = hojas.map((h) => h.L), sH = sumar(pesoH);
  const hw = (s) => Math.pow(Math.sin(Math.PI * Math.pow(s, 0.85)), 0.8);
  const hoja = (r) => {
    const h = hojas[elegir(r, pesoH, sH)];
    const P = [h.lado * R * Math.sin(h.fi), -R * Math.cos(h.fi)];
    const T = [h.lado * Math.cos(h.fi), Math.sin(h.fi)], Nn = [h.lado * Math.sin(h.fi), -Math.cos(h.fi)];
    const ca = Math.cos(h.al), sa = Math.sin(h.al);
    const d = [T[0] * ca + Nn[0] * sa, T[1] * ca + Nn[1] * sa], q = [-d[1], d[0]], anch = h.L * 0.17;
    let s, v, tono = 0.08 + r() * 0.12; const k = r();
    if (k < 0.3) { s = r(); v = (r() < 0.5 ? -1 : 1) * hw(s); tono = 0.42; }
    else if (k < 0.42) { s = r(); v = 0; tono = 0.5; }
    else { do { s = r(); v = r() * 2 - 1; } while (Math.abs(v) > hw(s)); }
    const comba = 0.04 * Math.sin(Math.PI * s) * (1 - v * v) * (h.ext ? 1 : -1);
    return [P[0] + d[0] * s * h.L + q[0] * v * anch, P[1] + d[1] * s * h.L + q[1] * v * anch, h.z + comba + (r() - 0.5) * 0.004, tono];
  };
  const partes = [
    { w: 74, f: hoja },
    { w: 9, f: (r) => { const lado = r() < 0.5 ? 1 : -1, fi = (-9 + r() * 163) * G, a = r() * TAU, rad = R + Math.cos(a) * 0.012; return [lado * rad * Math.sin(fi), -rad * Math.cos(fi), Math.sin(a) * 0.012, 0.3]; } },
    { w: 2, f: (r) => { const p = enEsfera(r, [0, -R - 0.005, 0.02], 0.045); p.push(0.85); return p; } },
    { w: 6, f: (r) => { const lado = r() < 0.5 ? 1 : -1, t = r(); return [lado * (0.02 + 0.12 * t + 0.025 * Math.sin(t * 3.2)) + (r() - 0.5) * 0.04, -R - 0.03 - 0.27 * t, 0.03 + 0.02 * Math.sin(t * 6), 0.85]; } },
    { w: 5, f: (r) => { const t = r() * TAU, a = 0.17 * (r() < 0.6 ? 1 : Math.sqrt(r())), c = Math.cos(t), s = Math.sin(t); return [a * Math.sign(c) * c * c * c * c, 0.02 + a * Math.sign(s) * s * s * s * s, 0, 0.5]; } },
    aura(1.2)
  ];
  return construir(N, 67, partes, (p) => { p[1] += 0.05; giraX(p, 0.12); });
}

/* ---------- Polvo de ambiente y azar por partícula ---------- */
function polvoAmbiente(N) {
  const r = azar(5), o = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { o[i * 3] = (r() * 2 - 1) * 4.4; o[i * 3 + 1] = (r() * 2 - 1) * 2.6; o[i * 3 + 2] = -4.2 + r() * 5.6; }
  return o;
}
function azarPorParticula(N) {
  const r = azar(97), o = new Float32Array(N * 4);
  for (let i = 0; i < N * 4; i++) o[i] = r();
  return o;
}

const FIGURAS = [figBirrete, figPregunta, figLibro, figArmilar, figGrafico, figLaurel];

/* =====================================================================
   ESCENA
   WebGL sin librerías: un fondo y una nube de puntos que mezcla dos
   figuras (A → B) y se disuelve en polvo de ambiente.
   ===================================================================== */
const VS_FONDO = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';

const FS_FONDO = [
  'precision mediump float;',
  'uniform vec2 uRes; uniform vec3 uFig; uniform float uLuz;',
  'float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }',
  'void main(){',
  '  vec2 px = gl_FragCoord.xy; vec2 uv = px / uRes;',
  '  float d = length(px - uFig.xy) / (min(uRes.x, uRes.y) * uFig.z);',
  '  float halo = exp(-d * d * 1.6);',
  '  vec3 lomo = vec3(0.024, 0.090, 0.059);',
  '  vec3 empaste = vec3(0.047, 0.165, 0.122);',
  '  vec3 luz = vec3(0.070, 0.235, 0.172);',
  '  float v = smoothstep(1.2, 0.2, length(uv - 0.5) * 1.35);',
  '  vec3 c = mix(lomo, empaste, v * 0.8);',
  '  c = mix(c, luz, halo * uLuz);',
  '  c += (h(px) - 0.5) / 255.0 * 1.6;',
  '  gl_FragColor = vec4(c, 1.0);',
  '}'
].join('\n');

const VS_PUNTOS = [
  'attribute vec4 aA; attribute vec4 aB; attribute vec3 aP; attribute vec4 aR;',
  'uniform mat4 uVP; uniform mat3 uGiro;',
  'uniform vec3 uPosA; uniform vec3 uPosB; uniform vec2 uEsc;',
  'uniform float uMezcla; uniform float uArmar; uniform float uT; uniform float uScroll;',
  'uniform vec3 uRaton; uniform vec2 uPar;',
  'uniform float uPx; uniform float uTam; uniform float uHalo; uniform float uFoco; uniform float uBrillo;',
  'varying vec3 vCol; varying float vA;',
  'float sua(float t){ return t * t * (3.0 - 2.0 * t); }',
  'void main(){',
  /* mezcla A → B, escalonada por partícula */
  '  float m = sua(clamp(uMezcla * 2.3 - aR.x * 1.3, 0.0, 1.0));',
  '  vec3 fa = uGiro * (aA.xyz * uEsc.x) + uPosA;',
  '  vec3 fb = uGiro * (aB.xyz * uEsc.y) + uPosB;',
  '  vec3 f = mix(fa, fb, m);',
  '  float arco = sin(m * 3.14159265);',
  '  vec3 q = f * 1.6 + aR.yzw * 6.2831853;',
  '  vec3 n = vec3(sin(q.y + uT * 0.7) + sin(q.z * 1.3 - uT * 0.4),',
  '                sin(q.z + uT * 0.6) + sin(q.x * 1.2 + uT * 0.5),',
  '                sin(q.x + uT * 0.8) + sin(q.y * 1.4 - uT * 0.3));',
  '  f += n * arco * 0.2 * (0.4 + aR.y);',
  '  f.z -= arco * 0.6 * aR.z;',
  '  f += 0.006 * vec3(sin(uT * 1.1 + aR.y * 50.0), cos(uT * 0.9 + aR.z * 50.0), sin(uT * 1.3 + aR.w * 50.0));',
  /* polvo de ambiente: deriva lenta y paralaje con el scroll */
  '  vec3 d = aP;',
  '  d.y = mod(d.y + uScroll * (0.3 + aR.z * 0.7) + 2.6, 5.2) - 2.6;',
  '  d.xy += uPar * (0.25 + (d.z + 4.2) * 0.12);',
  '  d += 0.07 * vec3(sin(uT * 0.21 + aR.x * 30.0), cos(uT * 0.17 + aR.y * 30.0), sin(uT * 0.13 + aR.z * 30.0));',
  /* polvo → figura (un 10 % se queda siempre como polvo) */
  '  float g = sua(clamp(uArmar * 1.6 - aR.y * 0.6, 0.0, 1.0)) * step(0.08, aR.w);',
  '  vec3 p = mix(d, f, g);',
  '  p += n * sin(g * 3.14159265) * 0.16;',
  /* el puntero empuja las partículas */
  '  vec2 dm = p.xy - uRaton.xy;',
  '  float emp = uRaton.z * exp(-dot(dm, dm) * 11.0) * g;',
  '  p.xy += normalize(dm + vec2(0.0001)) * emp * 0.15;',
  '  p.z += emp * 0.3 * (aR.x - 0.35);',
  '  vec4 clip = uVP * vec4(p, 1.0);',
  '  gl_Position = clip;',
  '  float w = max(clip.w, 0.2);',
  '  float coc = abs(w - uFoco);',
  '  float tam = uTam * (0.55 + aR.x * 0.95) * (1.0 + coc * mix(1.1, 0.35, g));',
  '  float px = tam * uPx / w;',
  '  float fino = min(px / 1.4, 1.0);',
  '  px = max(px, 1.4);',
  '  gl_PointSize = min(px * mix(1.0, 6.0, uHalo), 96.0);',
  '  float tono = mix(aR.z * 0.34, mix(aA.w, aB.w, m), g);',
  '  vec3 oro = vec3(0.84, 0.62, 0.24);',
  '  vec3 tiza = vec3(0.97, 0.87, 0.58);',
  '  vec3 menta = vec3(0.36, 0.80, 0.60);',
  '  vCol = tono < 0.5 ? mix(oro, tiza, tono * 2.0) : mix(tiza, menta, tono * 2.0 - 1.0);',
  '  float par = 0.74 + 0.26 * sin(uT * (0.7 + aR.z * 1.6) + aR.w * 40.0);',
  '  float visible = max(step(aR.x, 0.16), 1.0 - step(0.08, aR.w));',
  '  float a = par * uBrillo * fino * mix(0.36 * visible, 1.0, g);',
  '  a /= 1.0 + coc * coc * mix(0.55, 0.25, g);',
  '  a *= 1.0 - 0.4 * arco;',
  '  vA = a * mix(1.0, 0.05, uHalo);',
  '}'
].join('\n');

const FS_PUNTOS = [
  'precision mediump float;',
  'varying vec3 vCol; varying float vA;',
  'void main(){',
  '  vec2 c = gl_PointCoord * 2.0 - 1.0;',
  '  float k = max(0.0, 1.0 - dot(c, c));',
  '  gl_FragColor = vec4(vCol * (k * k * vA), 1.0);',
  '}'
].join('\n');

function crearEscena(lienzo, N, opciones) {
  const opc = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance' };
  let gl = null;
  try { gl = lienzo.getContext('webgl', opc) || lienzo.getContext('experimental-webgl', opc); } catch (e) { gl = null; }
  if (!gl) return null;

  const FOV = 32 * Math.PI / 180, CAM = 6, TAN = Math.tan(FOV / 2);
  const datos = { figs: FIGURAS.map((f) => f(N)), polvo: polvoAmbiente(N), azar: azarPorParticula(N) };
  const o = opciones || {};
  let topeDpr = o.topeDpr || 2, conHalo = o.halo !== false, tam = o.tam || 0.02;
  let pf, pp, uf, up, bFig, bPolvo, bAzar, bTri;
  let cssW = 1, cssH = 1, dpr = 1, viva = true;
  const vp = new Float32Array(16), giro = new Float32Array(9);

  function compilar(tipo, src) {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  }
  function programa(vs, fs, attrs) {
    const p = gl.createProgram();
    gl.attachShader(p, compilar(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compilar(gl.FRAGMENT_SHADER, fs));
    attrs.forEach((n, i) => gl.bindAttribLocation(p, i, n));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
    return p;
  }
  function uniformes(p, nombres) { const u = {}; nombres.forEach((n) => { u[n] = gl.getUniformLocation(p, n); }); return u; }
  function bufer(arr) { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW); return b; }

  function iniciar() {
    pf = programa(VS_FONDO, FS_FONDO, ['p']);
    pp = programa(VS_PUNTOS, FS_PUNTOS, ['aA', 'aB', 'aP', 'aR']);
    uf = uniformes(pf, ['uRes', 'uFig', 'uLuz']);
    up = uniformes(pp, ['uVP', 'uGiro', 'uPosA', 'uPosB', 'uEsc', 'uMezcla', 'uArmar', 'uT', 'uScroll', 'uRaton', 'uPar', 'uPx', 'uTam', 'uHalo', 'uFoco', 'uBrillo']);
    bFig = datos.figs.map(bufer);
    bPolvo = bufer(datos.polvo);
    bAzar = bufer(datos.azar);
    bTri = bufer(new Float32Array([-1, -1, 3, -1, -1, 3]));
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0.024, 0.09, 0.059, 1);
  }
  try { iniciar(); } catch (e) { return null; }

  lienzo.addEventListener('webglcontextlost', (e) => { e.preventDefault(); viva = false; });
  lienzo.addEventListener('webglcontextrestored', () => { try { iniciar(); viva = true; medir(); } catch (e) { viva = false; } });

  function medir() {
    cssW = Math.max(1, lienzo.clientWidth); cssH = Math.max(1, lienzo.clientHeight);
    dpr = Math.min(window.devicePixelRatio || 1, topeDpr);
    const w = Math.round(cssW * dpr), h = Math.round(cssH * dpr);
    if (lienzo.width !== w || lienzo.height !== h) { lienzo.width = w; lienzo.height = h; }
    /* proyección en perspectiva · vista: cámara en (0, 0, CAM) mirando al origen */
    const f = 1 / TAN, cerca = 0.1, lejos = 60, asp = cssW / cssH;
    vp.fill(0);
    vp[0] = f / asp; vp[5] = f;
    vp[10] = (lejos + cerca) / (cerca - lejos); vp[11] = -1;
    vp[14] = vp[10] * -CAM + (2 * lejos * cerca) / (cerca - lejos); vp[15] = CAM;
  }

  const api = {
    N: N,
    medir: medir,
    get viva() { return viva; },
    get mitadAlto() { return CAM * TAN; },
    get mitadAncho() { return CAM * TAN * cssW / cssH; },
    get pxPorUnidad() { return cssH / (2 * CAM * TAN); },
    get alto() { return cssH; },
    get ancho() { return cssW; },
    /* de píxeles CSS de la ventana a coordenadas del mundo en el plano z = 0 */
    aMundo: function (x, y) { return [(x / cssW * 2 - 1) * api.mitadAncho, (1 - y / cssH * 2) * api.mitadAlto]; },
    calidad: function (c) {
      if (c.topeDpr) topeDpr = c.topeDpr;
      if (c.halo !== undefined) conHalo = c.halo;
      if (c.tam) tam = c.tam;
      medir();
    },
    get dpr() { return topeDpr; },
    dibujar: function (e) {
      if (!viva) return;
      const W = lienzo.width, H = lienzo.height;
      gl.viewport(0, 0, W, H);
      /* fondo */
      gl.disable(gl.BLEND);
      gl.useProgram(pf);
      gl.bindBuffer(gl.ARRAY_BUFFER, bTri);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.disableVertexAttribArray(1); gl.disableVertexAttribArray(2); gl.disableVertexAttribArray(3);
      gl.uniform2f(uf.uRes, W, H);
      gl.uniform3f(uf.uFig, e.figCss[0] * dpr, (cssH - e.figCss[1]) * dpr, e.figRadio);
      gl.uniform1f(uf.uLuz, e.luz);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      /* puntos */
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);
      gl.useProgram(pp);
      gl.bindBuffer(gl.ARRAY_BUFFER, bFig[e.a]); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bFig[e.b]); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bPolvo); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bAzar); gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 4, gl.FLOAT, false, 0, 0);
      const cy = Math.cos(e.yaw), sy = Math.sin(e.yaw), cb = Math.cos(e.pitch), sb = Math.sin(e.pitch);
      giro[0] = cy; giro[1] = sb * sy; giro[2] = -cb * sy;
      giro[3] = 0; giro[4] = cb; giro[5] = sb;
      giro[6] = sy; giro[7] = -sb * cy; giro[8] = cb * cy;
      gl.uniformMatrix4fv(up.uVP, false, vp);
      gl.uniformMatrix3fv(up.uGiro, false, giro);
      gl.uniform3f(up.uPosA, e.posA[0], e.posA[1], e.posA[2] || 0);
      gl.uniform3f(up.uPosB, e.posB[0], e.posB[1], e.posB[2] || 0);
      gl.uniform2f(up.uEsc, e.escA, e.escB);
      gl.uniform1f(up.uMezcla, e.mezcla);
      gl.uniform1f(up.uArmar, e.armar);
      gl.uniform1f(up.uT, e.t);
      gl.uniform1f(up.uScroll, e.scroll);
      gl.uniform3f(up.uRaton, e.raton[0], e.raton[1], e.raton[2]);
      gl.uniform2f(up.uPar, e.par[0], e.par[1]);
      gl.uniform1f(up.uPx, (H / 2) / TAN);
      gl.uniform1f(up.uTam, tam * (e.grano || 1));
      gl.uniform1f(up.uFoco, CAM);
      gl.uniform1f(up.uBrillo, e.brillo);
      if (conHalo) { gl.uniform1f(up.uHalo, 1); gl.drawArrays(gl.POINTS, 0, N >> 3); }
      gl.uniform1f(up.uHalo, 0);
      gl.drawArrays(gl.POINTS, 0, N);
    }
  };
  medir();
  return api;
}

/* =====================================================================
   MÚSICA DE FONDO
   Suena la pista musica.mp3 («How Did We», de Toby Tranter, libre de
   derechos), que debe estar subida junto a index.html. El archivo viene
   bajado a nivel de fondo (-18 LUFS) para que no suene fuerte en ningún
   equipo; la página además la sube y la baja de volumen poco a poco.

   ¿Prefieres la música generada en el navegador (acordes en re mayor)?
   Deja el nombre vacío:  const MUSICA_ARCHIVO = '';
   ===================================================================== */
const MUSICA_ARCHIVO = 'musica.mp3';
const MUSICA_ARCHIVO_VOLUMEN = 0.8; // volumen de la pista, de 0 a 1 (iPhone lo ignora y usa el del equipo)
const MUSICA_VOLUMEN = 1.25; // ganancia de la música generada
const COMPAS = 8; // segundos por acorde

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

/* Re mayor: Dmaj9 · Bm9 · Gmaj9 · A6/9. Números = notas MIDI; notas = [segundo, nota] */
const ACORDES = [
  { bajo: 38, colchon: [50, 57, 61, 64, 66], notas: [[0, 78], [1, 81], [2, 76], [4, 74], [5, 78], [6.5, 69]] },
  { bajo: 47, colchon: [47, 57, 62, 66, 73], notas: [[0, 78], [1, 74], [2, 73], [4, 71], [5, 74], [6.5, 66]] },
  { bajo: 43, colchon: [55, 59, 62, 66, 69], notas: [[0, 71], [1, 74], [2, 81], [4, 78], [5, 74], [6.5, 71]] },
  { bajo: 45, colchon: [57, 61, 64, 66, 71], notas: [[0, 73], [1, 76], [2, 83], [4, 81], [5, 76], [6.5, 73]] }
];

/* eco de sala: ruido que se apaga, oscurecido para que la cola sea suave */
function impulsoDeSala(ctx, seg) {
  const n = Math.floor(ctx.sampleRate * seg), buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c); let previo = 0;
    for (let i = 0; i < n; i++) {
      previo = previo * 0.55 + (Math.random() * 2 - 1) * 0.45;
      d[i] = previo * Math.pow(1 - i / n, 2.6) * (i < 400 ? i / 400 : 1);
    }
  }
  return buf;
}

function armarMusica(ctx) {
  const salida = ctx.createGain(); salida.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20; comp.knee.value = 20; comp.ratio.value = 3; comp.attack.value = 0.03; comp.release.value = 0.5;
  const sala = ctx.createConvolver(); sala.buffer = impulsoDeSala(ctx, 4.5);
  const seco = ctx.createGain(); seco.gain.value = 0.7;
  const mojado = ctx.createGain(); mojado.gain.value = 0.55;
  const mezcla = ctx.createGain();
  const filtro = ctx.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 1150; filtro.Q.value = 0.4;
  filtro.connect(mezcla);
  mezcla.connect(seco); mezcla.connect(sala); sala.connect(mojado);
  seco.connect(comp); mojado.connect(comp); comp.connect(salida);

  function tono(tipo, f, t0, t1, destino) {
    const o = ctx.createOscillator(); o.type = tipo; o.frequency.value = f; o.connect(destino); o.start(t0); o.stop(t1);
  }
  /* colchón: entra y sale despacio, se cruza con el acorde siguiente */
  function colchon(m, t, nivel) {
    const g = ctx.createGain(), f = hz(m), fin = t + COMPAS + 4.4;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(nivel, t + 3.2);
    g.gain.setValueAtTime(nivel, t + COMPAS - 0.4); g.gain.linearRampToValueAtTime(0, t + COMPAS + 4.2);
    g.connect(filtro);
    tono('sine', f, t, fin, g);
    const g2 = ctx.createGain(); g2.gain.value = 0.45; g2.connect(g);
    tono('triangle', f * 1.004, t, fin, g2);
  }
  function bajo(m, t) {
    const g = ctx.createGain(), f = hz(m), fin = t + COMPAS + 2.8;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.04, t + 1.6);
    g.gain.setValueAtTime(0.04, t + COMPAS - 1); g.gain.linearRampToValueAtTime(0, t + COMPAS + 2.6);
    g.connect(mezcla);
    tono('sine', f, t, fin, g);
    const g2 = ctx.createGain(); g2.gain.value = 0.7; g2.connect(g);
    tono('sine', f * 2, t, fin, g2);
  }
  /* nota tipo piano eléctrico: cuatro parciales suaves que se apagan a distinto ritmo */
  const PARCIALES = [[1, 1, 3.6], [2, 0.38, 2.3], [3, 0.14, 1.4], [4.02, 0.06, 0.8]];
  function nota(m, t, fuerza, lado) {
    const f = hz(m); let destino = mezcla;
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = lado; p.connect(mezcla); destino = p; }
    PARCIALES.forEach((par) => {
      const g = ctx.createGain(), dur = par[2] * Math.pow(523 / f, 0.25);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.17 * fuerza * par[1], t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      g.connect(destino);
      tono('sine', f * par[0], t, t + dur + 0.05, g);
    });
  }
  /* programa un compás (8 s) que empieza en el segundo t */
  function compas(k, vuelta, t) {
    const a = ACORDES[k % 4];
    a.colchon.forEach((m, i) => colchon(m, t, i === 0 ? 0.026 : 0.034));
    bajo(a.bajo, t);
    a.notas.forEach((n, i) => {
      if (vuelta % 2 === 1 && (i === 1 || i === 4)) return; // en las vueltas impares respira más
      nota(n[1], t + n[0] + ((i * 7 + k * 3) % 5) * 0.006, i === 0 ? 1 : 0.72 + ((i * 5 + k) % 3) * 0.08, i % 2 ? 0.3 : -0.3);
    });
    if (vuelta % 2 === 1) nota(a.colchon[3] + 24, t + 3, 0.5, 0.15);
  }
  return { salida: salida, compas: compas };
}

function crearSonido() {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, musica = null, pista = null, usarArchivo = !!MUSICA_ARCHIVO, encendido = false, reloj = 0, n = 0, tSig = 0, fundido = 0, avisar = null;

  /* Si la pista no se puede cargar (no está subida, tiene otro nombre, falla la red),
     la página no se queda muda: pasa a la música generada y lo deja dicho en la consola. */
  function sinArchivo(motivo) {
    if (!usarArchivo) return false;
    usarArchivo = false; clearInterval(fundido);
    if (pista) { try { pista.pause(); } catch (e) { /* nada */ } pista = null; }
    if (window.console) console.warn('Música: no se pudo cargar "' + MUSICA_ARCHIVO + '" (' + motivo + '). Revisa que el archivo esté subido junto a index.html con ese nombre exacto. Mientras tanto suena la música generada.');
    return true;
  }
  function preparar() {
    if (usarArchivo) {
      if (!pista) {
        const a = new Audio(MUSICA_ARCHIVO); a.loop = true; a.preload = 'auto';
        a.addEventListener('error', () => {
          const codigo = a.error ? 'código ' + a.error.code : 'error';
          if (sinArchivo(codigo) && encendido) encender().then(() => { if (avisar) avisar(); });
        });
        pista = a; nivel(MUSICA_ARCHIVO_VOLUMEN);
      }
      return true;
    }
    if (!AC) return false;
    if (!ctx) {
      try { ctx = new AC(); musica = armarMusica(ctx); musica.salida.connect(ctx.destination); } catch (e) { ctx = null; return false; }
    }
    return true;
  }
  function programar() {
    if (!ctx || ctx.state !== 'running') return;
    if (tSig < ctx.currentTime + 0.05) tSig = ctx.currentTime + 0.12;
    while (tSig < ctx.currentTime + 3.5) { musica.compas(n % 4, Math.floor(n / 4), tSig); tSig += COMPAS; n++; }
  }
  function volumen(valor, seg) {
    const g = musica.salida.gain, t = ctx.currentTime;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(valor, t + seg);
  }
  /* la pista: su volumen sube y baja poco a poco (donde el navegador lo permite) */
  function nivel(v) { try { if (pista) pista.volume = v; } catch (e) { /* iPhone no deja cambiarlo */ } }
  function fundir(objetivo, seg, luego) {
    clearInterval(fundido);
    if (!pista) return;
    const desde = pista.volume, t0 = performance.now(), ms = seg * 1000;
    fundido = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      nivel(desde + (objetivo - desde) * k);
      if (k >= 1) { clearInterval(fundido); if (luego) luego(); }
    }, 50);
  }
  function encender() {
    if (!preparar()) return Promise.resolve(false);
    encendido = true;
    if (pista) {
      const p = pista;
      if (p.paused) nivel(0);
      return p.play().then(() => { if (encendido && pista === p) fundir(MUSICA_ARCHIVO_VOLUMEN, 2.5); return encendido; }, (err) => {
        if (!usarArchivo) return encendido; // ya se pasó a la música generada por el aviso de error
        if (err && err.name === 'NotSupportedError' && sinArchivo(err.name)) return encender();
        encendido = false; return false;
      });
    }
    return Promise.resolve(ctx.state === 'running' ? null : ctx.resume()).then(() => {
      if (!encendido) return false;
      programar(); clearInterval(reloj); reloj = setInterval(programar, 1000);
      volumen(MUSICA_VOLUMEN, 2.5);
      return true;
    }, () => { encendido = false; return false; });
  }
  function apagar() {
    encendido = false; clearInterval(reloj);
    if (pista) { if (!pista.paused) fundir(0, 0.5, () => { if (!encendido) pista.pause(); }); return; }
    if (!ctx) return;
    volumen(0, 0.5);
    setTimeout(() => { if (!encendido && ctx.state === 'running') ctx.suspend(); }, 700);
  }
  /* al cambiar de pestaña (o al abrir WhatsApp) la música espera */
  function pausar() { if (!encendido) return; if (pista) pista.pause(); else if (ctx && ctx.state === 'running') ctx.suspend(); }
  function seguir() {
    if (!encendido) return;
    if (pista) { const p = pista.play(); if (p && p.catch) p.catch(() => {}); }
    else if (ctx) ctx.resume().then(programar, () => {});
  }
  /* ¿el navegador deja sonar sin que la persona toque nada? (casi nunca) */
  function puedeSolo() {
    if (!preparar()) return Promise.resolve(false);
    if (pista) {
      /* se prueba a sonar en silencio; si el navegador lo niega o la pista tarda en llegar, se pide un toque */
      const p = pista;
      return new Promise((resolver) => {
        let decidido = false;
        const fin = (si) => { if (!decidido) { decidido = true; resolver(si); } };
        setTimeout(() => fin(false), 1500);
        nivel(0);
        p.play().then(() => {
          if (!encendido && pista === p) { p.pause(); try { p.currentTime = 0; } catch (e) { /* aún sin datos: da igual */ } }
          fin(true);
        }, (err) => { if (err && err.name === 'NotSupportedError') sinArchivo(err.name); fin(false); });
      });
    }
    return Promise.resolve(ctx.state === 'running');
  }
  return {
    disponible: !!(AC || MUSICA_ARCHIVO), preparar: preparar, encender: encender, apagar: apagar, pausar: pausar, seguir: seguir, puedeSolo: puedeSolo,
    alCambiar: (f) => { avisar = f; }, // la página repinta el botón de sonido si la música cambia sola
    get encendido() { return encendido; }
  };
}

/* =====================================================================
   PÁGINA
   El scroll decide qué figura se ve; el formato de solicitud abre WhatsApp.
   ===================================================================== */
const WHATSAPP = '573167672653';

const raiz = document.documentElement;
raiz.classList.add('cargando'); // sin scroll mientras se ve la pantalla de carga
const $ = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
const suave = (t) => t * t * (3 - 2 * t);
const media = (q) => !!(window.matchMedia && window.matchMedia(q).matches);
const quieto = media('(prefers-reduced-motion: reduce)');
const calidadFija = /[?&]fijo\b/.test(location.search);

const lienzo = $('#escena'), barra = $('#barra'), ruta = $('#recorrido'), marco = $('.ruta__marco', ruta);
const laminas = $$('.lamina', marco), NE = laminas.length;
const listaCap = $('.ruta__capitulos', marco), capitulos = $$('li', listaCap), avance = $('.ruta__avance', marco);
const cierre = $('.cierre'), huecoCierre = $('[data-hueco-cierre]');
const areas = $('.areas'), cinta = $('.areas__cinta'), hojas = $$('.hoja');
ruta.style.setProperty('--etapas', NE);

/* ---------- escena ---------- */
const movil = Math.min(window.innerWidth, window.innerHeight) < 700;
let escena = null;
try { escena = crearEscena(lienzo, movil ? 10000 : 18000, { topeDpr: 2, halo: !movil, tam: 0.02 }); } catch (e) { escena = null; }
if (!escena) raiz.classList.add('sin-webgl');

/* medio ancho y medio alto que ocupa cada figura, para encajarla en su hueco */
const EXT = [[1.02, 0.68], [0.55, 1.0], [1.05, 0.8], [0.85, 1.05], [0.98, 0.9], [0.98, 1.02]];
let vh = 1, largo = 1, tramo = 1, rutaArriba = 0, huecos = [];

function medir() {
  vh = marco.offsetHeight || window.innerHeight;
  rutaArriba = ruta.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
  tramo = Math.max(1, ruta.offsetHeight - vh);
  largo = tramo / (NE - 1);
  if (escena) escena.medir();
  huecos = laminas.map((l) => {
    const h = $('.hueco', l); let x = 0, y = 0, el = h;
    while (el && el !== marco) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    return { x: x + h.offsetWidth / 2, y: y + h.offsetHeight / 2, w: h.offsetWidth, h: h.offsetHeight };
  });
}
function escalaPara(k, w, h) {
  const e = EXT[k];
  return Math.min((w / 2) / e[0], (h / 2) / e[1], 460) * 0.93 / escena.pxPorUnidad;
}
const radioLuz = (w, h) => limitar(Math.min(w, h) * 0.85 / Math.min(escena.ancho, escena.alto), 0.3, 0.8);

/* ---------- estado ---------- */
let q = 0, T = 0, antes = 0, pendiente = false;
let introT = quieto ? 1 : 0, introOn = quieto;
let objNX = 0, objNY = 0, nX = 0, nY = 0, objRX = 0, objRY = 0, ratX = 0, ratY = 0, ratF = 0, ultimoMov = -1e9;
let capActual = -1, solida = null, muestras = 0, sumaDt = 0, ajustes = 0;
const est = { a: 0, b: 0, mezcla: 0, armar: 0, posA: [0, 0, 0], posB: [0, 0, 0], escA: 1, escB: 1, yaw: 0, pitch: 0, t: 0, scroll: 0, raton: [0, 0, 0], par: [0, 0], brillo: 1, figCss: [0, 0], figRadio: 0.5, luz: 0 };

function pedir() { if (!pendiente) { pendiente = true; requestAnimationFrame(cuadro); } }

function pintarLaminas() {
  for (let k = 0; k < NE; k++) {
    const l = laminas[k], d = k - q, op = limitar(1 - Math.abs(d) * 2.5, 0, 1), visible = op > 0.002;
    if (visible !== l._v) { l._v = visible; l.style.visibility = visible ? 'visible' : 'hidden'; }
    if (visible) { l.style.opacity = op.toFixed(3); l.style.transform = 'translate3d(0,' + (d * vh * 0.2).toFixed(1) + 'px,0)'; }
    const actual = Math.abs(d) < 0.24;
    if (actual !== l._a) { l._a = actual; l.classList.toggle('es-actual', actual); }
  }
  const c = Math.round(q);
  if (c !== capActual) {
    capActual = c;
    capitulos.forEach((li, i) => li.classList.toggle('es-actual', i + 1 === c));
    listaCap.classList.toggle('es-visible', c > 0);
  }
  avance.style.transform = 'scaleX(' + (q / (NE - 1)).toFixed(4) + ')';
}

function tapada() {
  const alto = window.innerHeight, ancho = raiz.clientWidth;
  for (let i = 0; i < hojas.length; i++) {
    const r = hojas[i].getBoundingClientRect();
    if (r.top <= 0 && r.bottom >= alto && r.width >= ancho * 0.92) return true;
  }
  return false;
}

function pintarEscena(y, dt) {
  const alto = window.innerHeight, intro = 1 - Math.pow(1 - introT, 3);
  const rc = cierre.getBoundingClientRect();
  const llegada = limitar((alto - rc.top) / (alto * 0.85), 0, 1);
  let giroExtra = 0;

  if (llegada > 0) {
    /* cierre: el polvo vuelve a armar el birrete */
    const r = huecoCierre.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const c = escena.aMundo(cx, cy), esc = escalaPara(0, r.width, r.height);
    est.a = 0; est.b = 0; est.mezcla = 0; est.armar = suave(llegada) * intro;
    est.posA[0] = est.posB[0] = c[0]; est.posA[1] = est.posB[1] = c[1];
    est.escA = est.escB = esc;
    est.figCss[0] = cx; est.figCss[1] = cy; est.figRadio = radioLuz(r.width, r.height);
  } else {
    /* recorrido: mezcla entre la figura de la etapa i y la de la i + 1 */
    const mTop = marco.getBoundingClientRect().top;
    const i = Math.min(NE - 2, Math.floor(q)), f = q - i;
    const mez = limitar((f - 0.2) / 0.6, 0, 1), ms = suave(mez);
    const ha = huecos[i], hb = huecos[i + 1];
    const pa = escena.aMundo(ha.x, ha.y + mTop), pb = escena.aMundo(hb.x, hb.y + mTop);
    est.a = i; est.b = i + 1; est.mezcla = mez;
    est.armar = (1 - suave(limitar((-mTop / vh - 0.12) / 0.55, 0, 1))) * intro;
    est.posA[0] = pa[0]; est.posA[1] = pa[1]; est.posB[0] = pb[0]; est.posB[1] = pb[1];
    est.escA = escalaPara(i, ha.w, ha.h); est.escB = escalaPara(i + 1, hb.w, hb.h);
    est.figCss[0] = ha.x + (hb.x - ha.x) * ms; est.figCss[1] = ha.y + (hb.y - ha.y) * ms + mTop;
    est.figRadio = radioLuz(ha.w + (hb.w - ha.w) * ms, ha.h + (hb.h - ha.h) * ms);
    giroExtra = Math.sin(mez * Math.PI) * 0.55 * (i % 2 ? -1 : 1);
  }

  /* puntero: inclina la figura y empuja el polvo */
  nX += (objNX - nX) * (1 - Math.exp(-dt * 3)); nY += (objNY - nY) * (1 - Math.exp(-dt * 3));
  ratX += (objRX - ratX) * (1 - Math.exp(-dt * 10)); ratY += (objRY - ratY) * (1 - Math.exp(-dt * 10));
  ratF += ((performance.now() - ultimoMov < 1300 ? 1 : 0) - ratF) * (1 - Math.exp(-dt * 4));
  est.raton[0] = ratX; est.raton[1] = ratY; est.raton[2] = ratF;
  est.par[0] = -nX * 0.12; est.par[1] = nY * 0.08;

  est.yaw = (quieto ? 0 : Math.sin(T * 0.23) * 0.28) + nX * 0.3 + giroExtra;
  est.pitch = (quieto ? 0 : Math.sin(T * 0.17) * 0.05) - nY * 0.14;
  est.t = T; est.scroll = y * 0.0011; est.luz = est.armar;
  /* figuras pequeñas (móvil): grano más fino para no empastar el dibujo */
  est.grano = limitar(0.42 + 0.58 * Math.min(est.escA, est.escB), 0.6, 1.05);
  escena.dibujar(est);
}

function vigilar(dt) {
  if (calidadFija || introT < 1 || ajustes > 2 || document.hidden) return;
  sumaDt += dt; muestras++;
  if (muestras < 90) return;
  const promedio = sumaDt / muestras; muestras = 0; sumaDt = 0;
  if (promedio > 0.026) { ajustes++; escena.calidad({ topeDpr: Math.max(1, escena.dpr - 0.5), halo: false }); }
  else ajustes = 3;
}

function cuadro(ahora) {
  pendiente = false;
  const dt = limitar((ahora - antes) / 1000 || 0.016, 0.001, 0.05); antes = ahora;
  if (!quieto) T += dt;
  avanzarCarga();
  if (introOn && introT < 1) introT = Math.min(1, introT + dt / 2.8);
  const y = window.scrollY || window.pageYOffset || 0;
  const objetivo = limitar((y - rutaArriba) / largo, 0, NE - 1);
  q = quieto ? objetivo : q + (objetivo - q) * (1 - Math.exp(-dt * 7));
  if (Math.abs(objetivo - q) < 0.0004) q = objetivo;

  pintarLaminas();
  const esSolida = y > rutaArriba + tramo + 30;
  if (esSolida !== solida) { solida = esSolida; barra.classList.toggle('es-solida', esSolida); }
  moverCinta();
  if (escena && escena.viva && !tapada()) { pintarEscena(y, dt); vigilar(dt); }
  if (!quieto || q !== objetivo || introT < 1) pedir();
}

/* ---------- cinta de áreas: avanza con el scroll ---------- */
function moverCinta() {
  const r = areas.getBoundingClientRect(), alto = window.innerHeight;
  if (r.bottom < -40 || r.top > alto + 40) return;
  const p = limitar((alto - r.top) / (alto + r.height), 0, 1);
  const sobra = Math.max(0, cinta.scrollWidth - areas.clientWidth);
  cinta.style.transform = 'translate3d(' + (-p * sobra).toFixed(1) + 'px,0,0)';
}

/* ---------- eventos de ventana ---------- */
window.addEventListener('scroll', pedir, { passive: true });
let esperaTam = 0;
function alCambiarTam() { clearTimeout(esperaTam); esperaTam = setTimeout(() => { medir(); pedir(); }, 120); }
window.addEventListener('resize', alCambiarTam);
window.addEventListener('orientationchange', alCambiarTam);
window.addEventListener('load', () => { medir(); pedir(); });
if (media('(hover: hover) and (pointer: fine)') && escena) {
  window.addEventListener('pointermove', (ev) => {
    objNX = ev.clientX / window.innerWidth * 2 - 1; objNY = ev.clientY / window.innerHeight * 2 - 1;
    const m = escena.aMundo(ev.clientX, ev.clientY); objRX = m[0]; objRY = m[1];
    ultimoMov = performance.now();
  }, { passive: true });
}

/* ---------- navegación por anclas ---------- */
const ALIAS = { solicitar: 'solicitud', faq: 'preguntas', modalidad: 'solicitud', metodologia: 'ruta', 'por-que': 'nosotros', areas: 'nosotros' };
function destinoDe(id) {
  id = ALIAS[id] || id;
  if (id === 'inicio') return 0;
  if (id === 'ruta') return rutaArriba + largo;
  const el = document.getElementById(id);
  if (!el) return null;
  return el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0) - (id === 'recorrido' ? 0 : barra.offsetHeight - 2);
}
function irA(id, alInstante) {
  const d = destinoDe(id);
  if (d === null) return false;
  window.scrollTo({ top: Math.max(0, d), behavior: (alInstante || quieto) ? 'auto' : 'smooth' });
  return true;
}
function irACapitulo(n) { window.scrollTo({ top: rutaArriba + largo * n, behavior: quieto ? 'auto' : 'smooth' }); }

document.addEventListener('click', (ev) => {
  const a = ev.target.closest ? ev.target.closest('a[href^="#"]') : null;
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  if (!id) return;
  if (a.dataset.servicio) elegirServicio(a.dataset.servicio, a.dataset.nivel);
  cerrarIndice();
  if (irA(id)) {
    ev.preventDefault();
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }
});
capitulos.forEach((li) => { const b = $('button', li); b.addEventListener('click', () => irACapitulo(+b.dataset.cap)); });

/* ---------- índice (menú en pantallas pequeñas) ---------- */
const indice = $('#indice'), botonIndice = $('.barra__indice');
function abrirIndice() {
  indice.hidden = false; raiz.classList.add('con-indice'); botonIndice.setAttribute('aria-expanded', 'true');
  const primero = $('a', indice); if (primero) primero.focus();
}
function cerrarIndice() {
  if (indice.hidden) return;
  indice.hidden = true; raiz.classList.remove('con-indice'); botonIndice.setAttribute('aria-expanded', 'false');
}
botonIndice.addEventListener('click', abrirIndice);
$('.indice__cerrar', indice).addEventListener('click', () => { cerrarIndice(); botonIndice.focus(); });
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && !indice.hidden) { cerrarIndice(); botonIndice.focus(); } });

/* ---------- formato de solicitud → WhatsApp ---------- */
const formato = $('#formatoSolicitud'), campoEtapa = $('#campoEtapa'), campoTema = $('#campoTema'), estado = $('.formato__estado', formato);

function ajustarCampos() {
  const s = formato.elements.servicio.value;
  const esTrabajoDeGrado = s === 'Tesis o trabajo de grado' || s === 'Preparación de sustentación';
  campoEtapa.hidden = !esTrabajoDeGrado; formato.elements.etapa.required = esTrabajoDeGrado; formato.elements.etapa.disabled = !esTrabajoDeGrado;
  campoTema.hidden = esTrabajoDeGrado; formato.elements.tema.required = !esTrabajoDeGrado; formato.elements.tema.disabled = esTrabajoDeGrado;
}
function elegirServicio(valor, nivel) {
  $$('input[name="servicio"]', formato).forEach((r) => { r.checked = r.value === valor; });
  if (nivel && !formato.elements.nivel.value) formato.elements.nivel.value = nivel;
  ajustarCampos();
}
formato.addEventListener('change', (ev) => { if (ev.target.name === 'servicio') ajustarCampos(); });
ajustarCampos();

formato.addEventListener('submit', (ev) => {
  ev.preventDefault();
  /* el navegador ya exige los campos y la casilla de autorización; esto es un seguro extra */
  if (formato.checkValidity && !formato.checkValidity()) { if (formato.reportValidity) formato.reportValidity(); return; }
  const d = new FormData(formato);
  const servicio = d.get('servicio'), nombre = (d.get('nombre') || '').trim(), telefono = (d.get('telefono') || '').trim();
  const nivel = d.get('nivel'), universidad = (d.get('universidad') || '').trim();
  const detalle = campoEtapa.hidden ? '*Materia y tema:* ' + (d.get('tema') || '').trim() : '*Etapa del trabajo:* ' + d.get('etapa');

  const mensaje =
    'Hola, vengo de la página web y quiero recibir asesoría.\n\n' +
    '*Asesoría:* ' + servicio + '\n' +
    '*Nombre:* ' + nombre + '\n' +
    '*WhatsApp:* ' + telefono + '\n' +
    '*Nivel:* ' + nivel + '\n' +
    '*Universidad:* ' + universidad + '\n' +
    detalle + '\n\n' +
    'Autorizo el tratamiento de mis datos según el aviso de privacidad de la página.\n' +
    'Quedo atento(a) a su respuesta.';

  /* mismos eventos de conversión que la versión anterior */
  if (typeof fbq !== 'undefined') {
    fbq('track', 'Lead', { content_name: 'Formulario Asesoría Tesis', content_category: nivel, value: 1, currency: 'COP' });
  }
  if (typeof gtag !== 'undefined') {
    gtag('event', 'generate_lead', { 'event_category': 'formulario', 'event_label': nivel, 'value': 1 });
  }

  const url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensaje);
  const ventana = window.open(url, '_blank');
  if (ventana) { try { ventana.opener = null; } catch (e) { /* sin acceso: nada que hacer */ } }
  estado.hidden = false;
  estado.textContent = 'Solicitud lista en WhatsApp. ';
  const enlace = document.createElement('a');
  enlace.href = url; enlace.target = '_blank'; enlace.rel = 'noopener';
  enlace.textContent = ventana ? 'Si no se abrió, ábrela aquí.' : 'Toca aquí para abrirla.';
  estado.appendChild(enlace);
});

/* ---------- música ---------- */
const sonido = crearSonido(), botonSonido = $('#sonido');
let musicaPendiente = false, prefiereSilencio = false;
try { prefiereSilencio = localStorage.getItem('at-musica') === '0'; } catch (e) { prefiereSilencio = false; }
const recordar = (v) => { try { localStorage.setItem('at-musica', v); } catch (e) { /* sin almacenamiento: no pasa nada */ } };

function pintarSonido() {
  const si = sonido.encendido;
  botonSonido.classList.toggle('suena', si);
  botonSonido.setAttribute('aria-pressed', si ? 'true' : 'false');
  botonSonido.setAttribute('aria-label', si ? 'Silenciar la música' : 'Activar la música');
}
sonido.alCambiar(pintarSonido);
function ponerMusica(si) {
  musicaPendiente = false;
  if (si) sonido.encender().then(pintarSonido); else sonido.apagar();
  pintarSonido();
}
if (!sonido.disponible) botonSonido.hidden = true;
/* se arma desde ya para saber, al terminar la carga, si el navegador deja sonar sin un toque */
if (sonido.disponible && !prefiereSilencio && !/[?&]directo\b/.test(location.search)) sonido.preparar();
botonSonido.addEventListener('click', () => { const si = !sonido.encendido; recordar(si ? '1' : '0'); ponerMusica(si); });
document.addEventListener('visibilitychange', () => { if (document.hidden) sonido.pausar(); else sonido.seguir(); });
/* si la persona entró sin elegir, la música empieza con su primer toque */
function primerToque(ev) {
  if (!musicaPendiente) return;
  if (ev.target && ev.target.closest && ev.target.closest('#sonido')) return;
  ponerMusica(true);
}
window.addEventListener('pointerup', primerToque);
window.addEventListener('keydown', primerToque);

/* ---------- pantalla de carga ---------- */
const carga = $('#carga'), cargaPct = $('#cargaPct'), cargaTexto = $('#cargaTexto'), cargaEntrar = $('#cargaEntrar');
const cargaNombre = $('.carga__nombre', carga), cargaTrazos = $$('.carga__sello *', carga);
const directo = /[?&]directo\b/.test(location.search); // ?directo salta la carga y la música
let cargaP = 0, cargaObj = 0.4, cargaLista = false, entro = false, esperaPuerta = 0, cargaReloj = performance.now();

function avanzarCarga() {
  if (cargaLista) return;
  /* reloj propio: el porcentaje avanza por tiempo real, no por cuadros dibujados */
  const ahora = performance.now(), dt = Math.min(0.3, (ahora - cargaReloj) / 1000); cargaReloj = ahora;
  cargaP = (quieto || directo) ? cargaObj : Math.min(cargaObj, cargaP + dt * 0.45);
  const p = Math.round(cargaP * 100);
  cargaPct.textContent = String(p);
  cargaNombre.style.setProperty('--p', p + '%');
  cargaTrazos.forEach((t) => { t.style.strokeDashoffset = String(1 - cargaP); });
  if (cargaP >= 1) { cargaLista = true; alTerminarCarga(); }
}
function entrar(conMusica) {
  if (entro) return;
  entro = true; clearTimeout(esperaPuerta);
  if (conMusica) ponerMusica(true);
  carga.classList.add('se-va'); raiz.classList.remove('cargando');
  setTimeout(() => { carga.hidden = true; }, 1000);
  requestAnimationFrame(() => { medir(); raiz.classList.add('lista'); introOn = true; pedir(); });
}
function alTerminarCarga() {
  if (directo || !sonido.disponible || prefiereSilencio) { entrar(false); return; }
  sonido.puedeSolo().then((si) => {
    if (si) { entrar(true); return; }
    /* el navegador exige un toque antes de sonar: se ofrece la entrada */
    carga.classList.add('es-espera');
    cargaTexto.textContent = 'Todo listo.';
    cargaEntrar.hidden = false;
    const b = $('#entrarCon'); if (b.focus) b.focus({ preventScroll: true });
    esperaPuerta = setTimeout(() => { musicaPendiente = true; entrar(false); }, 9000);
  });
}
$('#entrarCon').addEventListener('click', () => { recordar('1'); entrar(true); });
$('#entrarSin').addEventListener('click', () => { recordar('0'); entrar(false); });

/* ---------- arranque ---------- */
const anio = $('#anio'); if (anio) anio.textContent = String(new Date().getFullYear());
medir();
if (location.hash.length > 1) { let h = location.hash.slice(1); try { h = decodeURIComponent(h); } catch (e) { /* hash mal escrito: se usa tal cual */ } irA(h, true); }
pedir();

const fuentes = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
fuentes.then(() => { cargaObj = Math.max(cargaObj, 0.82); medir(); });
if (document.readyState === 'complete') cargaObj = 1; else window.addEventListener('load', () => { cargaObj = 1; });
setTimeout(() => { cargaObj = 1; }, 3200);
if (window.ResizeObserver) new ResizeObserver(alCambiarTam).observe(marco);

} catch (error) {
  /* si algo falla, que la página nunca quede tapada por la pantalla de carga */
  document.documentElement.classList.remove('cargando');
  var tapa = document.getElementById('carga'); if (tapa) tapa.style.display = 'none';
  if (window.console) console.error(error);
}
})();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancarPagina);
else arrancarPagina();
