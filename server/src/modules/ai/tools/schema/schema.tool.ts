import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../core/database/database.service';
import { FileTool } from '../file/file.tool';

// ============================================================
// Schema Tool
// Đọc DB schema qua DatabaseService hoặc Prisma schema
// ============================================================
@Injectable()
export class SchemaTool {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly fileTool: FileTool,
  ) {}

  /**
   * Get list of tables from a database connection
   */
  async getTables(connectionId: string): Promise<string[]> {
    return this.dbService.getTables(connectionId);
  }

  /**
   * Get column/relation schema of a table
   */
  async getTableSchema(connectionId: string, tableName: string) {
    return this.dbService.getTableSchema(connectionId, tableName);
  }

  /**
   * Read Prisma schema file if it exists
   */
  async readPrismaSchema(): Promise<string | null> {
    try {
      return await this.fileTool.readFile('prisma/schema.prisma');
    } catch {
      return null;
    }
  }

  /**
   * Parse Prisma schema into model definitions
   */
  parsePrismaModels(
    schemaContent: string,
  ): Array<{ name: string; fields: Array<{ name: string; type: string; isRequired: boolean }> }> {
    const models: any[] = [];
    const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
    let match: RegExpExecArray | null;

    while ((match = modelRegex.exec(schemaContent)) !== null) {
      const [, name, body] = match;
      const fields = body
        .trim()
        .split('\n')
        .filter((line) => line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('@@'))
        .map((line) => {
          const parts = line.trim().split(/\s+/);
          const fieldName = parts[0];
          const rawType = parts[1] || 'String';
          const isRequired = !rawType.endsWith('?');
          const type = rawType.replace('?', '').replace('[]', '');
          return { name: fieldName, type, isRequired };
        });
      models.push({ name, fields });
    }

    return models;
  }
}
