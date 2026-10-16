// Apply before paint; storage may be unavailable in private/restricted contexts.
(function(){
 let theme='dark';try{const saved=localStorage.getItem('gf-theme');if(saved==='light'||saved==='dark')theme=saved;else if(saved==='auto')theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}catch(e){}
 function apply(value){theme=value;document.documentElement.dataset.theme=theme;const button=(document.getElementById('appearance')||document.getElementById('theme'));if(button){button.textContent=theme==='dark'?'Light mode':'Dark mode';button.setAttribute('aria-label','Switch to '+(theme==='dark'?'light':'dark')+' mode');}window.dispatchEvent(new Event('themechange'));}
 apply(theme);document.addEventListener('DOMContentLoaded',()=>{apply(theme);(document.getElementById('appearance')||document.getElementById('theme'))?.addEventListener('click',()=>{apply(theme==='dark'?'light':'dark');try{localStorage.setItem('gf-theme',theme);}catch(e){}});});
 window.addEventListener('storage',e=>{if(e.key==='gf-theme'&&(e.newValue==='light'||e.newValue==='dark'))apply(e.newValue);});
})();
