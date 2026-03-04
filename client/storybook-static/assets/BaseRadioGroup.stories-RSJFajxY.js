import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as R}from"./index-DRjF_FHU.js";import"./BaseButton-5x2xryyG.js";import{e as o}from"./BaseToast-mdXcoZct.js";import"./BaseForm-BbERTDLa.js";import"./BaseModal-AdovnsC0.js";import"./BaseFilterBar-CHAzVOfN.js";import"./BasePagination-BAxhRFoa.js";import"./BaseDrawer-V7Z3Sqav.js";import"./BasePopover-BHodcGh2.js";import"./BaseDropdown-DojHRYX0.js";const r=[{label:"Option A",value:"a",description:"First option with description"},{label:"Option B",value:"b",description:"Second option"},{label:"Option C",value:"c"},{label:"Disabled",value:"d",disabled:!0}],H={title:"Base/Form/BaseRadioGroup",component:o,tags:["autodocs"],argTypes:{direction:{control:"select",options:["horizontal","vertical"]},size:{control:"select",options:["sm","md","lg"]},disabled:{control:"boolean"}}},s={render:()=>{const[n,l]=R.useState("a");return e.jsx(o,{name:"demo-v",label:"Choose option",options:r,value:n,onChange:l,direction:"vertical"})}},a={render:()=>{const[n,l]=R.useState("a");return e.jsx(o,{name:"demo-h",label:"Choose option",options:r,value:n,onChange:l,direction:"horizontal"})}},t={render:()=>e.jsx(o,{name:"demo-err",label:"Required",options:r,error:"Please select an option"})},i={render:()=>e.jsxs("div",{className:"space-y-6",children:[e.jsx(o,{name:"s-sm",label:"Small",options:r.slice(0,3),size:"sm"}),e.jsx(o,{name:"s-md",label:"Medium",options:r.slice(0,3),size:"md"}),e.jsx(o,{name:"s-lg",label:"Large",options:r.slice(0,3),size:"lg"})]})};var p,c,m;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => {
    const [val, setVal] = useState<string | number>('a');
    return <BaseRadioGroup name="demo-v" label="Choose option" options={options} value={val} onChange={setVal} direction="vertical" />;
  }
}`,...(m=(c=s.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var d,u,b;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => {
    const [val, setVal] = useState<string | number>('a');
    return <BaseRadioGroup name="demo-h" label="Choose option" options={options} value={val} onChange={setVal} direction="horizontal" />;
  }
}`,...(b=(u=a.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};var v,g,h;t.parameters={...t.parameters,docs:{...(v=t.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <BaseRadioGroup name="demo-err" label="Required" options={options} error="Please select an option" />
}`,...(h=(g=t.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var z,S,x;i.parameters={...i.parameters,docs:{...(z=i.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <div className="space-y-6">\r
      <BaseRadioGroup name="s-sm" label="Small" options={options.slice(0, 3)} size="sm" />\r
      <BaseRadioGroup name="s-md" label="Medium" options={options.slice(0, 3)} size="md" />\r
      <BaseRadioGroup name="s-lg" label="Large" options={options.slice(0, 3)} size="lg" />\r
    </div>
}`,...(x=(S=i.parameters)==null?void 0:S.docs)==null?void 0:x.source}}};const L=["Vertical","Horizontal","WithError","Sizes"];export{a as Horizontal,i as Sizes,s as Vertical,t as WithError,L as __namedExportsOrder,H as default};
