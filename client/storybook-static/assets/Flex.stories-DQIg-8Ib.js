import{j as e}from"./jsx-runtime-DiklIkkE.js";import"./BaseButton-5x2xryyG.js";import{F as o}from"./BaseToast-mdXcoZct.js";import"./BaseForm-BbERTDLa.js";import"./BaseModal-AdovnsC0.js";import"./BaseFilterBar-CHAzVOfN.js";import"./BasePagination-BAxhRFoa.js";import"./BaseDrawer-V7Z3Sqav.js";import"./BasePopover-BHodcGh2.js";import"./BaseDropdown-DojHRYX0.js";import"./index-DRjF_FHU.js";const k={title:"Base/Layout/Flex",component:o,tags:["autodocs"],argTypes:{gap:{control:"select",options:[0,1,2,3,4,5,6,8]},align:{control:"select",options:["start","center","end","stretch","baseline"]},justify:{control:"select",options:["start","center","end","between","around","evenly"]},direction:{control:"select",options:["row","row-reverse","col","col-reverse"]},wrap:{control:"boolean"}}},r=({children:d,w:n})=>e.jsx("div",{className:`bg-accent-100 text-accent-700 px-4 py-2 rounded text-sm font-medium ${n||""}`,children:d}),t={render:()=>e.jsxs(o,{gap:3,children:[e.jsx(r,{children:"One"}),e.jsx(r,{children:"Two"}),e.jsx(r,{children:"Three"})]})},s={render:()=>e.jsxs(o,{justify:"between",align:"center",children:[e.jsx(r,{children:"Left"}),e.jsx(r,{children:"Center"}),e.jsx(r,{children:"Right"})]})},a={render:()=>e.jsx(o,{justify:"center",align:"center",className:"h-32 border border-border rounded",children:e.jsx(r,{children:"Centered Content"})})},c={render:()=>e.jsx(o,{gap:2,wrap:!0,className:"max-w-xs",children:Array.from({length:8},(d,n)=>e.jsxs(r,{children:["Tag ",n+1]},n))})},i={render:()=>e.jsxs(o,{direction:"col",gap:2,align:"start",children:[e.jsx(r,{children:"First"}),e.jsx(r,{children:"Second"}),e.jsx(r,{children:"Third"})]})};var l,x,p;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <Flex gap={3}>\r
      <Box>One</Box>\r
      <Box>Two</Box>\r
      <Box>Three</Box>\r
    </Flex>
}`,...(p=(x=t.parameters)==null?void 0:x.docs)==null?void 0:p.source}}};var m,u,g;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <Flex justify="between" align="center">\r
      <Box>Left</Box>\r
      <Box>Center</Box>\r
      <Box>Right</Box>\r
    </Flex>
}`,...(g=(u=s.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var h,B,j;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <Flex justify="center" align="center" className="h-32 border border-border rounded">\r
      <Box>Centered Content</Box>\r
    </Flex>
}`,...(j=(B=a.parameters)==null?void 0:B.docs)==null?void 0:j.source}}};var w,F,f;c.parameters={...c.parameters,docs:{...(w=c.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <Flex gap={2} wrap className="max-w-xs">\r
      {Array.from({
      length: 8
    }, (_, i) => <Box key={i}>Tag {i + 1}</Box>)}\r
    </Flex>
}`,...(f=(F=c.parameters)==null?void 0:F.docs)==null?void 0:f.source}}};var b,y,C;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <Flex direction="col" gap={2} align="start">\r
      <Box>First</Box>\r
      <Box>Second</Box>\r
      <Box>Third</Box>\r
    </Flex>
}`,...(C=(y=i.parameters)==null?void 0:y.docs)==null?void 0:C.source}}};const $=["Row","SpaceBetween","CenterAll","Wrapping","Column"];export{a as CenterAll,i as Column,t as Row,s as SpaceBetween,c as Wrapping,$ as __namedExportsOrder,k as default};
