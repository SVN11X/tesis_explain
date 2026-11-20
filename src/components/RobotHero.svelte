<script lang="ts">
  import { onMount } from 'svelte';
  import type { EstadoVista, PartId, Vista } from '../lib/robot-three';
  let { base = '/tesis_explain/' }: {base?:string} = $props();
  // Cada pieza lleva el color de su tema en la guía (css/marco.css). Los datos salen del CAD y de la tesis:
  // modelos/README.md y robot.html.
  const pieces = [
    {id:'laser',name:'LiDAR',color:'turquesa',text:'Un láser, un plano de medida. Los retornos revelan las paredes que rodean al robot.',datos:['RPLidar A1','Barrido de 360°']},
    {id:'cubierta',name:'Chasis',color:'amarillo',text:'Una estructura compacta y negra, con dos franjas amarillas al frente, para proteger e integrar las piezas del prototipo.',datos:['23 × 25 cm','13,6 cm de alto']},
    {id:'electronica',name:'Electrónica',color:'verde',text:'Raspberry Pi y Arduino: integración con ROS 2 y control de las ruedas, a bordo. La carcasa se vuelve transparente para mostrarlos.',datos:['Raspberry Pi 4','Arduino Nano V3']},
    {id:'traccion',name:'Ruedas',color:'naranja',text:'Dos velocidades hacen la diferencia: si una rueda gira más rápido que la otra, el robot dobla.',datos:['Radio de rueda 33,5 mm','Separación 188 mm']},
  ] as const;
  let host:HTMLDivElement;
  let api:Awaited<ReturnType<typeof import('../lib/robot-three').heroScene>>|undefined;
  let ready=$state(false), failed=$state(false), lightweight=$state(false), cad=$state(false), exploded=$state(false), moving=$state(true), selected=$state<PartId>('laser');
  let vista=$state<EstadoVista>({zoom:1,cerca:false,lejos:false,enfocada:null}), avisoRueda=$state(0), tactil=$state(false);
  let destroyed=false, ocultarAviso:ReturnType<typeof setTimeout>|undefined;
  let current=$derived(pieces.find(p=>p.id===selected)!);
  let zoomTexto=$derived('×'+vista.zoom.toFixed(1).replace('.',','));
  let ayuda=$derived(ready?(lightweight?'3D LIGERO · ARRASTRA PARA GIRAR':tactil?'ARRASTRA PARA GIRAR · PELLIZCA PARA ACERCAR':'ARRASTRA PARA GIRAR · CTRL + RUEDA PARA ACERCAR'):failed?'VISTA FOTOGRÁFICA':'PREPARANDO VISOR');
  /** Elegir una pieza la marca y acerca la cámara a ella, desde la pestaña o tocándola en el modelo. */
  function choose(id:PartId){selected=id;api?.select(id);api?.focus(id);}
  function avisarRueda(){avisoRueda++;clearTimeout(ocultarAviso);ocultarAviso=setTimeout(()=>{avisoRueda=0;},1800);}
  async function init(){
    failed=false;
    try{const module=await import('../lib/robot-three');if(destroyed)return;api?.dispose();
      const nuevo=await module.heroScene(host,choose,()=>{failed=true;ready=false;},`${base}modelos/robot.glb`,e=>{vista=e;});
      if(destroyed){nuevo.dispose();return;}
      api=nuevo;api.setMotion(moving);api.explode(exploded);api.select(selected);api.alAvisoRueda(avisarRueda);lightweight=api.lightweight;cad=api.cad;ready=true;}
    catch{failed=true;ready=false;}
  }
  onMount(()=>{moving=!matchMedia('(prefers-reduced-motion: reduce)').matches;tactil=matchMedia('(pointer: coarse)').matches;init();return()=>{destroyed=true;clearTimeout(ocultarAviso);api?.dispose();};});
  function explode(){exploded=!exploded;api?.explode(exploded);}
  /** Con el foco en el modelo: flechas para girar, más y menos para acercar, cero o Inicio para ver todo el robot. */
  function teclas(e:KeyboardEvent){
    if(!api||e.target!==host||e.altKey||e.ctrlKey||e.metaKey)return;
    const k=e.key;
    if(k==='+'||k==='=')api.zoom(.8);
    else if(k==='-'||k==='_')api.zoom(1.25);
    else if(k==='0'||k==='Home')api.reset();
    else if(k==='ArrowLeft')api.orbit(.14,0);
    else if(k==='ArrowRight')api.orbit(-.14,0);
    else if(k==='ArrowUp')api.orbit(0,.1);
    else if(k==='ArrowDown')api.orbit(0,-.1);
    else return;
    e.preventDefault();
  }
</script>

