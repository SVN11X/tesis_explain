// El menú del teléfono y el buscador son del marco común (js/marco.js). Aquí queda solo lo propio de la portada.
export function initExperience(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(!reduced.matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('[data-reveal]').forEach(el=>{el.classList.add('will-reveal');observer.observe(el);});}
}
