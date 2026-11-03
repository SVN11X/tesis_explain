import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';
import gsap from 'gsap';

export type PartId = 'laser' | 'cubierta' | 'electronica' | 'traccion';
export const PARTS: PartId[] = ['laser','cubierta','electronica','traccion'];

export type Robot = {root:THREE.Group; parts:Record<PartId,THREE.Group>; wheels:THREE.Group[]; original:Record<PartId,number>; head?:THREE.Object3D; cad?:boolean};

/** Geometría propia y procedural, no el CAD del prototipo. Queda para el visor ligero sin WebGL y para el laboratorio. */
export function createRobot():Robot {
  const root = new THREE.Group();
  const parts = Object.fromEntries(PARTS.map(k => [k, new THREE.Group()])) as Record<PartId, THREE.Group>;
  const black = new THREE.MeshStandardMaterial({color:0x202529,roughness:.52,metalness:.25});
  const lidMat = new THREE.MeshStandardMaterial({color:0x303638,roughness:.43,metalness:.35});
  const yellow = new THREE.MeshStandardMaterial({color:0xe7ed63,roughness:.36,metalness:.15});
  const rubber = new THREE.MeshStandardMaterial({color:0x0d1113,roughness:.93});
  const steel = new THREE.MeshStandardMaterial({color:0x9aa7aa,roughness:.35,metalness:.8});
  const green = new THREE.MeshStandardMaterial({color:0x155b4a,roughness:.7});
  const blue = new THREE.MeshStandardMaterial({color:0x1c6574,roughness:.65});
  const copper = new THREE.MeshStandardMaterial({color:0xc6a777,roughness:.45,metalness:.65});
  function mesh(g:THREE.BufferGeometry,m:THREE.Material,p:THREE.Group,x=0,y=0,z=0) {
    const o=new THREE.Mesh(g,m); o.position.set(x,y,z); o.castShadow=true; o.receiveShadow=true; p.add(o); return o;
  }
  const cylinder=(r:number,h:number,m:THREE.Material,p:THREE.Group,y:number,x=0,z=0)=>mesh(new THREE.CylinderGeometry(r,r,h,r<.004?10:40),m,p,x,y,z);
  const box=(w:number,h:number,d:number,m:THREE.Material,p:THREE.Group,x:number,y:number,z:number)=>mesh(new THREE.BoxGeometry(w,h,d),m,p,x,y,z);
  for(const [id,part] of Object.entries(parts)){part.userData.part=id;root.add(part);}
  cylinder(.104,.068,black,parts.traccion,.067);
  cylinder(.112,.008,black,parts.traccion,.031);
  cylinder(.108,.004,yellow,parts.traccion,.054);
  const wheels:THREE.Group[]=[];
  for(const x of [-.094,.094]){
    const wheel=new THREE.Group(); wheel.position.set(x,.0335,.018); parts.traccion.add(wheel); wheels.push(wheel);
    const tire=cylinder(.0335,.03,rubber,wheel,0); tire.rotation.z=Math.PI/2;
    const hub=cylinder(.018,.031,steel,wheel,0);hub.rotation.z=Math.PI/2;
    const inner=cylinder(.008,.032,black,wheel,0);inner.rotation.z=Math.PI/2;
    for(let i=0;i<18;i++){ const a=i/18*Math.PI*2; const tread=box(.031,.003,.006,black,wheel,0,Math.cos(a)*.033,Math.sin(a)*.033);tread.rotation.x=-a; }
  }
  const caster=mesh(new THREE.SphereGeometry(.012,16,12),steel,parts.traccion,0,.013,-.07);
  caster.scale.z=.8;
  parts.cubierta.position.y=.108;
  cylinder(.113,.027,black,parts.cubierta,0);
  cylinder(.114,.003,yellow,parts.cubierta,-.01);
  cylinder(.109,.008,lidMat,parts.cubierta,.017);
  // Tornillos, ventilación y panel frontal dan escala al objeto sin texturas externas.
  for(let i=0;i<8;i++){ const a=i/8*Math.PI*2;const screw=cylinder(.0028,.0015,steel,parts.cubierta,.022,Math.cos(a)*.095,Math.sin(a)*.095);screw.rotation.y=a; }
  for(let i=0;i<7;i++)box(.032,.001,.002,black,parts.cubierta,.06,.022,-.022+i*.006);
  box(.047,.012,.028,black,parts.cubierta,-.045,.025,-.052);
  const display=box(.032,.001,.017,new THREE.MeshBasicMaterial({color:0x607d74}),parts.cubierta,-.045,.032,-.052);
  display.userData.part='electronica';
  parts.electronica.position.y=.086;
  box(.075,.004,.052,green,parts.electronica,.018,0,-.01);
  box(.019,.008,.019,steel,parts.electronica,.015,.006,-.01);
  for(let i=0;i<9;i++)box(.0015,.008,.003,copper,parts.electronica,-.014+i*.004,.006,.01);
  box(.027,.004,.055,blue,parts.electronica,-.055,0,0);
  box(.012,.005,.018,black,parts.electronica,-.055,.005,-.004);
  for(let i=0;i<5;i++)box(.006,.005,.009,steel,parts.electronica,.052,.006,-.029+i*.01);
  for(const x of [-.018,.006]){const cell=cylinder(.009,.055,new THREE.MeshStandardMaterial({color:0x963c36,roughness:.6}),parts.electronica,.001,x,.049);cell.rotation.z=Math.PI/2;}
  parts.laser.position.y=.157;
  cylinder(.043,.012,black,parts.laser,0);
  cylinder(.036,.036,lidMat,parts.laser,.023);
  cylinder(.038,.004,black,parts.laser,.044);
  cylinder(.0365,.003,yellow,parts.laser,.009);
  const lens=box(.012,.009,.003,new THREE.MeshStandardMaterial({color:0x458c85,roughness:.1,metalness:.9}),parts.laser,0,.024,-.036);
  lens.rotation.y=0;
  const original=Object.fromEntries(Object.entries(parts).map(([id,p])=>[id,p.position.y])) as Record<PartId,number>;
  return {root,parts,wheels,original};
}

