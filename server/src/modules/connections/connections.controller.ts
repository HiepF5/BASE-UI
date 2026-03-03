import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { DBConfig } from '../../core/database/types/db.types';

@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  /**
   * GET /api/connections
   * Lấy danh sách connections
   */
  @Get()
  listConnections() {
    return this.connectionsService.listConnections();
  }

  /**
   * POST /api/connections
   * Tạo connection mới
   */
  @Post()
  async createConnection(@Body() body: { name: string; config: DBConfig }) {
    return this.connectionsService.createConnection(body.name, body.config);
  }

  /**
   * POST /api/connections/test
   * Test connection
   */
  @Post('test')
  async testConnection(@Body() config: DBConfig) {
    return this.connectionsService.testConnection(config);
  }

  /**
   * POST /api/connections/:id/connect
   * Kết nối đến DB
   */
  @Post(':id/connect')
  async connect(@Param('id') id: string) {
    return this.connectionsService.connect(id);
  }

  /**
   * Delete /api/connections/:id
   * Xóa connection
   */
  @Delete(':id')
  async deleteConnection(@Param('id') id: string) {
    return this.connectionsService.deleteConnection(id);
  }
}
