import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { QueryOptions } from '../../core/database/types/db.types';
import { EntitiesConfig } from '../../config/entities.config';

@Injectable()
export class CrudService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Validate entity có được phép truy cập không (whitelist)
   */
  private validateEntity(entity: string): void {
    const config = EntitiesConfig[entity];
    if (!config) {
      throw new BadRequestException(`Entity "${entity}" is not allowed.`);
    }
  }

  async findAll(connectionId: string, entity: string, options: QueryOptions) {
    this.validateEntity(entity);

    const config = EntitiesConfig[entity];
    const searchFields = config?.columns
      ?.filter((col) => col.searchable)
      ?.map((col) => col.key);

    return this.databaseService.findAll(connectionId, entity, {
      ...options,
      searchFields,
    });
  }

  async findById(connectionId: string, entity: string, id: string) {
    this.validateEntity(entity);
    const primaryKey = await this.databaseService.getPrimaryKey(connectionId, entity);
    const record = await this.databaseService.findById(connectionId, entity, id, primaryKey);

    if (!record) {
      throw new NotFoundException(`Record not found: ${entity}/${id}`);
    }
    return record;
  }

  async create(connectionId: string, entity: string, data: Record<string, any>) {
    this.validateEntity(entity);
    const config = EntitiesConfig[entity];

    if (!config?.permissions?.create) {
      throw new BadRequestException(`Create is not allowed for entity "${entity}"`);
    }

    return this.databaseService.insert(connectionId, entity, data);
  }

  async update(connectionId: string, entity: string, id: string, data: Record<string, any>) {
    this.validateEntity(entity);
    const config = EntitiesConfig[entity];

    if (!config?.permissions?.update) {
      throw new BadRequestException(`Update is not allowed for entity "${entity}"`);
    }

    const primaryKey = await this.databaseService.getPrimaryKey(connectionId, entity);
    return this.databaseService.update(connectionId, entity, id, data, primaryKey);
  }

  async remove(connectionId: string, entity: string, id: string) {
    this.validateEntity(entity);
    const config = EntitiesConfig[entity];

    if (!config?.permissions?.delete) {
      throw new BadRequestException(`Delete is not allowed for entity "${entity}"`);
    }

    const primaryKey = await this.databaseService.getPrimaryKey(connectionId, entity);
    await this.databaseService.delete(connectionId, entity, id, primaryKey);
    return { success: true, message: `Deleted ${entity}/${id}` };
  }

  async bulkDelete(connectionId: string, entity: string, ids: string[]) {
    this.validateEntity(entity);
    const config = EntitiesConfig[entity];

    if (!config?.permissions?.delete) {
      throw new BadRequestException(`Delete is not allowed for entity "${entity}"`);
    }

    const primaryKey = await this.databaseService.getPrimaryKey(connectionId, entity);

    for (const id of ids) {
      await this.databaseService.delete(connectionId, entity, id, primaryKey);
    }

    return { success: true, message: `Deleted ${ids.length} records from ${entity}` };
  }
}
