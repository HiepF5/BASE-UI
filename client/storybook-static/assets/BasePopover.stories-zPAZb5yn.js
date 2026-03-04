import{j as e}from"./jsx-runtime-DiklIkkE.js";import{B as s}from"./BasePopover-BHodcGh2.js";import{B as i}from"./BaseButton-5x2xryyG.js";import"./index-DRjF_FHU.js";const C={title:"Base/Overlay/BasePopover",component:s,tags:["autodocs"],argTypes:{placement:{control:"select",options:["top","top-start","top-end","bottom","bottom-start","bottom-end","left","right"]},closeOnOutsideClick:{control:"boolean"},closeOnEsc:{control:"boolean"}}},r={render:()=>e.jsx("div",{className:"flex items-center justify-center",style:{minHeight:200},children:e.jsx(s,{trigger:({toggle:t})=>e.jsx(i,{variant:"outline",onClick:t,children:"Toggle Popover"}),placement:"bottom-start",children:e.jsxs("div",{className:"p-4",children:[e.jsx("p",{className:"font-semibold mb-1",children:"Popover Title"}),e.jsx("p",{className:"text-sm text-text-muted",children:"Some descriptive content here."})]})})})},o={render:()=>e.jsx("div",{className:"grid grid-cols-4 gap-8 p-12",children:["top","bottom","left","right","top-start","top-end","bottom-start","bottom-end"].map(t=>e.jsx(s,{trigger:({toggle:N})=>e.jsx(i,{variant:"outline",size:"sm",onClick:N,children:t}),placement:t,children:e.jsxs("div",{className:"p-3 text-sm",children:["Placement: ",e.jsx("strong",{children:t})]})},t))})},n={render:()=>e.jsx("div",{className:"flex items-center justify-center",style:{minHeight:200},children:e.jsx(s,{trigger:({toggle:t})=>e.jsx(i,{onClick:t,children:"Wide Popover"}),width:360,children:e.jsxs("div",{className:"p-4",children:[e.jsx("p",{className:"font-semibold mb-2",children:"Custom Width Popover"}),e.jsx("p",{className:"text-sm text-text-muted",children:"This popover has a fixed width of 360px set via the width prop."})]})})})},a={render:()=>e.jsx("div",{className:"flex items-center justify-center",style:{minHeight:300},children:e.jsx(s,{trigger:({toggle:t})=>e.jsx(i,{onClick:t,children:"User Info"}),width:280,children:e.jsxs("div",{className:"p-4 space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold",children:"JD"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-semibold text-sm",children:"John Doe"}),e.jsx("p",{className:"text-xs text-text-muted",children:"john@example.com"})]})]}),e.jsx("hr",{className:"border-border"}),e.jsxs("div",{className:"text-sm space-y-1",children:[e.jsxs("p",{className:"text-text-secondary",children:["Role: ",e.jsx("span",{className:"font-medium",children:"Admin"})]}),e.jsxs("p",{className:"text-text-secondary",children:["Status: ",e.jsx("span",{className:"text-success-600 font-medium",children:"Active"})]})]})]})})})};var c,l,m;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <div className="flex items-center justify-center" style={{
    minHeight: 200
  }}>\r
      <BasePopover trigger={({
      toggle
    }) => <BaseButton variant="outline" onClick={toggle}>Toggle Popover</BaseButton>} placement="bottom-start">\r
        <div className="p-4">\r
          <p className="font-semibold mb-1">Popover Title</p>\r
          <p className="text-sm text-text-muted">Some descriptive content here.</p>\r
        </div>\r
      </BasePopover>\r
    </div>
}`,...(m=(l=r.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};var d,p,x;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <div className="grid grid-cols-4 gap-8 p-12">\r
      {(['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'] as const).map(pl => <BasePopover key={pl} trigger={({
      toggle
    }) => <BaseButton variant="outline" size="sm" onClick={toggle}>{pl}</BaseButton>} placement={pl}>\r
          <div className="p-3 text-sm">Placement: <strong>{pl}</strong></div>\r
        </BasePopover>)}\r
    </div>
}`,...(x=(p=o.parameters)==null?void 0:p.docs)==null?void 0:x.source}}};var h,v,g;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div className="flex items-center justify-center" style={{
    minHeight: 200
  }}>\r
      <BasePopover trigger={({
      toggle
    }) => <BaseButton onClick={toggle}>Wide Popover</BaseButton>} width={360}>\r
        <div className="p-4">\r
          <p className="font-semibold mb-2">Custom Width Popover</p>\r
          <p className="text-sm text-text-muted">\r
            This popover has a fixed width of 360px set via the width prop.\r
          </p>\r
        </div>\r
      </BasePopover>\r
    </div>
}`,...(g=(v=n.parameters)==null?void 0:v.docs)==null?void 0:g.source}}};var u,f,j;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <div className="flex items-center justify-center" style={{
    minHeight: 300
  }}>\r
      <BasePopover trigger={({
      toggle
    }) => <BaseButton onClick={toggle}>User Info</BaseButton>} width={280}>\r
        <div className="p-4 space-y-3">\r
          <div className="flex items-center gap-3">\r
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">JD</div>\r
            <div>\r
              <p className="font-semibold text-sm">John Doe</p>\r
              <p className="text-xs text-text-muted">john@example.com</p>\r
            </div>\r
          </div>\r
          <hr className="border-border" />\r
          <div className="text-sm space-y-1">\r
            <p className="text-text-secondary">Role: <span className="font-medium">Admin</span></p>\r
            <p className="text-text-secondary">Status: <span className="text-success-600 font-medium">Active</span></p>\r
          </div>\r
        </div>\r
      </BasePopover>\r
    </div>
}`,...(j=(f=a.parameters)==null?void 0:f.docs)==null?void 0:j.source}}};const k=["Default","Placements","CustomWidth","RichContent"];export{n as CustomWidth,r as Default,o as Placements,a as RichContent,k as __namedExportsOrder,C as default};
