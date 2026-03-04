import{j as n}from"./jsx-runtime-DiklIkkE.js";import{r as i}from"./index-DRjF_FHU.js";import"./BaseButton-5x2xryyG.js";import{d as r}from"./BaseToast-mdXcoZct.js";import"./BaseForm-BbERTDLa.js";import"./BaseModal-AdovnsC0.js";import"./BaseFilterBar-CHAzVOfN.js";import"./BasePagination-BAxhRFoa.js";import"./BaseDrawer-V7Z3Sqav.js";import"./BasePopover-BHodcGh2.js";import"./BaseDropdown-DojHRYX0.js";const c=[{label:"React",value:"react"},{label:"TypeScript",value:"typescript"},{label:"Tailwind CSS",value:"tailwind"},{label:"Vite",value:"vite"},{label:"Zustand",value:"zustand"},{label:"React Query",value:"react-query"}],k={title:"Base/Form/BaseMultiSelect",component:r,tags:["autodocs"],argTypes:{disabled:{control:"boolean"},searchable:{control:"boolean"},maxDisplay:{control:"number"}}},t={render:()=>{const[e,a]=i.useState(["react"]);return n.jsx(r,{label:"Tech Stack",options:c,value:e,onChange:a,placeholder:"Select technologies..."})}},s={render:()=>{const[e,a]=i.useState([]);return n.jsx(r,{label:"Searchable",options:c,value:e,onChange:a,searchable:!0,placeholder:"Type to search..."})}},l={render:()=>{const[e,a]=i.useState([]);return n.jsx(r,{label:"Required Field",options:c,value:e,onChange:a,error:"Please select at least one",required:!0})}},o={render:()=>n.jsx(r,{label:"Disabled",options:c,value:["react","typescript"],onChange:()=>{},disabled:!0})};var u,p,d;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => {
    const [val, setVal] = useState<(string | number)[]>(['react']);
    return <BaseMultiSelect label="Tech Stack" options={options} value={val} onChange={setVal} placeholder="Select technologies..." />;
  }
}`,...(d=(p=t.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var m,b,h;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => {
    const [val, setVal] = useState<(string | number)[]>([]);
    return <BaseMultiSelect label="Searchable" options={options} value={val} onChange={setVal} searchable placeholder="Type to search..." />;
  }
}`,...(h=(b=s.parameters)==null?void 0:b.docs)==null?void 0:h.source}}};var S,v,g;l.parameters={...l.parameters,docs:{...(S=l.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => {
    const [val, setVal] = useState<(string | number)[]>([]);
    return <BaseMultiSelect label="Required Field" options={options} value={val} onChange={setVal} error="Please select at least one" required />;
  }
}`,...(g=(v=l.parameters)==null?void 0:v.docs)==null?void 0:g.source}}};var x,y,V;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <BaseMultiSelect label="Disabled" options={options} value={['react', 'typescript']} onChange={() => {}} disabled />
}`,...(V=(y=o.parameters)==null?void 0:y.docs)==null?void 0:V.source}}};const w=["Default","Searchable","WithError","Disabled"];export{t as Default,o as Disabled,s as Searchable,l as WithError,w as __namedExportsOrder,k as default};
