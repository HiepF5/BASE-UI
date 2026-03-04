import{j as r}from"./jsx-runtime-DiklIkkE.js";import{r as a}from"./index-DRjF_FHU.js";import{B as s}from"./BasePagination-BAxhRFoa.js";import"./BaseButton-5x2xryyG.js";const F={title:"Base/Data/BasePagination",component:s,tags:["autodocs"],argTypes:{page:{control:"number"},limit:{control:"number"},total:{control:"number"},compact:{control:"boolean"},showSizeChanger:{control:"boolean"},showTotal:{control:"boolean"}}},i={render:()=>{const[e,t]=a.useState(1),[n,o]=a.useState(10);return r.jsx(s,{page:e,limit:n,total:120,onPageChange:t,onLimitChange:o})}},g={render:()=>{const[e,t]=a.useState(1);return r.jsx(s,{page:e,limit:10,total:30,onPageChange:t,showSizeChanger:!1})}},m={render:()=>{const[e,t]=a.useState(1),[n,o]=a.useState(10);return r.jsx(s,{page:e,limit:n,total:5e3,onPageChange:t,onLimitChange:o})}},c={render:()=>{const[e,t]=a.useState(1);return r.jsx(s,{page:e,limit:10,total:80,compact:!0,onPageChange:t,showSizeChanger:!1})}},p={render:()=>{const[e,t]=a.useState(1),[n,o]=a.useState(25);return r.jsx(s,{page:e,limit:n,total:200,pageSizeOptions:[25,50,100,200],onPageChange:t,onLimitChange:o})}};var u,l,P;i.parameters={...i.parameters,docs:{...(u=i.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    return <BasePagination page={page} limit={limit} total={120} onPageChange={setPage} onLimitChange={setLimit} />;
  }
}`,...(P=(l=i.parameters)==null?void 0:l.docs)==null?void 0:P.source}}};var S,d,h;g.parameters={...g.parameters,docs:{...(S=g.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    return <BasePagination page={page} limit={10} total={30} onPageChange={setPage} showSizeChanger={false} />;
  }
}`,...(h=(d=g.parameters)==null?void 0:d.docs)==null?void 0:h.source}}};var C,L,f;m.parameters={...m.parameters,docs:{...(C=m.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    return <BasePagination page={page} limit={limit} total={5000} onPageChange={setPage} onLimitChange={setLimit} />;
  }
}`,...(f=(L=m.parameters)==null?void 0:L.docs)==null?void 0:f.source}}};var x,z,B;c.parameters={...c.parameters,docs:{...(x=c.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    return <BasePagination page={page} limit={10} total={80} compact onPageChange={setPage} showSizeChanger={false} />;
  }
}`,...(B=(z=c.parameters)==null?void 0:z.docs)==null?void 0:B.source}}};var w,j,b;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    return <BasePagination page={page} limit={limit} total={200} pageSizeOptions={[25, 50, 100, 200]} onPageChange={setPage} onLimitChange={setLimit} />;
  }
}`,...(b=(j=p.parameters)==null?void 0:j.docs)==null?void 0:b.source}}};const M=["Default","FewPages","ManyPages","Compact","CustomPageSizes"];export{c as Compact,p as CustomPageSizes,i as Default,g as FewPages,m as ManyPages,M as __namedExportsOrder,F as default};
