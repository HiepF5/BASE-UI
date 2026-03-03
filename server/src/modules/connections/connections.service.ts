import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { DBConfig } from '../../core/database/types/db.types';
import * as crypto from 'crypto';

interface StoredConnection {
  id: string;
  name: string;
  config: DBConfig;
  connected: boolean;
  createdAt: Date;
}

@Injectable()
export class ConnectionsService {
  // In-memory storage - production nên dùng DB + encrypt password
  private connections: Map<string, StoredConnection> = new Map();

  constructor(private readonly databaseService: DatabaseService) {}

  listConnections() {
    return Array.from(this.connections.values()).map((conn) => ({
      id: conn.id,
      name: conn.name,
      type: conn.config.type,
      host: conn.config.host,
      port: conn.config.port,
      database: conn.config.database,
      connected: conn.connected,
      createdAt: conn.createdAt,
    }));
  }

  async createConnection(name: string, config: DBConfig) {
    const id = crypto.randomUUID();

    this.connections.set(id, {
      id,
      name,
      config,
      connected: false,
      createdAt: new Date(),
    });

    return { id, name, type: config.type };
  }

  async testConnection(config: DBConfig) {
    const success = await this.databaseService.testConnection(config);
    return { success, message: success ? 'Connection successful' : 'Connection failed' };
  }

  async connect(id: string) {
    const conn = this.connections.get(id);
    if (!conn) {
      throw new NotFoundException(`Connection "${id}" not found`);
    }

    await this.databaseService.connect(id, conn.config);
    conn.connected = true;

    return { success: true, message: `Connected to ${conn.name}` };
  }

  async deleteConnection(id: string) {
    const conn = this.connections.get(id);
    if (!conn) {
      throw new NotFoundException(`Connection "${id}" not found`);
    }

    if (conn.connected) {
      await this.databaseService.disconnect(id);
    }
    this.connections.delete(id);

    return { success: true };
  }
}
