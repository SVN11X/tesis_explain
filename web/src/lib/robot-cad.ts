import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { PARTS, type PartId, type Robot } from './robot-three';

/** El prototipo desde su CAD: modelos/robot.glb, que genera herramientas/modelo_robot.py. Cada nodo trae su grupo en el
    nombre, y el cabezal del LiDAR queda en un pivote propio para girar sobre su eje. Los materiales del archivo son
    de dos caras: las piezas del CAD no traen todas sus caras orientadas hacia afuera. */
export async function loadRobot(url:string):Promise<Robot>{
  const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf=await loader.loadAsync(url);gltf.scene.updateMatrixWorld(true);
  // El origen del archivo es el eje de las ruedas. El centro de la cubierta queda 7 cm más adelante y se lleva al centro de la base.
  const root=new THREE.Group(),body=new THREE.Group();body.position.z=-.07;root.add(body);
  const parts=Object.fromEntries(PARTS.map(k=>[k,new THREE.Group()])) as Record<PartId,THREE.Group>;
  for(const [id,part] of Object.entries(parts)){part.userData.part=id;body.add(part);}
  const meshes:THREE.Mesh[]=[];gltf.scene.traverse(o=>{if((o as THREE.Mesh).isMesh)meshes.push(o as THREE.Mesh);});
  const head=new THREE.Group(),cabezal:THREE.Mesh[]=[];parts.laser.add(head);
  for(const m of meshes){
    m.matrixWorld.decompose(m.position,m.quaternion,m.scale);m.castShadow=true;m.receiveShadow=true;
    const group=m.name.split('__')[0];
    // La carcasa se vuelve transparente para mostrar lo de adentro: lleva materiales propios, sin compartirlos con otro grupo.
    if(group==='cubierta')m.material=(m.material as THREE.Material).clone();
    if(group==='laser_cabezal')cabezal.push(m);else (parts[(group==='laser_base'?'laser':group) as PartId]??parts.cubierta).add(m);
  }
  const centro=new THREE.Box3();for(const m of cabezal){m.updateMatrixWorld(true);centro.expandByObject(m);}
  const c=centro.getCenter(new THREE.Vector3());head.position.set(c.x,0,c.z);
  for(const m of cabezal){m.position.x-=c.x;m.position.z-=c.z;head.add(m);}
  const original=Object.fromEntries(Object.entries(parts).map(([id,p])=>[id,p.position.y])) as Record<PartId,number>;
  return {root,parts,wheels:[],original,head,cad:true};
}
