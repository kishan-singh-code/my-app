import{r as a,j as n}from"./index-BFX-4Gwo.js";import{T as c}from"./index-BoPLQvFV.js";import{T as m}from"./TextWorkbench-CCsaRzB7.js";import{S as u}from"./index-BAYgUYPk.js";import"./useCopyToClipboard-CrVii-3u.js";import"./InfoCircleFilled-a2VYrYJR.js";import"./DeleteOutlined-DNGFCgKy.js";import"./SwapOutlined-COOBqz0L.js";const r=t=>t.split(/\r?\n/).map(e=>e.replace(/[\t ]+/g," ").trim()).join(`
`),p=t=>t.replace(/(?:\r?\n){2,}/g,`
`),x=(t,e)=>e==="spaces"?r(t):p(e==="blank-lines"?t:r(t)),g=()=>{const[t,e]=a.useState(`This    text	 has extra spaces.


And too many blank lines.`),[o,i]=a.useState("both"),s=x(t,o);return n.jsx(c,{children:n.jsx(m,{input:t,output:s,onInputChange:e,controls:n.jsx(u,{value:o,options:[{label:"Spaces",value:"spaces"},{label:"Blank Lines",value:"blank-lines"},{label:"Both",value:"both"}],onChange:l=>i(l)}),onSwap:()=>e(s)})})};export{g as default};
