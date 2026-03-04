// ============================================================
// Unit Tests – Validation Builder (Phase 5 – Quality)
// Tests: buildFieldValidator, buildFormSchema, buildDefaultValues
// ============================================================

import { describe, it, expect } from 'vitest';
import { buildFieldValidator, buildFormSchema, buildDefaultValues } from '../validation-builder';
import type { FieldSchema } from '../schema.types';

// ─── Test Helpers ────────────────────────────────────────────

function field(
  overrides: Partial<FieldSchema> & { name: string; label: string; type: FieldSchema['type'] },
): FieldSchema {
  return {
    editable: true,
    ...overrides,
  };
}

// ─── buildFieldValidator ─────────────────────────────────────

describe('buildFieldValidator', () => {
  describe('text fields', () => {
    it('validates required text', () => {
      const v = buildFieldValidator(
        field({ name: 'name', label: 'Name', type: 'text', validation: { required: true } }),
      );
      expect(v.safeParse('hello').success).toBe(true);
      expect(v.safeParse('').success).toBe(false);
    });

    it('validates optional text', () => {
      const v = buildFieldValidator(field({ name: 'bio', label: 'Bio', type: 'text' }));
      expect(v.safeParse('').success).toBe(true);
      expect(v.safeParse(undefined).success).toBe(true);
    });

    it('validates maxLength', () => {
      const v = buildFieldValidator(
        field({
          name: 'code',
          label: 'Code',
          type: 'text',
          validation: { required: true, maxLength: 5 },
        }),
      );
      expect(v.safeParse('abc').success).toBe(true);
      expect(v.safeParse('abcdef').success).toBe(false);
    });

    it('validates pattern', () => {
      const v = buildFieldValidator(
        field({
          name: 'code',
          label: 'Code',
          type: 'text',
          validation: { required: true, pattern: '^[A-Z]+$' },
        }),
      );
      expect(v.safeParse('ABC').success).toBe(true);
      expect(v.safeParse('abc').success).toBe(false);
    });
  });

  describe('number fields', () => {
    it('coerces and validates number', () => {
      const v = buildFieldValidator(
        field({
          name: 'age',
          label: 'Age',
          type: 'number',
          validation: { required: true, min: 0, max: 200 },
        }),
      );
      expect(v.safeParse(25).success).toBe(true);
      expect(v.safeParse('25').success).toBe(true); // coerced
      expect(v.safeParse(-1).success).toBe(false);
      expect(v.safeParse(201).success).toBe(false);
    });
  });

  describe('boolean fields', () => {
    it('accepts boolean values', () => {
      const v = buildFieldValidator(field({ name: 'active', label: 'Active', type: 'boolean' }));
      expect(v.safeParse(true).success).toBe(true);
      expect(v.safeParse(false).success).toBe(true);
    });
  });

  describe('email fields', () => {
    it('validates email format', () => {
      const v = buildFieldValidator(
        field({ name: 'email', label: 'Email', type: 'email', validation: { required: true } }),
      );
      expect(v.safeParse('user@example.com').success).toBe(true);
      expect(v.safeParse('invalid').success).toBe(false);
    });
  });

  describe('url fields', () => {
    it('validates URL format', () => {
      const v = buildFieldValidator(
        field({ name: 'site', label: 'Site', type: 'url', validation: { required: true } }),
      );
      expect(v.safeParse('https://example.com').success).toBe(true);
      expect(v.safeParse('not-a-url').success).toBe(false);
    });
  });

  describe('select fields', () => {
    it('validates required select', () => {
      const v = buildFieldValidator(
        field({ name: 'role', label: 'Role', type: 'select', validation: { required: true } }),
      );
      expect(v.safeParse('admin').success).toBe(true);
      expect(v.safeParse('').success).toBe(false);
    });
  });

  describe('multiselect fields', () => {
    it('validates required multiselect', () => {
      const v = buildFieldValidator(
        field({ name: 'tags', label: 'Tags', type: 'multiselect', validation: { required: true } }),
      );
      expect(v.safeParse(['a', 'b']).success).toBe(true);
      expect(v.safeParse([]).success).toBe(false);
    });
  });

  describe('json fields', () => {
    it('validates JSON string', () => {
      const v = buildFieldValidator(
        field({ name: 'meta', label: 'Meta', type: 'json', validation: { required: true } }),
      );
      expect(v.safeParse('{"key":"value"}').success).toBe(true);
      expect(v.safeParse('not json').success).toBe(false);
    });
  });

  describe('date fields', () => {
    it('validates required date string', () => {
      const v = buildFieldValidator(
        field({ name: 'dob', label: 'DOB', type: 'date', validation: { required: true } }),
      );
      expect(v.safeParse('2024-01-15').success).toBe(true);
      expect(v.safeParse('').success).toBe(false);
    });
  });
});

