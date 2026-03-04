// ============================================================
// Unit Tests – Field Mapping (Phase 5 – Quality)
// Tests: mapDbTypeToFieldType, inferFieldTypeByName,
//        entitySchemaToColumnConfigs, getCreateFields, getEditFields,
//        columnNameToLabel, fieldToColumnConfig
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  mapDbTypeToFieldType,
  inferFieldTypeByName,
  entitySchemaToColumnConfigs,
  getCreateFields,
  getEditFields,
  columnNameToLabel,
  fieldToColumnConfig,
  tableSchemaToEntitySchema,
} from '../field-mapping';
import type { EntitySchema, FieldSchema } from '../schema.types';
import type { TableSchema } from '../../../types';

// ─── Test Fixtures ───────────────────────────────────────────

const mockSchema: EntitySchema = {
  name: 'users',
  label: 'Users',
  primaryKey: 'id',
  displayField: 'name',
  fields: [
    {
      name: 'id',
      label: 'ID',
      type: 'number',
      isPrimary: true,
      sortable: true,
      filterable: false,
      editable: false,
      visibleInTable: true,
      visibleInCreate: false,
      visibleInEdit: false,
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      sortable: true,
      filterable: true,
      editable: true,
      visibleInTable: true,
      visibleInCreate: true,
      visibleInEdit: true,
      validation: { required: true, maxLength: 100 },
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      sortable: true,
      filterable: true,
      editable: true,
      visibleInTable: true,
      visibleInCreate: true,
      visibleInEdit: true,
      validation: { required: true, email: true },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      sortable: true,
      filterable: true,
      editable: true,
      visibleInTable: true,
      visibleInCreate: true,
      visibleInEdit: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      name: 'created_at',
      label: 'Created At',
      type: 'datetime',
      sortable: true,
      filterable: true,
      editable: false,
      visibleInTable: true,
      visibleInCreate: false,
      visibleInEdit: false,
    },
    {
      name: 'internal_notes',
      label: 'Internal Notes',
      type: 'textarea',
      sortable: false,
      filterable: false,
      editable: true,
      visibleInTable: false,
      visibleInCreate: true,
      visibleInEdit: true,
    },
  ],
};

// ─── mapDbTypeToFieldType ────────────────────────────────────

describe('mapDbTypeToFieldType', () => {
  it.each([
    ['int', 'number'],
    ['integer', 'number'],
    ['bigint', 'number'],
    ['smallint', 'number'],
    ['serial', 'number'],
    ['float', 'number'],
    ['double', 'number'],
    ['decimal(10,2)', 'number'],
    ['numeric', 'number'],
    ['boolean', 'boolean'],
    ['bool', 'boolean'],
    ['timestamp', 'datetime'],
    ['datetime', 'datetime'],
    ['date', 'date'],
    ['text', 'textarea'],
    ['mediumtext', 'textarea'],
    ['longtext', 'textarea'],
    ['json', 'json'],
    ['jsonb', 'json'],
    ['varchar(255)', 'text'],
    ['char(1)', 'text'],
    ['nvarchar(100)', 'text'],
    ['uuid', 'text'],
    ['enum', 'select'],
  ])('maps "%s" → "%s"', (dbType, expected) => {
    expect(mapDbTypeToFieldType(dbType)).toBe(expected);
  });

  it('handles case insensitivity', () => {
    expect(mapDbTypeToFieldType('VARCHAR(255)')).toBe('text');
    expect(mapDbTypeToFieldType('BOOLEAN')).toBe('boolean');
    expect(mapDbTypeToFieldType('  INT  ')).toBe('number');
  });

  it('returns "text" for unknown types', () => {
    expect(mapDbTypeToFieldType('unknown_type')).toBe('text');
    expect(mapDbTypeToFieldType('custom')).toBe('text');
  });
});

// ─── inferFieldTypeByName ────────────────────────────────────

