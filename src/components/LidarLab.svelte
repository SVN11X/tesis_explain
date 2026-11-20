<script lang="ts">
  import { onMount } from 'svelte';
  import { LidarModel, WORLD, metrics, type ScenarioId, type Frame } from '../lib/lidar-model';
  let { base = '/tesis_explain/' }: {base?:string} = $props();
  let model=new LidarModel();
  let frame=$state<Frame>(model.frame());
  let selectedScene=$state<ScenarioId>('recinto');
  let history=$state<Frame[]>([model.frame()]), historyIndex=$state(0);
  let running=$state(false), mounted=$state(false), loaded=$state(false), failed=$state(false), laser=$state(true), mapLayer=$state(true), top=$state(false);
  let mobileView=$state<'world'|'map'>('world'), ray=$state(0), speed=$state(3), message=$state(''), shareURL=$state('');
  let host:HTMLDivElement, mapCanvas:HTMLCanvasElement, panel:HTMLDivElement;
  let api:ReturnType<typeof import('../lib/lidar-three').lidarScene>|undefined;
  let destroyed=false, last=0, accumulator=0, scanClock=0, raf=0, inView=true;
  const fmt=(v:number,d=2)=>v.toLocaleString('es-CL',{minimumFractionDigits:d,maximumFractionDigits:d});
  let values=$derived(metrics(frame.grid));
  let description=$derived(selectedScene==='bajo'?'Una caja puede ser invisible para el láser y seguir siendo un obstáculo. Cambia la altura del sensor.':selectedScene==='esquina'?'El primer impacto detiene cada rayo. Reposiciona el robot para descubrir lo que queda detrás.':'El mapa solo conoce lo que observa el láser. Mueve el robot y descubre el espacio detrás del tabique.');
  let distance=$derived(frame.rays[ray]?.distance??0);
  function capture(){frame=model.frame();history=[...history.slice(0,historyIndex+1).slice(-239),frame];historyIndex=history.length-1;}
  function restore(i:number){running=false;historyIndex=i;model.restore(history[i]);frame=model.frame();}
  function reset(id:ScenarioId=selectedScene){running=false;selectedScene=id;model=new LidarModel(id);frame=model.frame();history=[frame];historyIndex=0;ray=0;laser=true;mapLayer=true;top=false;message='Experimento reiniciado.';scanClock=0;accumulator=0;api?.populate(model.scene);api?.view(false);}
  function move(x:number,z:number,yaw=frame.pose.yaw){running=false;if(model.move(x,z,yaw)){capture();message='';}else message='El robot no puede ocupar una pared o un obstáculo, aunque el láser no lo detecte.';}
  function sensor(height:number,range:number){running=false;model.setSensor(height,range);frame=model.frame();history=[frame];historyIndex=0;message='Nuevo plano de medida: se ha reiniciado el mapa para no mezclar observaciones.';}
  function step(){running=false;if(historyIndex<history.length-1){restore(historyIndex+1);return;}for(let i=0;i<4;i++)model.advance(.05);model.measure();capture();}
  function toggle(){if(!running&&model.routeIndex>=model.scene.route.length){message='El recorrido terminó. Reinicia o mueve el robot para seguir explorando.';return;}running=!running;message=running?'Recorrido guiado por puntos prefijados.':'Recorrido en pausa.';last=0;accumulator=0;}
  function tick(ts:number){raf=0;if(document.hidden||!inView){last=0;return;}raf=requestAnimationFrame(tick);const dt=last?Math.min((ts-last)/1000,.1):0;last=ts;if(!running)return;
    accumulator+=dt*speed;
    while(accumulator>=.05){accumulator-=.05;scanClock+=.05;
      if(historyIndex<history.length-1){if(scanClock>=.2){historyIndex++;model.restore(history[historyIndex]);frame=model.frame();scanClock=0;}continue;}
      if(!model.advance(.05)){running=false;message=model.routeIndex>=model.scene.route.length?'Recorrido completo. Puedes revisar cada barrido con la línea temporal.':'El recorrido se detuvo ante un obstáculo. Reposiciona el robot o reinicia.';model.measure();capture();break;}
      if(scanClock>=.2){model.measure();capture();scanClock=0;}
    }
  }
  function drawMap(){if(!mapCanvas)return;const ctx=mapCanvas.getContext('2d');if(!ctx)return;const width=mapCanvas.clientWidth||350,height=width*WORLD.depth/WORLD.width,dpr=Math.min(devicePixelRatio||1,2);
    mapCanvas.width=width*dpr;mapCanvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    const sx=width/WORLD.cols,sy=height/WORLD.rows;
    for(let i=0;i<frame.grid.length;i++){const v=mapLayer?frame.grid[i]:-1;ctx.fillStyle=v===100?'#c6d8b8':v===0?'#304a45':'#111b1e';ctx.fillRect(i%WORLD.cols*sx,Math.floor(i/WORLD.cols)*sy,Math.ceil(sx),Math.ceil(sy));}
    const px=(x:number)=>(x+WORLD.width/2)/WORLD.width*width,pz=(z:number)=>(z+WORLD.depth/2)/WORLD.depth*height;
    if(laser){ctx.strokeStyle='rgba(217,235,119,.09)';ctx.lineWidth=.7;ctx.beginPath();for(const r of frame.rays){ctx.moveTo(px(frame.pose.x),pz(frame.pose.z));ctx.lineTo(px(r.x),pz(r.z));}ctx.stroke();const r=frame.rays[ray];ctx.strokeStyle='#80ded4';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(px(frame.pose.x),pz(frame.pose.z));ctx.lineTo(px(r.x),pz(r.z));ctx.stroke();}
    const x=px(frame.pose.x),y=pz(frame.pose.z),rr=WORLD.robotRadius/WORLD.width*width;
    // El robot con la planta en U del CAD del prototipo, como en las figuras de la guía (js/comun.js): borde recto atrás,
    // curva adelante y el LiDAR, de donde salen los rayos. Medidas en metros desde el LiDAR, escaladas al radio del modelo.
    const k=Math.max(rr,6)/.115,c=Math.cos(frame.pose.yaw),s=Math.sin(frame.pose.yaw),p=(u:number,v:number):[number,number]=>[x+(u*c-v*s)*k,y+(u*s+v*c)*k];
    ctx.beginPath();ctx.moveTo(...p(-.17,-.115));ctx.lineTo(...p(-.035,-.115));for(let i=1;i<=12;i++){const a=-Math.PI/2+Math.PI*i/12;ctx.lineTo(...p(-.035+Math.cos(a)*.115,Math.sin(a)*.115));}ctx.lineTo(...p(-.17,.115));ctx.closePath();
    ctx.fillStyle='#e8ed87';ctx.fill();ctx.strokeStyle='#142124';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#142124';ctx.beginPath();ctx.arc(x,y,Math.max(2,.035*k),0,2*Math.PI);ctx.fill();
    ctx.fillStyle='#b8c7bf';ctx.font='10px monospace';ctx.fillText('1 m',width-56,height-19);ctx.strokeStyle='#b8c7bf';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(width-20-width/WORLD.width,height-11);ctx.lineTo(width-20,height-11);ctx.stroke();
  }
  function mapMove(e:PointerEvent){const rect=mapCanvas.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width*WORLD.width-WORLD.width/2,z=(e.clientY-rect.top)/rect.height*WORLD.depth-WORLD.depth/2;move(x,z);}
  function keyboard(e:KeyboardEvent){const delta:Record<string,[number,number]>={ArrowLeft:[-.08,0],ArrowRight:[.08,0],ArrowUp:[0,-.08],ArrowDown:[0,.08]};if(delta[e.key]){e.preventDefault();move(frame.pose.x+delta[e.key][0],frame.pose.z+delta[e.key][1]);}}
  async function initialize(){failed=false;try{const module=await import('../lib/lidar-three');if(destroyed)return;api?.dispose();api=module.lidarScene(host,model.scene,(x,z)=>move(x,z),()=>{failed=true;loaded=false;mobileView='map';});api.update(frame);loaded=true;}catch{failed=true;loaded=false;mobileView='map';}}
  onMount(()=>{
    const url=new URL(location.href);const id=url.searchParams.get('escenario');if(id&&['recinto','esquina','bajo'].includes(id)){selectedScene=id as ScenarioId;model=new LidarModel(selectedScene);}
    const read=(key:string,defaultValue:number)=>{const raw=url.searchParams.get(key);if(raw===null)return defaultValue;const v=Number(raw);return Number.isFinite(v)?v:defaultValue;};
    model.move(read('x',model.pose.x),read('z',model.pose.z),read('rumbo',model.pose.yaw));model.setSensor(read('altura',.24),read('alcance',3.5));frame=model.frame();history=[frame];mounted=true;
    const resume=()=>{last=0;if(!raf&&!document.hidden&&inView)raf=requestAnimationFrame(tick);};
    initialize();resume();document.addEventListener('visibilitychange',resume);const observer=new IntersectionObserver(e=>{inView=e[0].isIntersecting;resume();},{rootMargin:'80px'});observer.observe(panel);
    const resize=new ResizeObserver(drawMap);resize.observe(mapCanvas);const mq=matchMedia('(prefers-reduced-motion: reduce)');const quiet=()=>{if(mq.matches)running=false;};if(mq.addEventListener)mq.addEventListener('change',quiet);else mq.addListener(quiet);
    return()=>{destroyed=true;cancelAnimationFrame(raf);observer.disconnect();resize.disconnect();document.removeEventListener('visibilitychange',resume);if(mq.removeEventListener)mq.removeEventListener('change',quiet);else mq.removeListener(quiet);api?.dispose();};
  });
  $effect(()=>{frame;laser;mapLayer;ray;api?.update(frame);api?.layers(laser,mapLayer);api?.ray(ray);drawMap();});
  function exportFrame(){const data={format:'robot-explorador/lidar-v1',provenance:'Escenario didáctico sintético; no es un ensayo ni una ejecución de SLAM Toolbox.',units:{length:'m',angle:'rad'},scene:model.scene,grid:{cols:WORLD.cols,rows:WORLD.rows,resolution:WORLD.resolution,values:Array.from(frame.grid),encoding:{unknown:-1,free:0,occupied:100}},pose:frame.pose,sensor:{height:frame.height,range:frame.range,rayCount:WORLD.rayCount},elapsed:frame.elapsed,measurements:frame.rays};const objectURL=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=objectURL;a.download=`lidar-${selectedScene}-barrido-${frame.sequence}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(objectURL),1000);message='Escenario y mapa exportados como JSON.';}
  async function share(){const url=new URL(`${base}laboratorios.html`,location.origin);url.searchParams.set('escenario',selectedScene);for(const [key,value]of Object.entries({x:frame.pose.x,z:frame.pose.z,rumbo:frame.pose.yaw,altura:frame.height,alcance:frame.range}))url.searchParams.set(key,value.toFixed(3));shareURL=url.href;try{await navigator.clipboard.writeText(url.href);message='Enlace copiado. Abre la misma posición y sensor; el mapa comienza con ese barrido.';}catch{message='Copia el enlace del campo siguiente.';}}
</script>

<div class="lab-frame" bind:this={panel}>
  <fieldset class="lab-interactive" disabled={!mounted} aria-label="Controles del experimento">
  <div class="lab-topbar">
    <div class="lab-scenario"><span class="mono tiny">ESCENARIO</span><select aria-label="Escenario del laboratorio" value={selectedScene} onchange={e=>reset(e.currentTarget.value as ScenarioId)}><option value="recinto">01 / El recinto</option><option value="esquina">02 / La esquina</option><option value="bajo">03 / El punto ciego</option></select></div>
    <div class="playback"><button class="button acid compact" onclick={toggle} aria-pressed={running}>{#if running}<svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M200,32H160a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm0,176H160V48h40ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Zm0,176H56V48H96Z"/></svg>{:else}<svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"/></svg>{/if}{running?'Pausar':'Recorrer'}</button><button class="button quiet compact" onclick={step} aria-label="Avanzar un barrido">Paso <svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg></button><button class="button quiet compact" onclick={()=>reset()} aria-label="Reiniciar experimento"><svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L44.59,96H72a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0V85.8L60.25,60A96,96,0,0,1,224,128Z"/></svg><span>Reiniciar</span></button><select class="speed-select" aria-label="Velocidad de reproducción" bind:value={speed}><option value={1}>×1</option><option value={3}>×3</option><option value={6}>×6</option></select></div>
    <span class="lab-kind mono">SIMULACIÓN DIDÁCTICA</span>
  </div>
  <div class="lab-mobile-tabs" role="group" aria-label="Vista del laboratorio"><button aria-pressed={mobileView==='world'} onclick={()=>mobileView='world'}>Mundo 3D</button><button aria-pressed={mobileView==='map'} onclick={()=>mobileView='map'}>Mapa 2D</button></div>
  <div class="lab-views">
    <div class="lab-world" class:mobile-hidden={mobileView!=='world'}>
      <div class="view-heading"><span class="mono">EL MUNDO / 3D</span><button class="text-button" onclick={()=>{top=!top;api?.view(top);}} disabled={!loaded}>{top?'Perspectiva ↗':'Vista superior ↓'}</button></div>
      <div class="world-canvas" bind:this={host} role="group" aria-label="Recinto tridimensional con robot, obstáculos y plano del láser">
        {#if !loaded}<div class="scene-loading">{#if failed}<p>Continúa en el mapa 2D.<br>Este navegador no pudo iniciar el visor 3D.</p><button class="text-button" onclick={initialize}>Reintentar 3D</button>{:else}<div class="scan-loader" aria-hidden="true"></div><span class="mono">Preparando escena</span>{/if}</div>{/if}
      </div>
      <p class="scene-hint"><span aria-hidden="true">↔</span> Arrastra el robot para moverlo · Arrastra el fondo para girar</p>
      {#if selectedScene==='bajo'}<span class="height-tag mono">CAJA: 12 CM · LÁSER: {fmt(frame.height*100,0)} CM</span>{/if}
    </div>
    <div class="lab-map" class:mobile-hidden={mobileView!=='map'}>
      <div class="view-heading"><span class="mono">LO QUE SABE / 2D</span><span class="mono tiny">CELDA · 8 CM</span></div>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (Aplicación espacial con flechas; los campos numéricos ofrecen la misma acción sin depender del canvas.) -->
      <div class="map-wrap" role="application" tabindex="0" aria-label="Mapa de ocupación. Toca una posición o usa las flechas para mover el robot." onkeydown={keyboard}><canvas bind:this={mapCanvas} aria-label="Celdas desconocidas, libres y ocupadas del mapa" onpointerdown={e=>{mapCanvas.setPointerCapture(e.pointerId);mapMove(e);}} onpointermove={e=>{if(mapCanvas.hasPointerCapture(e.pointerId))mapMove(e);}} onpointerup={e=>{if(mapCanvas.hasPointerCapture(e.pointerId))mapCanvas.releasePointerCapture(e.pointerId);}}></canvas></div>
      <div class="map-legend"><span><i class="unknown"></i>Desconocido</span><span><i class="free"></i>Libre</span><span><i class="occupied"></i>Impacto</span></div>
      <div class="map-metrics"><div><span class="mono metric-number">{fmt(values.knownPercent,1)}<small>%</small></span><span>celdas observadas</span></div><div><span class="mono metric-number">{fmt(values.freeArea,2)}<small>m²</small></span><span>marcadas libres</span></div></div>
      <p class="map-hint">Toca el mapa para reposicionar el robot. Las zonas ocultas necesitan otra observación.</p>
    </div>
  </div>
  <div class="lab-insight"><span class="insight-marker" aria-hidden="true">↳</span><p>{description}</p><span class="mono tiny">{WORLD.rayCount} RAYOS / BARRIDO</span></div>
  <div class="lab-controls">
    <label class="range-field"><span>Altura del láser <output>{fmt(frame.height*100,0)} cm</output></span><input type="range" min="0.06" max="0.55" step="0.01" value={frame.height} aria-label="Altura del láser en metros" oninput={e=>sensor(+e.currentTarget.value,frame.range)}/></label>
    <label class="range-field"><span>Alcance <output>{fmt(frame.range,1)} m</output></span><input type="range" min="0.5" max="5.5" step="0.1" value={frame.range} aria-label="Alcance del láser en metros" oninput={e=>sensor(frame.height,+e.currentTarget.value)}/></label>
    <label class="range-field"><span>Inspeccionar rayo <output>{fmt(distance,2)} m{frame.rays[ray]?.hit?'':' · sin retorno'}</output></span><input type="range" min="0" max="229" step="1" bind:value={ray} aria-label="Índice del rayo seleccionado" /></label>
    <div class="layer-controls"><label><input type="checkbox" bind:checked={laser}/>Rayos</label><label><input type="checkbox" bind:checked={mapLayer}/>Mapa acumulado</label></div>
  </div>
  <div class="lab-timeline"><span class="mono tiny">BARRIDO {frame.sequence}</span><input type="range" min="0" max={Math.max(0,history.length-1)} step="1" value={historyIndex} disabled={history.length<2} aria-label="Historial de barridos" aria-valuetext={`Barrido ${frame.sequence}, ${fmt(frame.elapsed,1)} segundos de simulación`} oninput={e=>restore(+e.currentTarget.value)} /><span class="mono tiny">{fmt(frame.elapsed,1)} s</span></div>
  <div class="lab-bottom"><details class="pose-details"><summary>Posición y orientación</summary><div class="pose-controls"><label>X (m)<input aria-label="Posición X en metros" type="number" min="-2.6" max="2.6" step="0.08" value={+frame.pose.x.toFixed(3)} onchange={e=>move(+e.currentTarget.value,frame.pose.z)}/></label><label>Z (m)<input aria-label="Posición Z en metros" type="number" min="-1.8" max="1.8" step="0.08" value={+frame.pose.z.toFixed(3)} onchange={e=>move(frame.pose.x,+e.currentTarget.value)}/></label><label>Rumbo (°)<input aria-label="Rumbo en grados" type="number" step="5" value={Math.round(frame.pose.yaw*180/Math.PI)} onchange={e=>move(frame.pose.x,frame.pose.z,+e.currentTarget.value*Math.PI/180)}/></label></div></details><div class="lab-export"><button class="text-button" onclick={share}>Copiar escena ↗</button><button class="text-button" onclick={exportFrame}>Exportar JSON ↓</button></div></div>
  <p class="lab-message" role="status">{message}</p>
  {#if shareURL}<label class="share-result">Enlace al escenario<input readonly value={shareURL} aria-label="Enlace para compartir el escenario" onclick={e=>e.currentTarget.select()}/></label>{/if}
  </fieldset>
</div>
<div class="lab-footnotes"><p><strong>Un ejemplo para experimentar.</strong> Recinto sintético de 5,6 × 4 m. Barrido ideal, sin ruido y con pose conocida. «Recorrer» sigue puntos prefijados y no ejecuta navegación autónoma ni SLAM.</p><p>El porcentaje cuenta celdas observadas del ejemplo, no la cobertura reportada en la tesis. <a href={`${base}mapeo.html#lidar`}>Cómo funciona el sensor real ↗</a></p></div>
