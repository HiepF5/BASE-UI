import { ProjectContext } from '../../core/ai-context.service';

// ============================================================
// Skill Context Interface - Context truyền vào mỗi skill
// ============================================================
export interface SkillContext extends ProjectContext {
  userInput: string;
  relatedFiles?: string[];
  previousResults?: any[];
}
