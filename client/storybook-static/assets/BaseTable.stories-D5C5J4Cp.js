import{j as t}from"./jsx-runtime-DiklIkkE.js";import{r as l}from"./index-DRjF_FHU.js";import"./BaseButton-5x2xryyG.js";import{i as n}from"./BaseToast-mdXcoZct.js";import"./BaseForm-BbERTDLa.js";import"./BaseModal-AdovnsC0.js";import"./BaseFilterBar-CHAzVOfN.js";import"./BasePagination-BAxhRFoa.js";import"./BaseDrawer-V7Z3Sqav.js";import"./BasePopover-BHodcGh2.js";import"./BaseDropdown-DojHRYX0.js";const o=[{name:"id",label:"ID",type:"number",visible:!0,sortable:!0,filterable:!1,editable:!1,required:!1,width:60},{name:"name",label:"Name",type:"text",visible:!0,sortable:!0,filterable:!0,editable:!0,required:!0},{name:"email",label:"Email",type:"email",visible:!0,sortable:!0,filterable:!0,editable:!0,required:!0},{name:"role",label:"Role",type:"select",visible:!0,sortable:!1,filterable:!0,editable:!0,required:!0,options:[{label:"Admin",value:"admin"},{label:"User",value:"user"}]},{name:"active",label:"Active",type:"boolean",visible:!0,sortable:!1,filterable:!0,editable:!0,required:!1},{name:"createdAt",label:"Created",type:"date",visible:!0,sortable:!0,filterable:!1,editable:!1,required:!1}],s=Array.from({length:25},(r,e)=>({id:e+1,name:`User ${e+1}`,email:`user${e+1}@example.com`,role:e%3===0?"admin":"user",active:e%4!==0,createdAt:new Date(2025,0,e+1).toISOString()})),ee={title:"Base/Data/BaseTable",component:n,tags:["autodocs"]},c={render:()=>{const[r,e]=l.useState(1),[a,i]=l.useState(10),U=s.slice((r-1)*a,r*a);return t.jsx(n,{columns:o,data:U,total:s.length,page:r,limit:a,onPageChange:e,onLimitChange:z=>{i(z),e(1)}})}},m={render:()=>{const[r,e]=l.useState(1),[a,i]=l.useState([{field:"name",direction:"asc"}]);return t.jsx(n,{columns:o,data:s.slice(0,10),total:s.length,page:r,limit:10,sort:a,onPageChange:e,onLimitChange:()=>{},onSort:i})}},d={render:()=>{const[r,e]=l.useState(1),[a,i]=l.useState([]);return t.jsxs("div",{children:[t.jsxs("p",{className:"text-sm text-text-muted mb-2",children:["Selected: ",a.length," rows"]}),t.jsx(n,{columns:o,data:s.slice(0,10),total:s.length,page:r,limit:10,selectedRows:a,onPageChange:e,onLimitChange:()=>{},onRowSelect:i})]})}},g={render:()=>{const[r,e]=l.useState(1);return t.jsx(n,{columns:o,data:s.slice(0,5),total:s.length,page:r,limit:5,onPageChange:e,onLimitChange:()=>{},onEdit:a=>alert(`Edit: ${a.name}`),onDelete:a=>alert(`Delete: ${a.name}`)})}},u={render:()=>t.jsx(n,{columns:o,data:s.slice(0,10),total:10,page:1,limit:10,striped:!0,onPageChange:()=>{},onLimitChange:()=>{}})},p={render:()=>t.jsx(n,{columns:o,data:s.slice(0,10),total:10,page:1,limit:10,compact:!0,onPageChange:()=>{},onLimitChange:()=>{}})},h={render:()=>t.jsx(n,{columns:o,data:[],total:0,page:1,limit:10,onPageChange:()=>{},onLimitChange:()=>{},emptyContent:t.jsxs("div",{className:"py-4",children:[t.jsx("div",{className:"text-2xl mb-2",children:"📭"}),t.jsx("p",{className:"text-text-muted",children:"No records found"})]})})},b={render:()=>t.jsx(n,{columns:o,data:[],total:0,page:1,limit:10,loading:!0,onPageChange:()=>{},onLimitChange:()=>{}})};var S,C,x;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const paged = mockData.slice((page - 1) * limit, page * limit);
    return <BaseTable columns={columns} data={paged} total={mockData.length} page={page} limit={limit} onPageChange={setPage} onLimitChange={(l: number) => {
      setLimit(l);
      setPage(1);
    }} />;
  }
}`,...(x=(C=c.parameters)==null?void 0:C.docs)==null?void 0:x.source}}};var P,f,L;m.parameters={...m.parameters,docs:{...(P=m.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<SortOption[]>([{
      field: 'name',
      direction: 'asc'
    }]);
    return <BaseTable columns={columns} data={mockData.slice(0, 10)} total={mockData.length} page={page} limit={10} sort={sort} onPageChange={setPage} onLimitChange={() => {}} onSort={setSort} />;
  }
}`,...(L=(f=m.parameters)==null?void 0:f.docs)==null?void 0:L.source}}};var v,D,j;d.parameters={...d.parameters,docs:{...(v=d.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<string[]>([]);
    return <div>\r
        <p className="text-sm text-text-muted mb-2">Selected: {selected.length} rows</p>\r
        <BaseTable columns={columns} data={mockData.slice(0, 10)} total={mockData.length} page={page} limit={10} selectedRows={selected} onPageChange={setPage} onLimitChange={() => {}} onRowSelect={setSelected} />\r
      </div>;
  }
}`,...(j=(D=d.parameters)==null?void 0:D.docs)==null?void 0:j.source}}};var w,k,y;g.parameters={...g.parameters,docs:{...(w=g.parameters)==null?void 0:w.docs,source:{originalSource:"{\n  render: () => {\n    const [page, setPage] = useState(1);\n    return <BaseTable columns={columns} data={mockData.slice(0, 5)} total={mockData.length} page={page} limit={5} onPageChange={setPage} onLimitChange={() => {}} onEdit={(row: Record<string, unknown>) => alert(`Edit: ${row.name}`)} onDelete={(row: Record<string, unknown>) => alert(`Delete: ${row.name}`)} />;\n  }\n}",...(y=(k=g.parameters)==null?void 0:k.docs)==null?void 0:y.source}}};var B,N,E;u.parameters={...u.parameters,docs:{...(B=u.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <BaseTable columns={columns} data={mockData.slice(0, 10)} total={10} page={1} limit={10} striped onPageChange={() => {}} onLimitChange={() => {}} />
}`,...(E=(N=u.parameters)==null?void 0:N.docs)==null?void 0:E.source}}};var T,R,A;p.parameters={...p.parameters,docs:{...(T=p.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <BaseTable columns={columns} data={mockData.slice(0, 10)} total={10} page={1} limit={10} compact onPageChange={() => {}} onLimitChange={() => {}} />
}`,...(A=(R=p.parameters)==null?void 0:R.docs)==null?void 0:A.source}}};var q,W,$;h.parameters={...h.parameters,docs:{...(q=h.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => <BaseTable columns={columns} data={[]} total={0} page={1} limit={10} onPageChange={() => {}} onLimitChange={() => {}} emptyContent={<div className="py-4">\r
          <div className="text-2xl mb-2">📭</div>\r
          <p className="text-text-muted">No records found</p>\r
        </div>} />
}`,...($=(W=h.parameters)==null?void 0:W.docs)==null?void 0:$.source}}};var O,_,I;b.parameters={...b.parameters,docs:{...(O=b.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <BaseTable columns={columns} data={[]} total={0} page={1} limit={10} loading onPageChange={() => {}} onLimitChange={() => {}} />
}`,...(I=(_=b.parameters)==null?void 0:_.docs)==null?void 0:I.source}}};const te=["Default","WithSort","WithSelection","WithActions","Striped","Compact","Empty","Loading"];export{p as Compact,c as Default,h as Empty,b as Loading,u as Striped,g as WithActions,d as WithSelection,m as WithSort,te as __namedExportsOrder,ee as default};
