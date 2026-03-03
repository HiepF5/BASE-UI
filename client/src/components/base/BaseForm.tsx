import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { BaseButton } from './BaseButton';
import type { ColumnConfig } from '../../types';
import { cn } from '../../core/utils';

// ============================================================
// BaseForm - Dynamic form từ ColumnConfig[] (React Hook Form)
// ============================================================
export interface BaseFormProps {
  columns: ColumnConfig[];
  defaultValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

export function BaseForm({
  columns,
  defaultValues = {},
  onSubmit,
  onCancel,
  loading,
  mode = 'create',
}: BaseFormProps) {
  const editableColumns = columns.filter(
    (col) => col.editable && (mode === 'create' || col.name !== 'id'),
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {editableColumns.map((col) => (
        <div key={col.name}>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            {col.label}
            {col.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {renderField(col, register, control, errors)}

          {errors[col.name] && (
            <p className="text-red-500 text-xs mt-1">
              {(errors[col.name] as any)?.message || `${col.label} is invalid`}
            </p>
          )}
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <BaseButton type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </BaseButton>
        )}
        <BaseButton type="submit" loading={loading}>
          {mode === 'create' ? 'Create' : 'Update'}
        </BaseButton>
      </div>
    </form>
  );
}

function renderField(
  col: ColumnConfig,
  register: any,
  control: any,
  errors: any,
): React.ReactNode {
  const baseClass = cn(
    'w-full border rounded-md px-3 py-2 text-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    errors[col.name] && 'border-red-300',
  );

  const validation: Record<string, any> = {};
  if (col.required) validation.required = `${col.label} is required`;
  if (col.validation?.min !== undefined) validation.min = { value: col.validation.min, message: col.validation.message || `Min: ${col.validation.min}` };
  if (col.validation?.max !== undefined) validation.max = { value: col.validation.max, message: col.validation.message || `Max: ${col.validation.max}` };
  if (col.validation?.pattern) validation.pattern = { value: new RegExp(col.validation.pattern), message: col.validation.message || 'Invalid format' };

  switch (col.type) {
    case 'textarea':
      return <textarea {...register(col.name, validation)} className={baseClass} rows={3} />;

    case 'select':
      return (
        <select {...register(col.name, validation)} className={baseClass}>
          <option value="">-- Select --</option>
          {col.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'boolean':
      return (
        <Controller
          name={col.name}
          control={control}
          rules={validation}
          render={({ field }) => (
            <input
              type="checkbox"
              checked={field.value || false}
              onChange={(e) => field.onChange(e.target.checked)}
              className="rounded"
            />
          )}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          {...register(col.name, { ...validation, valueAsNumber: true })}
          className={baseClass}
        />
      );

    case 'date':
      return <input type="date" {...register(col.name, validation)} className={baseClass} />;

    case 'email':
      return <input type="email" {...register(col.name, validation)} className={baseClass} />;

    case 'password':
      return <input type="password" {...register(col.name, validation)} className={baseClass} />;

    case 'text':
    default:
      return <input type="text" {...register(col.name, validation)} className={baseClass} />;
  }
}
