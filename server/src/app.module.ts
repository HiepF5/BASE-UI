import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SchemaModule } from './modules/schema/schema.module';
import { CrudModule } from './modules/crud/crud.module';
import { AuditModule } from './modules/audit/audit.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    SchemaModule,
    CrudModule,
    AuditModule,
    ConnectionsModule,
    AiModule,
  ],
})
export class AppModule {}
