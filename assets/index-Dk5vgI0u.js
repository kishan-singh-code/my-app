import{r as a,j as n}from"./index-DhFPPOmm.js";import{T as m}from"./index-BYmqMdJd.js";import{T as c}from"./TextWorkbench-BLamSH4m.js";import{S as u}from"./index-O5LEQfQM.js";import"./useCopyToClipboard-DO_qo_4D.js";import"./CSSMotionList-qRRiHuSr.js";import"./InfoCircleFilled-Cz6kk2jS.js";import"./DeleteOutlined-BLeixf-Y.js";import"./SwapOutlined-DoiGYeLc.js";const r=t=>t.split(/\r?\n/).map(e=>e.replace(/[\t ]+/g," ").trim()).join(`
`),p=t=>t.replace(/(?:\r?\n){2,}/g,`
`),x=(t,e)=>e==="spaces"?r(t):p(e==="blank-lines"?t:r(t)),v=()=>{const[t,e]=a.useState(`This    text	 has extra spaces.


And too many blank lines.`),[o,i]=a.useState("both"),s=x(t,o);return n.jsx(m,{children:n.jsx(c,{input:t,output:s,onInputChange:e,controls:n.jsx(u,{value:o,options:[{label:"Spaces",value:"spaces"},{label:"Blank Lines",value:"blank-lines"},{label:"Both",value:"both"}],onChange:l=>i(l)}),onSwap:()=>e(s)})})};export{v as default};
