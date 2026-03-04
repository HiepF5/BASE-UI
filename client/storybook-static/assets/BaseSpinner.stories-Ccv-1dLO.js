import{j as e}from"./jsx-runtime-DiklIkkE.js";import"./BaseButton-5x2xryyG.js";import{g as r,P as B}from"./BaseToast-mdXcoZct.js";import"./BaseForm-BbERTDLa.js";import"./BaseModal-AdovnsC0.js";import"./BaseFilterBar-CHAzVOfN.js";import"./BasePagination-BAxhRFoa.js";import"./BaseDrawer-V7Z3Sqav.js";import"./BasePopover-BHodcGh2.js";import"./BaseDropdown-DojHRYX0.js";import"./index-DRjF_FHU.js";const W={title:"Base/Feedback/BaseSpinner",component:r,tags:["autodocs"],argTypes:{size:{control:"select",options:["xs","sm","md","lg","xl"]},color:{control:"select",options:["primary","white","muted","current"]},label:{control:"text"}}},s={args:{size:"md",color:"primary"}},a={args:{size:"md",label:"Loading data..."}},o={render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(r,{size:"xs"}),e.jsx(r,{size:"sm"}),e.jsx(r,{size:"md"}),e.jsx(r,{size:"lg"}),e.jsx(r,{size:"xl"})]})},n={render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(r,{color:"primary"}),e.jsx(r,{color:"muted"}),e.jsx("div",{className:"bg-primary p-3 rounded",children:e.jsx(r,{color:"white"})})]})},i={render:()=>e.jsx("div",{className:"relative h-64 border border-border rounded",children:e.jsx(B,{label:"Loading page..."})})};var t,d,c;s.parameters={...s.parameters,docs:{...(t=s.parameters)==null?void 0:t.docs,source:{originalSource:`{
  args: {
    size: 'md',
    color: 'primary'
  }
}`,...(c=(d=s.parameters)==null?void 0:d.docs)==null?void 0:c.source}}};var l,m,p;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    size: 'md',
    label: 'Loading data...'
  }
}`,...(p=(m=a.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var g,u,x;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">\r
      <BaseSpinner size="xs" />\r
      <BaseSpinner size="sm" />\r
      <BaseSpinner size="md" />\r
      <BaseSpinner size="lg" />\r
      <BaseSpinner size="xl" />\r
    </div>
}`,...(x=(u=o.parameters)==null?void 0:u.docs)==null?void 0:x.source}}};var z,S,b;n.parameters={...n.parameters,docs:{...(z=n.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">\r
      <BaseSpinner color="primary" />\r
      <BaseSpinner color="muted" />\r
      <div className="bg-primary p-3 rounded">\r
        <BaseSpinner color="white" />\r
      </div>\r
    </div>
}`,...(b=(S=n.parameters)==null?void 0:S.docs)==null?void 0:b.source}}};var j,v,h;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <div className="relative h-64 border border-border rounded">\r
      <PageLoader label="Loading page..." />\r
    </div>
}`,...(h=(v=i.parameters)==null?void 0:v.docs)==null?void 0:h.source}}};const _=["Default","WithLabel","AllSizes","Colors","FullPageLoader"];export{o as AllSizes,n as Colors,s as Default,i as FullPageLoader,a as WithLabel,_ as __namedExportsOrder,W as default};
