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
  if(gpu){gpu.shadowMap.enabled=true;gpu.shadowMap.type=THREE.PCFShadowMap;gpu.toneMapping=THREE.ACESFilmicToneMapping;gpu.toneMappingExposure=1.15;}
  renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.dataset.renderer=gpu?'webgl':'svg';host.append(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(options.hero?35:41,1,.01,60);
  camera.position.set(...(options.hero?[.37,.30,.43]:[4.5,5,5.7]) as [number,number,number]);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.target.set(0,options.hero?.095:0,0);controls.enableDamping=true;controls.dampingFactor=.09;
  controls.enablePan=false;controls.minDistance=options.hero?.34:3.8;controls.maxDistance=options.hero?1.6:15;
  controls.maxPolarAngle=Math.PI*.48;controls.minPolarAngle=.08;controls.enableZoom=false;
  let env:THREE.WebGLRenderTarget|undefined;
  if(gpu){const room=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(gpu);env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();}
  else scene.add(new THREE.AmbientLight(0xc5d0bf,.7));
  scene.add(new THREE.HemisphereLight(0xd8e4ec,0x182321,2.2));
  const light=new THREE.DirectionalLight(0xf4fbff,gpu?4.2:1.1);light.position.set(-3,5,3);light.castShadow=!!gpu;
  light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-4;light.shadow.camera.right=4;
  light.shadow.camera.top=4;light.shadow.camera.bottom=-4;light.shadow.normalBias=.01;scene.add(light);
  const rim=new THREE.DirectionalLight(0xe6e987,gpu?2.3:.35);rim.position.set(2,2,-3);scene.add(rim);
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
    const geometry=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.LineSegments||o instanceof THREE.Points){geometry.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
    geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());env?.dispose();gpu?.dispose();renderer.domElement.remove();
  }
  return {renderer,scene,camera,controls,invalidate,dispose,lightweight:!gpu};
}

/** Tema efectivo de la página: el elegido con el botón de la cabecera o, si no hay elección, el del sistema. */
export function temaOscuro(){const t=document.documentElement.getAttribute('data-theme');return t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);}

