import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CrudService } from './crud.service';
import { RoleGuard } from '../../core/guards/role.guard';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';

@Controller('crud')
@UseInterceptors(AuditInterceptor)
export class CrudController {
  constructor(private readonly crudService: CrudService) {}

  /**
   * GET /api/crud/:connectionId/:entity
   * Lấy danh sách với pagination, sort, filter
   */
  @Get(':connectionId/:entity')
  async findAll(
    @Param('connectionId') connectionId: string,
    @Param('entity') entity: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('sortField') sortField?: string,
    @Query('sortDirection') sortDirection?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('filters') filters?: string,
  ) {
    return this.crudService.findAll(connectionId, entity, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sortField ? { field: sortField, direction: sortDirection || 'ASC' } : undefined,
      search,
      filters: filters ? JSON.parse(filters) : undefined,
    });
  }

  /**
   * GET /api/crud/:connectionId/:entity/:id
   * Lấy 1 record theo ID
   */
  @Get(':connectionId/:entity/:id')
  async findById(
    @Param('connectionId') connectionId: string,
    @Param('entity') entity: string,
    @Param('id') id: string,
  ) {
    return this.crudService.findById(connectionId, entity, id);
  }

  /**
   * POST /api/crud/:connectionId/:entity
   * Tạo record mới
   */
  @Post(':connectionId/:entity')
  async create(
    @Param('connectionId') connectionId: string,
    @Param('entity') entity: string,
    @Body() data: Record<string, any>,
  ) {
    return this.crudService.create(connectionId, entity, data);
  }

  /**
   * PUT /api/crud/:connectionId/:entity/:id
   * Cập nhật record
   */
  @Put(':connectionId/:entity/:id')
  async update(
    @Param('connectionId') connectionId: string,
    @Param('entity') entity: string,
    @Param('id') id: string,
    @Body() data: Record<string, any>,
  ) {
    return this.crudService.update(connectionId, entity, id, data);
  }

  /**
   * DELETE /api/crud/:connectionId/:entity/:id
   * Xóa record
   */
  @Delete(':connectionId/:entity/:id')
  async remove(
    @Param('connectionId') connectionId: string,
    @Param('entity') entity: string,
    @Param('id') id: string,
  ) {
    return this.crudService.remove(connectionId, entity, id);
  }

  /**
   * POST /api/crud/:connectionId/:entity/bulk-delete
   * Xóa nhiều record
   */
  @Post(':connectionId/:entity/bulk-delete')
  async bulkDelete(
    @Param('connectionId') connectionId: string,
    @Param('entity') entity: string,
    @Body() body: { ids: string[] },
  ) {
    return this.crudService.bulkDelete(connectionId, entity, body.ids);
  }
}
