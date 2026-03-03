import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiOrchestratorService } from './core/ai-orchestrator.service';
import { AiContextService } from './core/ai-context.service';
import { LlmProvider } from './core/llm/llm.provider';

// Skills
import { NestCodegenSkill } from './skills/code-generation/nest-codegen.skill';
import { ReactCodegenSkill } from './skills/code-generation/react-codegen.skill';
import { FormCodegenSkill } from './skills/code-generation/form-codegen.skill';
import { ProjectAnalyzerSkill } from './skills/project-understanding/project-analyzer.skill';
import { ApplyFileChangeSkill } from './skills/filesystem/apply-file-change.skill';
import { AstRefactorSkill } from './skills/ast-refactor/ast-refactor.skill';
import { SchemaUiGeneratorSkill } from './skills/schema-aware/schema-ui-generator.skill';
import { PlanningSkill } from './skills/planning/planning.skill';
import { DevopsGeneratorSkill } from './skills/devops/devops-generator.skill';
import { NestDebugSkill } from './skills/debug/nest-debug.skill';

// Tools
import { FileTool } from './tools/file/file.tool';
import { GitTool } from './tools/git/git.tool';
import { ExecTool } from './tools/exec/exec.tool';
import { SchemaTool } from './tools/schema/schema.tool';
import { TestTool } from './tools/test/test.tool';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    AiOrchestratorService,
    AiContextService,
    LlmProvider,
    // Tools
    FileTool,
    GitTool,
    ExecTool,
    SchemaTool,
    TestTool,
    // Skills
    NestCodegenSkill,
    ReactCodegenSkill,
    FormCodegenSkill,
    ProjectAnalyzerSkill,
    ApplyFileChangeSkill,
    AstRefactorSkill,
    SchemaUiGeneratorSkill,
    PlanningSkill,
    DevopsGeneratorSkill,
    NestDebugSkill,
  ],
  exports: [AiService],
})
export class AiModule {}
