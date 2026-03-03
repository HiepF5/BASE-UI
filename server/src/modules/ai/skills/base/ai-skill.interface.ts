import { ProjectContext } from '../../core/ai-context.service';

// ============================================================
// AI Skill Interface - Mọi skill phải implement
// ============================================================

export interface SkillMeta {
  id: string;
  name: string;
  group: string;
  description: string;
}

export interface FileChange {
  filePath: string;
  action: 'create' | 'update' | 'delete';
  content?: string;
}

export interface SkillResult {
  messages: string[];
  proposedChanges: FileChange[];
  skillUsed: string;
  plan?: string[];
}

export interface AiSkill {
  meta: SkillMeta;

  /**
   * Kiểm tra skill có thể xử lý yêu cầu này không
   */
  canHandle(userInput: string): boolean;

  /**
   * Thực thi skill với user input + project context
   */
  execute(userInput: string, context: ProjectContext): Promise<SkillResult>;
}
