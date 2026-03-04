import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as w}from"./index-DRjF_FHU.js";import"./BaseButton-5x2xryyG.js";import{h as s}from"./BaseToast-mdXcoZct.js";import"./BaseForm-BbERTDLa.js";import"./BaseModal-AdovnsC0.js";import"./BaseFilterBar-CHAzVOfN.js";import"./BasePagination-BAxhRFoa.js";import"./BaseDrawer-V7Z3Sqav.js";import"./BasePopover-BHodcGh2.js";import"./BaseDropdown-DojHRYX0.js";const T={title:"Base/Form/BaseSwitch",component:s,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"]},label:{control:"text"},description:{control:"text"},disabled:{control:"boolean"}}},a={args:{label:"Dark mode"}},r={args:{label:"Notifications",description:"Receive push notifications for updates"}},t={render:()=>e.jsxs("div",{className:"space-y-4",children:[e.jsx(s,{label:"Small",size:"sm"}),e.jsx(s,{label:"Medium (default)",size:"md"}),e.jsx(s,{label:"Large",size:"lg"})]})},o={args:{label:"Disabled switch",disabled:!0}},i={render:()=>{const[n,F]=w.useState(!1);return e.jsx(s,{label:n?"Feature ON":"Feature OFF",checked:n,onChange:v=>F(v.target.checked),description:n?"Click to disable":"Click to enable"})}};var c,l,d;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    label: 'Dark mode'
  }
}`,...(d=(l=a.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var m,p,u;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    label: 'Notifications',
    description: 'Receive push notifications for updates'
  }
}`,...(u=(p=r.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var b,g,h;t.parameters={...t.parameters,docs:{...(b=t.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">\r
      <BaseSwitch label="Small" size="sm" />\r
      <BaseSwitch label="Medium (default)" size="md" />\r
      <BaseSwitch label="Large" size="lg" />\r
    </div>
}`,...(h=(g=t.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var S,f,x;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    label: 'Disabled switch',
    disabled: true
  }
}`,...(x=(f=o.parameters)==null?void 0:f.docs)==null?void 0:x.source}}};var k,D,z;i.parameters={...i.parameters,docs:{...(k=i.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => {
    const [on, setOn] = useState(false);
    return <BaseSwitch label={on ? 'Feature ON' : 'Feature OFF'} checked={on} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOn(e.target.checked)} description={on ? 'Click to disable' : 'Click to enable'} />;
  }
}`,...(z=(D=i.parameters)==null?void 0:D.docs)==null?void 0:z.source}}};const W=["Default","WithDescription","Sizes","Disabled","Interactive"];export{a as Default,o as Disabled,i as Interactive,t as Sizes,r as WithDescription,W as __namedExportsOrder,T as default};
