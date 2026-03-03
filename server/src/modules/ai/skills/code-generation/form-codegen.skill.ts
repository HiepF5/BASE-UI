import { Injectable } from '@nestjs/common';
import { AiSkill, SkillMeta, SkillResult } from '../base/ai-skill.interface';
import { ProjectContext } from '../../core/ai-context.service';
import { LlmProvider } from '../../core/llm/llm.provider';
import { FileTool } from '../../tools/file/file.tool';

// ============================================================
// React Form Generator Skill
// Sinh form + validation từ schema/field description
// ============================================================
@Injectable()
export class FormCodegenSkill implements AiSkill {
  meta: SkillMeta = {
    id: 'codegen.react.form',
    name: 'React Form Generator',
    group: 'code-generation',
    description: 'Generate React form with validation (React Hook Form + Zod)',
  };

  constructor(
    private readonly llm: LlmProvider,
    private readonly fileTool: FileTool,
  ) {}

  canHandle(userInput: string): boolean {
    const keywords = ['form', 'biểu mẫu', 'input', 'validation'];
    const lower = userInput.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  }

  async execute(userInput: string, context: ProjectContext): Promise<SkillResult> {
    const formName = this.extractFormName(userInput);
    const pascal = this.toPascalCase(formName);

    const formContent = this.generateForm(formName, pascal);
    const schemaContent = this.generateSchema(formName, pascal);

    return {
      messages: [
        `Generated React form: ${pascal}Form`,
        `Includes: form component + Zod validation schema`,
      ],
      proposedChanges: [
        {
          filePath: `src/components/forms/${pascal}Form.tsx`,
          action: 'create',
          content: formContent,
        },
        {
          filePath: `src/components/forms/${formName}.schema.ts`,
          action: 'create',
          content: schemaContent,
        },
      ],
      skillUsed: this.meta.id,
    };
  }

  private extractFormName(input: string): string {
    const words = input.toLowerCase().split(/\s+/);
    const skip = ['form', 'tạo', 'create', 'generate', 'biểu', 'mẫu'];
    const filtered = words.filter((w) => !skip.includes(w) && w.length > 2);
    return filtered[0] || 'entity';
  }

  private generateForm(name: string, pascal: string): string {
    return `import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ${name}Schema, type ${pascal}FormData } from './${name}.schema';

interface ${pascal}FormProps {
  defaultValues?: Partial<${pascal}FormData>;
  onSubmit: (data: ${pascal}FormData) => void;
  loading?: boolean;
}

export function ${pascal}Form({ defaultValues, onSubmit, loading }: ${pascal}FormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<${pascal}FormData>({
    resolver: zodResolver(${name}Schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          {...register('name')}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...register('description')}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter description"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
`;
  }

  private generateSchema(name: string, pascal: string): string {
    return `import { z } from 'zod';

export const ${name}Schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export type ${pascal}FormData = z.infer<typeof ${name}Schema>;
`;
  }

  private toPascalCase(str: string): string {
    return str.split(/[-_]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  }
}
