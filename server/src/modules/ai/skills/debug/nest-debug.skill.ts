import { Injectable } from '@nestjs/common';
import { AiSkill, SkillMeta, SkillResult } from '../base/ai-skill.interface';
import { ProjectContext } from '../../core/ai-context.service';
import { LlmProvider } from '../../core/llm/llm.provider';
import { FileTool } from '../../tools/file/file.tool';

// ============================================================
// NestJS Debugger Skill
// Phân tích lỗi NestJS, gợi ý fix
// ============================================================
@Injectable()
export class NestDebugSkill implements AiSkill {
  meta: SkillMeta = {
    id: 'debug.nest',
    name: 'NestJS Debugger',
    group: 'debug',
    description: 'Analyze NestJS errors and suggest fixes (missing providers, circular deps, etc.)',
  };

  constructor(
    private readonly llm: LlmProvider,
    private readonly fileTool: FileTool,
  ) {}

  canHandle(userInput: string): boolean {
    const keywords = ['error', 'lỗi', 'bug', 'fix', 'debug', 'resolve', 'cannot', "can't"];
    return keywords.some((kw) => userInput.toLowerCase().includes(kw));
  }

  async execute(userInput: string, context: ProjectContext): Promise<SkillResult> {
    const analysis = this.analyzeError(userInput);

    return {
      messages: [
        `Error Analysis:`,
        `Type: ${analysis.type}`,
        `Root Cause: ${analysis.rootCause}`,
        `Suggested Fix: ${analysis.suggestion}`,
      ],
      proposedChanges: analysis.proposedChanges,
      skillUsed: this.meta.id,
    };
  }

  private analyzeError(errorText: string): {
    type: string;
    rootCause: string;
    suggestion: string;
    proposedChanges: any[];
  } {
    const lower = errorText.toLowerCase();

    if (lower.includes("can't resolve dependencies") || lower.includes('cannot resolve')) {
      return {
        type: 'Dependency Injection Error',
        rootCause: 'Missing provider or import in module',
        suggestion: 'Add the missing service to the providers array of the module, or import the module that exports it.',
        proposedChanges: [],
      };
    }

    if (lower.includes('circular dependency') || lower.includes('circular')) {
      return {
        type: 'Circular Dependency',
        rootCause: 'Two or more modules/services depend on each other',
        suggestion: 'Use forwardRef() to break the circular dependency, or restructure the code.',
        proposedChanges: [],
      };
    }

    if (lower.includes('unauthorized') || lower.includes('401')) {
      return {
        type: 'Auth Error',
        rootCause: 'Missing or invalid JWT token',
        suggestion: 'Check that the JWT token is valid, the secret matches, and the guard is properly configured.',
        proposedChanges: [],
      };
    }

    if (lower.includes('connection') || lower.includes('econnrefused')) {
      return {
        type: 'Connection Error',
        rootCause: 'Cannot connect to database or external service',
        suggestion: 'Verify the database is running, check connection params (host, port, password).',
        proposedChanges: [],
      };
    }

    return {
      type: 'Unknown Error',
      rootCause: 'Unable to automatically determine root cause',
      suggestion: 'Please provide the full error stack trace for better analysis.',
      proposedChanges: [],
    };
  }
}
