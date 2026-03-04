// ============================================================
// Relation Mapping - Relation type → UI component strategy
// ManyToOne → Select, OneToMany → Inline Table, ManyToMany → MultiSelect
// ============================================================

import type { RelationFieldSchema, RelationType, FieldSchema } from './schema.types';

// ─── Relation UI Mapping ─────────────────────────────────────

/** UI rendering strategy for relation types */
export type RelationUIType = 'select' | 'multiselect' | 'inline-table' | 'readonly';

/** Map relation type → appropriate UI component */
export function getRelationUIType(relationType: RelationType): RelationUIType {
  switch (relationType) {
    case 'ManyToOne':
    case 'OneToOne':
      return 'select';
    case 'ManyToMany':
      return 'multiselect';
    case 'OneToMany':
      return 'inline-table';
    default:
      return 'readonly';
  }
}

// ─── Relation Config Builder ─────────────────────────────────

/** Build API endpoint for loading relation options */
export function buildRelationOptionsEndpoint(
  connectionId: string,
  relation: RelationFieldSchema,
): string {
  const limit = relation.preloadLimit || 100;
  const searchField = relation.searchField || relation.displayField;
  return `/crud/${connectionId}/${relation.target}?limit=${limit}&fields=${relation.displayField},id&sort=${searchField}:asc`;
}

/** Build search endpoint for relation async search */
export function buildRelationSearchEndpoint(
  connectionId: string,
  relation: RelationFieldSchema,
  searchTerm: string,
): string {
  const searchField = relation.searchField || relation.displayField;
  return `/crud/${connectionId}/${relation.target}?search=${encodeURIComponent(searchTerm)}&limit=20&fields=${relation.displayField},id&sort=${searchField}:asc`;
}

// ─── Relation Field Utilities ────────────────────────────────

/** Check if field is a relation field */
export function isRelationField(field: FieldSchema): boolean {
  return field.type === 'relation' && Boolean(field.relation);
}

/** Get all relation fields from entity schema fields */
export function getRelationFields(fields: FieldSchema[]): FieldSchema[] {
  return fields.filter(isRelationField);
}

/** Get ManyToOne / OneToOne relation fields (rendered as dropdowns in form) */
export function getSelectRelationFields(fields: FieldSchema[]): FieldSchema[] {
  return fields.filter(
    (f) =>
      isRelationField(f) && (f.relation!.type === 'ManyToOne' || f.relation!.type === 'OneToOne'),
  );
}

/** Get OneToMany relation fields (rendered as inline tables) */
export function getInlineTableRelationFields(fields: FieldSchema[]): FieldSchema[] {
  return fields.filter((f) => isRelationField(f) && f.relation!.type === 'OneToMany');
}

/** Get ManyToMany relation fields (rendered as multi-selects) */
export function getMultiSelectRelationFields(fields: FieldSchema[]): FieldSchema[] {
  return fields.filter((f) => isRelationField(f) && f.relation!.type === 'ManyToMany');
}

// ─── Display Value Resolution ────────────────────────────────

/** Resolve display value from relation data */
export function resolveRelationDisplayValue(row: Record<string, any>, field: FieldSchema): string {
  if (!field.relation) return String(row[field.name] ?? '');

  // If the row has a nested object for this relation
  const nested = row[field.relation.target] || row[field.name.replace(/_id$/, '')];
  if (nested && typeof nested === 'object') {
    return String(nested[field.relation.displayField] ?? nested.name ?? nested.id ?? '');
  }

  // Fallback: just show the FK value
  return String(row[field.name] ?? '—');
}

/** Convert relation options API response → SelectOption[] */
export function mapRelationDataToOptions(
  data: any[],
  relation: RelationFieldSchema,
): Array<{ label: string; value: string | number }> {
  return data.map((item) => ({
    label: String(item[relation.displayField] || item.name || item.id),
    value: item.id,
  }));
}
