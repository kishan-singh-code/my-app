import{r as l,j as s,S as u}from"./index-Ox7EXzvk.js";import{T as p}from"./index-DOqGydgx.js";import{T as m}from"./TextWorkbench-C1KUOrNv.js";import{S as h}from"./index-oRE4RCu4.js";import{C as x}from"./index-DfjpyPlY.js";const d=(r,n,e)=>{const a=r.split(/\r?\n/).sort((t,c)=>{const i=e?t.toLowerCase():t,o=e?c.toLowerCase():c;return i.localeCompare(o,void 0,{sensitivity:e?"base":"variant"})});return n==="asc"?a.join(`
`):a.reverse().join(`
`)},g=()=>{const[r,n]=l.useState(`Delta
alpha
charlie
Bravo`),[e,a]=l.useState("asc"),[t,c]=l.useState(!0),i=d(r,e,t);return s.jsx(p,{children:s.jsx(m,{input:r,output:i,onInputChange:n,controls:s.jsxs(u,{wrap:!0,children:[s.jsx(h,{value:e,options:[{label:"A-Z",value:"asc"},{label:"Z-A",value:"desc"}],onChange:o=>a(o)}),s.jsx(x,{checked:t,onChange:o=>c(o.target.checked),children:"Ignore case"})]}),onSwap:()=>n(i)})})};export{g as default};