describe('inferFieldTypeByName', () => {
  it('detects email fields', () => {
    expect(inferFieldTypeByName('email', 'text')).toBe('email');
    expect(inferFieldTypeByName('user_email', 'text')).toBe('email');
    expect(inferFieldTypeByName('email_work', 'text')).toBe('email');
  });

  it('detects password fields', () => {
    expect(inferFieldTypeByName('password', 'text')).toBe('password');
    expect(inferFieldTypeByName('user_password', 'text')).toBe('password');
    expect(inferFieldTypeByName('password_hash', 'text')).toBe('password');
  });

  it('detects URL fields', () => {
    expect(inferFieldTypeByName('url', 'text')).toBe('url');
    expect(inferFieldTypeByName('website', 'text')).toBe('url');
    expect(inferFieldTypeByName('profile_url', 'text')).toBe('url');
  });

  it('detects phone fields', () => {
    expect(inferFieldTypeByName('phone', 'text')).toBe('phone');
    expect(inferFieldTypeByName('tel', 'text')).toBe('phone');
    expect(inferFieldTypeByName('contact_phone', 'text')).toBe('phone');
  });

  it('detects textarea fields', () => {
    expect(inferFieldTypeByName('description', 'text')).toBe('textarea');
    expect(inferFieldTypeByName('content', 'text')).toBe('textarea');
    expect(inferFieldTypeByName('body', 'text')).toBe('textarea');
    expect(inferFieldTypeByName('bio', 'text')).toBe('textarea');
    expect(inferFieldTypeByName('notes', 'text')).toBe('textarea');
  });

  it('does not override non-text base types', () => {
    expect(inferFieldTypeByName('email', 'number')).toBe('number');
    expect(inferFieldTypeByName('phone', 'boolean')).toBe('boolean');
  });

  it('returns base type for unrecognized names', () => {
    expect(inferFieldTypeByName('first_name', 'text')).toBe('text');
    expect(inferFieldTypeByName('username', 'text')).toBe('text');
  });
});

// ─── columnNameToLabel ───────────────────────────────────────

describe('columnNameToLabel', () => {
  it('converts snake_case to Title Case', () => {
    expect(columnNameToLabel('first_name')).toBe('First Name');
    expect(columnNameToLabel('created_at')).toBe('Created At');
  });

  it('removes trailing _id', () => {
    expect(columnNameToLabel('user_id')).toBe('User');
    expect(columnNameToLabel('category_id')).toBe('Category');
  });

  it('handles single word', () => {
    expect(columnNameToLabel('name')).toBe('Name');
    expect(columnNameToLabel('email')).toBe('Email');
  });

  it('handles kebab-case', () => {
    expect(columnNameToLabel('first-name')).toBe('First Name');
  });
});

// ─── fieldToColumnConfig ─────────────────────────────────────

describe('fieldToColumnConfig', () => {
  it('maps text field correctly', () => {
    const field: FieldSchema = {
      name: 'name',
      label: 'Name',
      type: 'text',
      sortable: true,
      filterable: true,
      editable: true,
      validation: { required: true, maxLength: 100 },
    };
    const col = fieldToColumnConfig(field);
    expect(col).toMatchObject({
      name: 'name',
      label: 'Name',
      type: 'text',
      visible: true,
      sortable: true,
      filterable: true,
      editable: true,
      required: true,
    });
  });

  it('maps select field with options', () => {
    const field: FieldSchema = {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    };
    const col = fieldToColumnConfig(field);
    expect(col.type).toBe('select');
    expect(col.options).toEqual([
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ]);
  });

  it('maps relation field to select type', () => {
    const field: FieldSchema = {
      name: 'category',
      label: 'Category',
      type: 'relation',
      relation: { type: 'ManyToOne', target: 'categories', displayField: 'name' },
    };
    const col = fieldToColumnConfig(field);
    expect(col.type).toBe('select');
  });

  it('maps date/datetime to date type', () => {
    expect(fieldToColumnConfig({ name: 'a', label: 'A', type: 'date' }).type).toBe('date');
    expect(fieldToColumnConfig({ name: 'b', label: 'B', type: 'datetime' }).type).toBe('date');
  });

  it('maps json/textarea to textarea type', () => {
    expect(fieldToColumnConfig({ name: 'a', label: 'A', type: 'json' }).type).toBe('textarea');
    expect(fieldToColumnConfig({ name: 'b', label: 'B', type: 'textarea' }).type).toBe('textarea');
  });
});

// ─── entitySchemaToColumnConfigs ─────────────────────────────

describe('entitySchemaToColumnConfigs', () => {
  it('returns only visible-in-table fields', () => {
    const cols = entitySchemaToColumnConfigs(mockSchema);
    const names = cols.map((c) => c.name);
    expect(names).toContain('id');
    expect(names).toContain('name');
    expect(names).toContain('email');
    expect(names).toContain('status');
    expect(names).toContain('created_at');
    expect(names).not.toContain('internal_notes'); // visibleInTable: false
  });

  it('returns correct count', () => {
    const cols = entitySchemaToColumnConfigs(mockSchema);
    expect(cols).toHaveLength(5); // id, name, email, status, created_at
  });
});

// ─── getCreateFields / getEditFields ─────────────────────────

