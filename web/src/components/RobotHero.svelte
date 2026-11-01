<script lang="ts">
  import { onMount } from 'svelte';
  import type { PartId } from '../lib/robot-three';
  let { base = '/tesis_explain/' }: {base?:string} = $props();
  const pieces = [
    {id:'laser',name:'LiDAR',text:'Un láser, un plano de medida. Los retornos revelan las paredes que rodean al robot.'},
    {id:'cubierta',name:'Chasis',text:'Una estructura compacta para proteger e integrar las piezas del prototipo.'},
    {id:'electronica',name:'Electrónica',text:'Raspberry Pi y Arduino: integración con ROS 2 y control de las ruedas, a bordo.'},
    {id:'traccion',name:'Ruedas',text:'Dos velocidades hacen la diferencia. Radio de rueda: 33,5 mm. Separación: 188 mm.'},
  ];
  let host:HTMLDivElement;
  let api:ReturnType<typeof import('../lib/robot-three').heroScene>|undefined;
  let ready=$state(false), failed=$state(false), lightweight=$state(false), exploded=$state(false), moving=$state(true), selected=$state<PartId>('laser');
  let destroyed=false;
  let current=$derived(pieces.find(p=>p.id===selected)!);
  function choose(id:PartId){selected=id;api?.select(id);}
  async function init(){
    failed=false;
    try{const module=await import('../lib/robot-three');if(destroyed)return;api?.dispose();api=module.heroScene(host,choose,()=>{failed=true;ready=false;});api.setMotion(moving);api.explode(exploded);api.select(selected);lightweight=api.lightweight;ready=true;}
    catch{failed=true;ready=false;}
  }
  onMount(()=>{moving=!matchMedia('(prefers-reduced-motion: reduce)').matches;init();return()=>{destroyed=true;api?.dispose();};});
  function explode(){exploded=!exploded;api?.explode(exploded);}
</script>

<div class="robot-viewer" class:exploded>
  <div class="viewer-coordinate mono" aria-hidden="true">PROTOTIPO / VISTA {exploded?'EXPLOTADA':'ESPACIAL'}<span>01—04</span></div>
  <div class="robot-stage" bind:this={host} aria-label="Modelo tridimensional ilustrativo del robot">
    {#if !ready}<img class="robot-poster" src={`${base}img/fotos/robot-lateral-800.webp`} width="800" height="633" alt="Fotografía del prototipo negro con franjas amarillas y LiDAR superior" fetchpriority="high" />{/if}
  </div>
  <div class="model-label mono"><span class="live-dot"></span>{ready?(lightweight?'3D LIGERO · ARRASTRA PARA GIRAR':'ARRASTRA PARA GIRAR'):failed?'VISTA FOTOGRÁFICA':'PREPARANDO VISOR'}</div>
  {#if failed}<div class="viewer-error" role="status">La vista 3D no está disponible. Puedes seguir con la fotografía y el laboratorio 2D. <button class="text-button" onclick={init}>Reintentar</button></div>{/if}
  <div class="viewer-actions">
    <button class="pill" aria-pressed={exploded} onclick={explode} disabled={!ready}><span aria-hidden="true">{exploded?'−':'+'}</span>{exploded?'Ensamblar':'Despiece'}</button>
    <label class="sr-only" for="hero-camera">Punto de vista del robot</label>
    <select id="hero-camera" class="camera-select" disabled={!ready} onchange={e=>api?.view(e.currentTarget.value as 'frente'|'arriba'|'perspectiva')}>
      <option value="perspectiva">Perspectiva</option><option value="frente">Frente</option><option value="arriba">Desde arriba</option>
    </select>
    <button class="icon-button" aria-label={moving?'Pausar movimiento del sensor':'Animar el sensor'} aria-pressed={moving} disabled={!ready} onclick={()=>{moving=!moving;api?.setMotion(moving);}}>{moving?'Ⅱ':'▷'}</button>
  </div>
  <div class="part-selector" role="group" aria-label="Componentes del robot">
    {#each pieces as piece,i}<button aria-pressed={selected===piece.id} onclick={()=>choose(piece.id as PartId)}><span class="mono">0{i+1}</span>{piece.name}</button>{/each}
  </div>
  <div class="part-caption"><span class="caption-rule"></span><p><strong>{current.name}.</strong> {current.text}</p></div>
  <p class="model-credit">Geometría e interior ilustrativos. <a href={`${base}robot.html`}>Ver el prototipo documentado ↗</a></p>
</div>
