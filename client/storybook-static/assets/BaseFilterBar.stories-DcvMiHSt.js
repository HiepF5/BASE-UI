import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as a}from"./index-DRjF_FHU.js";import{B as o}from"./BaseFilterBar-CHAzVOfN.js";import"./BaseButton-5x2xryyG.js";const d=[{name:"name",label:"Name",type:"text",visible:!0,sortable:!0,filterable:!0,editable:!0,required:!0},{name:"email",label:"Email",type:"email",visible:!0,sortable:!0,filterable:!0,editable:!0,required:!0},{name:"role",label:"Role",type:"select",visible:!0,sortable:!1,filterable:!0,editable:!0,required:!0,options:[{label:"Admin",value:"admin"},{label:"User",value:"user"},{label:"Editor",value:"editor"}]},{name:"age",label:"Age",type:"number",visible:!0,sortable:!0,filterable:!0,editable:!0,required:!1}],f={title:"Base/Data/BaseFilterBar",component:o,tags:["autodocs"]},r={render:()=>{const[t,u]=a.useState(""),[s,c]=a.useState(null);return e.jsxs("div",{className:"space-y-4",children:[e.jsx(o,{columns:d,onFilter:c,onSearch:u,searchValue:t}),e.jsxs("div",{className:"p-3 bg-bg-secondary rounded-lg text-sm",children:[e.jsxs("p",{children:[e.jsx("strong",{children:"Search:"})," ",t||"(none)"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Filter:"})," ",s?JSON.stringify(s,null,2):"(none)"]})]})]})}};var l,i,n;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterGroup | null>(null);
    return <div className="space-y-4">\r
        <BaseFilterBar columns={columns} onFilter={setFilter} onSearch={setSearch} searchValue={search} />\r
        <div className="p-3 bg-bg-secondary rounded-lg text-sm">\r
          <p><strong>Search:</strong> {search || '(none)'}</p>\r
          <p><strong>Filter:</strong> {filter ? JSON.stringify(filter, null, 2) : '(none)'}</p>\r
        </div>\r
      </div>;
  }
}`,...(n=(i=r.parameters)==null?void 0:i.docs)==null?void 0:n.source}}};const g=["Default"];export{r as Default,g as __namedExportsOrder,f as default};
