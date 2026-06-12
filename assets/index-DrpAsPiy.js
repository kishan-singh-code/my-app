import{r as p,j as r,S as l}from"./index-DhFPPOmm.js";import{T as u}from"./index-BYmqMdJd.js";import{T as m}from"./TextWorkbench-BLamSH4m.js";import{S as h}from"./index-O5LEQfQM.js";import{C as x}from"./index-B9kO5Owb.js";import"./useCopyToClipboard-DO_qo_4D.js";import"./CSSMotionList-qRRiHuSr.js";import"./InfoCircleFilled-Cz6kk2jS.js";import"./DeleteOutlined-BLeixf-Y.js";import"./SwapOutlined-DoiGYeLc.js";const d=(s,n,t)=>{const a=s.split(/\r?\n/).sort((e,c)=>{const i=t?e.toLowerCase():e,o=t?c.toLowerCase():c;return i.localeCompare(o,void 0,{sensitivity:t?"base":"variant"})});return n==="asc"?a.join(`
`):a.reverse().join(`
`)},I=()=>{const[s,n]=p.useState(`Delta
alpha
charlie
Bravo`),[t,a]=p.useState("asc"),[e,c]=p.useState(!0),i=d(s,t,e);return r.jsx(u,{children:r.jsx(m,{input:s,output:i,onInputChange:n,controls:r.jsxs(l,{wrap:!0,children:[r.jsx(h,{value:t,options:[{label:"A-Z",value:"asc"},{label:"Z-A",value:"desc"}],onChange:o=>a(o)}),r.jsx(x,{checked:e,onChange:o=>c(o.target.checked),children:"Ignore case"})]}),onSwap:()=>n(i)})})};export{I as default};
