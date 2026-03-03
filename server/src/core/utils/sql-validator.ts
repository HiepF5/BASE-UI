/**
 * SQL Validator - Security utility
 * Block các SQL nguy hiểm trước khi execute
 */
export class SqlValidator {
  private static readonly FORBIDDEN_KEYWORDS = [
    'DROP',
    'TRUNCATE',
    'ALTER',
    'CREATE DATABASE',
    'DROP DATABASE',
  ];

  /**
   * Validate SQL string, throw nếu phát hiện từ khóa nguy hiểm
   */
  static validate(sql: string): void {
    const upperSQL = sql.toUpperCase().trim();

    for (const keyword of this.FORBIDDEN_KEYWORDS) {
      if (upperSQL.includes(keyword)) {
        throw new Error(`Forbidden SQL operation detected: ${keyword}`);
      }
    }

    // Block DELETE without WHERE
    if (upperSQL.startsWith('DELETE') && !upperSQL.includes('WHERE')) {
      throw new Error('DELETE without WHERE clause is not allowed');
    }

    // Block UPDATE without WHERE
    if (upperSQL.startsWith('UPDATE') && !upperSQL.includes('WHERE')) {
      throw new Error('UPDATE without WHERE clause is not allowed');
    }
  }

  /**
   * Sanitize table/column name - chỉ cho phép alphanumeric + underscore
   */
  static sanitizeIdentifier(name: string): string {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      throw new Error(`Invalid identifier: ${name}`);
    }
    return name;
  }
}
