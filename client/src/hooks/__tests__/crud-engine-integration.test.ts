// ============================================================
// Integration Test – CRUD Engine Flow (Phase 5 – Quality)
// End-to-end test: EntitySchema → ColumnConfigs, FormSchema,
//   DefaultValues, QueryFields, Filter AST → Flat → SQL preview
// Simulates the full pipeline a DynamicCrudPage goes through
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  tableSchemaToEntitySchema,
  entitySchemaToColumnConfigs,
  getCreateFields,
  getEditFields,
} from '../../core/metadata/field-mapping';
import { buildFormSchema, buildDefaultValues } from '../../core/metadata/validation-builder';
import {
  resolveQueryFields,
  createEmptyGroup,
  createEmptyCondition,
  validateAST,
  astToFlatFilter,
  astToSQLPreview,
  countConditions,
} from '../../core/query-builder/query-builder.utils';
import type { TableSchema } from '../../types';
import type {
  FilterGroupNode,
  FilterConditionNode,
} from '../../core/query-builder/query-builder.types';
import type { SchemaRegistry } from '../../core/metadata/schema.types';

// ─── Realistic Table Schemas ─────────────────────────────────

const usersTableSchema: TableSchema = {
  tableName: 'users',
  columns: [
    { name: 'id', type: 'serial', nullable: false, isPrimary: true },
    { name: 'username', type: 'varchar(50)', nullable: false, isPrimary: false },
    { name: 'email', type: 'varchar(255)', nullable: false, isPrimary: false },
    { name: 'password_hash', type: 'varchar(255)', nullable: false, isPrimary: false },
    { name: 'is_active', type: 'boolean', nullable: false, isPrimary: false, defaultValue: 'true' },
    { name: 'role', type: 'enum', nullable: false, isPrimary: false },
    { name: 'bio', type: 'text', nullable: true, isPrimary: false },
    {
      name: 'created_at',
      type: 'timestamp',
      nullable: false,
      isPrimary: false,
      defaultValue: 'CURRENT_TIMESTAMP',
    },
    {
      name: 'updated_at',
      type: 'timestamp',
      nullable: false,
      isPrimary: false,
      defaultValue: 'CURRENT_TIMESTAMP',
    },
  ],
  primaryKey: ['id'],
};

