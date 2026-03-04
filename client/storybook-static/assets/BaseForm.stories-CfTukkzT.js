import{j as e}from"./jsx-runtime-DiklIkkE.js";import{B as t}from"./BaseForm-BbERTDLa.js";import"./index-DRjF_FHU.js";import"./BaseButton-5x2xryyG.js";const s=[{name:"id",label:"ID",type:"number",visible:!0,sortable:!0,filterable:!1,editable:!1,required:!1},{name:"name",label:"Full Name",type:"text",visible:!0,sortable:!0,filterable:!0,editable:!0,required:!0},{name:"email",label:"Email",type:"email",visible:!0,sortable:!0,filterable:!0,editable:!0,required:!0,validation:{pattern:"^[^@]+@[^@]+\\.[^@]+$",message:"Invalid email"}},{name:"role",label:"Role",type:"select",visible:!0,sortable:!1,filterable:!0,editable:!0,required:!0,options:[{label:"Admin",value:"admin"},{label:"User",value:"user"},{label:"Editor",value:"editor"}]},{name:"bio",label:"Bio",type:"textarea",visible:!0,sortable:!1,filterable:!1,editable:!0,required:!1},{name:"active",label:"Active",type:"boolean",visible:!0,sortable:!1,filterable:!0,editable:!0,required:!1}],N={title:"Base/Data/BaseForm",component:t,tags:["autodocs"]},a={render:()=>e.jsx("div",{className:"max-w-lg",children:e.jsx(t,{columns:s,mode:"create",onSubmit:o=>alert(JSON.stringify(o,null,2)),onCancel:()=>alert("Cancelled")})})},r={render:()=>e.jsx("div",{className:"max-w-lg",children:e.jsx(t,{columns:s,mode:"edit",defaultValues:{id:1,name:"John Doe",email:"john@example.com",role:"admin",bio:"Lorem ipsum dolor sit amet.",active:!0},onSubmit:o=>alert(JSON.stringify(o,null,2)),onCancel:()=>alert("Cancelled")})})},l={render:()=>e.jsx("div",{className:"max-w-lg",children:e.jsx(t,{columns:s,mode:"create",loading:!0,onSubmit:()=>{}})})};var i,m,n;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <div className="max-w-lg">\r
      <BaseForm columns={columns} mode="create" onSubmit={data => alert(JSON.stringify(data, null, 2))} onCancel={() => alert('Cancelled')} />\r
    </div>
}`,...(n=(m=a.parameters)==null?void 0:m.docs)==null?void 0:n.source}}};var d,u,c;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <div className="max-w-lg">\r
      <BaseForm columns={columns} mode="edit" defaultValues={{
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      bio: 'Lorem ipsum dolor sit amet.',
      active: true
    }} onSubmit={data => alert(JSON.stringify(data, null, 2))} onCancel={() => alert('Cancelled')} />\r
    </div>
}`,...(c=(u=r.parameters)==null?void 0:u.docs)==null?void 0:c.source}}};var b,p,f;l.parameters={...l.parameters,docs:{...(b=l.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="max-w-lg">\r
      <BaseForm columns={columns} mode="create" loading onSubmit={() => {}} />\r
    </div>
}`,...(f=(p=l.parameters)==null?void 0:p.docs)==null?void 0:f.source}}};const j=["CreateMode","EditMode","Loading"];export{a as CreateMode,r as EditMode,l as Loading,j as __namedExportsOrder,N as default};
