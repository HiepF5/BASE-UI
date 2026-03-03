import { FilterNode } from './filter.types';
import { FilterParser } from './filter.parser';

// ============================================================
// ORM Adapter - Convert parsed filter thành SQL
// ============================================================
export class OrmAdapter {
  /**
   * Convert Filter AST thành SQL WHERE clause (Postgres style)
   */
  static toSQL(
    filterNode: FilterNode,
    startParam = 1,
  ): { sql: string; params: any[]; nextParam: number } {
    const params: any[] = [];
    let paramIndex = startParam;

    const sql = buildSQL(filterNode, params, { current: paramIndex });
    paramIndex = params.length + startParam;

    return { sql, params, nextParam: paramIndex };
  }

  /**
   * Convert Filter AST thành Prisma where object
   */
  static toPrisma(filterNode: FilterNode): Record<string, any> {
    return FilterParser.parse(filterNode);
  }
}

function buildSQL(
  node: FilterNode,
  params: any[],
  paramCounter: { current: number },
): string {
  if (node.type === 'group') {
    const children = node.children
      .map((child) => buildSQL(child, params, paramCounter))
      .filter(Boolean);
    if (children.length === 0) return '';
    return `(${children.join(` ${node.operator} `)})`;
  }

  if (node.type === 'condition') {
    const { field, operator, value } = node;
    const sqlOperator = mapToSQLOperator(operator);

    if (operator === 'isNull') {
      return `"${field}" IS NULL`;
    }
    if (operator === 'isNotNull') {
      return `"${field}" IS NOT NULL`;
    }
    if (operator === 'in' || operator === 'notIn') {
      const placeholders = (value as any[])
        .map(() => {
          params.push(value);
          return `$${paramCounter.current++}`;
        });
      const not = operator === 'notIn' ? 'NOT ' : '';
      return `"${field}" ${not}IN (${placeholders.join(', ')})`;
    }
    if (operator === 'between') {
      params.push(value[0], value[1]);
      const p1 = `$${paramCounter.current++}`;
      const p2 = `$${paramCounter.current++}`;
      return `"${field}" BETWEEN ${p1} AND ${p2}`;
    }
    if (operator === 'contains') {
      params.push(`%${value}%`);
      return `"${field}" ILIKE $${paramCounter.current++}`;
    }
    if (operator === 'startsWith') {
      params.push(`${value}%`);
      return `"${field}" ILIKE $${paramCounter.current++}`;
    }
    if (operator === 'endsWith') {
      params.push(`%${value}`);
      return `"${field}" ILIKE $${paramCounter.current++}`;
    }

    params.push(value);
    return `"${field}" ${sqlOperator} $${paramCounter.current++}`;
  }

  return '';
}

function mapToSQLOperator(op: string): string {
  const mapping: Record<string, string> = {
    eq: '=',
    neq: '!=',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    before: '<',
    after: '>',
  };
  return mapping[op] || '=';
}
