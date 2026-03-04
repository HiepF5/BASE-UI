import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as a}from"./index-DRjF_FHU.js";import{B as n}from"./BaseDrawer-V7Z3Sqav.js";import{B as s}from"./BaseButton-5x2xryyG.js";const F={title:"Base/Overlay/BaseDrawer",component:n,tags:["autodocs"],argTypes:{placement:{control:"select",options:["left","right","top","bottom"]},size:{control:"select",options:["sm","md","lg","xl","full"]},closeOnBackdrop:{control:"boolean"},closeOnEsc:{control:"boolean"},showClose:{control:"boolean"}}},o={render:()=>{const[r,t]=a.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(s,{onClick:()=>t(!0),children:"Open Right Drawer"}),e.jsx(n,{open:r,onClose:()=>t(!1),title:"Right Drawer",placement:"right",children:e.jsx("p",{className:"text-text-secondary",children:"This drawer slides in from the right."})})]})}},l={render:()=>{const[r,t]=a.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(s,{onClick:()=>t(!0),children:"Open Left Drawer"}),e.jsx(n,{open:r,onClose:()=>t(!1),title:"Left Drawer",placement:"left",children:e.jsx("p",{className:"text-text-secondary",children:"This drawer slides in from the left."})})]})}},i={render:()=>{const[r,t]=a.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(s,{onClick:()=>t(!0),children:"Open Bottom Drawer"}),e.jsx(n,{open:r,onClose:()=>t(!1),title:"Bottom Drawer",placement:"bottom",size:"md",children:e.jsx("p",{className:"text-text-secondary",children:"This drawer slides in from the bottom."})})]})}},c={render:()=>{const[r,t]=a.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(s,{onClick:()=>t(!0),children:"Drawer with Footer"}),e.jsx(n,{open:r,onClose:()=>t(!1),title:"Edit Item",placement:"right",size:"lg",footer:e.jsxs("div",{className:"flex justify-end gap-2",children:[e.jsx(s,{variant:"secondary",onClick:()=>t(!1),children:"Cancel"}),e.jsx(s,{onClick:()=>t(!1),children:"Save Changes"})]}),children:e.jsxs("div",{className:"space-y-4",children:[e.jsx("p",{className:"text-text-secondary",children:"Drawer body with a footer containing action buttons."}),e.jsx("div",{className:"h-96 bg-bg-secondary rounded-lg flex items-center justify-center text-text-muted",children:"Form content area"})]})})]})}},d={render:()=>{const[r,t]=a.useState(null);return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"flex gap-2 flex-wrap",children:["sm","md","lg","xl","full"].map(p=>e.jsx(s,{variant:"outline",onClick:()=>t(p),children:p},p))}),r&&e.jsx(n,{open:!0,onClose:()=>t(null),title:`Size: ${r}`,placement:"right",size:r,children:e.jsxs("p",{className:"text-text-secondary",children:["Drawer with ",e.jsx("strong",{children:r})," size."]})})]})}};var m,u,x;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <BaseButton onClick={() => setOpen(true)}>Open Right Drawer</BaseButton>\r
        <BaseDrawer open={open} onClose={() => setOpen(false)} title="Right Drawer" placement="right">\r
          <p className="text-text-secondary">This drawer slides in from the right.</p>\r
        </BaseDrawer>\r
      </>;
  }
}`,...(x=(u=o.parameters)==null?void 0:u.docs)==null?void 0:x.source}}};var h,f,B;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <BaseButton onClick={() => setOpen(true)}>Open Left Drawer</BaseButton>\r
        <BaseDrawer open={open} onClose={() => setOpen(false)} title="Left Drawer" placement="left">\r
          <p className="text-text-secondary">This drawer slides in from the left.</p>\r
        </BaseDrawer>\r
      </>;
  }
}`,...(B=(f=l.parameters)==null?void 0:f.docs)==null?void 0:B.source}}};var g,w,j;i.parameters={...i.parameters,docs:{...(g=i.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <BaseButton onClick={() => setOpen(true)}>Open Bottom Drawer</BaseButton>\r
        <BaseDrawer open={open} onClose={() => setOpen(false)} title="Bottom Drawer" placement="bottom" size="md">\r
          <p className="text-text-secondary">This drawer slides in from the bottom.</p>\r
        </BaseDrawer>\r
      </>;
  }
}`,...(j=(w=i.parameters)==null?void 0:w.docs)==null?void 0:j.source}}};var D,C,O;c.parameters={...c.parameters,docs:{...(D=c.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <BaseButton onClick={() => setOpen(true)}>Drawer with Footer</BaseButton>\r
        <BaseDrawer open={open} onClose={() => setOpen(false)} title="Edit Item" placement="right" size="lg" footer={<div className="flex justify-end gap-2">\r
              <BaseButton variant="secondary" onClick={() => setOpen(false)}>Cancel</BaseButton>\r
              <BaseButton onClick={() => setOpen(false)}>Save Changes</BaseButton>\r
            </div>}>\r
          <div className="space-y-4">\r
            <p className="text-text-secondary">Drawer body with a footer containing action buttons.</p>\r
            <div className="h-96 bg-bg-secondary rounded-lg flex items-center justify-center text-text-muted">\r
              Form content area\r
            </div>\r
          </div>\r
        </BaseDrawer>\r
      </>;
  }
}`,...(O=(C=c.parameters)==null?void 0:C.docs)==null?void 0:O.source}}};var y,S,z;d.parameters={...d.parameters,docs:{...(y=d.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full' | null>(null);
    return <>\r
        <div className="flex gap-2 flex-wrap">\r
          {(['sm', 'md', 'lg', 'xl', 'full'] as const).map(s => <BaseButton key={s} variant="outline" onClick={() => setSize(s)}>{s}</BaseButton>)}\r
        </div>\r
        {size && <BaseDrawer open onClose={() => setSize(null)} title={\`Size: \${size}\`} placement="right" size={size}>\r
            <p className="text-text-secondary">Drawer with <strong>{size}</strong> size.</p>\r
          </BaseDrawer>}\r
      </>;
  }
}`,...(z=(S=d.parameters)==null?void 0:S.docs)==null?void 0:z.source}}};const R=["Right","Left","Bottom","WithFooter","Sizes"];export{i as Bottom,l as Left,o as Right,d as Sizes,c as WithFooter,R as __namedExportsOrder,F as default};
