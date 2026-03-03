import { Injectable } from '@nestjs/common';
import { AiOrchestratorService } from './core/ai-orchestrator.service';
import { AiContextService } from './core/ai-context.service';
import { FileTool } from './tools/file/file.tool';

export interface FileChange {
  filePath: string;
  action: 'create' | 'update' | 'delete';
  content?: string;
}

export interface AiExecuteResult {
  messages: string[];
  proposedChanges: FileChange[];
  skillUsed: string;
  plan?: string[];
}

@Injectable()
export class AiService {
  constructor(
    private readonly orchestrator: AiOrchestratorService,
    private readonly context: AiContextService,
    private readonly fileTool: FileTool,
  ) {}

  async execute(userInput: string, preferredSkillId?: string): Promise<AiExecuteResult> {
    return this.orchestrator.execute(userInput, preferredSkillId);
  }

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
        errors.push(`Failed to ${change.action} ${change.filePath}: ${err.message}`);
      }
    }

    return { applied, errors };
  }

  getContext() {
    return this.context.getFullContext();
  }

  getSkills() {
    return this.orchestrator.getAvailableSkills();
  }
}