export function stage(host:HTMLElement, options:{ hero?:boolean; onFrame?:(dt:number)=>boolean; onLost?:()=>void }={}){
  let gpu:THREE.WebGLRenderer|undefined;
  try{const canvas=document.createElement('canvas');const context=canvas.getContext('webgl2',{antialias:true,alpha:true,powerPreference:'high-performance'});if(context)gpu=new THREE.WebGLRenderer({canvas,context,antialias:true,alpha:true,powerPreference:'high-performance'});}catch{/* SVG conserva la escena 3D cuando WebGL no está disponible. */}
  const renderer=gpu??new SVGRenderer();
  if(renderer instanceof SVGRenderer){renderer.setQuality('high');renderer.setPrecision(2);renderer.overdraw=.35;renderer.setClearColor(new THREE.Color(options.hero?0xf1f1e9:0x1a2b2b),1);}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));
  // En la portada el mapeo de tonos neutro conserva el negro del PLA y el amarillo de las franjas. ACES los
  // aclaraba hasta verse grises y crema.
  if(gpu){gpu.shadowMap.enabled=true;gpu.shadowMap.type=THREE.PCFShadowMap;gpu.toneMapping=options.hero?THREE.NeutralToneMapping:THREE.ACESFilmicToneMapping;gpu.toneMappingExposure=options.hero?1:1.15;}
  renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.dataset.renderer=gpu?'webgl':'svg';host.append(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(options.hero?35:41,1,.01,60);
  camera.position.set(...(options.hero?[.37,.30,.43]:[4.5,5,5.7]) as [number,number,number]);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.target.set(0,options.hero?.095:0,0);controls.enableDamping=true;controls.dampingFactor=.09;
  controls.maxPolarAngle=Math.PI*.48;controls.minPolarAngle=.08;
  if(options.hero){
    // Acercamiento con la rueda (solo con Ctrl, ver heroScene), el pellizco y los botones. Acerca hacia el puntero y el
    // centro de giro no se aleja más de 30 cm del robot.
    controls.enableZoom=true;controls.zoomToCursor=true;controls.zoomSpeed=.9;controls.enablePan=true;controls.screenSpacePanning=true;
    controls.minDistance=.12;controls.maxDistance=1.5;controls.cursor.set(0,.08,0);controls.maxTargetRadius=.3;
  }else{controls.enableZoom=false;controls.enablePan=false;controls.minDistance=3.8;controls.maxDistance=15;}
  let env:THREE.WebGLRenderTarget|undefined;
  if(gpu){const room=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(gpu);env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();}
  else scene.add(new THREE.AmbientLight(0xc5d0bf,.7));
  const hemi=new THREE.HemisphereLight(0xd8e4ec,0x182321,2.2);scene.add(hemi);
  const light=new THREE.DirectionalLight(0xf4fbff,gpu?4.2:1.1);light.position.set(-3,5,3);light.castShadow=!!gpu;
  light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-4;light.shadow.camera.right=4;
  light.shadow.camera.top=4;light.shadow.camera.bottom=-4;light.shadow.normalBias=.01;scene.add(light);
  const rim=new THREE.DirectionalLight(0xe6e987,gpu?2.3:.35);rim.position.set(2,2,-3);scene.add(rim);
  // En la portada la luz principal viene de adelante y de arriba: la sombra cae detrás del robot y no llega al borde.
  if(options.hero&&gpu){light.position.set(1.6,6,3.2);light.shadow.camera.left=light.shadow.camera.bottom=-.4;light.shadow.camera.right=light.shadow.camera.top=.4;light.shadow.mapSize.set(2048,2048);light.shadow.radius=4;rim.color.setHex(0xe4ecff);rim.position.set(-2.4,2.2,-3);}
  let dirty=true,visible=true,dead=false,raf=0,last=0,lastPaint=0;
  const invalidate=()=>{dirty=true;};controls.addEventListener('change',invalidate);
  const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(w&&h){renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();invalidate();}});resize.observe(host);
  function tick(ts:number){raf=0;if(dead||!visible||document.hidden)return;const dt=last?Math.min((ts-last)/1000,.05):0;last=ts;
    const changed=options.onFrame?.(dt)||false;const orbit=controls.update(dt);dirty=dirty||changed||orbit;if(dirty&&(gpu||ts-lastPaint>66)){renderer.render(scene,camera);dirty=false;lastPaint=ts;}raf=requestAnimationFrame(tick);
  }
  function resume(){last=0;if(!raf&&!dead&&visible&&!document.hidden)raf=requestAnimationFrame(tick);}
  const observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting;resume();},{rootMargin:'80px'});observer.observe(host);
  const visibility=()=>resume();document.addEventListener('visibilitychange',visibility);
  const lost=(e:Event)=>{e.preventDefault();options.onLost?.();};renderer.domElement.addEventListener('webglcontextlost',lost);
  resume();
  function dispose(){dead=true;cancelAnimationFrame(raf);resize.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);controls.dispose();
    const geometry=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.LineSegments||o instanceof THREE.Points){geometry.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);const map=(m as THREE.MeshBasicMaterial).map;if(map)textures.add(map);}}});
    geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env?.dispose();gpu?.dispose();renderer.domElement.remove();
  }
  return {renderer,scene,camera,controls,invalidate,dispose,lightweight:!gpu,lights:{hemi,key:light,rim}};
}

