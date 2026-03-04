// ============================================================
// Unit Tests – Query Builder Utils (Phase 5 – Quality)
// Tests: createEmptyGroup, createEmptyCondition, countConditions,
//        astToFlatFilter, flatFilterToAST, astToSQLPreview,
//        validateAST, resolveQueryFields, fieldsToQueryFields
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  createEmptyGroup,
  createEmptyCondition,
  countConditions,
  astToFlatFilter,
  flatFilterToAST,
  astToSQLPreview,
  validateAST,
  resolveQueryFields,
  fieldsToQueryFields,
} from '../query-builder.utils';
import type { FilterGroupNode, FilterConditionNode, QueryField } from '../query-builder.types';
import type { EntitySchema, SchemaRegistry } from '../../metadata/schema.types';

// ─── Test Fixtures ───────────────────────────────────────────

const textField: QueryField = { name: 'name', label: 'Name', type: 'text' };
const numberField: QueryField = { name: 'age', label: 'Age', type: 'number' };
const dateField: QueryField = { name: 'created', label: 'Created', type: 'date' };
const fields: QueryField[] = [textField, numberField, dateField];

// ─── createEmptyGroup ────────────────────────────────────────

describe('createEmptyGroup', () => {
  it('creates AND group by default', () => {
    const group = createEmptyGroup();
    expect(group.type).toBe('group');
    expect(group.operator).toBe('AND');
    expect(group.children).toEqual([]);
  });

  it('creates OR group when specified', () => {
    const group = createEmptyGroup('OR');
    expect(group.operator).toBe('OR');
  });
});

// ─── createEmptyCondition ────────────────────────────────────

describe('createEmptyCondition', () => {
  it('uses first field by default', () => {
    const cond = createEmptyCondition(fields);
    expect(cond.type).toBe('condition');
    expect(cond.field).toBe('name');
    expect(cond.value).toBe('');
  });

  it('uses specified field', () => {
    const cond = createEmptyCondition(fields, 'age');
    expect(cond.field).toBe('age');
  });

  it('falls back to first field for unknown name', () => {
    const cond = createEmptyCondition(fields, 'nonexistent');
    expect(cond.field).toBe('name');
  });

  it('handles empty fields array', () => {
    const cond = createEmptyCondition([]);
    expect(cond.field).toBe('');
    expect(cond.operator).toBe('eq');
  });
});

// ─── countConditions ─────────────────────────────────────────

describe('countConditions', () => {
  it('counts single condition', () => {
    const cond: FilterConditionNode = { type: 'condition', field: 'x', operator: 'eq', value: '1' };
    expect(countConditions(cond)).toBe(1);
  });

  it('counts flat group', () => {
    const group: FilterGroupNode = {
      type: 'group',
      operator: 'AND',
      children: [
        { type: 'condition', field: 'a', operator: 'eq', value: '1' },
        { type: 'condition', field: 'b', operator: 'gt', value: '2' },
      ],
    };
    expect(countConditions(group)).toBe(2);
  });

  it('counts nested groups', () => {
    const nested: FilterGroupNode = {
      type: 'group',
      operator: 'OR',
      children: [
        { type: 'condition', field: 'a', operator: 'eq', value: '1' },
        {
          type: 'group',
          operator: 'AND',
          children: [
            { type: 'condition', field: 'b', operator: 'gt', value: '2' },
            { type: 'condition', field: 'c', operator: 'lt', value: '3' },
          ],
        },
      ],
    };
    expect(countConditions(nested)).toBe(3);
  });

  it('returns 0 for empty group', () => {
    const group: FilterGroupNode = { type: 'group', operator: 'AND', children: [] };
    expect(countConditions(group)).toBe(0);
  });
});

// ─── astToFlatFilter / flatFilterToAST roundtrip ─────────────

describe('astToFlatFilter', () => {
  it('converts simple AST to flat format', () => {
    const ast: FilterGroupNode = {
      type: 'group',
      operator: 'AND',
      children: [{ type: 'condition', field: 'name', operator: 'eq', value: 'test' }],
    };
    const flat = astToFlatFilter(ast);
    expect(flat.logic).toBe('AND');
    expect(flat.conditions).toHaveLength(1);
    expect(flat.conditions[0]).toMatchObject({
      field: 'name',
      operator: 'eq',
      value: 'test',
    });
  });

  it('maps contains → like', () => {
    const ast: FilterGroupNode = {
      type: 'group',
      operator: 'AND',
      children: [{ type: 'condition', field: 'name', operator: 'contains', value: 'test' }],
    };
    const flat = astToFlatFilter(ast);
    expect(flat.conditions[0]).toMatchObject({ operator: 'like' });
  });

  it('handles nested groups', () => {
    const ast: FilterGroupNode = {
      type: 'group',
      operator: 'OR',
      children: [
        { type: 'condition', field: 'a', operator: 'eq', value: '1' },
        {
          type: 'group',
          operator: 'AND',
          children: [{ type: 'condition', field: 'b', operator: 'gt', value: '2' }],
        },
      ],
    };
    const flat = astToFlatFilter(ast);
    expect(flat.logic).toBe('OR');
    expect(flat.conditions).toHaveLength(2);
    // Second is nested group
    expect(flat.conditions[1]).toMatchObject({ logic: 'AND' });
  });
});

