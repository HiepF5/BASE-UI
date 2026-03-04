import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as I}from"./index-DRjF_FHU.js";import"./BaseButton-5x2xryyG.js";import{a as r}from"./BaseToast-mdXcoZct.js";import"./BaseForm-BbERTDLa.js";import"./BaseModal-AdovnsC0.js";import"./BaseFilterBar-CHAzVOfN.js";import"./BasePagination-BAxhRFoa.js";import"./BaseDrawer-V7Z3Sqav.js";import"./BasePopover-BHodcGh2.js";import"./BaseDropdown-DojHRYX0.js";const F={title:"Base/Form/BaseCheckbox",component:r,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"]},label:{control:"text"},description:{control:"text"},error:{control:"text"},disabled:{control:"boolean"},indeterminate:{control:"boolean"}}},a={args:{label:"Accept terms and conditions"}},s={args:{label:"Email notifications",description:"Receive updates about new features"}},t={args:{label:"Required checkbox",error:"You must accept the terms"}},o={args:{label:"Select all",indeterminate:!0}},c={render:()=>e.jsxs("div",{className:"space-y-3",children:[e.jsx(r,{label:"Small",size:"sm"}),e.jsx(r,{label:"Medium (default)",size:"md"}),e.jsx(r,{label:"Large",size:"lg"})]})},n={render:()=>{const[i,R]=I.useState(!1);return e.jsx(r,{label:i?"Checked ✓":"Unchecked",checked:i,onChange:D=>R(D.target.checked)})}};var l,d,m;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    label: 'Accept terms and conditions'
  }
}`,...(m=(d=a.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var p,u,h;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    label: 'Email notifications',
    description: 'Receive updates about new features'
  }
}`,...(h=(u=s.parameters)==null?void 0:u.docs)==null?void 0:h.source}}};var b,g,k;t.parameters={...t.parameters,docs:{...(b=t.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    label: 'Required checkbox',
    error: 'You must accept the terms'
  }
}`,...(k=(g=t.parameters)==null?void 0:g.docs)==null?void 0:k.source}}};var x,f,S;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    label: 'Select all',
    indeterminate: true
  }
}`,...(S=(f=o.parameters)==null?void 0:f.docs)==null?void 0:S.source}}};var C,z,j;c.parameters={...c.parameters,docs:{...(C=c.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <div className="space-y-3">\r
      <BaseCheckbox label="Small" size="sm" />\r
      <BaseCheckbox label="Medium (default)" size="md" />\r
      <BaseCheckbox label="Large" size="lg" />\r
    </div>
}`,...(j=(z=c.parameters)==null?void 0:z.docs)==null?void 0:j.source}}};var v,B,E;n.parameters={...n.parameters,docs:{...(v=n.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(false);
    return <BaseCheckbox label={checked ? 'Checked ✓' : 'Unchecked'} checked={checked} onChange={e => setChecked(e.target.checked)} />;
  }
}`,...(E=(B=n.parameters)==null?void 0:B.docs)==null?void 0:E.source}}};const O=["Default","WithDescription","WithError","Indeterminate","Sizes","Interactive"];export{a as Default,o as Indeterminate,n as Interactive,c as Sizes,s as WithDescription,t as WithError,O as __namedExportsOrder,F as default};
