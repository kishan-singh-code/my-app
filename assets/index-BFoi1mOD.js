import{r as a,j as r}from"./index-Ox7EXzvk.js";import{T as i}from"./index-DOqGydgx.js";import{T as p}from"./TextWorkbench-C1KUOrNv.js";import{C as u}from"./index-DfjpyPlY.js";const m=(n,o)=>{const e=new Set;return n.split(/\r?\n/).filter(s=>{const t=o?s.toLowerCase():s;return e.has(t)?!1:(e.add(t),!0)}).join(`
`)},C=()=>{const[n,o]=a.useState(`alpha
beta
alpha
gamma
Beta`),[e,s]=a.useState(!1),t=m(n,e);return r.jsx(i,{children:r.jsx(p,{input:n,output:t,onInputChange:o,controls:r.jsx(u,{checked:e,onChange:c=>s(c.target.checked),children:"Ignore case"}),onSwap:()=>o(t)})})};export{C as default};
