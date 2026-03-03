import { Injectable } from '@nestjs/common';
import { AiSkill, SkillMeta, SkillResult } from '../base/ai-skill.interface';
import { ProjectContext } from '../../core/ai-context.service';
import { LlmProvider } from '../../core/llm/llm.provider';

// ============================================================
// Generic Planner Skill
// Biến yêu cầu lớn thành plan nhiều bước
// ============================================================
@Injectable()
export class PlanningSkill implements AiSkill {
  meta: SkillMeta = {
    id: 'planning.generic',
    name: 'Generic Planner',
    group: 'planning',
    description: 'Break down complex requests into actionable step-by-step plans',
  };

  constructor(private readonly llm: LlmProvider) {}

  canHandle(userInput: string): boolean {
    const keywords = ['plan', 'kế hoạch', 'design', 'thiết kế', 'how to', 'làm thế nào'];
    return keywords.some((kw) => userInput.toLowerCase().includes(kw));
  }

  async execute(userInput: string, context: ProjectContext): Promise<SkillResult> {
    // Generate a plan based on user input
    const plan = this.generatePlan(userInput);

    return {
      messages: [
        `Generated plan for: "${userInput}"`,
        ...plan.map((step, i) => `${i + 1}. [${step.skillId}] ${step.description}`),
      ],
      proposedChanges: [],
      skillUsed: this.meta.id,
      plan: plan.map((s) => s.description),
    };
  }

  private generatePlan(
    userInput: string,
  ): Array<{ step: number; description: string; skillId: string; complexity: string }> {
    const lower = userInput.toLowerCase();

    // Simple rule-based planning - production nên dùng LLM
    if (lower.includes('auth') || lower.includes('jwt') || lower.includes('login')) {
      return [
        { step: 1, description: 'Install auth packages (jwt, passport)', skillId: 'tool.exec', complexity: 'low' },
        { step: 2, description: 'Create AuthModule + AuthService', skillId: 'codegen.nest.crud', complexity: 'medium' },
        { step: 3, description: 'Create JwtStrategy', skillId: 'codegen.nest.crud', complexity: 'medium' },
        { step: 4, description: 'Update AppModule imports', skillId: 'refactor.ast', complexity: 'low' },
        { step: 5, description: 'Create login endpoint', skillId: 'codegen.nest.crud', complexity: 'low' },
        { step: 6, description: 'Add RoleGuard', skillId: 'codegen.nest.crud', complexity: 'medium' },
        { step: 7, description: 'Create frontend login page', skillId: 'codegen.react.page', complexity: 'medium' },
      ];
    }

    if (lower.includes('crud') || lower.includes('module')) {
      return [
        { step: 1, description: 'Create NestJS CRUD module', skillId: 'codegen.nest.crud', complexity: 'medium' },
        { step: 2, description: 'Create React page + hooks', skillId: 'codegen.react.page', complexity: 'medium' },
        { step: 3, description: 'Add entity config', skillId: 'fs.apply-change', complexity: 'low' },
        { step: 4, description: 'Update routing', skillId: 'refactor.ast', complexity: 'low' },
      ];
    }

    // Generic plan
    return [
      { step: 1, description: 'Analyze project structure', skillId: 'project.analyzer', complexity: 'low' },
      { step: 2, description: 'Create backend implementation', skillId: 'codegen.nest.crud', complexity: 'medium' },
      { step: 3, description: 'Create frontend implementation', skillId: 'codegen.react.page', complexity: 'medium' },
      { step: 4, description: 'Run tests', skillId: 'tool.test', complexity: 'low' },
    ];
  }
}
