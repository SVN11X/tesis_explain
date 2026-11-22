import { test } from "node:test";
import assert from "node:assert/strict";
import DV from "../public/js/diagramas-vivos-datos.js";

const GRAFOS = { nav2: DV.nav2, energia: DV.energia };

function dentro(p, c, w, h, m = 0) {
  return Math.abs(p[0] - c[0]) <= w / 2 + m && Math.abs(p[1] - c[1]) <= h / 2 + m;
}

for (const [nombre, G] of Object.entries(GRAFOS)) {
  test(`${nombre}: ids únicos y aristas entre nodos que existen`, () => {
    const nodos = new Set(G.nodos.map((n) => n.id));
    assert.equal(nodos.size, G.nodos.length);
    assert.equal(new Set(G.aristas.map((a) => a.id)).size, G.aristas.length);
    for (const a of G.aristas) {
      assert.ok(nodos.has(a.de), `${a.id}: origen ${a.de}`);
      assert.ok(nodos.has(a.a), `${a.id}: destino ${a.a}`);
    }
  });

  test(`${nombre}: cada paso usa aristas que existen y cada etapa sale de la anterior`, () => {
    const aristas = new Map(G.aristas.map((a) => [a.id, a]));
    for (const paso of G.pasos) {
      assert.ok(paso.etapas.length > 0, paso.id);
      paso.etapas.forEach((etapa, k) => {
        assert.ok(etapa.length > 0, `${paso.id}: etapa ${k} vacía`);
        for (const id of etapa) assert.ok(aristas.has(id), `${paso.id}: la arista ${id} no existe`);
        if (k > 0) {
          const llegadas = new Set(paso.etapas[k - 1].map((id) => aristas.get(id).a));
          for (const id of etapa) assert.ok(llegadas.has(aristas.get(id).de), `${paso.id}: ${id} no sale de donde llega la etapa anterior`);
        }
      });
    }
  });

  for (const [vista, V] of Object.entries(G.vistas)) {
    test(`${nombre}, vista ${vista}: posiciones, rutas y ningún cruce con nodos ajenos`, () => {
      const [w, h] = V.nodo;
      for (const n of G.nodos) {
        const c = V.pos[n.id];
        assert.ok(c, `falta la posición de ${n.id}`);
        assert.ok(c[0] - w / 2 >= 0 && c[0] + w / 2 <= V.vb[0] && c[1] - h / 2 >= 0 && c[1] + h / 2 <= V.vb[1], `${n.id} sale del viewBox`);
        for (const m of G.nodos) {
          if (m.id < n.id) {
            const d = V.pos[m.id];
            assert.ok(Math.abs(c[0] - d[0]) >= w + 8 || Math.abs(c[1] - d[1]) >= h + 8, `${n.id} y ${m.id} se tocan`);
          }
        }
      }
      for (const a of G.aristas) {
        const r = V.rutas[a.id];
        assert.ok(r && r.length >= 2, `falta la ruta de ${a.id}`);
        assert.ok(dentro(r[0], V.pos[a.de], w, h), `${a.id}: empieza fuera de ${a.de}`);
        assert.ok(dentro(r[r.length - 1], V.pos[a.a], w, h), `${a.id}: termina fuera de ${a.a}`);
        for (const p of r) assert.ok(p[0] >= -(V.pad || 0) && p[0] <= V.vb[0] + (V.pad || 0) && p[1] >= 0 && p[1] <= V.vb[1], `${a.id}: punto fuera del viewBox`);
        for (let i = 0; i < r.length - 1; i++) {
          assert.ok(r[i][0] === r[i + 1][0] || r[i][1] === r[i + 1][1], `${a.id}: el tramo ${i} no es ortogonal`);
          const largo = Math.hypot(r[i + 1][0] - r[i][0], r[i + 1][1] - r[i][1]);
          for (let s = 0; s <= largo; s += 2) {
            const f = largo ? s / largo : 0;
            const p = [r[i][0] + (r[i + 1][0] - r[i][0]) * f, r[i][1] + (r[i + 1][1] - r[i][1]) * f];
            for (const n of G.nodos) {
              if (n.id === a.de || n.id === a.a) continue;
              assert.ok(!dentro(p, V.pos[n.id], w, h, 2), `${a.id} cruza el nodo ${n.id} en ${p}`);
            }
          }
        }
      }
    });
  }
}

for (const [nombre, G] of Object.entries(GRAFOS)) {
  for (const [vista, V] of Object.entries(G.vistas)) {
    test(`${nombre}, vista ${vista}: las insignias de las aristas no tocan un nodo, otra arista ni otra insignia`, () => {
      const [w, h] = V.nodo, r = DV.geo.radioMarca, marcas = DV.geo.marcas(G, V), fallos = [];
      const rutas = Object.fromEntries(G.aristas.map((a) => [a.id, DV.geo.recortar(V.rutas[a.id], V.pos[a.de], V.pos[a.a], w, h)]));
      for (const a of G.aristas) {
        const c = marcas[a.id];
        if (!c) { fallos.push(`${a.id}: no hay sitio para su insignia`); continue; }
        if (c[0] - r < -(V.pad || 0) || c[0] + r > V.vb[0] + (V.pad || 0) || c[1] - r < 0 || c[1] + r > V.vb[1]) fallos.push(`${a.id}: sale del viewBox`);
        for (const n of G.nodos) {
          const p = V.pos[n.id];
          if (c[0] + r > p[0] - w / 2 && c[0] - r < p[0] + w / 2 && c[1] + r > p[1] - h / 2 && c[1] - r < p[1] + h / 2) fallos.push(`${a.id}: toca el nodo ${n.id}`);
        }
        for (const e of G.aristas) {
          if (e.id === a.id) continue;
          const q = rutas[e.id];
          for (let i = 0; i < q.length - 1; i++) {
            if (Math.max(q[i][0], q[i + 1][0]) >= c[0] - r && Math.min(q[i][0], q[i + 1][0]) <= c[0] + r && Math.max(q[i][1], q[i + 1][1]) >= c[1] - r && Math.min(q[i][1], q[i + 1][1]) <= c[1] + r) fallos.push(`${a.id}: cruza la arista ${e.id}`);
          }
        }
        for (const o of G.aristas) {
          if (o.id <= a.id || !marcas[o.id]) continue;
          if (Math.hypot(marcas[o.id][0] - c[0], marcas[o.id][1] - c[1]) < 2 * r) fallos.push(`${a.id} y ${o.id} se superponen`);
        }
      }
      assert.deepEqual(fallos, []);
    });
  }
}

test("ciclo: las cuatro etapas, sus temas y los ritmos de la página", () => {
  const E = DV.ciclo.etapas;
  assert.deepEqual(E.map((e) => e.id), ["percibir", "estimar", "decidir", "moverse"]);
  const temas = E.flatMap((e) => e.enlaces.map((l) => l.t));
  assert.deepEqual(temas, ["Tema 5", "Tema 3", "Tema 5", "Tema 7", "Tema 6", "Tema 4"]);
  assert.equal(DV.ciclo.ritmos.ruedasHz, 30);
  assert.equal(DV.ciclo.ritmos.destinoS, 3.3);
  for (const V of Object.values(DV.ciclo.vistas)) for (const e of E) assert.ok(V.pos[e.id]);
});
