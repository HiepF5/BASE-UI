export { PrivateRoute } from './auth/PrivateRoute';
export { QueryBuilder } from './query-builder';

// Base components
export {
  // Existing
  BaseButton,
  BaseTable,
  BaseForm,
  BaseModal,
  BaseFilterBar,
  // Form (Week 2)
  BaseInput,
  BaseSelect,
  BaseMultiSelect,
  BaseCheckbox,
  BaseRadioGroup,
  BaseDatePicker,
  BaseSwitch,
  // Layout (Week 2)
  Stack,
  Flex,
  Grid,
  Container,
  // Feedback (Week 2)
  BaseSpinner,
  PageLoader,
  BaseAlert,
  ToastProvider,
  useToast,
  // Data & Overlay (Week 3)
  BasePagination,
  BaseDrawer,
  BasePopover,
  BaseDropdown,
} from './base';

// Dynamic components (Week 4 – Metadata Engine)
export { FieldRenderer, DynamicForm, DynamicTable } from './dynamic';
export type { FieldRendererProps, DynamicFormProps, DynamicTableProps } from './dynamic';

// Relation components (Phase 3 – Relation + Nested CRUD)
export { RelationSelect, RelationMultiSelect, RelationInlineTable } from './relation';
export type {
  RelationSelectProps,
  RelationMultiSelectProps,
  RelationInlineTableProps,
} from './relation';
