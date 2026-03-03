import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DatabaseAdapter } from './adapters/database-adapter.interface';
import { AdapterFactory } from './factories/adapter.factory';
import {
  DBConfig,
  ColumnSchema,
  QueryOptions,
  PaginationResult,
} from './types/db.types';

// ============================================================
// DatabaseService - High-level service quản lý connections
// Multi-connection ready (connectionId → adapter)
// ============================================================
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private adapters: Map<string, DatabaseAdapter> = new Map();
  private configs: Map<string, DBConfig> = new Map();

  async onModuleDestroy() {
    for (const [, adapter] of this.adapters) {
      await adapter.disconnect();
    }
    this.adapters.clear();
  }

  /**
   * Tạo và lưu connection mới
   */
  async connect(connectionId: string, config: DBConfig): Promise<void> {
    if (this.adapters.has(connectionId)) {
      await this.adapters.get(connectionId).disconnect();
    }

    const adapter = AdapterFactory.create(config);
    await adapter.connect(config);

    this.adapters.set(connectionId, adapter);
    this.configs.set(connectionId, config);
  }

  /**
   * Test connection mà không lưu
   */
  async testConnection(config: DBConfig): Promise<boolean> {
    const adapter = AdapterFactory.create(config);
    try {
      await adapter.connect(config);
      await adapter.disconnect();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Disconnect một connection
   */
  async disconnect(connectionId: string): Promise<void> {
    const adapter = this.adapters.get(connectionId);
    if (adapter) {
      await adapter.disconnect();
      this.adapters.delete(connectionId);
      this.configs.delete(connectionId);
    }
  }

  /**
   * Lấy adapter theo connectionId
   */
  getAdapter(connectionId: string): DatabaseAdapter {
    const adapter = this.adapters.get(connectionId);
    if (!adapter) {
      throw new Error(`Connection "${connectionId}" not found. Please connect first.`);
    }
    return adapter;
  }

  // ========= Proxy methods =========

  async getTables(connectionId: string): Promise<string[]> {
    return this.getAdapter(connectionId).getTables();
  }

  async getSchema(connectionId: string, table: string): Promise<ColumnSchema[]> {
    return this.getAdapter(connectionId).getSchema(table);
  }

  async getPrimaryKey(connectionId: string, table: string): Promise<string> {
    return this.getAdapter(connectionId).getPrimaryKey(table);
  }

  async getForeignKeys(connectionId: string, table: string) {
    return this.getAdapter(connectionId).getForeignKeys(table);
  }

  async findAll(connectionId: string, table: string, options: QueryOptions): Promise<PaginationResult<any>> {
    return this.getAdapter(connectionId).findAll(table, options);
  }

  async findById(connectionId: string, table: string, id: any, primaryKey: string): Promise<any> {
    return this.getAdapter(connectionId).findById(table, id, primaryKey);
  }

  async insert(connectionId: string, table: string, data: Record<string, any>): Promise<any> {
    return this.getAdapter(connectionId).insert(table, data);
  }

  async update(connectionId: string, table: string, id: any, data: Record<string, any>, primaryKey: string): Promise<any> {
    return this.getAdapter(connectionId).update(table, id, data, primaryKey);
  }

  async delete(connectionId: string, table: string, id: any, primaryKey: string): Promise<void> {
    return this.getAdapter(connectionId).delete(table, id, primaryKey);
  }

  async executeRaw(connectionId: string, sql: string, params?: any[]): Promise<any> {
    return this.getAdapter(connectionId).executeRaw(sql, params);
  }

  async beginTransaction(connectionId: string): Promise<void> {
    return this.getAdapter(connectionId).beginTransaction();
  }

  async commit(connectionId: string): Promise<void> {
    return this.getAdapter(connectionId).commit();
  }

  async rollback(connectionId: string): Promise<void> {
    return this.getAdapter(connectionId).rollback();
  }
}
