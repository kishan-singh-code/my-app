import{r as a,j as s}from"./index-BFX-4Gwo.js";import{T as p}from"./index-BoPLQvFV.js";import{T as c}from"./TextWorkbench-CCsaRzB7.js";import{C as m}from"./index-Baw8Jq0d.js";import"./useCopyToClipboard-CrVii-3u.js";import"./InfoCircleFilled-a2VYrYJR.js";import"./DeleteOutlined-DNGFCgKy.js";import"./SwapOutlined-COOBqz0L.js";const u=(o,n)=>{const e=new Set;return o.split(/\r?\n/).filter(r=>{const t=n?r.toLowerCase():r;return e.has(t)?!1:(e.add(t),!0)}).join(`
`)},k=()=>{const[o,n]=a.useState(`alpha
beta
alpha
gamma
Beta`),[e,r]=a.useState(!1),t=u(o,e);return s.jsx(p,{children:s.jsx(c,{input:o,output:t,onInputChange:n,controls:s.jsx(m,{checked:e,onChange:i=>r(i.target.checked),children:"Ignore case"}),onSwap:()=>n(t)})})};export{k as default};
