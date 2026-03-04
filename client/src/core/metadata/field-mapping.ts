// ============================================================
// Field Mapping - DB type → UI FieldType + ColumnConfig adapter
// Cốt lõi của Metadata Engine: map database schema thành UI metadata
// ============================================================

import type { FieldSchema, FieldType, ColumnConfig, EntitySchema } from './schema.types';
import type { TableSchema } from '../../types';

// ─── DB Type → UI FieldType mapping ─────────────────────────

/** Map database column type string → FieldType */
export function mapDbTypeToFieldType(dbType: string): FieldType {
  const t = dbType.toLowerCase().trim();

  // Integer types
  if (/^(int|integer|smallint|bigint|tinyint|serial|bigserial)/.test(t)) return 'number';
  // Float types
  if (/^(float|double|real|decimal|numeric|money)/.test(t)) return 'number';

  // Boolean
  if (/^(bool|boolean|bit)/.test(t)) return 'boolean';

  // Date/time
  if (/^(timestamp|datetime)/.test(t)) return 'datetime';
  if (/^(date)/.test(t)) return 'date';
  if (/^(time)/.test(t)) return 'text';

  // Text variants
  if (/^(text|mediumtext|longtext|clob)/.test(t)) return 'textarea';
  if (/^(json|jsonb)/.test(t)) return 'json';

  // String / varchar
  if (/^(varchar|char|character|nvarchar|nchar|string)/.test(t)) {
    // Heuristic: detect email/url/phone by column name via caller
    return 'text';
  }

  // UUID
  if (/^(uuid|guid)/.test(t)) return 'text';

  // Enum
  if (/^(enum|user-defined)/.test(t)) return 'select';

  return 'text';
}

/** Heuristic: detect special text types by column name */
export function inferFieldTypeByName(columnName: string, baseType: FieldType): FieldType {
  if (baseType !== 'text') return baseType;

  const name = columnName.toLowerCase();
  if (name === 'email' || name.endsWith('_email') || name.startsWith('email_')) return 'email';
  if (name === 'password' || name.endsWith('_password') || name === 'password_hash')
    return 'password';
  if (name === 'url' || name === 'website' || name.endsWith('_url') || name.startsWith('url_'))
    return 'url';
  if (name === 'phone' || name === 'tel' || name.endsWith('_phone') || name.endsWith('_tel'))
    return 'phone';
  if (
    name === 'description' ||
    name === 'content' ||
    name === 'body' ||
    name === 'bio' ||
    name === 'notes'
  )
    return 'textarea';

  return baseType;
}

// ─── TableSchema → EntitySchema conversion ───────────────────

/** Convert backend TableSchema → EntitySchema (auto-generated metadata) */
export function tableSchemaToEntitySchema(tableSchema: TableSchema): EntitySchema {
  const fields: FieldSchema[] = tableSchema.columns.map((col) => {
    const baseType = mapDbTypeToFieldType(col.type);
    const fieldType = inferFieldTypeByName(col.name, baseType);

    return {
      name: col.name,
      label: columnNameToLabel(col.name),
      type: fieldType,
      isPrimary: col.isPrimary,
      sortable: true,
      filterable: !col.isPrimary,
      editable: !col.isPrimary && col.name !== 'created_at' && col.name !== 'updated_at',
      visibleInTable: true,
      visibleInCreate: !col.isPrimary && col.name !== 'created_at' && col.name !== 'updated_at',
      visibleInEdit: !col.isPrimary && col.name !== 'created_at' && col.name !== 'updated_at',
      visibleInDetail: true,
      validation: {
        required: !col.nullable && !col.isPrimary && !col.defaultValue,
        maxLength: col.maxLength || undefined,
      },
    };
  });

  // Enrich with relation info
  if (tableSchema.relations) {
    for (const rel of tableSchema.relations) {
      // Find FK column field and convert to relation
      const fkField = fields.find(
        (f) => f.name === rel.sourceColumn || f.name === `${rel.targetTable}_id`,
      );
      if (fkField) {
        fkField.type = 'relation';
        fkField.relation = {
          type:
            rel.type === 'MANY_TO_ONE'
              ? 'ManyToOne'
              : rel.type === 'ONE_TO_MANY'
                ? 'OneToMany'
                : rel.type === 'MANY_TO_MANY'
                  ? 'ManyToMany'
                  : 'ManyToOne',
          target: rel.targetTable,
          displayField: 'name', // Default – should be configurable
          foreignKey: rel.sourceColumn,
        };
        fkField.label = columnNameToLabel(rel.targetTable);
      }
    }
  }

  // Detect primary key
  const pk = tableSchema.primaryKey?.[0] || fields.find((f) => f.isPrimary)?.name || 'id';

  // Detect display field (first text field that isn't PK)
  const displayField =
    fields.find((f) => !f.isPrimary && (f.type === 'text' || f.type === 'email'))?.name || pk;

  return {
    name: tableSchema.tableName,
    label: columnNameToLabel(tableSchema.tableName),
    primaryKey: pk,
    displayField,
    fields,
    permissions: { read: true, create: true, update: true, delete: true, export: true },
    defaultSort: { field: pk, direction: 'desc' },
    defaultPageSize: 20,
    pageSizes: [10, 20, 50, 100],
  };
}

// ─── EntitySchema → ColumnConfig[] (backward compat for BaseTable/BaseForm) ──

/** Convert FieldSchema → ColumnConfig for existing base components */
export function fieldToColumnConfig(field: FieldSchema): ColumnConfig {
  // Map extended FieldType → old ColumnConfig type
  let colType: ColumnConfig['type'];
  switch (field.type) {
    case 'number':
      colType = 'number';
      break;
    case 'boolean':
      colType = 'boolean';
      break;
    case 'date':
    case 'datetime':
      colType = 'date';
      break;
    case 'select':
    case 'multiselect':
      colType = 'select';
      break;
    case 'textarea':
    case 'json':
      colType = 'textarea';
      break;
    case 'email':
      colType = 'email';
      break;
    case 'password':
      colType = 'password';
      break;
    case 'relation':
      colType = 'select';
      break; // Relation renders as select
    default:
      colType = 'text';
      break;
  }

  return {
    name: field.name,
    label: field.label,
    type: colType,
    visible: field.visibleInTable !== false,
    sortable: field.sortable !== false,
    filterable: field.filterable !== false,
    editable: field.editable !== false,
    required: field.validation?.required || false,
    width: field.width,
    options: field.options?.map((o) => ({ label: o.label, value: String(o.value) })),
    validation: field.validation
      ? {
          min: field.validation.min,
          max: field.validation.max,
          pattern: field.validation.pattern,
          message: field.validation.messages?.required,
        }
      : undefined,
  };
}

/** Convert EntitySchema → ColumnConfig[] */
export function entitySchemaToColumnConfigs(schema: EntitySchema): ColumnConfig[] {
  return schema.fields.filter((f) => f.visibleInTable !== false).map(fieldToColumnConfig);
}

/** Get form fields for create mode */
export function getCreateFields(schema: EntitySchema): FieldSchema[] {
  return schema.fields.filter((f) => f.visibleInCreate !== false && !f.isPrimary);
}

/** Get form fields for edit mode */
export function getEditFields(schema: EntitySchema): FieldSchema[] {
  return schema.fields.filter((f) => f.visibleInEdit !== false && !f.isPrimary);
}

// ─── Helpers ─────────────────────────────────────────────────

/** Convert column / table name → display label */
export function columnNameToLabel(name: string): string {
  return name
    .replace(/_id$/, '')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
