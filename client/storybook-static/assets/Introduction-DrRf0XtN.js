import{j as e}from"./jsx-runtime-DiklIkkE.js";import{useMDXComponents as o}from"./index-ChEI-nsM.js";import{M as t}from"./index-D8yrghy9.js";import"./index-DRjF_FHU.js";import"./iframe-DBnbtWq4.js";import"./index-BKlBQwGM.js";import"./index-D-Mha1DF.js";import"./index-DrFu-skq.js";function s(r){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",p:"p",pre:"pre",strong:"strong",...o(),...r.components};return e.jsxs(e.Fragment,{children:[e.jsx(t,{title:"Documentation/Getting Started"}),`
`,e.jsx(n.h1,{id:"base-ui--component-library",children:"Base UI – Component Library"}),`
`,e.jsxs(n.p,{children:["A production-grade React component library built with ",e.jsx(n.strong,{children:"TypeScript"}),", ",e.jsx(n.strong,{children:"Tailwind CSS"}),", ",e.jsx(n.strong,{children:"CVA"})," (class-variance-authority), and ",e.jsx(n.strong,{children:"CSS custom properties"})," for theming."]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"architecture-principles",children:"Architecture Principles"}),`
`,e.jsxs(n.p,{children:[`| Principle | Description |\r
|-----------|-------------|\r
| `,e.jsx(n.strong,{children:"Pure Presentational"}),` | Components contain zero business logic — they only render UI from props |\r
| `,e.jsx(n.strong,{children:"CVA-driven Variants"})," | All visual variations (size, variant, color) defined via ",e.jsx(n.code,{children:"cva()"}),` |\r
| `,e.jsx(n.strong,{children:"Themed via CSS Variables"})," | Colors reference design tokens (",e.jsx(n.code,{children:"--color-primary"}),", ",e.jsx(n.code,{children:"--color-bg"}),`, etc.) |\r
| `,e.jsx(n.strong,{children:"Headless Patterns"}),` | Complex components (Table, Dropdown, Popover) expose render-props for full control |\r
| `,e.jsx(n.strong,{children:"Accessible by Default"})," | ARIA attributes, keyboard navigation, focus traps built in |"]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"design-tokens",children:"Design Tokens"}),`
`,e.jsxs(n.p,{children:["The system uses CSS custom properties defined in ",e.jsx(n.code,{children:":root"})," (see ",e.jsx(n.code,{children:"index.css"}),"):"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-css",children:`:root {\r
  --color-primary: ...;\r
  --color-bg: ...;\r
  --color-bg-secondary: ...;\r
  --color-text: ...;\r
  --color-text-secondary: ...;\r
  --color-border: ...;\r
  /* ... etc */\r
}
`})}),`
`,e.jsxs(n.p,{children:["Tailwind classes map to these tokens: ",e.jsx(n.code,{children:"bg-bg"}),", ",e.jsx(n.code,{children:"text-text-secondary"}),", ",e.jsx(n.code,{children:"border-border"}),", ",e.jsx(n.code,{children:"bg-primary-500"}),", etc."]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"component-categories",children:"Component Categories"}),`
`,e.jsx(n.h3,{id:"form-controls",children:"Form Controls"}),`
`,e.jsxs(n.p,{children:[`| Component | Description |\r
|-----------|-------------|\r
| `,e.jsx(n.code,{children:"BaseInput"}),` | Text input with label, hint, icons, error/success variants, 3 sizes |\r
| `,e.jsx(n.code,{children:"BaseSelect"}),` | Native select dropdown with same variant/size system |\r
| `,e.jsx(n.code,{children:"BaseMultiSelect"}),` | Tag-based multi-select with search, removable chips |\r
| `,e.jsx(n.code,{children:"BaseCheckbox"}),` | Checkbox with label, description, indeterminate, 3 sizes |\r
| `,e.jsx(n.code,{children:"BaseRadioGroup"}),` | Radio button group, horizontal/vertical, with descriptions |\r
| `,e.jsx(n.code,{children:"BaseDatePicker"}),` | Date / datetime / time picker, native HTML5 |\r
| `,e.jsx(n.code,{children:"BaseSwitch"}),` | Toggle switch with label & description |\r
| `,e.jsx(n.code,{children:"BaseForm"})," | Dynamic form generator from ",e.jsx(n.code,{children:"ColumnConfig[]"})," (React Hook Form) |"]}),`
`,e.jsx(n.h3,{id:"layout",children:"Layout"}),`
`,e.jsxs(n.p,{children:[`| Component | Description |\r
|-----------|-------------|\r
| `,e.jsx(n.code,{children:"Stack"}),` | Vertical flex container with configurable gap & alignment |\r
| `,e.jsx(n.code,{children:"Flex"}),` | Horizontal flex row with gap, wrap, direction |\r
| `,e.jsx(n.code,{children:"Grid"}),` | CSS Grid with responsive column counts |\r
| `,e.jsx(n.code,{children:"Container"})," | Max-width centered wrapper (sm / md / lg / xl / full) |"]}),`
`,e.jsx(n.h3,{id:"feedback",children:"Feedback"}),`
`,e.jsxs(n.p,{children:[`| Component | Description |\r
|-----------|-------------|\r
| `,e.jsx(n.code,{children:"BaseSpinner"}),` | Loading spinner with size & color variants |\r
| `,e.jsx(n.code,{children:"BaseAlert"}),` | Inline alert banner (info / success / warning / danger / neutral) |\r
| `,e.jsx(n.code,{children:"BaseToast"})," / ",e.jsx(n.code,{children:"ToastProvider"}),` | Toast notification system with context API |\r
| `,e.jsx(n.code,{children:"BaseButton"})," | Button with variants, sizes, loading state, icons |"]}),`
`,e.jsx(n.h3,{id:"data-display",children:"Data Display"}),`
`,e.jsxs(n.p,{children:[`| Component | Description |\r
|-----------|-------------|\r
| `,e.jsx(n.code,{children:"BaseTable"}),` | Data table with sort, selection, pagination, custom cell renderers, striped/compact modes |\r
| `,e.jsx(n.code,{children:"BasePagination"}),` | Standalone pagination with page numbers, size changer, total info |\r
| `,e.jsx(n.code,{children:"BaseFilterBar"})," | Search bar + advanced filter builder from column config |"]}),`
`,e.jsx(n.h3,{id:"overlays",children:"Overlays"}),`
`,e.jsxs(n.p,{children:[`| Component | Description |\r
|-----------|-------------|\r
| `,e.jsx(n.code,{children:"BaseModal"}),` | Centered modal dialog with backdrop, ESC close, focus trap, footer slot |\r
| `,e.jsx(n.code,{children:"BaseDrawer"}),` | Slide-in panel (left/right/top/bottom) with CVA placement × size variants |\r
| `,e.jsx(n.code,{children:"BasePopover"}),` | Floating anchored content, 8 placements, click-outside/ESC close |\r
| `,e.jsx(n.code,{children:"BaseDropdown"})," | Action menu with keyboard navigation, icons, dividers, danger items |"]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"usage-pattern",children:"Usage Pattern"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { BaseButton, BaseInput, BaseModal } from '@/components/base';\r
\r
function MyForm() {\r
  const [open, setOpen] = useState(false);\r
  return (\r
    <>\r
      <BaseInput label="Name" size="md" variant="default" />\r
      <BaseButton variant="primary" size="md" onClick={() => setOpen(true)}>\r
        Submit\r
      </BaseButton>\r
      <BaseModal open={open} onClose={() => setOpen(false)} title="Confirm">\r
        <p>Are you sure?</p>\r
      </BaseModal>\r
    </>\r
  );\r
}
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsxs(n.h2,{id:"utility-cn",children:["Utility: ",e.jsx(n.code,{children:"cn()"})]}),`
`,e.jsxs(n.p,{children:["All components use the ",e.jsx(n.code,{children:"cn()"})," helper (clsx + tailwind-merge) for conditional class merging:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { cn } from '@/core/utils';\r
\r
cn('px-4 py-2', isActive && 'bg-primary-500', className);
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"folder-structure",children:"Folder Structure"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`src/components/base/\r
├── __stories__/        # Storybook stories (one per component)\r
├── BaseButton.tsx\r
├── BaseInput.tsx\r
├── BaseSelect.tsx\r
├── BaseMultiSelect.tsx\r
├── BaseCheckbox.tsx\r
├── BaseRadio.tsx        # BaseRadioGroup\r
├── BaseDatePicker.tsx\r
├── BaseSwitch.tsx\r
├── BaseForm.tsx\r
├── BaseTable.tsx\r
├── BasePagination.tsx\r
├── BaseFilterBar.tsx\r
├── BaseModal.tsx\r
├── BaseDrawer.tsx\r
├── BasePopover.tsx\r
├── BaseDropdown.tsx\r
├── BaseSpinner.tsx\r
├── BaseAlert.tsx\r
├── BaseToast.tsx\r
├── Stack.tsx\r
├── Flex.tsx\r
├── Grid.tsx\r
├── Container.tsx\r
└── index.ts             # Barrel exports
`})})]})}function m(r={}){const{wrapper:n}={...o(),...r.components};return n?e.jsx(n,{...r,children:e.jsx(s,{...r})}):s(r)}export{m as default};
