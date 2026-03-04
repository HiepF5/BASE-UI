import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as V}from"./index-DRjF_FHU.js";import"./BaseButton-5x2xryyG.js";import{c as a}from"./BaseToast-mdXcoZct.js";import"./BaseForm-BbERTDLa.js";import"./BaseModal-AdovnsC0.js";import"./BaseFilterBar-CHAzVOfN.js";import"./BasePagination-BAxhRFoa.js";import"./BaseDrawer-V7Z3Sqav.js";import"./BasePopover-BHodcGh2.js";import"./BaseDropdown-DojHRYX0.js";const A={title:"Base/Form/BaseInput",component:a,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"]},variant:{control:"select",options:["default","error","success"]},label:{control:"text"},error:{control:"text"},hint:{control:"text"},placeholder:{control:"text"},disabled:{control:"boolean"}}},r={args:{label:"Username",placeholder:"Enter username...",size:"md"}},s={args:{label:"Email",value:"invalid",variant:"error",error:"Invalid email address"}},t={args:{label:"Email",value:"valid@mail.com",variant:"success",hint:"Looks good!"}},n={args:{label:"Search",placeholder:"Search...",leftIcon:e.jsx("span",{children:"🔍"}),rightIcon:e.jsx("span",{children:"✕"})}},l={render:()=>e.jsxs("div",{className:"space-y-3 max-w-sm",children:[e.jsx(a,{label:"Small",size:"sm",placeholder:"Small input"}),e.jsx(a,{label:"Medium",size:"md",placeholder:"Medium input"}),e.jsx(a,{label:"Large",size:"lg",placeholder:"Large input"})]})},o={args:{label:"Disabled",value:"Cannot edit",disabled:!0}},c={render:()=>{const[i,M]=V.useState("");return e.jsx(a,{label:"Interactive",placeholder:"Type something...",value:i,onChange:T=>M(T.target.value),hint:i.length>0?`${i.length} characters`:void 0})}};var m,d,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    label: 'Username',
    placeholder: 'Enter username...',
    size: 'md'
  }
}`,...(p=(d=r.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var u,h,g;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    value: 'invalid',
    variant: 'error',
    error: 'Invalid email address'
  }
}`,...(g=(h=s.parameters)==null?void 0:h.docs)==null?void 0:g.source}}};var v,b,S;t.parameters={...t.parameters,docs:{...(v=t.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    value: 'valid@mail.com',
    variant: 'success',
    hint: 'Looks good!'
  }
}`,...(S=(b=t.parameters)==null?void 0:b.docs)==null?void 0:S.source}}};var I,x,E;n.parameters={...n.parameters,docs:{...(I=n.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    label: 'Search',
    placeholder: 'Search...',
    leftIcon: <span>🔍</span>,
    rightIcon: <span>✕</span>
  }
}`,...(E=(x=n.parameters)==null?void 0:x.docs)==null?void 0:E.source}}};var z,f,j;l.parameters={...l.parameters,docs:{...(z=l.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <div className="space-y-3 max-w-sm">\r
      <BaseInput label="Small" size="sm" placeholder="Small input" />\r
      <BaseInput label="Medium" size="md" placeholder="Medium input" />\r
      <BaseInput label="Large" size="lg" placeholder="Large input" />\r
    </div>
}`,...(j=(f=l.parameters)==null?void 0:f.docs)==null?void 0:j.source}}};var B,L,D;o.parameters={...o.parameters,docs:{...(B=o.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    label: 'Disabled',
    value: 'Cannot edit',
    disabled: true
  }
}`,...(D=(L=o.parameters)==null?void 0:L.docs)==null?void 0:D.source}}};var W,y,C;c.parameters={...c.parameters,docs:{...(W=c.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => {
    const [val, setVal] = useState('');
    return <BaseInput label="Interactive" placeholder="Type something..." value={val} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)} hint={val.length > 0 ? \`\${val.length} characters\` : undefined} />;
  }
}`,...(C=(y=c.parameters)==null?void 0:y.docs)==null?void 0:C.source}}};const G=["Default","WithError","WithSuccess","WithIcons","Sizes","Disabled","Interactive"];export{r as Default,o as Disabled,c as Interactive,l as Sizes,s as WithError,n as WithIcons,t as WithSuccess,G as __namedExportsOrder,A as default};