// ─── buildFormSchema ─────────────────────────────────────────

describe('buildFormSchema', () => {
  const fields: FieldSchema[] = [
    field({ name: 'id', label: 'ID', type: 'number', isPrimary: true, editable: false }),
    field({ name: 'name', label: 'Name', type: 'text', validation: { required: true } }),
    field({ name: 'email', label: 'Email', type: 'email', validation: { required: true } }),
    field({ name: 'status', label: 'Status', type: 'select' }),
    field({ name: 'created_at', label: 'Created At', type: 'datetime', editable: false }),
  ];

  it('creates schema for create mode (skips primary key)', () => {
    const schema = buildFormSchema(fields, 'create');
    const shape = schema.shape;
    expect(shape).not.toHaveProperty('id');
    expect(shape).not.toHaveProperty('created_at'); // editable: false
    expect(shape).toHaveProperty('name');
    expect(shape).toHaveProperty('email');
    expect(shape).toHaveProperty('status');
  });

  it('validates create data', () => {
    const schema = buildFormSchema(fields, 'create');
    const result = schema.safeParse({ name: 'John', email: 'john@test.com', status: 'active' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid create data', () => {
    const schema = buildFormSchema(fields, 'create');
    const result = schema.safeParse({ name: '', email: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('creates schema for edit mode (all optional)', () => {
    const schema = buildFormSchema(fields, 'edit');
    const result = schema.safeParse({ name: 'updated' });
    expect(result.success).toBe(true);
  });

  it('edit mode allows empty body', () => {
    const schema = buildFormSchema(fields, 'edit');
    const result = schema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ─── buildDefaultValues ──────────────────────────────────────

describe('buildDefaultValues', () => {
  const fields: FieldSchema[] = [
    field({ name: 'id', label: 'ID', type: 'number', isPrimary: true }),
    field({ name: 'name', label: 'Name', type: 'text' }),
    field({ name: 'active', label: 'Active', type: 'boolean' }),
    field({ name: 'count', label: 'Count', type: 'number' }),
    field({ name: 'tags', label: 'Tags', type: 'multiselect' }),
    field({ name: 'desc', label: 'Description', type: 'textarea' }),
  ];

  it('generates correct defaults (no existing data)', () => {
    const defaults = buildDefaultValues(fields);
    expect(defaults).not.toHaveProperty('id'); // primary key skipped
    expect(defaults.name).toBe('');
    expect(defaults.active).toBe(false);
    expect(defaults.count).toBe('');
    expect(defaults.tags).toEqual([]);
    expect(defaults.desc).toBe('');
  });

  it('uses existing data when provided', () => {
    const defaults = buildDefaultValues(fields, { name: 'Existing', active: true });
    expect(defaults.name).toBe('Existing');
    expect(defaults.active).toBe(true);
    expect(defaults.count).toBe(''); // not in existing
  });

  it('uses field defaultValue when set', () => {
    const withDefault: FieldSchema[] = [
      field({ name: 'status', label: 'Status', type: 'text', defaultValue: 'draft' }),
    ];
    const defaults = buildDefaultValues(withDefault);
    expect(defaults.status).toBe('draft');
  });
});
