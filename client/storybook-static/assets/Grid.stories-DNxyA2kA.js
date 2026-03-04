import{j as e}from"./jsx-runtime-DiklIkkE.js";import"./BaseButton-5x2xryyG.js";import{G as s}from"./BaseToast-mdXcoZct.js";import"./BaseForm-BbERTDLa.js";import"./BaseModal-AdovnsC0.js";import"./BaseFilterBar-CHAzVOfN.js";import"./BasePagination-BAxhRFoa.js";import"./BaseDrawer-V7Z3Sqav.js";import"./BasePopover-BHodcGh2.js";import"./BaseDropdown-DojHRYX0.js";import"./index-DRjF_FHU.js";const k={title:"Base/Layout/Grid",component:s,tags:["autodocs"],argTypes:{cols:{control:"select",options:[1,2,3,4,6,12]},gap:{control:"select",options:[0,2,3,4,6,8]}}},a=({children:l})=>e.jsx("div",{className:"bg-primary-100 text-primary-700 p-4 rounded text-center text-sm font-medium",children:l}),t={render:()=>e.jsx(s,{cols:3,gap:4,children:Array.from({length:6},(l,r)=>e.jsxs(a,{children:["Cell ",r+1]},r))})},o={render:()=>e.jsx(s,{cols:1,smCols:2,mdCols:3,lgCols:4,gap:4,children:Array.from({length:8},(l,r)=>e.jsxs(a,{children:["Item ",r+1]},r))})},d={render:()=>e.jsxs(s,{cols:2,gap:4,children:[e.jsx(a,{children:"Left"}),e.jsx(a,{children:"Right"})]})},n={render:()=>e.jsxs(s,{cols:1,mdCols:3,gap:4,children:[e.jsxs("div",{className:"bg-success-light p-6 rounded border border-success/20 text-center",children:[e.jsx("div",{className:"text-2xl font-bold text-success",children:"1,234"}),e.jsx("div",{className:"text-sm text-text-muted",children:"Total Users"})]}),e.jsxs("div",{className:"bg-primary-100 p-6 rounded border border-primary-200 text-center",children:[e.jsx("div",{className:"text-2xl font-bold text-primary",children:"567"}),e.jsx("div",{className:"text-sm text-text-muted",children:"Active"})]}),e.jsxs("div",{className:"bg-warning-light p-6 rounded border border-warning/20 text-center",children:[e.jsx("div",{className:"text-2xl font-bold text-warning",children:"89"}),e.jsx("div",{className:"text-sm text-text-muted",children:"Pending"})]})]})};var i,c,m;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <Grid cols={3} gap={4}>\r
      {Array.from({
      length: 6
    }, (_, i) => <Cell key={i}>Cell {i + 1}</Cell>)}\r
    </Grid>
}`,...(m=(c=t.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var x,p,g;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <Grid cols={1} smCols={2} mdCols={3} lgCols={4} gap={4}>\r
      {Array.from({
      length: 8
    }, (_, i) => <Cell key={i}>Item {i + 1}</Cell>)}\r
    </Grid>
}`,...(g=(p=o.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var u,v,h;d.parameters={...d.parameters,docs:{...(u=d.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <Grid cols={2} gap={4}>\r
      <Cell>Left</Cell>\r
      <Cell>Right</Cell>\r
    </Grid>
}`,...(h=(v=d.parameters)==null?void 0:v.docs)==null?void 0:h.source}}};var b,C,j;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <Grid cols={1} mdCols={3} gap={4}>\r
      <div className="bg-success-light p-6 rounded border border-success/20 text-center">\r
        <div className="text-2xl font-bold text-success">1,234</div>\r
        <div className="text-sm text-text-muted">Total Users</div>\r
      </div>\r
      <div className="bg-primary-100 p-6 rounded border border-primary-200 text-center">\r
        <div className="text-2xl font-bold text-primary">567</div>\r
        <div className="text-sm text-text-muted">Active</div>\r
      </div>\r
      <div className="bg-warning-light p-6 rounded border border-warning/20 text-center">\r
        <div className="text-2xl font-bold text-warning">89</div>\r
        <div className="text-sm text-text-muted">Pending</div>\r
      </div>\r
    </Grid>
}`,...(j=(C=n.parameters)==null?void 0:C.docs)==null?void 0:j.source}}};const D=["ThreeColumns","Responsive","TwoColumns","DashboardLayout"];export{n as DashboardLayout,o as Responsive,t as ThreeColumns,d as TwoColumns,D as __namedExportsOrder,k as default};