/** Tema efectivo de la página: el elegido con el botón de la cabecera o, si no hay elección, el del sistema. */
export function temaOscuro(){const t=document.documentElement.getAttribute('data-theme');return t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);}

export type Vista='perspectiva'|'frente'|'arriba';
export type EstadoVista={zoom:number;cerca:boolean;lejos:boolean;enfocada:PartId|null};
/** Color de cada pieza, el mismo de su pestaña en la portada (css: --c-turquesa, --c-amarillo, --c-verde y
    --c-naranja), en el tema claro y en el oscuro. */
export const COLOR_PIEZA:Record<PartId,[number,number]>={laser:[0x00838c,0x4fd2db],cubierta:[0xb39a00,0xe9dc4b],electronica:[0x4f8f1f,0xa3d65f],traccion:[0xc4561a,0xff9d57]};

/** Piso de la portada: anillos de barrido que se desvanecen hacia el borde, sin un disco que se corte. */
function texturaPiso(oscuro:boolean){
  const n=512,c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d');
  if(!g)return undefined;
  const tinta=oscuro?'226,236,214':'24,40,37';
  const fondo=g.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);
  fondo.addColorStop(0,`rgba(${tinta},${oscuro?.07:.05})`);fondo.addColorStop(.7,`rgba(${tinta},${oscuro?.03:.02})`);fondo.addColorStop(1,`rgba(${tinta},0)`);
  g.fillStyle=fondo;g.fillRect(0,0,n,n);
  for(let i=1;i<=6;i++){const r=i/6*n*.47;g.beginPath();g.arc(n/2,n/2,r,0,Math.PI*2);g.lineWidth=i%3===0?2.2:1.2;g.strokeStyle=`rgba(${tinta},${(oscuro?.28:.2)*(1-i/7.5)})`;g.stroke();}
  // marcas cada 30 grados, más largas en los ejes
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r1=n*.47*(i%3===0?.86:.92),r2=n*.47;g.beginPath();g.moveTo(n/2+Math.cos(a)*r1,n/2+Math.sin(a)*r1);g.lineTo(n/2+Math.cos(a)*r2,n/2+Math.sin(a)*r2);g.lineWidth=1.4;g.strokeStyle=`rgba(${tinta},${oscuro?.3:.22})`;g.stroke();}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
function texturaSombra(){
  const n=256,c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d');
  if(!g)return undefined;
  const r=g.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);r.addColorStop(0,'rgba(0,0,0,.42)');r.addColorStop(.55,'rgba(0,0,0,.18)');r.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=r;g.fillRect(0,0,n,n);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

