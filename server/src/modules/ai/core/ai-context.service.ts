import { Injectable } from '@nestjs/common';

// ============================================================
// AI Context Service - Lưu memory & project summary
// ============================================================
export interface ProjectContext {
  techStack: {
    backend: string;
    frontend: string;
    database: string[];
  };
  conventions: {
    fileNaming: string;
    componentNaming: string;
    moduleStructure: string;
  };
  generatedModules: string[];
  projectRoot: string;
}

@Injectable()
export class AiContextService {
  private context: ProjectContext = {
    techStack: {
      backend: 'NestJS',
      frontend: 'Vite + React',
      database: ['PostgreSQL', 'MySQL', 'Oracle'],
    },
    conventions: {
      fileNaming: 'kebab-case',
      componentNaming: 'PascalCase',
      moduleStructure: 'NestJS module pattern (module + controller + service)',
    },
    generatedModules: [],
    projectRoot: process.cwd(),
  };

  getFullContext(): ProjectContext {
    return { ...this.context };
  }

  getTechStack() {
    return this.context.techStack;
  }

  getConventions() {
    return this.context.conventions;
  }

  addGeneratedModule(moduleName: string): void {
    if (!this.context.generatedModules.includes(moduleName)) {
      this.context.generatedModules.push(moduleName);
    }
  }

  updateTechStack(update: Partial<ProjectContext['techStack']>): void {
    this.context.techStack = { ...this.context.techStack, ...update };
  }

  setProjectRoot(root: string): void {
    this.context.projectRoot = root;
  }
}
