import{j as e}from"./jsx-runtime-DiklIkkE.js";import"./BaseButton-5x2xryyG.js";import{S as n}from"./BaseToast-mdXcoZct.js";import"./BaseForm-BbERTDLa.js";import"./BaseModal-AdovnsC0.js";import"./BaseFilterBar-CHAzVOfN.js";import"./BasePagination-BAxhRFoa.js";import"./BaseDrawer-V7Z3Sqav.js";import"./BasePopover-BHodcGh2.js";import"./BaseDropdown-DojHRYX0.js";import"./index-DRjF_FHU.js";const b={title:"Base/Layout/Stack",component:n,tags:["autodocs"],argTypes:{gap:{control:"select",options:[0,1,2,3,4,5,6,8,10,12]},align:{control:"select",options:["start","center","end","stretch"]},justify:{control:"select",options:["start","center","end","between","around"]}}},r=({children:t})=>e.jsx("div",{className:"bg-primary-100 text-primary-700 px-4 py-2 rounded text-sm font-medium",children:t}),s={render:()=>e.jsxs(n,{gap:3,children:[e.jsx(r,{children:"Item 1"}),e.jsx(r,{children:"Item 2"}),e.jsx(r,{children:"Item 3"})]})},o={render:()=>e.jsxs(n,{gap:3,align:"center",children:[e.jsx(r,{children:"Short"}),e.jsx(r,{children:"Medium Item"}),e.jsx(r,{children:"A Much Longer Item"})]})},a={render:()=>e.jsx("div",{className:"space-y-6",children:[1,3,6,10].map(t=>e.jsxs("div",{children:[e.jsxs("p",{className:"text-xs text-text-muted mb-1",children:["gap=",t]}),e.jsxs(n,{gap:t,children:[e.jsx(r,{children:"A"}),e.jsx(r,{children:"B"}),e.jsx(r,{children:"C"})]})]},t))})};var c,m,i;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <Stack gap={3}>\r
      <Box>Item 1</Box>\r
      <Box>Item 2</Box>\r
      <Box>Item 3</Box>\r
    </Stack>
}`,...(i=(m=s.parameters)==null?void 0:m.docs)==null?void 0:i.source}}};var p,d,x;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <Stack gap={3} align="center">\r
      <Box>Short</Box>\r
      <Box>Medium Item</Box>\r
      <Box>A Much Longer Item</Box>\r
    </Stack>
}`,...(x=(d=o.parameters)==null?void 0:d.docs)==null?void 0:x.source}}};var l,u,g;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div className="space-y-6">\r
      {([1, 3, 6, 10] as const).map(gap => <div key={gap}>\r
          <p className="text-xs text-text-muted mb-1">gap={gap}</p>\r
          <Stack gap={gap}>\r
            <Box>A</Box>\r
            <Box>B</Box>\r
            <Box>C</Box>\r
          </Stack>\r
        </div>)}\r
    </div>
}`,...(g=(u=a.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};const M=["Default","WithAlignment","Gaps"];export{s as Default,a as Gaps,o as WithAlignment,M as __namedExportsOrder,b as default};
