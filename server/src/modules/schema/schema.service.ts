import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import {
  TableSchema,
  RelationSchema,
} from '../../core/database/types/db.types';

@Injectable()
export class SchemaService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getTables(connectionId: string): Promise<string[]> {
    return this.databaseService.getTables(connectionId);
  }

  async getTableSchema(connectionId: string, table: string): Promise<TableSchema> {
    const [columns, foreignKeys, primaryKey] = await Promise.all([
      this.databaseService.getSchema(connectionId, table),
      this.databaseService.getForeignKeys(connectionId, table),
      this.databaseService.getPrimaryKey(connectionId, table),
    ]);

    // Enrich columns with FK info
    const enrichedColumns = columns.map((col) => {
      const fk = foreignKeys.find((f) => f.column === col.name);
      return {
        ...col,
        foreignKey: fk ? { table: fk.foreignTable, column: fk.foreignColumn } : undefined,
      };
    });

    // Build relations from FK
    const relations: RelationSchema[] = foreignKeys.map((fk) => ({
      name: fk.foreignTable,
      type: 'ManyToOne' as const,
      target: fk.foreignTable,
      foreignKey: fk.column,
      displayField: 'name', // Default, should be configurable
    }));

    return {
      name: table,
      columns: enrichedColumns,
      relations,
      primaryKey,
    };
  }

  async getRelations(connectionId: string, table: string): Promise<RelationSchema[]> {
    const foreignKeys = await this.databaseService.getForeignKeys(connectionId, table);

    // ManyToOne relations (table has FK)
    const manyToOneRelations: RelationSchema[] = foreignKeys.map((fk) => ({
      name: fk.foreignTable,
      type: 'ManyToOne' as const,
      target: fk.foreignTable,
      foreignKey: fk.column,
    }));

    // OneToMany relations (other tables reference this table)
    // This requires scanning all tables - simplified version
    const allTables = await this.databaseService.getTables(connectionId);
    const oneToManyRelations: RelationSchema[] = [];

    for (const otherTable of allTables) {
      if (otherTable === table) continue;
      const otherFKs = await this.databaseService.getForeignKeys(connectionId, otherTable);
      const referencingFKs = otherFKs.filter((fk) => fk.foreignTable === table);

      for (const fk of referencingFKs) {
        oneToManyRelations.push({
          name: otherTable,
          type: 'OneToMany' as const,
          target: otherTable,
          foreignKey: fk.column,
        });
      }
    }

    return [...manyToOneRelations, ...oneToManyRelations];
  }
}
