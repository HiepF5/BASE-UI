// ============================================================
// Relation Parser - Parse relation paths trong filter
// ============================================================

export interface RelationPath {
  relations: string[];
  field: string;
}

/**
 * Parse field path thành relation path
 * "user.name" → { relations: ["user"], field: "name" }
 * "items.product.name" → { relations: ["items", "product"], field: "name" }
 */
export function parseRelationPath(fieldPath: string): RelationPath {
  const parts = fieldPath.split('.');

  if (parts.length === 1) {
    return { relations: [], field: parts[0] };
  }

  return {
    relations: parts.slice(0, -1),
    field: parts[parts.length - 1],
  };
}

/**
 * Build nested object từ relation path
 * Dùng để convert "user.name" thành { user: { name: value } }
 */
export function buildNested(
  field: string,
  operator: string,
  value: any,
): Record<string, any> {
  const parts = field.split('.');

  return parts.reverse().reduce(
    (acc, part) => ({ [part]: acc }),
    { [operator]: value } as any,
  );
}

/**
 * Flatten nested filter về SQL join conditions
 */
export function flattenRelationFilter(
  filter: Record<string, any>,
  parentAlias = 't0',
  depth = 0,
): { joins: string[]; conditions: string[]; params: any[] } {
  const joins: string[] = [];
  const conditions: string[] = [];
  const params: any[] = [];

  for (const [key, value] of Object.entries(filter)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Có thể là relation hoặc operation
      const isOperation = Object.keys(value).some((k) =>
        ['equals', 'gt', 'lt', 'gte', 'lte', 'contains', 'in', 'not'].includes(k),
      );

      if (isOperation) {
        // Đây là leaf condition
        for (const [op, val] of Object.entries(value)) {
          conditions.push(`${parentAlias}."${key}" ${sqlOp(op)} $${params.length + 1}`);
          params.push(val);
        }
      } else {
        // Đây là relation join
        const alias = `t${depth + 1}`;
        joins.push(`JOIN "${key}" ${alias} ON ${parentAlias}."${key}_id" = ${alias}."id"`);
        const nested = flattenRelationFilter(value, alias, depth + 1);
        joins.push(...nested.joins);
        conditions.push(...nested.conditions);
        params.push(...nested.params);
      }
    }
  }

  return { joins, conditions, params };
}

function sqlOp(op: string): string {
  const mapping: Record<string, string> = {
    equals: '=',
    not: '!=',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    contains: 'ILIKE',
    in: 'IN',
  };
  return mapping[op] || '=';
}