export async function heroScene(host:HTMLElement,onSelect:(id:PartId)=>void,onLost:()=>void,modelUrl?:string,onView?:(estado:EstadoVista)=>void){
  let motion=!matchMedia('(prefers-reduced-motion: reduce)').matches, spin:THREE.Object3D|undefined;
  let exploded=false, vista:Vista='perspectiva', enfocada:PartId|null=null, seleccion:PartId='laser';
  const s=stage(host,{hero:true,onLost,onFrame:(dt)=>{if(spin&&motion&&!exploded){spin.rotation.y+=dt*.75;s.invalidate();return true;}return false;}});
  // Sin WebGL el visor dibuja en SVG y el modelo del CAD sería demasiado pesado: queda el robot procedural.
  // El cargador del CAD va en su propio módulo, para que el laboratorio LiDAR no lo descargue.
  let robot:Robot;
  if(s.lightweight||!modelUrl)robot=createRobot();
  else{try{const {loadRobot}=await import('./robot-cad');robot=await loadRobot(modelUrl);}catch(error){console.warn('No se pudo cargar el modelo del CAD; se usa el robot ilustrativo.',error);robot=createRobot();}}
  spin=robot.head??robot.parts.laser;
  // Despiece y cámara: el modelo del CAD mide 15 cm de alto y el ilustrativo, 20 cm. Cada vista guarda la posición de
  // la cámara con el robot armado y desmontado, y la altura del punto que mira.
  const C=robot.cad?{offsets:{traccion:0,electronica:.075,cubierta:.15,laser:.24},target:[.075,.19],
      vistas:{perspectiva:[[.37,.3,.43],[.6,.45,.72]],frente:[[0,.15,.5],[0,.25,1.02]],arriba:[[0,.6,.005],[0,1.12,.005]]}}
    :{offsets:{traccion:0,electronica:.10,cubierta:.21,laser:.34},target:[.095,.24],
      vistas:{perspectiva:[[.37,.3,.43],[.72,.53,.84]],frente:[[0,.16,.56],[0,.27,1.18]],arriba:[[0,.65,.005],[0,1.3,.005]]}};
  s.controls.target.y=C.target[0];s.controls.update();
  s.scene.add(robot.root);
  // Piso: anillos que se desvanecen, una sombra de contacto y la sombra de la luz principal
  let pisoMapa=texturaPiso(temaOscuro());const sombraMapa=texturaSombra();
  const pisoMat=new THREE.MeshBasicMaterial({map:pisoMapa,transparent:true,depthWrite:false,toneMapped:false});
  const piso=new THREE.Mesh(new THREE.CircleGeometry(.25,96),pisoMat);piso.rotation.x=-Math.PI/2;piso.position.y=-.0006;piso.renderOrder=-2;s.scene.add(piso);
  const contacto=new THREE.Mesh(new THREE.CircleGeometry(.18,64),new THREE.MeshBasicMaterial({map:sombraMapa,transparent:true,depthWrite:false,toneMapped:false}));
  contacto.rotation.x=-Math.PI/2;contacto.position.y=-.0003;contacto.renderOrder=-1;s.scene.add(contacto);
  const sombraMat=new THREE.ShadowMaterial({opacity:.3});
  if(!s.lightweight){const floor=new THREE.Mesh(new THREE.CircleGeometry(.4,64),sombraMat);floor.rotation.x=-Math.PI/2;floor.position.y=-.0001;floor.receiveShadow=true;s.scene.add(floor);}
  // Aro de la pieza elegida, con el color de su pestaña
  robot.root.updateMatrixWorld(true);
  const anillos=Object.fromEntries((Object.keys(robot.parts) as PartId[]).map(id=>{const part=robot.parts[id],b=new THREE.Box3().setFromObject(part),size=b.getSize(new THREE.Vector3()),c=part.worldToLocal(b.getCenter(new THREE.Vector3()));
    return [id,{r:Math.max(size.x,size.z)/2*1.04,x:c.x,y:part.worldToLocal(b.max.clone()).y+.003,z:c.z}];})) as Record<PartId,{r:number;x:number;y:number;z:number}>;
  const highlightMat=new THREE.MeshBasicMaterial({color:COLOR_PIEZA.laser[0],transparent:true,opacity:.9,depthTest:false,toneMapped:false});
  const highlight=new THREE.Mesh(new THREE.TorusGeometry(.049,.0009,6,72),highlightMat);highlight.rotation.x=Math.PI/2;highlight.renderOrder=20;robot.parts.laser.add(highlight);highlight.position.y=.045;
  // Con el CAD, la carcasa se vuelve transparente cuando la pieza elegida queda dentro de ella
  const carcasa:THREE.MeshStandardMaterial[]=[],mallasCarcasa:THREE.Mesh[]=[];
  if(robot.cad)robot.parts.cubierta.traverse(o=>{const m=o as THREE.Mesh;if(m.isMesh&&m!==highlight){mallasCarcasa.push(m);for(const mat of Array.isArray(m.material)?m.material:[m.material])if(!carcasa.includes(mat as THREE.MeshStandardMaterial))carcasa.push(mat as THREE.MeshStandardMaterial);}});
  let transparente=false;host.dataset.carcasa='opaca';
  function rayosX(){const valor=!!robot.cad&&!exploded&&(seleccion==='electronica'||seleccion==='traccion');if(valor===transparente)return;transparente=valor;
    for(const m of carcasa){gsap.killTweensOf(m);m.transparent=true;m.depthWrite=!valor;m.needsUpdate=true;gsap.to(m,{opacity:valor?.16:1,duration:duration()*.75,ease:'power2.out',onUpdate:s.invalidate,onComplete:()=>{if(!valor){m.transparent=false;m.depthWrite=true;m.needsUpdate=true;}s.invalidate();}});}
    for(const m of mallasCarcasa)m.castShadow=!valor;host.dataset.carcasa=valor?'transparente':'opaca';s.invalidate();}
  // En el tema oscuro el robot negro se perdería sobre el fondo: suben la luz de contorno y el entorno.
  const L=s.lights;
  function tema(){const oscuro=temaOscuro();
    s.scene.environmentIntensity=oscuro?.85:.55;L.hemi.intensity=oscuro?1:.75;L.key.intensity=s.lightweight?1.1:oscuro?2.8:2.6;L.rim.intensity=s.lightweight?.35:oscuro?3.4:1.3;
    sombraMat.opacity=oscuro?.5:.22;const viejo=pisoMapa;pisoMapa=texturaPiso(oscuro);pisoMat.map=pisoMapa??null;pisoMat.needsUpdate=true;viejo?.dispose();
    highlightMat.color.setHex(COLOR_PIEZA[seleccion][oscuro?1:0]);
    if(s.renderer instanceof SVGRenderer)s.renderer.setClearColor(new THREE.Color(oscuro?0x121a17:0xf1f1e9),1);s.invalidate();}
  // js/marco.js avisa con temacambio tanto el botón como un cambio del sistema
  tema();document.addEventListener('temacambio',tema);
  function select(id:PartId){seleccion=id;robot.parts[id].add(highlight);highlightMat.color.setHex(COLOR_PIEZA[id][temaOscuro()?1:0]);
    if(robot.cad){const a=anillos[id];highlight.scale.setScalar(a.r/.049);highlight.position.set(a.x,a.y,a.z);}
    else{const radius=id==='laser'?.049:id==='electronica'?.078:.121;highlight.scale.setScalar(radius/.049);highlight.position.set(0,id==='laser'?.045:id==='electronica'?.015:id==='cubierta'?.026:.055,0);}
    rayosX();s.invalidate();}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const duration=()=>reduced.matches?0:.8;
  // Cámara: un encuadre por vista y estado del despiece, acercamiento y foco en una pieza
  const V=(a:number[])=>new THREE.Vector3(a[0],a[1],a[2]);
  function encuadre(){return {target:new THREE.Vector3(0,C.target[exploded?1:0],0),position:V(C.vistas[vista][exploded?1:0])};}
  const distanciaBase=()=>{const e=encuadre();return e.position.distanceTo(e.target);};
  function avisar(){const d=s.camera.position.distanceTo(s.controls.target);onView?.({zoom:distanciaBase()/d,cerca:d<=s.controls.minDistance*1.02,lejos:d>=s.controls.maxDistance*.98,enfocada});}
  s.controls.addEventListener('change',avisar);
  function ir(target:THREE.Vector3,position:THREE.Vector3,d=duration()){
    gsap.killTweensOf(s.controls.target);gsap.killTweensOf(s.camera.position);
    const listo=()=>{s.invalidate();avisar();};
    if(!d){s.controls.target.copy(target);s.camera.position.copy(position);s.controls.update();listo();return;}
    gsap.to(s.controls.target,{x:target.x,y:target.y,z:target.z,duration:d,ease:'power3.inOut',onUpdate:listo});
    gsap.to(s.camera.position,{x:position.x,y:position.y,z:position.z,duration:d,ease:'power3.inOut',onUpdate:listo,onComplete:listo});
  }
  function zoom(factor:number){const t=s.controls.target.clone(),off=s.camera.position.clone().sub(t);
    off.setLength(THREE.MathUtils.clamp(off.length()*factor,s.controls.minDistance,s.controls.maxDistance));ir(t,t.clone().add(off),reduced.matches?0:.35);}
  function reset(){enfocada=null;const e=encuadre();ir(e.target,e.position);}
  // Dirección desde la que se mira cada pieza al enfocarla, y cuánto se acerca
  const FOCO:Record<PartId,{dir:number[];k:number}>={laser:{dir:[.55,.62,.56],k:1.35},cubierta:{dir:[.37,.3,.43],k:1},electronica:{dir:[.42,.82,.42],k:1.05},traccion:{dir:[.88,.32,.36],k:.95}};
  function focus(id:PartId){
    if(id==='cubierta'){reset();return;}
    enfocada=id;robot.root.updateMatrixWorld(true);const caja=new THREE.Box3();
    robot.parts[id].traverse(o=>{if((o as THREE.Mesh).isMesh&&o!==highlight)caja.expandByObject(o);});
    if(caja.isEmpty()){reset();return;}
    const centro=caja.getCenter(new THREE.Vector3()),radio=caja.getSize(new THREE.Vector3()).length()/2;
    const d=THREE.MathUtils.clamp(radio/Math.sin(THREE.MathUtils.degToRad(s.camera.fov/2))*FOCO[id].k,s.controls.minDistance*1.3,s.controls.maxDistance);
    ir(centro,centro.clone().add(V(FOCO[id].dir).normalize().multiplyScalar(d)));
  }
  function orbit(azimut:number,polar:number){if(azimut)s.controls.rotateLeft(azimut);if(polar)s.controls.rotateUp(polar);s.invalidate();}
  const raycaster=new THREE.Raycaster();let down={x:0,y:0};
  // Solo cuentan los toques sobre el lienzo: los botones de acercamiento quedan encima del modelo.
  const sobreLienzo=(e:PointerEvent)=>e.target instanceof Node&&s.renderer.domElement.contains(e.target);
  const onDown=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY};};
  const onUp=(e:PointerEvent)=>{if(!sobreLienzo(e)||Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)return;const r=host.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),s.camera);
    const visibles=raycaster.intersectObject(robot.root,true).filter(h=>{const m=h.object as THREE.Mesh;const mat=m.material as THREE.Material|undefined;return m!==highlight&&!(transparente&&mat&&carcasa.includes(mat as THREE.MeshStandardMaterial));});
    let obj:THREE.Object3D|undefined=visibles[0]?.object;while(obj&&!obj.userData.part)obj=obj.parent??undefined;if(obj?.userData.part)onSelect(obj.userData.part);
  };host.addEventListener('pointerdown',onDown);host.addEventListener('pointerup',onUp);
  // La rueda sola desplaza la página, como en cualquier parte del sitio. Con Ctrl (o el pellizco del panel táctil, que
  // llega con Ctrl) acerca. Safari envía el pellizco como gesto.
  let avisoRueda=0;const onAvisoRueda=new Set<()=>void>();
  const onWheel=(e:WheelEvent)=>{if(e.ctrlKey||e.metaKey)return;e.stopPropagation();const ahora=performance.now();if(ahora-avisoRueda>1200){avisoRueda=ahora;onAvisoRueda.forEach(f=>f());}};
  host.addEventListener('wheel',onWheel,{capture:true,passive:true});
  let escalaGesto=1;
  const onGestureStart=(e:Event)=>{e.preventDefault();escalaGesto=1;};
  const onGestureChange=(e:Event)=>{e.preventDefault();const escala=(e as unknown as {scale:number}).scale||1;zoomInmediato(escalaGesto/escala);escalaGesto=escala;};
  function zoomInmediato(factor:number){const t=s.controls.target,off=s.camera.position.clone().sub(t);off.setLength(THREE.MathUtils.clamp(off.length()*factor,s.controls.minDistance,s.controls.maxDistance));s.camera.position.copy(t).add(off);s.controls.update();s.invalidate();}
  host.addEventListener('gesturestart',onGestureStart);host.addEventListener('gesturechange',onGestureChange);
  function explode(value:boolean){exploded=value;enfocada=null;const offsets=C.offsets;
    for(const id of Object.keys(robot.parts) as PartId[]){gsap.killTweensOf(robot.parts[id].position);gsap.to(robot.parts[id].position,{y:robot.original[id]+(value?offsets[id]:0),duration:duration(),ease:'power3.inOut',onUpdate:s.invalidate});}
    rayosX();const e=encuadre();ir(e.target,e.position);
  }
  function view(preset:Vista){vista=preset;reset();}
  const mq=()=>{if(reduced.matches)motion=false;};if(reduced.addEventListener)reduced.addEventListener('change',mq);else reduced.addListener(mq);
  avisar();
  return {explode,view,select,focus,zoom,reset,orbit,alAvisoRueda:(f:()=>void)=>{onAvisoRueda.add(f);},lightweight:s.lightweight,cad:!!robot.cad,setMotion:(v:boolean)=>{motion=v;},
    dispose:()=>{for(const p of Object.values(robot.parts))gsap.killTweensOf(p.position);for(const m of carcasa)gsap.killTweensOf(m);gsap.killTweensOf(s.camera.position);gsap.killTweensOf(s.controls.target);
      host.removeEventListener('pointerdown',onDown);host.removeEventListener('pointerup',onUp);host.removeEventListener('wheel',onWheel,{capture:true});host.removeEventListener('gesturestart',onGestureStart);host.removeEventListener('gesturechange',onGestureChange);
      if(reduced.removeEventListener)reduced.removeEventListener('change',mq);else reduced.removeListener(mq);
      document.removeEventListener('temacambio',tema);onAvisoRueda.clear();s.dispose();}};
}
