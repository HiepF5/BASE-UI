import { Controller, Get, Param } from '@nestjs/common';
import { SchemaService } from './schema.service';

@Controller('schema')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  /**
   * GET /api/schema/:connectionId/tables
   * Lấy danh sách tất cả tables
   */
  @Get(':connectionId/tables')
  async getTables(@Param('connectionId') connectionId: string) {
    return this.schemaService.getTables(connectionId);
  }

  /**
   * GET /api/schema/:connectionId/:table
   * Lấy schema chi tiết của 1 table (columns + relations)
   */
  @Get(':connectionId/:table')
  async getTableSchema(
    @Param('connectionId') connectionId: string,
    @Param('table') table: string,
  ) {
    return this.schemaService.getTableSchema(connectionId, table);
  }

  /**
   * GET /api/schema/:connectionId/:table/relations
   * Lấy relation metadata của table
   */
  @Get(':connectionId/:table/relations')
  async getRelations(
    @Param('connectionId') connectionId: string,
    @Param('table') table: string,
  ) {
    return this.schemaService.getRelations(connectionId, table);
  }
}
