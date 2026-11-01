import test from 'node:test';
import assert from 'node:assert/strict';
import { LidarModel, scenario, scan, cellAt, WORLD, metrics, canPlace, boxDistance } from '../src/lib/lidar-model.ts';

test('el primer obstáculo detiene el rayo; un paralelo fuera no tiene impacto', () => {
  const box = { id: 'b', x: 1, z: 0, w: .2, d: 1, h: 1 };
  assert.equal(boxDistance(0, 0, 1, 0, box), .9);
  assert.equal(boxDistance(0, 2, 1, 0, box), Infinity);
  const rays = scan({x:0,z:0,yaw:0}, [box, {...box,id:'b2',x:2}], .2, 5);
  assert.equal(rays[0].obstacle, 'b');
  assert.equal(rays.length, 230);
});
test('el objeto bajo es invisible a 24 cm y visible a 8 cm, pero siempre colisiona', () => {
  const s = scenario('bajo');
  const high = scan(s.start, s.obstacles, .24, 5);
  const low = scan(s.start, s.obstacles, .08, 5);
  assert.notEqual(high[0].obstacle, 'caja-baja');
  assert.equal(low[0].obstacle, 'caja-baja');
  assert.equal(canPlace(0,0,s.obstacles), false);
});
test('las regiones ocluidas permanecen desconocidas y el área coincide con el conteo', () => {
  const model = new LidarModel('recinto');
  assert.equal(model.grid[cellAt(1, .2)], -1);
  const m = metrics(model.grid);
  assert.equal(m.free + m.occupied + m.unknown, WORLD.cols * WORLD.rows);
  assert.equal(m.freeArea, m.free * .08 ** 2);
});
test('cambiar el plano reinicia la evidencia acumulada', () => {
  const a = new LidarModel('bajo');
  a.move(-1.5,1.5); a.move(-1.25,0,0); a.setSensor(.08,3.5);
  const b = new LidarModel('bajo'); b.setSensor(.08,3.5);
  assert.deepEqual(a.grid,b.grid);
});
test('los fotogramas son independientes y restauran pose, mediciones y celdas', () => {
  const a = new LidarModel(); const saved = a.frame(); const before = saved.grid.slice();
  a.move(-1.5,0); assert.deepEqual(saved.grid,before);
  a.restore(saved); assert.deepEqual(a.frame(),saved);
});
test('las rutas de los tres escenarios terminan sin atravesar obstáculos', () => {
  for (const id of ['recinto','esquina','bajo']) {
    const a = new LidarModel(id);
    let n = 0;
    while (n++ < 10000 && a.advance(.1)) assert.ok(canPlace(a.pose.x,a.pose.z,a.scene.obstacles));
    assert.ok(a.routeIndex >= a.scene.route.length, `${id}: ruta bloqueada en ${JSON.stringify(a.pose)}`);
  }
});
test('entrada inválida no corrompe el estado', () => {
  const a = new LidarModel(); const before = a.frame();
  assert.equal(a.move(NaN,0),false); assert.equal(a.move(100,0),false);
  assert.equal(a.setSensor(Infinity,1),false); assert.equal(a.advance(Infinity),false);
  assert.deepEqual(a.frame(),before);
});
