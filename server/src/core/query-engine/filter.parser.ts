import { FilterNode, FilterGroup, FilterCondition } from './filter.types';

// ============================================================
// Filter Parser - Parse Filter AST thành query representation
// ============================================================
export class FilterParser {
  /**
   * Parse FilterNode AST thành object representation
   * Dùng cho ORM adapter convert sang SQL / Prisma / TypeORM
   */
  static parse(node: FilterNode): any {
    if (node.type === 'group') {
      return this.parseGroup(node as FilterGroup);
    }
    return this.parseCondition(node as FilterCondition);
  }

  private static parseGroup(group: FilterGroup): any {
    const children = group.children.map((child) => this.parse(child));
    return {
      [group.operator]: children,
    };
  }

  private static parseCondition(condition: FilterCondition): any {
    const { field, operator, value } = condition;

    // Handle nested relation field (e.g., "user.name")
    if (field.includes('.')) {
      return buildNestedFilter(field, operator, value);
    }

    return {
      [field]: {
        [mapOperator(operator)]: prepareValue(operator, value),
      },
    };
  }
}

/**
 * Build nested filter cho relation path
 * "user.name" → { user: { name: { contains: "value" } } }
 */
function buildNestedFilter(field: string, operator: string, value: any): any {
  const parts = field.split('.');
  const leaf = {
    [mapOperator(operator)]: prepareValue(operator, value),
  };

  return parts.reduceRight((acc, part, index) => {
    if (index === parts.length - 1) {
      return { [part]: acc };
    }
    return { [part]: acc };
  }, leaf as any);
}

/**
 * Map frontend operator sang query operator
 */
function mapOperator(op: string): string {
  const mapping: Record<string, string> = {
    eq: 'equals',
    neq: 'not',
    gt: 'gt',
    gte: 'gte',
    lt: 'lt',
    lte: 'lte',
    contains: 'contains',
    startsWith: 'startsWith',
    endsWith: 'endsWith',
    in: 'in',
    notIn: 'notIn',
    isNull: 'equals',
    isNotNull: 'not',
    between: 'between',
    before: 'lt',
    after: 'gt',
  };
  return mapping[op] || 'equals';
}

/**
 * Prepare value dựa theo operator
 */
function prepareValue(operator: string, value: any): any {
  switch (operator) {
    case 'isNull':
      return null;
    case 'isNotNull':
      return null;
    case 'contains':
      return `%${value}%`;
    case 'startsWith':
      return `${value}%`;
    case 'endsWith':
      return `%${value}`;
    default:
      return value;
  }
}
