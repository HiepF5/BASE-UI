// ============================================================
// Metadata Engine - Barrel Exports
// Core của Phase 2: cho phép render UI từ metadata
// ============================================================

// Types
export type {
  FieldType,
  RelationType,
  ValidationSchema,
  FieldOption,
  RelationFieldSchema,
  FieldSchema,
  EntitySchema,
  SchemaRegistry,
  ColumnConfig,
} from './schema.types';

// Field mapping
export {
  mapDbTypeToFieldType,
  inferFieldTypeByName,
  tableSchemaToEntitySchema,
  fieldToColumnConfig,
  entitySchemaToColumnConfigs,
  getCreateFields,
  getEditFields,
  columnNameToLabel,
} from './field-mapping';

// Relation mapping
export {
  type RelationUIType,
  getRelationUIType,
  buildRelationOptionsEndpoint,
  buildRelationSearchEndpoint,
  isRelationField,
  getRelationFields,
  getSelectRelationFields,
  getInlineTableRelationFields,
  getMultiSelectRelationFields,
  resolveRelationDisplayValue,
  mapRelationDataToOptions,
} from './relation-mapping';

// Validation builder
export { buildFieldValidator, buildFormSchema, buildDefaultValues } from './validation-builder';
