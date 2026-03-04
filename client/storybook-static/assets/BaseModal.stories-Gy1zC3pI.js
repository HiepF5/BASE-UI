import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as d}from"./index-DRjF_FHU.js";import{B as a}from"./BaseModal-AdovnsC0.js";import{B as n}from"./BaseButton-5x2xryyG.js";const N={title:"Base/Overlay/BaseModal",component:a,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg","xl","full"]},closeOnBackdrop:{control:"boolean"},closeOnEsc:{control:"boolean"},showClose:{control:"boolean"}}},r={render:()=>{const[t,s]=d.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(n,{onClick:()=>s(!0),children:"Open Modal"}),e.jsx(a,{open:t,onClose:()=>s(!1),title:"Default Modal",children:e.jsx("p",{className:"text-text-secondary",children:"This is a default modal dialog."})})]})}},l={render:()=>{const[t,s]=d.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(n,{onClick:()=>s(!0),children:"Open Modal with Footer"}),e.jsx(a,{open:t,onClose:()=>s(!1),title:"Confirm Action",footer:e.jsxs("div",{className:"flex justify-end gap-2",children:[e.jsx(n,{variant:"secondary",onClick:()=>s(!1),children:"Cancel"}),e.jsx(n,{variant:"danger",onClick:()=>s(!1),children:"Delete"})]}),children:e.jsx("p",{className:"text-text-secondary",children:"Are you sure you want to delete this item? This action cannot be undone."})})]})}},i={render:()=>{const[t,s]=d.useState(null);return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"flex gap-2 flex-wrap",children:["sm","md","lg","xl","full"].map(o=>e.jsx(n,{variant:"outline",onClick:()=>s(o),children:o},o))}),t&&e.jsx(a,{open:!0,onClose:()=>s(null),title:`Size: ${t}`,size:t,children:e.jsxs("p",{className:"text-text-secondary",children:["This modal uses the ",e.jsx("strong",{children:t})," size variant."]})})]})}},c={render:()=>{const[t,s]=d.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(n,{onClick:()=>s(!0),children:"Long Content Modal"}),e.jsx(a,{open:t,onClose:()=>s(!1),title:"Scrollable Content",size:"md",children:e.jsx("div",{className:"space-y-4",children:Array.from({length:20},(o,u)=>e.jsxs("p",{className:"text-text-secondary",children:["Paragraph ",u+1,": Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur."]},u))})})]})}};var p,m,x;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <BaseButton onClick={() => setOpen(true)}>Open Modal</BaseButton>\r
        <BaseModal open={open} onClose={() => setOpen(false)} title="Default Modal">\r
          <p className="text-text-secondary">This is a default modal dialog.</p>\r
        </BaseModal>\r
      </>;
  }
}`,...(x=(m=r.parameters)==null?void 0:m.docs)==null?void 0:x.source}}};var f,h,B;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <BaseButton onClick={() => setOpen(true)}>Open Modal with Footer</BaseButton>\r
        <BaseModal open={open} onClose={() => setOpen(false)} title="Confirm Action" footer={<div className="flex justify-end gap-2">\r
              <BaseButton variant="secondary" onClick={() => setOpen(false)}>Cancel</BaseButton>\r
              <BaseButton variant="danger" onClick={() => setOpen(false)}>Delete</BaseButton>\r
            </div>}>\r
          <p className="text-text-secondary">Are you sure you want to delete this item? This action cannot be undone.</p>\r
        </BaseModal>\r
      </>;
  }
}`,...(B=(h=l.parameters)==null?void 0:h.docs)==null?void 0:B.source}}};var g,C,j;i.parameters={...i.parameters,docs:{...(g=i.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full' | null>(null);
    return <>\r
        <div className="flex gap-2 flex-wrap">\r
          {(['sm', 'md', 'lg', 'xl', 'full'] as const).map(s => <BaseButton key={s} variant="outline" onClick={() => setSize(s)}>{s}</BaseButton>)}\r
        </div>\r
        {size && <BaseModal open onClose={() => setSize(null)} title={\`Size: \${size}\`} size={size}>\r
            <p className="text-text-secondary">This modal uses the <strong>{size}</strong> size variant.</p>\r
          </BaseModal>}\r
      </>;
  }
}`,...(j=(C=i.parameters)==null?void 0:C.docs)==null?void 0:j.source}}};var y,O,S;c.parameters={...c.parameters,docs:{...(y=c.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <BaseButton onClick={() => setOpen(true)}>Long Content Modal</BaseButton>\r
        <BaseModal open={open} onClose={() => setOpen(false)} title="Scrollable Content" size="md">\r
          <div className="space-y-4">\r
            {Array.from({
            length: 20
          }, (_, i) => <p key={i} className="text-text-secondary">\r
                Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.\r
                Pellentesque euismod, urna eu tincidunt consectetur.\r
              </p>)}\r
          </div>\r
        </BaseModal>\r
      </>;
  }
}`,...(S=(O=c.parameters)==null?void 0:O.docs)==null?void 0:S.source}}};const F=["Default","WithFooter","Sizes","LongContent"];export{r as Default,c as LongContent,i as Sizes,l as WithFooter,F as __namedExportsOrder,N as default};
