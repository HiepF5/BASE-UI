import { Injectable } from '@nestjs/common';
import { AiSkill, SkillMeta, SkillResult, FileChange } from '../base/ai-skill.interface';
import { ProjectContext } from '../../core/ai-context.service';
import { FileTool } from '../../tools/file/file.tool';

// ============================================================
// Apply File Change Skill
// Apply FileChange[] từ AI sau khi user confirm
// ============================================================
@Injectable()
export class ApplyFileChangeSkill implements AiSkill {
  meta: SkillMeta = {
    id: 'fs.apply-change',
    name: 'Apply File Changes',
    group: 'filesystem',
    description: 'Apply file create/update/delete operations to the project',
  };

  constructor(private readonly fileTool: FileTool) {}

  canHandle(userInput: string): boolean {
    const keywords = ['apply', 'áp dụng', 'save', 'lưu'];
    return keywords.some((kw) => userInput.toLowerCase().includes(kw));
  }

  async execute(userInput: string, context: ProjectContext): Promise<SkillResult> {
    // In real usage, changes come from previous skill results
    // This is called via AiService.applyChanges()
    return {
      messages: ['Apply file changes skill ready. Use POST /ai/apply with file changes.'],
      proposedChanges: [],
      skillUsed: this.meta.id,
    };
  }

  /**
   * Apply a list of file changes
   */
  async applyChanges(changes: FileChange[]): Promise<{ applied: number; errors: string[] }> {
    let applied = 0;
    const errors: string[] = [];

    for (const change of changes) {
      try {
        switch (change.action) {
          case 'create':
          case 'update':
            await this.fileTool.writeFile(change.filePath, change.content || '');
            applied++;
            break;
          case 'delete':
            await this.fileTool.deleteFile(change.filePath);
            applied++;
            break;
        }
      } catch (err) {
        errors.push(`${change.action} ${change.filePath}: ${err.message}`);
      }
    }

    return { applied, errors };
  }
}
