import { Injectable } from '@nestjs/common';
import { AiSkill, SkillMeta, SkillResult } from '../base/ai-skill.interface';
import { ProjectContext } from '../../core/ai-context.service';
import { LlmProvider } from '../../core/llm/llm.provider';
import { FileTool } from '../../tools/file/file.tool';

// ============================================================
// React Page Generator Skill
// Sinh React page tương ứng với 1 module backend
// ============================================================
@Injectable()
export class ReactCodegenSkill implements AiSkill {
  meta: SkillMeta = {
    id: 'codegen.react.page',
    name: 'React Page Generator',
    group: 'code-generation',
    description: 'Generate React page with table + form for a CRUD module',
  };

  constructor(
    private readonly llm: LlmProvider,
    private readonly fileTool: FileTool,
  ) {}

  canHandle(userInput: string): boolean {
    const keywords = ['page', 'react', 'frontend', 'trang', 'ui', 'component'];
    const lower = userInput.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  }

  async execute(userInput: string, context: ProjectContext): Promise<SkillResult> {
    const moduleName = this.extractModuleName(userInput);
    const pascal = this.toPascalCase(moduleName);
    const dir = `src/modules/${moduleName}`;

    const pageContent = this.generatePage(moduleName, pascal);
    const hookContent = this.generateHook(moduleName);

    return {
      messages: [
        `Generated React page for: ${moduleName}`,
        `Includes: DynamicCrudPage, useCrud hook`,
      ],
      proposedChanges: [
        {
          filePath: `${dir}/${pascal}Page.tsx`,
          action: 'create',
          content: pageContent,
        },
        {
          filePath: `${dir}/hooks/use${pascal}.ts`,
          action: 'create',
          content: hookContent,
        },
      ],
      skillUsed: this.meta.id,
    };
  }

  private extractModuleName(input: string): string {
    const words = input.toLowerCase().split(/\s+/);
    const skip = ['tạo', 'create', 'generate', 'page', 'trang', 'react', 'frontend', 'for', 'cho'];
    const filtered = words.filter((w) => !skip.includes(w) && w.length > 2);
    return filtered[0] || 'entity';
  }

  private generatePage(name: string, pascal: string): string {
    return `import React from 'react';
import { DynamicCrudPage } from '../dynamic-crud/DynamicCrudPage';
import { EntitiesConfig } from '../../config/entities.config';

/**
 * ${pascal} Management Page
 * Metadata-driven CRUD page
 */
export function ${pascal}Page() {
  const config = EntitiesConfig['${name}'];

  if (!config) {
    return <div>Entity config not found for: ${name}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{config.label}</h1>
      <DynamicCrudPage config={config} />
    </div>
  );
}
`;
  }

  private generateHook(name: string): string {
    return `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../core/api/apiClient';

export function use${this.toPascalCase(name)}(connectionId = 'default') {
  const queryClient = useQueryClient();
  const entity = '${name}';

  const listQuery = useQuery({
    queryKey: ['crud', connectionId, entity],
    queryFn: () => apiClient.get(\`/crud/\${connectionId}/\${entity}\`),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) =>
      apiClient.post(\`/crud/\${connectionId}/\${entity}\`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crud', connectionId, entity] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      apiClient.put(\`/crud/\${connectionId}/\${entity}/\${id}\`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crud', connectionId, entity] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(\`/crud/\${connectionId}/\${entity}/\${id}\`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crud', connectionId, entity] });
    },
  });

  return {
    data: listQuery.data,
    loading: listQuery.isLoading,
    error: listQuery.error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    refetch: listQuery.refetch,
  };
}
`;
  }

  private toPascalCase(str: string): string {
    return str.split(/[-_]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  }
}
