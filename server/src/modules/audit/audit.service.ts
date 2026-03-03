import { Injectable, Logger } from '@nestjs/common';

export interface AuditLogEntry {
  entity: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  beforeData?: Record<string, any>;
  afterData?: Record<string, any>;
  userId: string;
  createdAt: Date;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private logs: AuditLogEntry[] = [];

  log(entry: AuditLogEntry): void {
    this.logs.push(entry);
    this.logger.log(
      `[AUDIT] ${entry.action} on ${entry.entity} by user ${entry.userId}`,
    );
  }

  getAll(): AuditLogEntry[] {
    return this.logs;
  }

  getByEntity(entity: string): AuditLogEntry[] {
    return this.logs.filter((l) => l.entity === entity);
  }
}