export async function heroScene(host:HTMLElement,onSelect:(id:PartId)=>void,onLost:()=>void,modelUrl?:string){
  let motion=!matchMedia('(prefers-reduced-motion: reduce)').matches, spin:THREE.Object3D|undefined;
  let exploded=false, activeTween:gsap.core.Tween|undefined;
  const s=stage(host,{hero:true,onLost,onFrame:(dt)=>{if(spin&&motion&&!exploded){spin.rotation.y+=dt*.75;s.invalidate();return true;}return false;}});
  // Sin WebGL el visor dibuja en SVG y el modelo del CAD sería demasiado pesado: queda el robot procedural.
  // El cargador del CAD va en su propio módulo, para que el laboratorio LiDAR no lo descargue.
  let robot:Robot;
  if(s.lightweight||!modelUrl)robot=createRobot();
  else{try{const {loadRobot}=await import('./robot-cad');robot=await loadRobot(modelUrl);}catch(error){console.warn('No se pudo cargar el modelo del CAD; se usa el robot ilustrativo.',error);robot=createRobot();}}
  spin=robot.head??robot.parts.laser;
  // Despiece y cámara: el modelo del CAD mide 15 cm de alto y el ilustrativo, 20 cm.
  const C=robot.cad?{offsets:{traccion:0,electronica:.075,cubierta:.15,laser:.24},target:[.075,.19],cam:[[.37,.3,.43],[.6,.45,.72]]}
    :{offsets:{traccion:0,electronica:.10,cubierta:.21,laser:.34},target:[.095,.24],cam:[[.37,.3,.43],[.72,.53,.84]]};
  s.controls.target.y=C.target[0];s.controls.update();
  s.scene.add(robot.root);
  const plinthMat=new THREE.MeshStandardMaterial({color:0x263331,roughness:.8,metalness:.2}),ringMat=new THREE.MeshBasicMaterial({color:0x8b9b7e,side:THREE.DoubleSide});
  const plinth=new THREE.Mesh(new THREE.CylinderGeometry(.21,.218,.012,80),plinthMat);plinth.position.y=-.009;plinth.receiveShadow=true;s.scene.add(plinth);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.225,.226,80),ringMat);ring.rotation.x=-Math.PI/2;ring.position.y=-.001;s.scene.add(ring);
  // En el tema oscuro el robot negro se perdería sobre el fondo: la base y el aro se aclaran y la luz de contorno sube.
  const rim=s.scene.children.find(o=>o instanceof THREE.DirectionalLight&&o.position.z<0) as THREE.DirectionalLight|undefined,rimBase=rim?.intensity??0;
  function tema(){const oscuro=temaOscuro();plinthMat.color.setHex(oscuro?0x3f4c47:0x263331);ringMat.color.setHex(oscuro?0xb7c79a:0x8b9b7e);if(rim)rim.intensity=rimBase*(oscuro?1.8:1);
    if(s.renderer instanceof SVGRenderer)s.renderer.setClearColor(new THREE.Color(oscuro?0x121a17:0xf1f1e9),1);s.invalidate();}
  tema();document.addEventListener('temacambio',tema);
  if(!s.lightweight){const floor=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.ShadowMaterial({opacity:.35}));floor.rotation.x=-Math.PI/2;floor.position.y=-.018;floor.receiveShadow=true;s.scene.add(floor);}
  // Con el CAD el aro rodea cada grupo a la altura de su borde superior, medido sin despiece.
  robot.root.updateMatrixWorld(true);
  const anillos=Object.fromEntries((Object.keys(robot.parts) as PartId[]).map(id=>{const part=robot.parts[id],b=new THREE.Box3().setFromObject(part),size=b.getSize(new THREE.Vector3()),c=part.worldToLocal(b.getCenter(new THREE.Vector3()));
    return [id,{r:Math.max(size.x,size.z)/2*1.04,x:c.x,y:part.worldToLocal(b.max.clone()).y+.003,z:c.z}];})) as Record<PartId,{r:number;x:number;y:number;z:number}>;
  const highlight=new THREE.Mesh(new THREE.TorusGeometry(.049,.0008,5,64),new THREE.MeshBasicMaterial({color:0xa4bb64,transparent:true,opacity:.8,depthTest:false}));highlight.rotation.x=Math.PI/2;highlight.renderOrder=20;robot.parts.laser.add(highlight);highlight.position.y=.045;
  function select(id:PartId){robot.parts[id].add(highlight);
    if(robot.cad){const a=anillos[id];highlight.scale.setScalar(a.r/.049);highlight.position.set(a.x,a.y,a.z);}
    else{const radius=id==='laser'?.049:id==='electronica'?.078:.121;highlight.scale.setScalar(radius/.049);highlight.position.set(0,id==='laser'?.045:id==='electronica'?.015:id==='cubierta'?.026:.055,0);}
    s.invalidate();}
  const raycaster=new THREE.Raycaster();let down={x:0,y:0};
  const onDown=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY};};
  const onUp=(e:PointerEvent)=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)return;const r=host.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),s.camera);
    const hit=raycaster.intersectObject(robot.root,true)[0];let obj:THREE.Object3D|undefined=hit?.object;while(obj&&!obj.userData.part)obj=obj.parent??undefined;if(obj?.userData.part)onSelect(obj.userData.part);
  };host.addEventListener('pointerdown',onDown);host.addEventListener('pointerup',onUp);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const duration=()=>reduced.matches?0:.8;
  function explode(value:boolean){exploded=value;const offsets=C.offsets;
    for(const id of Object.keys(robot.parts) as PartId[]){gsap.killTweensOf(robot.parts[id].position);gsap.to(robot.parts[id].position,{y:robot.original[id]+(value?offsets[id]:0),duration:duration(),ease:'power3.inOut',onUpdate:s.invalidate});}
    const cam=C.cam[value?1:0];gsap.to(s.controls.target,{y:C.target[value?1:0],duration:duration(),onUpdate:s.invalidate});gsap.to(s.camera.position,{x:cam[0],y:cam[1],z:cam[2],duration:duration(),onUpdate:s.invalidate});
  }
  function view(preset:'frente'|'arriba'|'perspectiva'){
    const k=robot.cad?.86:1;
    const p=(exploded?(preset==='arriba'?[0,1.3,.005]:preset==='frente'?[0,.27,1.18]:[.72,.53,.84]):(preset==='arriba'?[0,.65,.005]:preset==='frente'?[0,.16,.56]:[.37,.3,.43])).map(v=>v*k);
    activeTween?.kill();activeTween=gsap.to(s.camera.position,{x:p[0],y:p[1],z:p[2],duration:duration(),ease:'power3.inOut',onUpdate:s.invalidate});
  }
  const mq=()=>{if(reduced.matches)motion=false;};if(reduced.addEventListener)reduced.addEventListener('change',mq);else reduced.addListener(mq);
  return {explode,view,select,lightweight:s.lightweight,cad:!!robot.cad,setMotion:(v:boolean)=>{motion=v;},dispose:()=>{for(const p of Object.values(robot.parts))gsap.killTweensOf(p.position);gsap.killTweensOf(s.camera.position);gsap.killTweensOf(s.controls.target);host.removeEventListener('pointerdown',onDown);host.removeEventListener('pointerup',onUp);if(reduced.removeEventListener)reduced.removeEventListener('change',mq);else reduced.removeListener(mq);document.removeEventListener('temacambio',tema);s.dispose();}};
}
