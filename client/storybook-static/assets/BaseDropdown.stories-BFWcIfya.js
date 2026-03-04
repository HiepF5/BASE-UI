import{j as t}from"./jsx-runtime-DiklIkkE.js";import{B as r}from"./BaseDropdown-DojHRYX0.js";import{B as i}from"./BaseButton-5x2xryyG.js";import"./index-DRjF_FHU.js";const C={title:"Base/Overlay/BaseDropdown",component:r,tags:["autodocs"],argTypes:{placement:{control:"select",options:["bottom-start","bottom-end","top-start","top-end"]},closeOnSelect:{control:"boolean"}}},S=[{key:"edit",label:"Edit"},{key:"duplicate",label:"Duplicate"},{key:"archive",label:"Archive"},{key:"divider-1",type:"divider"},{key:"delete",label:"Delete",danger:!0}],s={render:()=>t.jsx(r,{trigger:({toggle:e})=>t.jsx(i,{variant:"outline",onClick:e,children:"Actions ▾"}),items:S,onSelect:e=>alert(`Selected: ${e}`)})},j=[{key:"edit",label:"Edit",icon:t.jsx("span",{children:"✏️"})},{key:"copy",label:"Copy",icon:t.jsx("span",{children:"📋"})},{key:"share",label:"Share",icon:t.jsx("span",{children:"🔗"})},{key:"divider-1",type:"divider"},{key:"export",label:"Export",icon:t.jsx("span",{children:"📤"})},{key:"delete",label:"Delete",icon:t.jsx("span",{children:"🗑️"}),danger:!0}],o={render:()=>t.jsx(r,{trigger:({toggle:e})=>t.jsx(i,{onClick:e,children:"Menu ▾"}),items:j,onSelect:e=>alert(`Selected: ${e}`)})},v=[{key:"view",label:"View"},{key:"edit",label:"Edit",disabled:!0},{key:"delete",label:"Delete",disabled:!0,danger:!0}],a={render:()=>t.jsx(r,{trigger:({toggle:e})=>t.jsx(i,{variant:"outline",onClick:e,children:"Limited Actions ▾"}),items:v,onSelect:e=>alert(`Selected: ${e}`)})},n={render:()=>t.jsx("div",{className:"flex gap-4 items-center justify-center py-32",children:["bottom-start","bottom-end","top-start","top-end"].map(e=>t.jsx(r,{trigger:({toggle:l})=>t.jsx(i,{variant:"outline",size:"sm",onClick:l,children:e}),items:S,placement:e,onSelect:l=>alert(`${e}: ${l}`)},e))})};var c,d,m;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <BaseDropdown trigger={({
    toggle
  }) => <BaseButton variant="outline" onClick={toggle}>Actions ▾</BaseButton>} items={basicItems} onSelect={key => alert(\`Selected: \${key}\`)} />
}`,...(m=(d=s.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var p,g,u;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <BaseDropdown trigger={({
    toggle
  }) => <BaseButton onClick={toggle}>Menu ▾</BaseButton>} items={itemsWithIcons} onSelect={key => alert(\`Selected: \${key}\`)} />
}`,...(u=(g=o.parameters)==null?void 0:g.docs)==null?void 0:u.source}}};var y,k,b;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <BaseDropdown trigger={({
    toggle
  }) => <BaseButton variant="outline" onClick={toggle}>Limited Actions ▾</BaseButton>} items={disabledItems} onSelect={key => alert(\`Selected: \${key}\`)} />
}`,...(b=(k=a.parameters)==null?void 0:k.docs)==null?void 0:b.source}}};var B,x,h;n.parameters={...n.parameters,docs:{...(B=n.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <div className="flex gap-4 items-center justify-center py-32">\r
      {(['bottom-start', 'bottom-end', 'top-start', 'top-end'] as const).map(pl => <BaseDropdown key={pl} trigger={({
      toggle
    }) => <BaseButton variant="outline" size="sm" onClick={toggle}>{pl}</BaseButton>} items={basicItems} placement={pl} onSelect={key => alert(\`\${pl}: \${key}\`)} />)}\r
    </div>
}`,...(h=(x=n.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};const w=["Default","WithIcons","WithDisabledItems","Placements"];export{s as Default,n as Placements,a as WithDisabledItems,o as WithIcons,w as __namedExportsOrder,C as default};
