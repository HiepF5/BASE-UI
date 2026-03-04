import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as T}from"./index-DRjF_FHU.js";import"./BaseButton-5x2xryyG.js";import{B as r}from"./BaseToast-mdXcoZct.js";import"./BaseForm-BbERTDLa.js";import"./BaseModal-AdovnsC0.js";import"./BaseFilterBar-CHAzVOfN.js";import"./BasePagination-BAxhRFoa.js";import"./BaseDrawer-V7Z3Sqav.js";import"./BasePopover-BHodcGh2.js";import"./BaseDropdown-DojHRYX0.js";const H={title:"Base/Feedback/BaseAlert",component:r,tags:["autodocs"],argTypes:{variant:{control:"select",options:["info","success","warning","danger","neutral"]},title:{control:"text"},closable:{control:"boolean"}}},a={args:{variant:"info",title:"Information",children:"This is an informational message."}},s={args:{variant:"success",title:"Success",children:"Your changes have been saved successfully."}},t={args:{variant:"warning",title:"Warning",children:"Please review your input before proceeding."}},n={args:{variant:"danger",title:"Error",children:"An unexpected error occurred. Please try again."}},o={args:{variant:"neutral",title:"Note",children:"This is a neutral informational note."}},i={render:()=>e.jsxs("div",{className:"space-y-3",children:[e.jsx(r,{variant:"info",title:"Info",children:"Info message content."}),e.jsx(r,{variant:"success",title:"Success",children:"Success message content."}),e.jsx(r,{variant:"warning",title:"Warning",children:"Warning message content."}),e.jsx(r,{variant:"danger",title:"Error",children:"Error message content."}),e.jsx(r,{variant:"neutral",title:"Note",children:"Neutral message content."})]})},c={render:()=>{const[k,l]=T.useState(!0);return k?e.jsx(r,{variant:"success",title:"Closable",closable:!0,onClose:()=>l(!1),children:"Click the × to dismiss this alert."}):e.jsx("button",{className:"text-sm text-primary underline",onClick:()=>l(!0),children:"Show alert again"})}};var u,m,d;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    variant: 'info',
    title: 'Information',
    children: 'This is an informational message.'
  }
}`,...(d=(m=a.parameters)==null?void 0:m.docs)==null?void 0:d.source}}};var g,p,h;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    variant: 'success',
    title: 'Success',
    children: 'Your changes have been saved successfully.'
  }
}`,...(h=(p=s.parameters)==null?void 0:p.docs)==null?void 0:h.source}}};var v,f,S;t.parameters={...t.parameters,docs:{...(v=t.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'Please review your input before proceeding.'
  }
}`,...(S=(f=t.parameters)==null?void 0:f.docs)==null?void 0:S.source}}};var x,A,b;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    variant: 'danger',
    title: 'Error',
    children: 'An unexpected error occurred. Please try again.'
  }
}`,...(b=(A=n.parameters)==null?void 0:A.docs)==null?void 0:b.source}}};var w,B,N;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    variant: 'neutral',
    title: 'Note',
    children: 'This is a neutral informational note.'
  }
}`,...(N=(B=o.parameters)==null?void 0:B.docs)==null?void 0:N.source}}};var y,j,C;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <div className="space-y-3">\r
      <BaseAlert variant="info" title="Info">Info message content.</BaseAlert>\r
      <BaseAlert variant="success" title="Success">Success message content.</BaseAlert>\r
      <BaseAlert variant="warning" title="Warning">Warning message content.</BaseAlert>\r
      <BaseAlert variant="danger" title="Error">Error message content.</BaseAlert>\r
      <BaseAlert variant="neutral" title="Note">Neutral message content.</BaseAlert>\r
    </div>
}`,...(C=(j=i.parameters)==null?void 0:j.docs)==null?void 0:C.source}}};var E,I,W;c.parameters={...c.parameters,docs:{...(E=c.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => {
    const [show, setShow] = useState(true);
    if (!show) {
      return <button className="text-sm text-primary underline" onClick={() => setShow(true)}>\r
          Show alert again\r
        </button>;
    }
    return <BaseAlert variant="success" title="Closable" closable onClose={() => setShow(false)}>\r
        Click the × to dismiss this alert.\r
      </BaseAlert>;
  }
}`,...(W=(I=c.parameters)==null?void 0:I.docs)==null?void 0:W.source}}};const J=["Info","Success","Warning","Danger","Neutral","AllVariants","Closable"];export{i as AllVariants,c as Closable,n as Danger,a as Info,o as Neutral,s as Success,t as Warning,J as __namedExportsOrder,H as default};
