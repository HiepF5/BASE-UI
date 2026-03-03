import { Injectable } from '@nestjs/common';
import { AiSkill, SkillMeta, SkillResult } from '../base/ai-skill.interface';
import { ProjectContext } from '../../core/ai-context.service';
import { LlmProvider } from '../../core/llm/llm.provider';
import { FileTool } from '../../tools/file/file.tool';
import { CODEGEN_SYSTEM_PROMPT } from '../../core/llm/prompts/codegen.prompt';

// ============================================================
// NestJS CRUD Generator Skill
// Sinh module CRUD NestJS từ mô tả tự nhiên
// ============================================================
@Injectable()
export class NestCodegenSkill implements AiSkill {
  meta: SkillMeta = {
    id: 'codegen.nest.crud',
    name: 'NestJS CRUD Generator',
    group: 'code-generation',
    description: 'Generate NestJS CRUD module (module + controller + service + dto + entity)',
  };

  constructor(
    private readonly llm: LlmProvider,
    private readonly fileTool: FileTool,
  ) {}

  canHandle(userInput: string): boolean {
    const keywords = ['nest', 'api', 'crud', 'module', 'endpoint', 'backend', 'controller', 'service'];
    const lower = userInput.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  }

  async execute(userInput: string, context: ProjectContext): Promise<SkillResult> {
    const moduleName = this.extractModuleName(userInput);
    const moduleDir = `src/modules/${moduleName}`;

    // Generate module files
    const moduleContent = this.generateModule(moduleName);
    const controllerContent = this.generateController(moduleName);
    const serviceContent = this.generateService(moduleName);
    const dtoContent = this.generateDto(moduleName);

    return {
      messages: [
        `Generated NestJS CRUD module: ${moduleName}`,
        `Files: module, controller, service, dto`,
      ],
      proposedChanges: [
        {
          filePath: `${moduleDir}/${moduleName}.module.ts`,
          action: 'create',
          content: moduleContent,
        },
        {
          filePath: `${moduleDir}/${moduleName}.controller.ts`,
          action: 'create',
          content: controllerContent,
        },
        {
          filePath: `${moduleDir}/${moduleName}.service.ts`,
          action: 'create',
          content: serviceContent,
        },
        {
          filePath: `${moduleDir}/dto/create-${moduleName}.dto.ts`,
          action: 'create',
          content: dtoContent,
        },
      ],
      skillUsed: this.meta.id,
    };
  }

  private extractModuleName(userInput: string): string {
    // Simple extraction - production nên dùng LLM
    const words = userInput.toLowerCase().split(/\s+/);
    const keywords = ['tạo', 'create', 'generate', 'api', 'module', 'crud', 'quản lý', 'manage'];
    const filtered = words.filter((w) => !keywords.includes(w) && w.length > 2);
    return filtered[0] || 'entity';
  }

  private generateModule(name: string): string {
    const pascal = this.toPascalCase(name);
    return `import { Module } from '@nestjs/common';
import { ${pascal}Controller } from './${name}.controller';
import { ${pascal}Service } from './${name}.service';

@Module({
  controllers: [${pascal}Controller],
  providers: [${pascal}Service],
  exports: [${pascal}Service],
})
export class ${pascal}Module {}
`;
  }

  private generateController(name: string): string {
    const pascal = this.toPascalCase(name);
    return `import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ${pascal}Service } from './${name}.service';
import { Create${pascal}Dto } from './dto/create-${name}.dto';

@Controller('${name}')
export class ${pascal}Controller {
  constructor(private readonly ${name}Service: ${pascal}Service) {}

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.${name}Service.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.${name}Service.findOne(id);
  }

  @Post()
  create(@Body() dto: Create${pascal}Dto) {
    return this.${name}Service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<Create${pascal}Dto>) {
    return this.${name}Service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.${name}Service.remove(id);
  }
}
`;
  }

  private generateService(name: string): string {
    const pascal = this.toPascalCase(name);
    return `import { Injectable, NotFoundException } from '@nestjs/common';
import { Create${pascal}Dto } from './dto/create-${name}.dto';

@Injectable()
export class ${pascal}Service {
  private items: any[] = [];

  findAll(page: number, limit: number) {
    const start = (page - 1) * limit;
    return {
      data: this.items.slice(start, start + limit),
      total: this.items.length,
      page,
      limit,
    };
  }

  findOne(id: string) {
    const item = this.items.find((i) => i.id === id);
    if (!item) throw new NotFoundException(\`\${id} not found\`);
    return item;
  }

  create(dto: Create${pascal}Dto) {
    const item = { id: String(Date.now()), ...dto };
    this.items.push(item);
    return item;
  }

  update(id: string, dto: Partial<Create${pascal}Dto>) {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) throw new NotFoundException(\`\${id} not found\`);
    this.items[index] = { ...this.items[index], ...dto };
    return this.items[index];
  }

  remove(id: string) {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) throw new NotFoundException(\`\${id} not found\`);
    this.items.splice(index, 1);
    return { success: true };
  }
}
`;
  }

  private generateDto(name: string): string {
    const pascal = this.toPascalCase(name);
    return `import { IsString, IsOptional } from 'class-validator';

export class Create${pascal}Dto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
`;
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('');
  }
}
