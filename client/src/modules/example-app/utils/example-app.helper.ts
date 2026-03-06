import type { EntitySchema } from '../../../core/metadata/schema.types';

// ============================================================
// example-app utils
// Helper functions for mock data generation
// ============================================================

// ─── Text Value Generator ─────────────────────────────────
const NAME_MAP: Record<string, string[]> = {
  username: [
    'admin',
    'john_doe',
    'jane_smith',
    'viewer01',
    'developer',
    'tester',
    'manager',
    'analyst',
  ],
  email: ['admin@example.com', 'john@test.com', 'jane@demo.com', 'user@corp.com'],
  name: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Food', 'Health'],
  product_name: [
    'Laptop Pro',
    'Wireless Mouse',
    'USB-C Hub',
    'Monitor 27"',
    'Keyboard',
    'Webcam',
    'Headset',
  ],
  order_number: [],
  slug: [],
  description: ['A great product', 'Best seller item', 'New arrival', 'Limited edition'],
  notes: ['Rush delivery', 'Gift wrap', 'Handle with care', ''],
};

export function generateTextValue(fieldName: string, index: number): string {
  if (fieldName === 'order_number') {
    return `ORD-${String(1000 + index).padStart(6, '0')}`;
  }
  if (fieldName === 'slug') {
    return `item-${index}`;
  }
  const matches = NAME_MAP[fieldName];
  if (matches && matches.length > 0) {
    return matches[index % matches.length];
  }
  return `${fieldName}_${index}`;
}

// ─── Mock Data Generator ──────────────────────────────────
export function generateMockData(schema: EntitySchema, count: number): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];

  for (let i = 1; i <= count; i++) {
    const row: Record<string, unknown> = {};

    for (const field of schema.fields) {
      if (field.isPrimary) {
        row[field.name] = i;
        continue;
      }

      switch (field.type) {
        case 'text':
        case 'email':
        case 'url':
        case 'phone':
        case 'textarea':
          row[field.name] = generateTextValue(field.name, i);
          break;

        case 'number':
          row[field.name] = Math.round(Math.random() * 1000 * 100) / 100;
          break;

        case 'boolean':
          row[field.name] = Math.random() > 0.3;
          break;

        case 'date':
        case 'datetime':
          row[field.name] = new Date(
            Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000),
          ).toISOString();
          break;

        case 'select':
          if (field.options?.length) {
            row[field.name] = field.options[Math.floor(Math.random() * field.options.length)].value;
          }
          break;

        case 'relation':
          if (field.relation?.type === 'ManyToOne') {
            row[field.name] = Math.floor(Math.random() * 10) + 1;
          } else if (field.relation?.type === 'ManyToMany') {
            row[field.name] = [1, 2, 3].slice(0, Math.floor(Math.random() * 3) + 1);
          }
          break;

        case 'json':
          row[field.name] = JSON.stringify({ key: `value_${i}` });
          break;

        default:
          row[field.name] = `${field.name}_${i}`;
      }
    }

    rows.push(row);
  }

  return rows;
}

// ─── Generate Relation Options from Schema ────────────────
export function generateRelationOptions(
  schema: EntitySchema,
  schemaRegistry: Record<string, EntitySchema>,
): Record<string, Array<{ label: string; value: string | number }>> {
  const opts: Record<string, Array<{ label: string; value: string | number }>> = {};

  for (const field of schema.fields) {
    if (field.type === 'relation' && field.relation) {
      const target = schemaRegistry[field.relation.target];
      if (target) {
        const mockTargetData = generateMockData(target, 8);
        opts[field.name] = mockTargetData.map((row) => ({
          label: String(row[target.displayField ?? 'name'] ?? row.id),
          value: row.id as number,
        }));
      }
    }
  }

  return opts;
}
