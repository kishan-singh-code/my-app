import{r as p,j as r,S as l}from"./index-BFX-4Gwo.js";import{T as u}from"./index-BoPLQvFV.js";import{T as m}from"./TextWorkbench-CCsaRzB7.js";import{S as h}from"./index-BAYgUYPk.js";import{C as x}from"./index-Baw8Jq0d.js";import"./useCopyToClipboard-CrVii-3u.js";import"./InfoCircleFilled-a2VYrYJR.js";import"./DeleteOutlined-DNGFCgKy.js";import"./SwapOutlined-COOBqz0L.js";const d=(s,n,e)=>{const a=s.split(/\r?\n/).sort((t,c)=>{const i=e?t.toLowerCase():t,o=e?c.toLowerCase():c;return i.localeCompare(o,void 0,{sensitivity:e?"base":"variant"})});return n==="asc"?a.join(`
`):a.reverse().join(`
`)},w=()=>{const[s,n]=p.useState(`Delta
alpha
charlie
Bravo`),[e,a]=p.useState("asc"),[t,c]=p.useState(!0),i=d(s,e,t);return r.jsx(u,{children:r.jsx(m,{input:s,output:i,onInputChange:n,controls:r.jsxs(l,{wrap:!0,children:[r.jsx(h,{value:e,options:[{label:"A-Z",value:"asc"},{label:"Z-A",value:"desc"}],onChange:o=>a(o)}),r.jsx(x,{checked:t,onChange:o=>c(o.target.checked),children:"Ignore case"})]}),onSwap:()=>n(i)})})};export{w as default};
