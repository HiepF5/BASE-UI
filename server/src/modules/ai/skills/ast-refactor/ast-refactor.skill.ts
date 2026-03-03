import { Injectable } from '@nestjs/common';
import { AiSkill, SkillMeta, SkillResult } from '../base/ai-skill.interface';
import { ProjectContext } from '../../core/ai-context.service';
import { FileTool } from '../../tools/file/file.tool';

// ============================================================
// AST Refactor Skill
// Refactor TypeScript/JavaScript dựa trên AST (ts-morph)
// ============================================================
@Injectable()
export class AstRefactorSkill implements AiSkill {
  meta: SkillMeta = {
    id: 'refactor.ast',
    name: 'AST Refactor',
    group: 'ast-refactor',
    description: 'Refactor TypeScript code using AST manipulation (add imports, methods, etc.)',
  };

  constructor(private readonly fileTool: FileTool) {}

  canHandle(userInput: string): boolean {
    const keywords = ['refactor', 'rename', 'move', 'add import', 'thêm import', 'restructure'];
    return keywords.some((kw) => userInput.toLowerCase().includes(kw));
  }

  async execute(userInput: string, context: ProjectContext): Promise<SkillResult> {
    // In production: use ts-morph to parse and refactor AST
    // For now: provide guidance
    return {
      messages: [
        'AST Refactor skill activated.',
        'This skill can:',
        '- Add imports to TypeScript files',
        '- Add methods to classes',
        '- Rename symbols across files',
        '- Move code between files',
        'Please specify the target file and desired refactoring.',
      ],
      proposedChanges: [],
      skillUsed: this.meta.id,
    };
  }
}
