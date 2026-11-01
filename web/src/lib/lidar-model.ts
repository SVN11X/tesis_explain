/** Laboratorio didáctico determinista. Coordenadas x/z en metros; y es altura.
 * No ejecuta SLAM Toolbox ni reproduce un ensayo del prototipo. */
export type Pose = { x: number; z: number; yaw: number };
export type Obstacle = { id: string; x: number; z: number; w: number; d: number; h: number; low?: boolean };
export type ScenarioId = 'recinto' | 'esquina' | 'bajo';
export type Scenario = { id: ScenarioId; name: string; description: string; obstacles: Obstacle[]; start: Pose; route: [number, number][] };
export type Ray = { x: number; z: number; distance: number; hit: boolean; obstacle?: string };
export type Frame = { pose: Pose; height: number; range: number; grid: Int8Array; rays: Ray[]; elapsed: number; sequence: number; routeIndex: number };
export const WORLD = { width: 5.6, depth: 4, resolution: 0.08, cols: 70, rows: 50, robotRadius: 0.145, rayCount: 230 };
const walls: Obstacle[] = [
  { id: 'pared-oeste', x: -2.8, z: 0, w: .10, d: 4.1, h: .8 },
  { id: 'pared-este', x: 2.8, z: 0, w: .10, d: 4.1, h: .8 },
  { id: 'pared-norte', x: 0, z: -2, w: 5.6, d: .10, h: .8 },
  { id: 'pared-sur', x: 0, z: 2, w: 5.6, d: .10, h: .8 },
];
export function scenario(id: ScenarioId): Scenario {
  const presets: Record<ScenarioId, Omit<Scenario, 'id'>> = {
    recinto: {
      name: 'El recinto', description: 'Un tabique oculta parte de la habitación. Cambia de posición para descubrir lo que hay detrás.',
      obstacles: [{ id: 'tabique', x: .2, z: .2, w: .12, d: 2.05, h: .65 }, { id: 'bloque', x: 1.35, z: -.8, w: .65, d: .5, h: .55 }, { id: 'columna', x: -1.3, z: 1.12, w: .45, d: .45, h: .8 }],
      start: { x: -1.5, z: -.7, yaw: .25 }, route: [[-1.5, -.7], [-1.5, .2], [-.65, .65], [-.65, 1.6], [2.15, 1.6], [2.15, -1.55], [-1.5, -1.55], [-1.5, -.7]],
    },
    esquina: {
      name: 'La esquina', description: 'El primer impacto termina cada rayo. Las celdas de detrás permanecen desconocidas.',
      obstacles: [{ id: 'tabique', x: .25, z: -.1, w: .12, d: 1.9, h: .7 }, { id: 'ala', x: .9, z: -1, w: 1.3, d: .12, h: .7 }],
      start: { x: -1.3, z: .7, yaw: -.35 }, route: [[-1.3, .7], [-1.3, 1.45], [1.9, 1.45], [1.9, -.4], [1.1, -.4], [1.9, 1.45], [-1.3, 1.45], [-1.3, .7]],
    },
    bajo: {
      name: 'El punto ciego', description: 'Esta caja mide 12 cm. Con el láser a 24 cm, el barrido pasa por encima. Baja el plano de medida para detectarla.',
      obstacles: [{ id: 'caja-baja', x: 0, z: 0, w: .9, d: .7, h: .12, low: true }, { id: 'armario', x: 1.45, z: .9, w: .6, d: .7, h: .75 }],
      start: { x: -1.25, z: 0, yaw: 0 }, route: [[-1.25, 0], [-1.25, -1.1], [1.8, -1.1], [1.8, 0], [.8, 0], [.8, -1.1], [-1.25, -1.1], [-1.25, 0]],
    },
  };
  const s = presets[id] || presets.recinto;
  return { id: id in presets ? id : 'recinto', ...s, obstacles: [...walls, ...s.obstacles].map(o => ({ ...o })), start: { ...s.start }, route: s.route.map(p => [...p]) };
}
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Intersección de un rayo con una caja horizontal, incluido el origen interior. */
export function boxDistance(x: number, z: number, dx: number, dz: number, o: Obstacle): number {
  let near = -Infinity, far = Infinity;
  for (const [p, d, lo, hi] of [[x, dx, o.x - o.w / 2, o.x + o.w / 2], [z, dz, o.z - o.d / 2, o.z + o.d / 2]]) {
    if (Math.abs(d) < 1e-12) { if (p < lo || p > hi) return Infinity; }
    else { const a = (lo - p) / d, b = (hi - p) / d; near = Math.max(near, Math.min(a, b)); far = Math.min(far, Math.max(a, b)); }
  }
  if (far < 0 || near > far) return Infinity;
  return Math.max(0, near);
}
export function scan(pose: Pose, obstacles: Obstacle[], height: number, range: number): Ray[] {
  return Array.from({ length: WORLD.rayCount }, (_, i) => {
    const angle = pose.yaw + i * Math.PI * 2 / WORLD.rayCount, dx = Math.cos(angle), dz = Math.sin(angle);
    let distance = range, obstacle: string | undefined;
    for (const o of obstacles) {
      if (o.h < height) continue;
      const d = boxDistance(pose.x, pose.z, dx, dz, o);
      if (d <= distance) { distance = d; obstacle = o.id; }
    }
    return { x: pose.x + dx * distance, z: pose.z + dz * distance, distance, hit: obstacle !== undefined, obstacle };
  });
}
export function canPlace(x: number, z: number, obstacles: Obstacle[]): boolean {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
  const r = WORLD.robotRadius;
  return !obstacles.some(o => {
    const cx = clamp(x, o.x - o.w / 2, o.x + o.w / 2), cz = clamp(z, o.z - o.d / 2, o.z + o.d / 2);
    return Math.hypot(x - cx, z - cz) < r;
  }) && Math.abs(x) < WORLD.width / 2 - r && Math.abs(z) < WORLD.depth / 2 - r;
}
export function cellAt(x: number, z: number): number {
  const col = Math.floor((x + WORLD.width / 2) / WORLD.resolution), row = Math.floor((z + WORLD.depth / 2) / WORLD.resolution);
  return col >= 0 && col < WORLD.cols && row >= 0 && row < WORLD.rows ? row * WORLD.cols + col : -1;
}
export function observe(grid: Int8Array, pose: Pose, rays: Ray[]): void {
  for (const ray of rays) {
    const length = Math.max(ray.distance, 1e-12), dx = (ray.x - pose.x) / length, dz = (ray.z - pose.z) / length;
    for (let t = 0; t < length - .012; t += WORLD.resolution / 3) {
      const cell = cellAt(pose.x + dx * t, pose.z + dz * t);
      if (cell >= 0 && grid[cell] !== 100) grid[cell] = 0;
    }
    if (ray.hit) { const cell = cellAt(ray.x + dx * .003, ray.z + dz * .003); if (cell >= 0) grid[cell] = 100; }
  }
}
export function metrics(grid: Int8Array) {
  let free = 0, occupied = 0;
  for (const value of grid) { if (value === 0) free++; else if (value === 100) occupied++; }
  return { free, occupied, unknown: grid.length - free - occupied, knownPercent: (free + occupied) / grid.length * 100, freeArea: free * WORLD.resolution ** 2 };
}
export class LidarModel {
  scene: Scenario;
  pose: Pose;
  height = .24;
  range = 3.5;
  grid = new Int8Array(WORLD.cols * WORLD.rows).fill(-1);
  rays: Ray[] = [];
  elapsed = 0;
  sequence = 0;
  routeIndex = 1;
  constructor(id: ScenarioId = 'recinto') { this.scene = scenario(id); this.pose = { ...this.scene.start }; this.measure(); }
  measure() { this.rays = scan(this.pose, this.scene.obstacles, this.height, this.range); observe(this.grid, this.pose, this.rays); this.sequence++; return this.frame(); }
  move(x: number, z: number, yaw = this.pose.yaw) {
    if (!canPlace(x, z, this.scene.obstacles) || !Number.isFinite(yaw)) return false;
    this.pose = { x, z, yaw }; this.measure(); return true;
  }
  setSensor(height: number, range: number) {
    if (!Number.isFinite(height) || !Number.isFinite(range)) return false;
    this.height = clamp(height, .06, .55); this.range = clamp(range, .5, 5.5);
    // Una altura/rango diferente inicia otro experimento: no mezcla mapas de planos distintos.
    this.grid.fill(-1); this.sequence = 0; this.elapsed = 0; this.measure(); return true;
  }
  advance(dt: number) {
    if (!(dt > 0) || !Number.isFinite(dt) || this.routeIndex >= this.scene.route.length) return false;
    const target = this.scene.route[this.routeIndex], dx = target[0] - this.pose.x, dz = target[1] - this.pose.z, distance = Math.hypot(dx, dz);
    const travel = Math.min(distance, .13 * Math.min(dt, .1));
    if (distance < .008) { this.routeIndex++; return this.routeIndex < this.scene.route.length; }
    const x = this.pose.x + dx / distance * travel, z = this.pose.z + dz / distance * travel;
    if (!canPlace(x, z, this.scene.obstacles)) return false;
    this.pose = { x, z, yaw: Math.atan2(dz, dx) }; this.elapsed += Math.min(dt, .1); return true;
  }
  frame(): Frame { return { pose: { ...this.pose }, height: this.height, range: this.range, grid: this.grid.slice(), rays: this.rays.map(r => ({ ...r })), elapsed: this.elapsed, sequence: this.sequence, routeIndex: this.routeIndex }; }
  restore(frame: Frame) {
    this.pose = { ...frame.pose }; this.height = frame.height; this.range = frame.range;
    this.grid = frame.grid.slice(); this.rays = frame.rays.map(r => ({ ...r })); this.elapsed = frame.elapsed; this.sequence = frame.sequence;
    this.routeIndex = frame.routeIndex;
  }
}
