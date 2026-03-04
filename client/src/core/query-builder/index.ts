// ============================================================
// Core Query Builder - Barrel Export
// Phase 3 – Query Builder
// ============================================================

// Types
export type {
  FilterOperator,
  FilterNode,
  FilterGroupNode,
  FilterConditionNode,
  QueryField,
  OperatorDef,
  QueryBuilderProps,
  ConditionGroupProps,
  ConditionRowProps,
} from './query-builder.types';

// Operator config
export {
  getOperatorsForType,
  getDefaultOperator,
  operatorRequiresValue,
  getOperatorDef,
} from './operator.config';

// Utils
export {
  createEmptyGroup,
  createEmptyCondition,
  resolveQueryFields,
  fieldsToQueryFields,
  astToFlatFilter,
  flatFilterToAST,
  validateAST,
  astToSQLPreview,
  countConditions,
  getMaxDepth,
} from './query-builder.utils';
export type { ValidationResult } from './query-builder.utils';
