type Entry={u:string;t:string;p:string;x:string};
declare global { interface Window {INDICE?:Entry[]} }
export function initExperience(){
  const menu=document.querySelector<HTMLDetailsElement>('.mobile-menu');
  menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.open=false;}));
  menu?.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;menu.querySelector('summary')?.focus();}});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(!reduced.matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('[data-reveal]').forEach(el=>{el.classList.add('will-reveal');observer.observe(el);});}
  const dialog=document.querySelector<HTMLDialogElement>('.search-dialog')!;
  const input=dialog.querySelector<HTMLInputElement>('input')!;
  const list=dialog.querySelector<HTMLUListElement>('.search-results')!;
  const status=dialog.querySelector<HTMLElement>('.search-status')!;
  const base=import.meta.env.BASE_URL.replace(/\/?$/,'/');
  let loading:Promise<void>|undefined;
  async function open(){dialog.showModal();input.focus();if(!window.INDICE){status.textContent='Cargando el índice…';try{loading??=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=base+'datos/indice.js';script.onload=()=>resolve();script.onerror=()=>{loading=undefined;script.remove();reject(new Error('index'));};document.head.append(script);});await loading;search();}catch{status.textContent='No se pudo cargar el índice. Cierra y vuelve a abrir la búsqueda.';}}else search();}
  document.querySelectorAll<HTMLButtonElement>('[data-search-open]').forEach(button=>{button.hidden=false;button.addEventListener('click',open);});
  dialog.querySelector('[data-search-close]')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!dialog.open)open();else dialog.close();}});
  const normalize=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/(\d),(?=\d)/g,'$1.');
  function search(){list.replaceChildren();const query=normalize(input.value.trim());if(query.length<2){status.textContent='Escribe al menos dos caracteres.';return;}if(!window.INDICE)return;
    const tokens=query.split(/\s+/),seen=new Set<string>();
    const results=window.INDICE.map(item=>({item,score:tokens.reduce((n,t)=>n+(normalize(item.t).includes(t)?4:0)+(normalize(item.x).includes(t)?1:0),0)})).filter(({item})=>tokens.every(t=>normalize(item.t+' '+item.x).includes(t))).sort((a,b)=>b.score-a.score).filter(({item})=>{if(seen.has(item.u))return false;seen.add(item.u);return true;}).slice(0,12);
    status.textContent=results.length?`${results.length} secciones encontradas${seen.size>12?' · se muestran las primeras':''}.`:'Sin coincidencias. Prueba con un término más general.';
    results.forEach(({item})=>{const li=document.createElement('li'),a=document.createElement('a'),meta=document.createElement('span'),title=document.createElement('strong'),excerpt=document.createElement('p');a.href=base+item.u;meta.textContent=item.p;title.textContent=item.t;const idx=normalize(item.x).indexOf(tokens[0]),start=Math.max(0,idx-45);excerpt.textContent=(start?'…':'')+item.x.slice(start,start+150)+'…';a.append(meta,title,excerpt);li.append(a);list.append(li);});
  }
  input.addEventListener('input',search);
}
