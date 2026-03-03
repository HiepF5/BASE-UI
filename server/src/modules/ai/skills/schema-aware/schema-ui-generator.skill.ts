import { Injectable } from '@nestjs/common';
import { AiSkill, SkillMeta, SkillResult } from '../base/ai-skill.interface';
import { ProjectContext } from '../../core/ai-context.service';
import { LlmProvider } from '../../core/llm/llm.provider';
import { SchemaTool } from '../../tools/schema/schema.tool';
import { FileTool } from '../../tools/file/file.tool';

// ============================================================
// Schema Aware UI Generator Skill
// Đọc DB schema → generate API + UI CRUD
// ============================================================
@Injectable()
export class SchemaUiGeneratorSkill implements AiSkill {
  meta: SkillMeta = {
    id: 'schema.ui-generator',
    name: 'Schema Aware UI Generator',
    group: 'schema-aware',
    description: 'Read DB schema and generate both API endpoints and UI components',
  };

  constructor(
    private readonly llm: LlmProvider,
    private readonly schemaTool: SchemaTool,
    private readonly fileTool: FileTool,
  ) {}

  canHandle(userInput: string): boolean {
    const keywords = ['schema', 'database', 'db', 'generate from', 'từ db', 'từ schema'];
    return keywords.some((kw) => userInput.toLowerCase().includes(kw));
  }

  async execute(userInput: string, context: ProjectContext): Promise<SkillResult> {
    // In production: read actual DB schema and generate
    return {
      messages: [
        'Schema UI Generator activated.',
        'This skill reads DB schema and generates:',
        '- NestJS CRUD module (controller + service + dto)',
        '- React page with DynamicCrudPage',
        '- Entity config for metadata-driven UI',
        'Provide connection ID and table name to proceed.',
      ],
      proposedChanges: [],
      skillUsed: this.meta.id,
    };
  }
}
