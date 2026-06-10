import{r as o,j as t}from"./index-Ox7EXzvk.js";import{T as c}from"./index-DOqGydgx.js";import{T as m}from"./TextWorkbench-C1KUOrNv.js";import{S as u}from"./index-oRE4RCu4.js";const r=e=>e.split(/\r?\n/).map(n=>n.replace(/[\t ]+/g," ").trim()).join(`
`),l=e=>e.replace(/(?:\r?\n){2,}/g,`
`),x=(e,n)=>n==="spaces"?r(e):l(n==="blank-lines"?e:r(e)),j=()=>{const[e,n]=o.useState(`This    text	 has extra spaces.


And too many blank lines.`),[s,p]=o.useState("both"),a=x(e,s);return t.jsx(c,{children:t.jsx(m,{input:e,output:a,onInputChange:n,controls:t.jsx(u,{value:s,options:[{label:"Spaces",value:"spaces"},{label:"Blank Lines",value:"blank-lines"},{label:"Both",value:"both"}],onChange:i=>p(i)}),onSwap:()=>n(a)})})};export{j as default};
