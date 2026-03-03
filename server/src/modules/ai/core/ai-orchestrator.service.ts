import { Injectable, Logger } from '@nestjs/common';
import { AiContextService } from './ai-context.service';
import { AiSkill, SkillResult } from '../skills/base/ai-skill.interface';

// Import all skills
import { NestCodegenSkill } from '../skills/code-generation/nest-codegen.skill';
import { ReactCodegenSkill } from '../skills/code-generation/react-codegen.skill';
import { FormCodegenSkill } from '../skills/code-generation/form-codegen.skill';
import { ProjectAnalyzerSkill } from '../skills/project-understanding/project-analyzer.skill';
import { ApplyFileChangeSkill } from '../skills/filesystem/apply-file-change.skill';
import { AstRefactorSkill } from '../skills/ast-refactor/ast-refactor.skill';
import { SchemaUiGeneratorSkill } from '../skills/schema-aware/schema-ui-generator.skill';
import { PlanningSkill } from '../skills/planning/planning.skill';
import { DevopsGeneratorSkill } from '../skills/devops/devops-generator.skill';
import { NestDebugSkill } from '../skills/debug/nest-debug.skill';

// ============================================================
// AI Orchestrator - Chọn Skill phù hợp và thực thi
// ============================================================
@Injectable()
export class AiOrchestratorService {
  private readonly logger = new Logger(AiOrchestratorService.name);
  private skills: AiSkill[];

  constructor(
    private readonly context: AiContextService,
    private readonly nestCodegen: NestCodegenSkill,
    private readonly reactCodegen: ReactCodegenSkill,
    private readonly formCodegen: FormCodegenSkill,
    private readonly projectAnalyzer: ProjectAnalyzerSkill,
    private readonly applyFileChange: ApplyFileChangeSkill,
    private readonly astRefactor: AstRefactorSkill,
    private readonly schemaUiGenerator: SchemaUiGeneratorSkill,
    private readonly planning: PlanningSkill,
    private readonly devopsGenerator: DevopsGeneratorSkill,
    private readonly nestDebug: NestDebugSkill,
  ) {
    this.skills = [
      nestCodegen,
      reactCodegen,
      formCodegen,
      projectAnalyzer,
      applyFileChange,
      astRefactor,
      schemaUiGenerator,
      planning,
      devopsGenerator,
      nestDebug,
    ];
  }

  /**
   * Execute user request: chọn skill → plan → execute
   */
  async execute(userInput: string, preferredSkillId?: string): Promise<SkillResult> {
    this.logger.log(`Executing: "${userInput}" (preferred: ${preferredSkillId || 'auto'})`);

    // 1. Chọn skill
    const skill = preferredSkillId
      ? this.skills.find((s) => s.meta.id === preferredSkillId)
      : this.selectSkill(userInput);

    if (!skill) {
      return {
        messages: ['No suitable skill found for this request.'],
        proposedChanges: [],
        skillUsed: 'none',
      };
    }

    this.logger.log(`Selected skill: ${skill.meta.name} (${skill.meta.id})`);

    // 2. Execute với context
    const ctx = this.context.getFullContext();
    try {
      const result = await skill.execute(userInput, ctx);
      return {
        ...result,
        skillUsed: skill.meta.id,
      };
    } catch (error) {
      this.logger.error(`Skill execution failed: ${error.message}`, error.stack);
      return {
        messages: [`Error: ${error.message}`],
        proposedChanges: [],
        skillUsed: skill.meta.id,
      };
    }
  }

  /**
   * Auto-select skill dựa trên user input
   */
  private selectSkill(userInput: string): AiSkill | null {
    // Tìm skill canHandle
    for (const skill of this.skills) {
      if (skill.canHandle(userInput)) {
        return skill;
      }
    }

    // Fallback: planning skill (generic)
    return this.planning;
  }

  getAvailableSkills() {
    return this.skills.map((s) => ({
      id: s.meta.id,
      name: s.meta.name,
      group: s.meta.group,
      description: s.meta.description,
    }));
  }
}