<div class="robot-viewer" class:exploded>
  <div class="viewer-coordinate mono" aria-hidden="true">PROTOTIPO / VISTA {exploded?'EXPLOTADA':'ESPACIAL'}<span class={`viewer-zoom c-${current.color}`}>{ready?`ZOOM ${zoomTexto}`:'01—04'}</span></div>
  <!-- El modelo se gira y se acerca con el teclado: el grupo recibe el foco y explica sus teclas en hero-ayuda. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
  <div class={`robot-stage c-${current.color}`} bind:this={host} role="group" tabindex={ready?0:-1} onkeydown={teclas}
    aria-label={cad?'Modelo 3D del prototipo, hecho a partir de su CAD':'Modelo 3D ilustrativo del robot'} aria-describedby="hero-ayuda">
    {#if !ready}<img class="robot-poster" src={`${base}img/fotos/robot-lateral-800.webp`} width="800" height="633" alt="Fotografía del prototipo negro con franjas amarillas y LiDAR superior" fetchpriority="high" />{/if}
    {#if ready}
      <div class="stage-tools" role="group" aria-label="Acercamiento del modelo">
        <button type="button" aria-label="Acercar" title="Acercar" disabled={vista.cerca} onclick={()=>api?.zoom(.72)}><svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/></svg></button>
        <button type="button" aria-label="Alejar" title="Alejar" disabled={vista.lejos} onclick={()=>api?.zoom(1.38)}><svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"/></svg></button>
        <button type="button" aria-label="Ver todo el robot" title="Ver todo el robot" onclick={()=>api?.reset()}><svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M216,48V88a8,8,0,0,1-16,0V56H168a8,8,0,0,1,0-16h40A8,8,0,0,1,216,48ZM88,200H56V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H88a8,8,0,0,0,0-16Zm120-40a8,8,0,0,0-8,8v32H168a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,208,160ZM88,40H48a8,8,0,0,0-8,8V88a8,8,0,0,0,16,0V56H88a8,8,0,0,0,0-16Z"/></svg></button>
      </div>
    {/if}
    <p class="model-label mono" id="hero-ayuda"><span class="live-dot" aria-hidden="true"></span>{ayuda}<span class="sr-only">. Con el foco en el modelo, las flechas lo giran, las teclas más y menos acercan y alejan, y cero vuelve a la vista completa.</span></p>
    {#key avisoRueda}{#if avisoRueda}<p class="wheel-hint" aria-hidden="true">Mantén Ctrl y usa la rueda para acercar</p>{/if}{/key}
  </div>
  {#if failed}<div class="viewer-error" role="status">La vista 3D no está disponible. Puedes seguir con la fotografía y el laboratorio 2D. <button class="text-button" onclick={init}>Reintentar</button></div>{/if}
  <div class="viewer-dock">
    <button class="pill" aria-pressed={exploded} onclick={explode} disabled={!ready}>{#if exploded}<svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"/></svg>{:else}<svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/></svg>{/if}{exploded?'Ensamblar':'Despiece'}</button>
    <span class="dock-sep" aria-hidden="true"></span>
    <label class="sr-only" for="hero-camera">Punto de vista del robot</label>
    <select id="hero-camera" class="camera-select" disabled={!ready} onchange={e=>api?.view(e.currentTarget.value as Vista)}>
      <option value="perspectiva">Perspectiva</option><option value="frente">Frente</option><option value="arriba">Desde arriba</option>
    </select>
    <span class="dock-sep" aria-hidden="true"></span>
    <button class="icon-button" aria-label={moving?'Pausar movimiento del sensor':'Animar el sensor'} aria-pressed={moving} disabled={!ready} onclick={()=>{moving=!moving;api?.setMotion(moving);}}>{#if moving}<svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M200,32H160a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm0,176H160V48h40ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Zm0,176H56V48H96Z"/></svg>{:else}<svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"/></svg>{/if}</button>
  </div>
  <div class="part-selector" role="group" aria-label="Componentes del robot">
    {#each pieces as piece,i}<button class={`c-${piece.color}`} aria-pressed={selected===piece.id} onclick={()=>choose(piece.id)}><span class="part-dot" aria-hidden="true"></span><span class="mono">0{i+1}</span><span>{piece.name}</span></button>{/each}
  </div>
  <div class={`part-caption c-${current.color}`} aria-live="polite"><span class="caption-rule" aria-hidden="true"></span><div><p><strong>{current.name}.</strong> {current.text}</p><ul class="part-facts mono">{#each current.datos as dato}<li>{dato}</li>{/each}</ul></div></div>
  <p class="model-credit">{cad||!ready?'Modelo del CAD del prototipo, simplificado para la web.':'Vista ligera con geometría ilustrativa.'} <a href={`${base}robot.html`}>Ver el prototipo documentado ↗</a></p>
</div>
