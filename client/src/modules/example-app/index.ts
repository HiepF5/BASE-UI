// ============================================================
// example-app module
// Phase 4 demonstration app - config-driven CRUD
// ============================================================

// ─── Pages ────────────────────────────────────────────────
export { ExampleAppPage } from './pages';

// ─── Components ───────────────────────────────────────────
export {
  EntitySelector,
  ConfigBanner,
  EntityHeader,
  SearchBar,
  ActiveFilterBanner,
  FilterPanel,
  SaveFilterDialog,
  DeleteConfirmDialog,
  FooterStats,
  ChecklistBanner,
} from './components';

// ─── Hooks ────────────────────────────────────────────────
export { useExampleApp } from './hooks/useExampleApp';

// ─── Config ───────────────────────────────────────────────
export { EXAMPLE_ENTITIES, SAVED_FILTERS_KEY } from './config/example-app.config';

// ─── Types ────────────────────────────────────────────────
export type {
  SavedFilter,
  ExampleEntity,
  ExampleAppState,
  EntitySelectorProps,
  FilterPanelProps,
  SaveFilterDialogProps,
  EntityHeaderProps,
  SearchBarProps,
  ActiveFilterBannerProps,
  ConfigBannerProps,
} from './types/example-app.types';
