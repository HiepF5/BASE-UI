import { Injectable } from '@nestjs/common';
import { AiSkill, SkillMeta, SkillResult } from '../base/ai-skill.interface';
import { ProjectContext } from '../../core/ai-context.service';
import { FileTool } from '../../tools/file/file.tool';

// ============================================================
// Project Analyzer Skill
// Quét project, nhận diện structure + convention
// ============================================================
@Injectable()
export class ProjectAnalyzerSkill implements AiSkill {
  meta: SkillMeta = {
    id: 'project.analyzer',
    name: 'Project Analyzer',
    group: 'project-understanding',
    description: 'Analyze project structure, tech stack, and conventions',
  };

  constructor(private readonly fileTool: FileTool) {}

  canHandle(userInput: string): boolean {
    const keywords = ['analyze', 'phân tích', 'project', 'structure', 'cấu trúc'];
    return keywords.some((kw) => userInput.toLowerCase().includes(kw));
  }

  async execute(userInput: string, context: ProjectContext): Promise<SkillResult> {
    const projectRoot = context.projectRoot;

    // Scan project structure
    const backendFiles = await this.fileTool.listDir(`${projectRoot}/server/src`).catch(() => []);
    const frontendFiles = await this.fileTool.listDir(`${projectRoot}/client/src`).catch(() => []);

    const analysis = {
      techStack: context.techStack,
      backend: {
        framework: 'NestJS',
        modules: this.extractModuleNames(backendFiles),
        hasDatabase: backendFiles.some((f: string) => f.includes('database')),
        hasAuth: backendFiles.some((f: string) => f.includes('auth')),
      },
      frontend: {
        framework: 'React + Vite',
        components: this.extractModuleNames(frontendFiles),
        hasStateManagement: frontendFiles.some((f: string) => f.includes('store')),
      },
      conventions: context.conventions,
    };

    return {
      messages: [
        `Project Analysis:`,
        `Backend: ${analysis.backend.framework} with ${analysis.backend.modules.length} modules`,
        `Frontend: ${analysis.frontend.framework}`,
        `Database support: ${analysis.backend.hasDatabase ? 'Yes' : 'No'}`,
        `Auth: ${analysis.backend.hasAuth ? 'Yes' : 'No'}`,
      ],
      proposedChanges: [],
      skillUsed: this.meta.id,
    };
  }

  private extractModuleNames(files: string[]): string[] {
    return files
      .filter((f: string) => f.endsWith('.module.ts') || f.endsWith('/'))
      .map((f: string) => f.replace(/\/$/, '').split('/').pop() || '');
  }
}