describe('getCreateFields', () => {
  it('excludes primary key and non-create-visible fields', () => {
    const fields = getCreateFields(mockSchema);
    const names = fields.map((f) => f.name);
    expect(names).not.toContain('id'); // isPrimary
    expect(names).not.toContain('created_at'); // visibleInCreate: false
    expect(names).toContain('name');
    expect(names).toContain('email');
    expect(names).toContain('status');
    expect(names).toContain('internal_notes');
  });
});

describe('getEditFields', () => {
  it('excludes primary key and non-edit-visible fields', () => {
    const fields = getEditFields(mockSchema);
    const names = fields.map((f) => f.name);
    expect(names).not.toContain('id'); // isPrimary
    expect(names).not.toContain('created_at'); // visibleInEdit: false
    expect(names).toContain('name');
    expect(names).toContain('email');
    expect(names).toContain('status');
    expect(names).toContain('internal_notes');
  });
});

// ─── tableSchemaToEntitySchema ───────────────────────────────

describe('tableSchemaToEntitySchema', () => {
  const tableSchema: TableSchema = {
    tableName: 'products',
    columns: [
      { name: 'id', type: 'integer', nullable: false, isPrimary: true },
      { name: 'name', type: 'varchar(255)', nullable: false, isPrimary: false },
      { name: 'price', type: 'decimal(10,2)', nullable: false, isPrimary: false },
      { name: 'active', type: 'boolean', nullable: false, isPrimary: false, defaultValue: 'true' },
      { name: 'email', type: 'varchar(255)', nullable: true, isPrimary: false },
      {
        name: 'created_at',
        type: 'timestamp',
        nullable: false,
        isPrimary: false,
        defaultValue: 'CURRENT_TIMESTAMP',
      },
    ],
    primaryKey: ['id'],
  };

  it('converts table name to label', () => {
    const schema = tableSchemaToEntitySchema(tableSchema);
    expect(schema.label).toBe('Products');
  });

  it('detects primary key', () => {
    const schema = tableSchemaToEntitySchema(tableSchema);
    expect(schema.primaryKey).toBe('id');
  });

  it('maps column types correctly', () => {
    const schema = tableSchemaToEntitySchema(tableSchema);
    const fieldMap = Object.fromEntries(schema.fields.map((f) => [f.name, f.type]));
    expect(fieldMap.id).toBe('number');
    expect(fieldMap.name).toBe('text');
    expect(fieldMap.price).toBe('number');
    expect(fieldMap.active).toBe('boolean');
    expect(fieldMap.email).toBe('email'); // inferred by name
    expect(fieldMap.created_at).toBe('datetime');
  });

  it('marks primary key as non-editable', () => {
    const schema = tableSchemaToEntitySchema(tableSchema);
    const idField = schema.fields.find((f) => f.name === 'id');
    expect(idField?.editable).toBe(false);
    expect(idField?.isPrimary).toBe(true);
  });

  it('marks created_at as non-editable', () => {
    const schema = tableSchemaToEntitySchema(tableSchema);
    const field = schema.fields.find((f) => f.name === 'created_at');
    expect(field?.editable).toBe(false);
    expect(field?.visibleInCreate).toBe(false);
  });

  it('sets required based on nullable', () => {
    const schema = tableSchemaToEntitySchema(tableSchema);
    const nameField = schema.fields.find((f) => f.name === 'name');
    expect(nameField?.validation?.required).toBe(true);

    const emailField = schema.fields.find((f) => f.name === 'email');
    expect(emailField?.validation?.required).toBe(false);
  });

  it('detects display field as first text field', () => {
    const schema = tableSchemaToEntitySchema(tableSchema);
    expect(schema.displayField).toBe('name');
  });

  it('includes default permissions and sort', () => {
    const schema = tableSchemaToEntitySchema(tableSchema);
    expect(schema.permissions).toEqual({
      read: true,
      create: true,
      update: true,
      delete: true,
      export: true,
    });
    expect(schema.defaultSort).toEqual({ field: 'id', direction: 'desc' });
  });

  it('handles relations', () => {
    const schemaWithRel: TableSchema = {
      tableName: 'orders',
      columns: [
        { name: 'id', type: 'integer', nullable: false, isPrimary: true },
        { name: 'user_id', type: 'integer', nullable: false, isPrimary: false },
      ],
      primaryKey: ['id'],
      relations: [
        {
          type: 'MANY_TO_ONE',
          sourceColumn: 'user_id',
          targetTable: 'users',
          targetColumn: 'id',
        },
      ],
    };
    const schema = tableSchemaToEntitySchema(schemaWithRel);
    const fkField = schema.fields.find((f) => f.name === 'user_id');
    expect(fkField?.type).toBe('relation');
    expect(fkField?.relation?.type).toBe('ManyToOne');
    expect(fkField?.relation?.target).toBe('users');
  });
});