describe('flatFilterToAST', () => {
  it('converts flat format back to AST', () => {
    const flat = {
      logic: 'AND' as const,
      conditions: [{ field: 'name', operator: 'eq' as const, value: 'test' }],
    };
    const ast = flatFilterToAST(flat);
    expect(ast.type).toBe('group');
    expect(ast.operator).toBe('AND');
    expect(ast.children).toHaveLength(1);
    expect(ast.children[0]).toMatchObject({
      type: 'condition',
      field: 'name',
      operator: 'eq',
      value: 'test',
    });
  });

  it('maps like → contains', () => {
    const flat = {
      logic: 'AND' as const,
      conditions: [{ field: 'name', operator: 'like' as const, value: '%test%' }],
    };
    const ast = flatFilterToAST(flat);
    expect((ast.children[0] as FilterConditionNode).operator).toBe('contains');
  });
});

describe('AST ↔ Flat roundtrip', () => {
  it('preserves structure through roundtrip (simple)', () => {
    const original: FilterGroupNode = {
      type: 'group',
      operator: 'AND',
      children: [
        { type: 'condition', field: 'name', operator: 'eq', value: 'test' },
        { type: 'condition', field: 'age', operator: 'gt', value: 18 },
      ],
    };
    const roundtrip = flatFilterToAST(astToFlatFilter(original));
    expect(roundtrip.operator).toBe(original.operator);
    expect(roundtrip.children).toHaveLength(2);
    expect((roundtrip.children[0] as FilterConditionNode).field).toBe('name');
    expect((roundtrip.children[1] as FilterConditionNode).field).toBe('age');
  });
});

// ─── astToSQLPreview ─────────────────────────────────────────

describe('astToSQLPreview', () => {
  it('renders eq condition', () => {
    const cond: FilterConditionNode = {
      type: 'condition',
      field: 'name',
      operator: 'eq',
      value: 'John',
    };
    expect(astToSQLPreview(cond)).toBe("name = 'John'");
  });

  it('renders contains condition', () => {
    const cond: FilterConditionNode = {
      type: 'condition',
      field: 'name',
      operator: 'contains',
      value: 'Jo',
    };
    expect(astToSQLPreview(cond)).toBe("name LIKE '%Jo%'");
  });

  it('renders isNull condition', () => {
    const cond: FilterConditionNode = {
      type: 'condition',
      field: 'email',
      operator: 'isNull',
      value: '',
    };
    expect(astToSQLPreview(cond)).toBe('email IS NULL');
  });

  it('renders isNotNull condition', () => {
    const cond: FilterConditionNode = {
      type: 'condition',
      field: 'email',
      operator: 'isNotNull',
      value: '',
    };
    expect(astToSQLPreview(cond)).toBe('email IS NOT NULL');
  });

  it('renders group with AND', () => {
    const group: FilterGroupNode = {
      type: 'group',
      operator: 'AND',
      children: [
        { type: 'condition', field: 'a', operator: 'eq', value: '1' },
        { type: 'condition', field: 'b', operator: 'gt', value: '2' },
      ],
    };
    expect(astToSQLPreview(group)).toBe("(a = '1' AND b > 2)");
  });

  it('renders empty group', () => {
    const group: FilterGroupNode = { type: 'group', operator: 'AND', children: [] };
    expect(astToSQLPreview(group)).toBe('(empty)');
  });

  it('renders between condition', () => {
    const cond: FilterConditionNode = {
      type: 'condition',
      field: 'price',
      operator: 'between',
      value: [10, 100],
    };
    expect(astToSQLPreview(cond)).toBe('price BETWEEN 10 AND 100');
  });

  it('renders in condition with array', () => {
    const cond: FilterConditionNode = {
      type: 'condition',
      field: 'status',
      operator: 'in',
      value: ['active', 'pending'],
    };
    expect(astToSQLPreview(cond)).toBe("status IN ('active', 'pending')");
  });

  it('renders comparison operators', () => {
    expect(astToSQLPreview({ type: 'condition', field: 'x', operator: 'neq', value: '1' })).toBe(
      "x != '1'",
    );
    expect(astToSQLPreview({ type: 'condition', field: 'x', operator: 'gte', value: '5' })).toBe(
      'x >= 5',
    );
    expect(astToSQLPreview({ type: 'condition', field: 'x', operator: 'lte', value: '10' })).toBe(
      'x <= 10',
    );
    expect(astToSQLPreview({ type: 'condition', field: 'x', operator: 'lt', value: '3' })).toBe(
      'x < 3',
    );
  });

  it('renders startsWith / endsWith', () => {
    expect(
      astToSQLPreview({ type: 'condition', field: 'name', operator: 'startsWith', value: 'A' }),
    ).toBe("name LIKE 'A%'");
    expect(
      astToSQLPreview({ type: 'condition', field: 'name', operator: 'endsWith', value: 'Z' }),
    ).toBe("name LIKE '%Z'");
  });
});

