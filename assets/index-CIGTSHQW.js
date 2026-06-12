import{r as a,j as s}from"./index-DhFPPOmm.js";import{T as p}from"./index-BYmqMdJd.js";import{T as c}from"./TextWorkbench-BLamSH4m.js";import{C as m}from"./index-B9kO5Owb.js";import"./useCopyToClipboard-DO_qo_4D.js";import"./CSSMotionList-qRRiHuSr.js";import"./InfoCircleFilled-Cz6kk2jS.js";import"./DeleteOutlined-BLeixf-Y.js";import"./SwapOutlined-DoiGYeLc.js";const u=(o,n)=>{const e=new Set;return o.split(/\r?\n/).filter(r=>{const t=n?r.toLowerCase():r;return e.has(t)?!1:(e.add(t),!0)}).join(`
`)},I=()=>{const[o,n]=a.useState(`alpha
beta
alpha
gamma
Beta`),[e,r]=a.useState(!1),t=u(o,e);return s.jsx(p,{children:s.jsx(c,{input:o,output:t,onInputChange:n,controls:s.jsx(m,{checked:e,onChange:i=>r(i.target.checked),children:"Ignore case"}),onSwap:()=>n(t)})})};export{I as default};
