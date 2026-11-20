import * as THREE from 'three';
import gsap from 'gsap';
import { stage, createRobot } from './robot-three';
import { WORLD, type Frame, type Scenario } from './lidar-model';

export function lidarScene(host:HTMLElement, sceneData:Scenario, onMove:(x:number,z:number)=>void, onLost:()=>void){
  const s=stage(host,{onLost});
  const robot=createRobot();s.scene.add(robot.root);
  const environment=new THREE.Group();s.scene.add(environment);
  const planeGeometry=new THREE.PlaneGeometry(WORLD.width,WORLD.depth);
  const uv=planeGeometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));
  const pixels=new Uint8Array(WORLD.cols*WORLD.rows*4);
  const texture=new THREE.DataTexture(pixels,WORLD.cols,WORLD.rows);texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;texture.colorSpace=THREE.SRGBColorSpace;
  const mapMaterial=s.lightweight?new THREE.MeshBasicMaterial({color:0x111b1e}):new THREE.MeshStandardMaterial({map:texture,roughness:.95,metalness:0});
  const floor=new THREE.Mesh(planeGeometry,mapMaterial);floor.rotation.x=-Math.PI/2;floor.position.y=-.012;floor.receiveShadow=true;s.scene.add(floor);
  const vectorMap=s.lightweight?new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide})):undefined;
  if(vectorMap)s.scene.add(vectorMap);
  const under=new THREE.Mesh(new THREE.BoxGeometry(WORLD.width+.1,.08,WORLD.depth+.1),new THREE.MeshStandardMaterial({color:0x1d2729,roughness:.85}));under.position.y=-.057;s.scene.add(under);
  const grid=new THREE.GridHelper(6,30,0x607371,0x2b4140);grid.position.y=-.008;grid.material.transparent=true;grid.material.opacity=.22;s.scene.add(grid);
  const rayPositions=new Float32Array(WORLD.rayCount*6),pointPositions=new Float32Array(WORLD.rayCount*3);
  const rayGeo=new THREE.BufferGeometry();rayGeo.setAttribute('position',new THREE.BufferAttribute(rayPositions,3).setUsage(THREE.DynamicDrawUsage));
  const rays=new THREE.LineSegments(rayGeo,new THREE.LineBasicMaterial({color:0xe9f487,transparent:true,opacity:.14,depthWrite:false}));rays.frustumCulled=false;s.scene.add(rays);
  const pointGeo=new THREE.BufferGeometry();pointGeo.setAttribute('position',new THREE.BufferAttribute(pointPositions,3).setUsage(THREE.DynamicDrawUsage));
  const returns=new THREE.Points(pointGeo,new THREE.PointsMaterial({color:0xf3fbb4,size:.032,depthWrite:false}));returns.frustumCulled=false;s.scene.add(returns);
  const selectedGeo=new THREE.BufferGeometry();selectedGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
  const selected=new THREE.Line(selectedGeo,new THREE.LineBasicMaterial({color:0x7ae4dd,depthTest:false}));selected.renderOrder=9;s.scene.add(selected);
  const halo=new THREE.Mesh(new THREE.RingGeometry(.16,.18,64),new THREE.MeshBasicMaterial({color:0xdde886,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));halo.rotation.x=-Math.PI/2;halo.position.y=.005;s.scene.add(halo);
  let frame:Frame|undefined,selectedRay=0,mapVisible=true;
  function populate(data:Scenario){
    environment.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.LineSegments){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});environment.clear();
    for(const o of data.obstacles){
      const wall=o.id.startsWith('pared');
      const material=new THREE.MeshStandardMaterial({color:o.low?0xc5a55c:0x6b7a7a,roughness:.7,metalness:.1,transparent:true,opacity:wall?.15:.6,depthWrite:!wall});
      const geometry=new THREE.BoxGeometry(o.w,o.h,o.d);const mesh=new THREE.Mesh(geometry,material);mesh.position.set(o.x,o.h/2,o.z);mesh.castShadow=!wall;environment.add(mesh);
      const outline=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:o.low?0xd5bf75:0x7f9393,transparent:true,opacity:wall?.4:.75}));outline.position.copy(mesh.position);environment.add(outline);
    }s.invalidate();
  }
  populate(sceneData);
  function update(f:Frame){frame=f;robot.root.position.set(f.pose.x,0,f.pose.z);robot.root.rotation.y=-f.pose.yaw-Math.PI/2;
    robot.parts.laser.position.y=f.height-.022;halo.position.x=f.pose.x;halo.position.z=f.pose.z;
    let hits=0;
    f.rays.forEach((r,i)=>{rayPositions.set([f.pose.x,f.height,f.pose.z,r.x,f.height,r.z],i*6);if(r.hit){pointPositions.set([r.x,f.height,r.z],hits*3);hits++;}});
    rayGeo.attributes.position.needsUpdate=true;pointGeo.attributes.position.needsUpdate=true;pointGeo.setDrawRange(0,hits);
    for(let i=0;i<f.grid.length;i++){const v=mapVisible?f.grid[i]:-1;const c=v===100?[156,178,161]:v===0?[41,68,64]:[17,27,30];pixels.set([...c,255],i*4);}texture.needsUpdate=true;
    if(vectorMap){const vertices:number[]=[],colors:number[]=[];const color=new THREE.Color();
      // Combinar celdas contiguas en cada fila mantiene ligero el respaldo vectorial.
      for(let row=0;row<WORLD.rows;row++){let col=0;while(col<WORLD.cols){const start=col,v=mapVisible?f.grid[row*WORLD.cols+col]:-1;while(col<WORLD.cols&&(mapVisible?f.grid[row*WORLD.cols+col]:-1)===v)col++;if(v<0)continue;
        const x=start*WORLD.resolution-WORLD.width/2,x2=col*WORLD.resolution-WORLD.width/2,z=row*WORLD.resolution-WORLD.depth/2,z2=z+WORLD.resolution;
        vertices.push(x,-.007,z,x2,-.007,z,x2,-.007,z2,x,-.007,z,x2,-.007,z2,x,-.007,z2);color.setHex(v===100?0xc6d8b8:0x304a45);for(let i=0;i<6;i++)colors.push(color.r,color.g,color.b);
      }}vectorMap.geometry.dispose();vectorMap.geometry=new THREE.BufferGeometry();vectorMap.geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));vectorMap.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    }
    const r=f.rays[selectedRay];(selectedGeo.attributes.position.array as Float32Array).set([f.pose.x,f.height+.003,f.pose.z,r.x,f.height+.003,r.z]);selectedGeo.attributes.position.needsUpdate=true;
    for(const wheel of robot.wheels)wheel.rotation.x=f.elapsed*.13/.0335;s.invalidate();
  }
  const raycaster=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);let dragging=false;
  function project(e:PointerEvent){const rect=host.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),s.camera);}
  function down(e:PointerEvent){project(e);if(raycaster.intersectObject(robot.root,true).length){dragging=true;s.controls.enabled=false;host.setPointerCapture(e.pointerId);e.preventDefault();}}
  function move(e:PointerEvent){if(!dragging)return;project(e);const p=raycaster.ray.intersectPlane(plane,new THREE.Vector3());if(p)onMove(p.x,p.z);}
  function up(e:PointerEvent){dragging=false;s.controls.enabled=true;if(host.hasPointerCapture(e.pointerId))host.releasePointerCapture(e.pointerId);}
  host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);
  const duration=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?0:.7;
  function view(top:boolean){gsap.killTweensOf(s.camera.position);gsap.to(s.camera.position,{x:top?0:4.5,y:top?7.5:5,z:top?.01:5.7,duration:duration(),ease:'power3.inOut',onUpdate:s.invalidate});}
  return {update,populate,view,ray:(i:number)=>{if(selectedRay!==i){selectedRay=i;if(frame)update(frame);}},layers:(laser:boolean,map:boolean)=>{rays.visible=laser;selected.visible=laser;returns.visible=laser;if(mapVisible!==map){mapVisible=map;if(frame)update(frame);}s.invalidate();},dispose:()=>{host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',up);gsap.killTweensOf(s.camera.position);texture.dispose();s.dispose();}};
}
