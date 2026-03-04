import{j as r}from"./jsx-runtime-DiklIkkE.js";import{r as w}from"./index-DRjF_FHU.js";import"./BaseButton-5x2xryyG.js";import{f as a}from"./BaseToast-mdXcoZct.js";import"./BaseForm-BbERTDLa.js";import"./BaseModal-AdovnsC0.js";import"./BaseFilterBar-CHAzVOfN.js";import"./BasePagination-BAxhRFoa.js";import"./BaseDrawer-V7Z3Sqav.js";import"./BasePopover-BHodcGh2.js";import"./BaseDropdown-DojHRYX0.js";const e=[{label:"React",value:"react"},{label:"Vue",value:"vue"},{label:"Angular",value:"angular"},{label:"Svelte",value:"svelte"},{label:"Disabled Option",value:"disabled",disabled:!0}],M={title:"Base/Form/BaseSelect",component:a,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"]},variant:{control:"select",options:["default","error"]},label:{control:"text"},error:{control:"text"},hint:{control:"text"},disabled:{control:"boolean"}}},o={args:{label:"Framework",options:e,placeholder:"Choose a framework..."}},t={args:{label:"Framework",options:e,variant:"error",error:"Required field"}},l={render:()=>r.jsxs("div",{className:"space-y-3 max-w-sm",children:[r.jsx(a,{label:"Small",size:"sm",options:e,placeholder:"Select..."}),r.jsx(a,{label:"Medium",size:"md",options:e,placeholder:"Select..."}),r.jsx(a,{label:"Large",size:"lg",options:e,placeholder:"Select..."})]})},s={render:()=>{const[n,f]=w.useState("");return r.jsx(a,{label:"Pick Framework",options:e,placeholder:"Select...",value:n,onChange:k=>f(k.target.value),hint:n?`Selected: ${n}`:void 0})}};var c,i,m;o.parameters={...o.parameters,docs:{...(c=o.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    label: 'Framework',
    options,
    placeholder: 'Choose a framework...'
  }
}`,...(m=(i=o.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};var p,d,u;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    label: 'Framework',
    options,
    variant: 'error',
    error: 'Required field'
  }
}`,...(u=(d=t.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var S,v,b;l.parameters={...l.parameters,docs:{...(S=l.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div className="space-y-3 max-w-sm">\r
      <BaseSelect label="Small" size="sm" options={options} placeholder="Select..." />\r
      <BaseSelect label="Medium" size="md" options={options} placeholder="Select..." />\r
      <BaseSelect label="Large" size="lg" options={options} placeholder="Select..." />\r
    </div>
}`,...(b=(v=l.parameters)==null?void 0:v.docs)==null?void 0:b.source}}};var g,h,x;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => {
    const [val, setVal] = useState('');
    return <BaseSelect label="Pick Framework" options={options} placeholder="Select..." value={val} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVal(e.target.value)} hint={val ? \`Selected: \${val}\` : undefined} />;
  }
}`,...(x=(h=s.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};const q=["Default","WithError","Sizes","Interactive"];export{o as Default,s as Interactive,l as Sizes,t as WithError,q as __namedExportsOrder,M as default};