const ordersTableSchema: TableSchema = {
  tableName: 'orders',
  columns: [
    { name: 'id', type: 'serial', nullable: false, isPrimary: true },
    { name: 'order_number', type: 'varchar(20)', nullable: false, isPrimary: false },
    { name: 'total_amount', type: 'decimal(10,2)', nullable: false, isPrimary: false },
    { name: 'status', type: 'enum', nullable: false, isPrimary: false },
    { name: 'user_id', type: 'integer', nullable: false, isPrimary: false },
    { name: 'notes', type: 'text', nullable: true, isPrimary: false },
    {
      name: 'created_at',
      type: 'timestamp',
      nullable: false,
      isPrimary: false,
      defaultValue: 'CURRENT_TIMESTAMP',
    },
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

// ─── Full CRUD Pipeline Integration Test ─────────────────────

describe('CRUD Engine Integration: Full Pipeline', () => {
  // Step 1: Convert DB schemas → EntitySchemas
  const usersSchema = tableSchemaToEntitySchema(usersTableSchema);
  const ordersSchema = tableSchemaToEntitySchema(ordersTableSchema);
  const registry: SchemaRegistry = {
    users: usersSchema,
    orders: ordersSchema,
  };

  describe('Step 1: Schema Generation', () => {
    it('generates valid users EntitySchema', () => {
      expect(usersSchema.name).toBe('users');
      expect(usersSchema.primaryKey).toBe('id');
      expect(usersSchema.displayField).toBe('username');
      expect(usersSchema.fields.length).toBe(9);
    });

    it('generates valid orders EntitySchema with relation', () => {
      expect(ordersSchema.name).toBe('orders');
      const userFk = ordersSchema.fields.find((f) => f.name === 'user_id');
      expect(userFk?.type).toBe('relation');
      expect(userFk?.relation?.target).toBe('users');
      expect(userFk?.relation?.type).toBe('ManyToOne');
    });

    it('correctly infers field types by name', () => {
      const emailField = usersSchema.fields.find((f) => f.name === 'email');
      expect(emailField?.type).toBe('email');

      const passwordField = usersSchema.fields.find((f) => f.name === 'password_hash');
      expect(passwordField?.type).toBe('password');

      const bioField = usersSchema.fields.find((f) => f.name === 'bio');
      expect(bioField?.type).toBe('textarea');
    });
  });

  // Step 2: Generate table columns from schema
  describe('Step 2: Table Column Generation', () => {
    const columns = entitySchemaToColumnConfigs(usersSchema);

    it('produces ColumnConfig[] for BaseTable', () => {
      expect(columns.length).toBeGreaterThan(0);
      expect(columns.every((c) => c.name && c.label)).toBe(true);
    });

    it('all columns have correct type mapping', () => {
      const colMap = Object.fromEntries(columns.map((c) => [c.name, c.type]));
      expect(colMap.username).toBe('text');
      expect(colMap.email).toBe('email');
      expect(colMap.is_active).toBe('boolean');
      expect(colMap.role).toBe('select');
      expect(colMap.bio).toBe('textarea');
      expect(colMap.created_at).toBe('date');
    });
  });

  // Step 3: Generate form schema for create/edit
  describe('Step 3: Form Schema + Defaults', () => {
    const createFields = getCreateFields(usersSchema);
    const editFields = getEditFields(usersSchema);

    it('create fields exclude PK and timestamps', () => {
      const names = createFields.map((f) => f.name);
      expect(names).not.toContain('id');
      expect(names).not.toContain('created_at');
      expect(names).not.toContain('updated_at');
      expect(names).toContain('username');
      expect(names).toContain('email');
    });

    it('edit fields exclude PK and timestamps', () => {
      const names = editFields.map((f) => f.name);
      expect(names).not.toContain('id');
      expect(names).not.toContain('created_at');
      expect(names).not.toContain('updated_at');
    });

    it('builds valid Zod schema for create', () => {
      const schema = buildFormSchema(createFields, 'create');
      // Valid data
      const valid = schema.safeParse({
        username: 'johndoe',
        email: 'john@example.com',
        password_hash: 'hashed123',
        is_active: true,
        role: 'admin',
        bio: 'Developer',
      });
      expect(valid.success).toBe(true);
    });

    it('create schema rejects missing required fields', () => {
      const schema = buildFormSchema(createFields, 'create');
      const invalid = schema.safeParse({
        username: '',
        email: 'not-email',
      });
      expect(invalid.success).toBe(false);
    });

    it('edit schema allows partial updates', () => {
      const schema = buildFormSchema(editFields, 'edit');
      const partial = schema.safeParse({ username: 'updated' });
      expect(partial.success).toBe(true);
    });

    it('generates correct default values', () => {
      const defaults = buildDefaultValues(createFields);
      expect(defaults).not.toHaveProperty('id');
      expect(defaults.is_active).toBe(false);
      expect(defaults.username).toBe('');
    });

    it('merges existing data into defaults', () => {
      const existing = { username: 'existing', email: 'existing@test.com' };
      const defaults = buildDefaultValues(editFields, existing);
      expect(defaults.username).toBe('existing');
      expect(defaults.email).toBe('existing@test.com');
    });
  });

  // Step 4: Query builder field resolution + filter pipeline
  describe('Step 4: Query Builder Pipeline', () => {
    const queryFields = resolveQueryFields(ordersSchema, registry);

    it('resolves direct + relation fields for orders', () => {
      const names = queryFields.map((f) => f.name);
      // Direct fields
      expect(names).toContain('id');
      expect(names).toContain('order_number');
      expect(names).toContain('total_amount');
      expect(names).toContain('status');
      expect(names).toContain('user_id');
      // Relation nested fields
      expect(names.some((n) => n.includes('users.'))).toBe(true);
    });

    it('marks relation fields with isRelationPath', () => {
      const relationPaths = queryFields.filter((f) => f.isRelationPath);
      expect(relationPaths.length).toBeGreaterThan(0);
      relationPaths.forEach((f) => {
        expect(f.name).toContain('.');
      });
    });

    it('builds filter AST from UI interactions', () => {
      // Simulate: user adds a group, adds conditions
      const root = createEmptyGroup('AND');

      // User adds "status = active"
      const cond1 = createEmptyCondition(queryFields, 'status');
      cond1.operator = 'eq';
      cond1.value = 'active';

      // User adds "total_amount > 100"
      const cond2 = createEmptyCondition(queryFields, 'total_amount');
      cond2.operator = 'gt';
      cond2.value = 100;

      root.children.push(cond1, cond2);

      // Validate the AST
      const validation = validateAST(root, queryFields);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(countConditions(root)).toBe(2);
    });

    it('converts AST → flat filter for API', () => {
      const root: FilterGroupNode = {
        type: 'group',
        operator: 'AND',
        children: [
          {
            type: 'condition',
            field: 'status',
            operator: 'eq',
            value: 'active',
          } as FilterConditionNode,
          {
            type: 'condition',
            field: 'total_amount',
            operator: 'gt',
            value: 100,
          } as FilterConditionNode,
        ],
      };

      const flat = astToFlatFilter(root);
      expect(flat.logic).toBe('AND');
      expect(flat.conditions).toHaveLength(2);
      expect(flat.conditions[0]).toMatchObject({
        field: 'status',
        operator: 'eq',
        value: 'active',
      });
    });

    it('generates SQL preview from AST', () => {
      const root: FilterGroupNode = {
        type: 'group',
        operator: 'AND',
        children: [
          {
            type: 'condition',
            field: 'status',
            operator: 'eq',
            value: 'active',
          } as FilterConditionNode,
          {
            type: 'condition',
            field: 'total_amount',
            operator: 'gt',
            value: 100,
          } as FilterConditionNode,
          {
            type: 'group',
            operator: 'OR',
            children: [
              {
                type: 'condition',
                field: 'order_number',
                operator: 'contains',
                value: 'ORD',
              } as FilterConditionNode,
              {
                type: 'condition',
                field: 'notes',
                operator: 'isNotNull',
                value: '',
              } as FilterConditionNode,
            ],
          } as FilterGroupNode,
        ],
      };

      const sql = astToSQLPreview(root);
      expect(sql).toContain("status = 'active'");
      expect(sql).toContain('total_amount > 100');
      expect(sql).toContain("order_number LIKE '%ORD%'");
      expect(sql).toContain('notes IS NOT NULL');
      expect(sql).toContain('AND');
      expect(sql).toContain('OR');
    });

    it('validates and rejects bad filters', () => {
      // Empty group
      const emptyRoot = createEmptyGroup();
      expect(validateAST(emptyRoot).valid).toBe(false);

      // Missing value
      const badCond: FilterGroupNode = {
        type: 'group',
        operator: 'AND',
        children: [
          { type: 'condition', field: 'status', operator: 'eq', value: '' } as FilterConditionNode,
        ],
      };
      expect(validateAST(badCond).valid).toBe(false);
    });
  });

  // Step 5: Cross-entity pipeline (orders with user relation)
  describe('Step 5: Relation-Aware Pipeline', () => {
    it('full pipeline: table → schema → columns → form → query → filter', () => {
      // 1. Convert table schema
      const schema = ordersSchema;
      expect(schema.fields.some((f) => f.type === 'relation')).toBe(true);

      // 2. Generate columns
      const columns = entitySchemaToColumnConfigs(schema);
      expect(columns.length).toBeGreaterThan(0);

      // 3. Generate create form
      const createFields = getCreateFields(schema);
      const createSchema = buildFormSchema(createFields, 'create');
      expect(
        createSchema.safeParse({
          order_number: 'ORD-001',
          total_amount: 150.5,
          status: 'pending',
          user_id: '1',
        }).success,
      ).toBe(true);

      // 4. Resolve query fields (with relation)
      const queryFields = resolveQueryFields(schema, registry);
      expect(queryFields.some((f) => f.isRelationPath)).toBe(true);

      // 5. Build a complex filter
      const filter: FilterGroupNode = {
        type: 'group',
        operator: 'AND',
        children: [
          { type: 'condition', field: 'status', operator: 'eq', value: 'pending' },
          { type: 'condition', field: 'total_amount', operator: 'gte', value: 100 },
          {
            type: 'group',
            operator: 'OR',
            children: [
              { type: 'condition', field: 'order_number', operator: 'startsWith', value: 'ORD' },
              { type: 'condition', field: 'notes', operator: 'isNull', value: '' },
            ],
          },
        ],
      };

      // 6. Validate
      expect(validateAST(filter).valid).toBe(true);
      expect(countConditions(filter)).toBe(4);

      // 7. Convert to flat for API
      const flat = astToFlatFilter(filter);
      expect(flat.logic).toBe('AND');
      expect(flat.conditions).toHaveLength(3); // 2 conditions + 1 nested group

      // 8. SQL preview
      const sql = astToSQLPreview(filter);
      expect(sql).toBeTruthy();
      expect(sql.length).toBeGreaterThan(10);
    });
  });
});