// ─── validateAST ─────────────────────────────────────────────

describe('validateAST', () => {
  it('passes valid AST', () => {
    const ast: FilterGroupNode = {
      type: 'group',
      operator: 'AND',
      children: [{ type: 'condition', field: 'name', operator: 'eq', value: 'test' }],
    };
    const result = validateAST(ast);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects empty group', () => {
    const ast: FilterGroupNode = { type: 'group', operator: 'AND', children: [] };
    const result = validateAST(ast);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Empty group');
  });

  it('detects missing field', () => {
    const ast: FilterGroupNode = {
      type: 'group',
      operator: 'AND',
      children: [{ type: 'condition', field: '', operator: 'eq', value: 'test' }],
    };
    const result = validateAST(ast);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing field'))).toBe(true);
  });

  it('detects missing value (operator requires value)', () => {
    const ast: FilterGroupNode = {
      type: 'group',
      operator: 'AND',
      children: [{ type: 'condition', field: 'name', operator: 'eq', value: '' }],
    };
    const result = validateAST(ast);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing value'))).toBe(true);
  });

  it('allows isNull/isNotNull without value', () => {
    const ast: FilterGroupNode = {
      type: 'group',
      operator: 'AND',
      children: [{ type: 'condition', field: 'email', operator: 'isNull', value: '' }],
    };
    const result = validateAST(ast);
    expect(result.valid).toBe(true);
  });

  it('detects unknown field when available fields provided', () => {
    const ast: FilterGroupNode = {
      type: 'group',
      operator: 'AND',
      children: [{ type: 'condition', field: 'nonexistent', operator: 'eq', value: 'x' }],
    };
    const result = validateAST(ast, fields);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Unknown field'))).toBe(true);
  });

  it('validates nested groups', () => {
    const ast: FilterGroupNode = {
      type: 'group',
      operator: 'OR',
      children: [
        {
          type: 'group',
          operator: 'AND',
          children: [], // empty
        },
      ],
    };
    const result = validateAST(ast);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Empty group'))).toBe(true);
  });
});

// ─── resolveQueryFields ──────────────────────────────────────

describe('resolveQueryFields', () => {
  const usersSchema: EntitySchema = {
    name: 'users',
    label: 'Users',
    fields: [
      { name: 'id', label: 'ID', type: 'number', isPrimary: true, filterable: true },
      { name: 'name', label: 'Name', type: 'text', filterable: true },
      { name: 'email', label: 'Email', type: 'email', filterable: true },
    ],
  };

  const ordersSchema: EntitySchema = {
    name: 'orders',
    label: 'Orders',
    fields: [
      { name: 'id', label: 'ID', type: 'number', isPrimary: true, filterable: true },
      { name: 'total', label: 'Total', type: 'number', filterable: true },
      {
        name: 'user_id',
        label: 'User',
        type: 'relation',
        filterable: true,
        relation: { type: 'ManyToOne', target: 'users', displayField: 'name' },
      },
    ],
  };

  const registry: SchemaRegistry = {
    users: usersSchema,
    orders: ordersSchema,
  };

  it('returns direct fields without registry', () => {
    const result = resolveQueryFields(usersSchema);
    expect(result).toHaveLength(3);
    expect(result.map((f) => f.name)).toEqual(['id', 'name', 'email']);
  });

  it('includes relation dot-paths with registry', () => {
    const result = resolveQueryFields(ordersSchema, registry);
    const names = result.map((f) => f.name);
    expect(names).toContain('id');
    expect(names).toContain('total');
    expect(names).toContain('user_id');
    // Should include relation paths
    expect(names.some((n) => n.startsWith('users.'))).toBe(true);
  });

  it('skips non-filterable fields', () => {
    const schema: EntitySchema = {
      name: 'test',
      label: 'Test',
      fields: [
        { name: 'id', label: 'ID', type: 'number', isPrimary: true },
        { name: 'hidden', label: 'Hidden', type: 'text', filterable: false },
        { name: 'visible', label: 'Visible', type: 'text', filterable: true },
      ],
    };
    const result = resolveQueryFields(schema);
    const names = result.map((f) => f.name);
    expect(names).toContain('id'); // primary always included
    expect(names).not.toContain('hidden');
    expect(names).toContain('visible');
  });
});

// ─── fieldsToQueryFields ─────────────────────────────────────

describe('fieldsToQueryFields', () => {
  it('converts FieldSchema[] to QueryField[]', () => {
    const result = fieldsToQueryFields([
      { name: 'id', label: 'ID', type: 'number', isPrimary: true },
      { name: 'name', label: 'Name', type: 'text', filterable: true },
      { name: 'secret', label: 'Secret', type: 'text', filterable: false },
    ]);
    const names = result.map((f) => f.name);
    expect(names).toContain('id'); // primary key
    expect(names).toContain('name');
    expect(names).not.toContain('secret'); // filterable: false, not primary
  });

  it('sets isRelationPath to false for all', () => {
    const result = fieldsToQueryFields([{ name: 'x', label: 'X', type: 'text' }]);
    expect(result[0].isRelationPath).toBe(false);
  });
});
