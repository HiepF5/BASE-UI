import{j as r}from"./jsx-runtime-DiklIkkE.js";import"./BaseButton-5x2xryyG.js";import{C as a}from"./BaseToast-mdXcoZct.js";import"./BaseForm-BbERTDLa.js";import"./BaseModal-AdovnsC0.js";import"./BaseFilterBar-CHAzVOfN.js";import"./BasePagination-BAxhRFoa.js";import"./BaseDrawer-V7Z3Sqav.js";import"./BasePopover-BHodcGh2.js";import"./BaseDropdown-DojHRYX0.js";import"./index-DRjF_FHU.js";const I={title:"Base/Layout/Container",component:a,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg","xl","2xl","full"]},noPadding:{control:"boolean"}}},n=()=>r.jsx("div",{className:"bg-primary-100 text-primary-700 p-4 rounded text-sm",children:"Content inside container. Resize browser to see max-width."}),e={render:()=>r.jsx(a,{children:r.jsx(n,{})})},s={render:()=>r.jsx("div",{className:"space-y-4",children:["sm","md","lg","xl","2xl","full"].map(t=>r.jsxs("div",{children:[r.jsxs("p",{className:"text-xs text-text-muted mb-1",children:['size="',t,'"']}),r.jsx(a,{size:t,className:"border border-border rounded",children:r.jsx(n,{})})]},t))})},o={render:()=>r.jsx(a,{noPadding:!0,className:"border border-border",children:r.jsx(n,{})})};var d,i,m;e.parameters={...e.parameters,docs:{...(d=e.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <Container>\r
      <Inner />\r
    </Container>
}`,...(m=(i=e.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};var c,l,p;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">\r
      {(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map(size => <div key={size}>\r
          <p className="text-xs text-text-muted mb-1">size="{size}"</p>\r
          <Container size={size} className="border border-border rounded">\r
            <Inner />\r
          </Container>\r
        </div>)}\r
    </div>
}`,...(p=(l=s.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};var x,u,b;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <Container noPadding className="border border-border">\r
      <Inner />\r
    </Container>
}`,...(b=(u=o.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};const w=["Default","AllSizes","NoPadding"];export{s as AllSizes,e as Default,o as NoPadding,w as __namedExportsOrder,I as default};
