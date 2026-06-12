import{r as u,j as n,R as g,C as p,a as d,I as m}from"./index-DhFPPOmm.js";import{T as x}from"./index-BYmqMdJd.js";const f=e=>e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r]),a=e=>f(e).replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>").replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noreferrer">$1</a>'),$=e=>{const r=e.split(/\r?\n/);let s=!1;const t=[],l=()=>{s&&(t.push("</ul>"),s=!1)};for(const o of r){if(!o.trim()){l();continue}const i=o.match(/^(#{1,3})\s+(.*)$/),c=o.match(/^[-*]\s+(.*)$/);if(i){l();const h=i[1].length;t.push(`<h${h}>${a(i[2])}</h${h}>`)}else c?(s||(t.push("<ul>"),s=!0),t.push(`<li>${a(c[1])}</li>`)):(l(),t.push(`<p>${a(o)}</p>`))}return l(),t.join(`
`)},{TextArea:j}=m,M=()=>{const[e,r]=u.useState(`# Markdown Preview

Write **bold** text, *emphasis*, \`code\`, and links like [Vite](https://vite.dev).

- Frontend only
- Safe escaped HTML`),s=$(e);return n.jsx(x,{children:n.jsxs(g,{gutter:[18,18],children:[n.jsx(p,{xs:24,lg:12,children:n.jsx(d,{title:"Markdown",children:n.jsx(j,{value:e,onChange:t=>r(t.target.value),rows:18})})}),n.jsx(p,{xs:24,lg:12,children:n.jsx(d,{title:"Preview",children:n.jsx("div",{style:{minHeight:392},dangerouslySetInnerHTML:{__html:s}})})})]})})};export{M as default};
