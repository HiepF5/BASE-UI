import React, { useMemo, useEffect } from 'react';
import { useForm, Controller, type FieldValues, type DefaultValues, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, type ZodTypeAny } from 'zod';
import { cn } from '@/core/utils';
import { BaseButton } from './BaseButton';
import type { ColumnConfig } from '@/types';

/* ── Props ── */
export interface BaseFormProps<T extends FieldValues = FieldValues> {
  columns: ColumnConfig[];
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => void;
  onCancel?: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit' | 'view';
  className?: string;
}

/**
 * BaseForm — Metadata-driven form.
 * Generates Zod schema + RHF form from ColumnConfig[].
 */
export function BaseForm<T extends FieldValues = FieldValues>({
  columns,
  defaultValues,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create',
  className,
}: BaseFormProps<T>) {
  const isView = mode === 'view';

  /* Build Zod schema from ColumnConfig */
  const zodSchema = useMemo(() => {
    const shape: Record<string, ZodTypeAny> = {};
    for (const col of columns) {
      if (!col.editable && mode === 'create') continue;
      let field: ZodTypeAny;

      switch (col.type) {
        case 'number':
          field = z.coerce.number();
          if (col.validation?.min != null) field = (field as z.ZodNumber).min(col.validation.min);
          if (col.validation?.max != null) field = (field as z.ZodNumber).max(col.validation.max);
          break;
        case 'boolean':
          field = z.boolean();
          break;
        case 'email':
          field = z.string().email('Email không hợp lệ');
          break;
        case 'url':
          field = z.string().url('URL không hợp lệ');
          break;
        case 'date':
        case 'datetime':
          field = z.string();
          break;
        default:
          field = z.string();
          if (col.validation?.minLength) field = (field as z.ZodString).min(col.validation.minLength);
          if (col.validation?.maxLength) field = (field as z.ZodString).max(col.validation.maxLength);
          if (col.validation?.pattern) field = (field as z.ZodString).regex(new RegExp(col.validation.pattern), col.validation?.message ?? 'Định dạng không hợp lệ');
      }

      if (!col.required) field = field.optional();
      shape[col.name] = field;
    }
    return z.object(shape);
  }, [columns, mode]);

  const editableColumns = useMemo(
    () => columns.filter((c) => c.editable !== false || mode === 'view'),
    [columns, mode],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<T>({
    resolver: zodResolver(zodSchema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  useEffect(() => {
    if (defaultValues) reset(defaultValues as DefaultValues<T>);
  }, [defaultValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('grid gap-4 sm:grid-cols-2', className)}
      noValidate
    >
      {editableColumns.map((col) => (
        <div
          key={col.name}
          className={cn(
            'flex flex-col gap-1',
            (col.type === 'textarea' || col.type === 'json') && 'sm:col-span-2',
          )}
        >
          <label htmlFor={col.name} className="text-sm font-medium text-gray-700">
            {col.label}
            {col.required && <span className="text-danger-500 ml-0.5">*</span>}
          </label>

          {renderField(col, register, control, isView)}

          {errors[col.name as keyof T] && (
            <p className="text-xs text-danger-600">
              {(errors[col.name as keyof T] as any)?.message ?? 'Giá trị không hợp lệ'}
            </p>
          )}
        </div>
      ))}

      {/* Actions */}
      {!isView && (
        <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
          {onCancel && (
            <BaseButton type="button" variant="secondary" onClick={onCancel}>
              Hủy
            </BaseButton>
          )}
          <BaseButton type="submit" loading={loading}>
            {mode === 'edit' ? 'Cập nhật' : 'Tạo mới'}
          </BaseButton>
        </div>
      )}
    </form>
  );
}

/* ── Field renderer ── */
function renderField(
  col: ColumnConfig,
  register: any,
  control: any,
  disabled: boolean,
) {
  const baseClass =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500';

  switch (col.type) {
    case 'textarea':
    case 'json':
      return (
        <textarea
          id={col.name}
          rows={col.type === 'json' ? 6 : 3}
          placeholder={col.placeholder}
          disabled={disabled}
          className={cn(baseClass, 'resize-y', col.type === 'json' && 'font-mono text-xs')}
          {...register(col.name)}
        />
      );

    case 'boolean':
      return (
        <Controller
          name={col.name}
          control={control}
          render={({ field }) => (
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!field.value}
                onChange={field.onChange}
                disabled={disabled}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">{col.label}</span>
            </label>
          )}
        />
      );

    case 'select':
      return (
        <select
          id={col.name}
          disabled={disabled}
          className={baseClass}
          {...register(col.name)}
        >
          <option value="">— Chọn —</option>
          {col.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );

    case 'number':
      return (
        <input
          id={col.name}
          type="number"
          placeholder={col.placeholder}
          disabled={disabled}
          className={baseClass}
          {...register(col.name, { valueAsNumber: true })}
        />
      );

    case 'date':
      return (
        <input
          id={col.name}
          type="date"
          disabled={disabled}
          className={baseClass}
          {...register(col.name)}
        />
      );

    case 'datetime':
      return (
        <input
          id={col.name}
          type="datetime-local"
          disabled={disabled}
          className={baseClass}
          {...register(col.name)}
        />
      );

    case 'password':
      return (
        <input
          id={col.name}
          type="password"
          placeholder={col.placeholder ?? '••••••••'}
          disabled={disabled}
          className={baseClass}
          {...register(col.name)}
        />
      );

    case 'email':
      return (
        <input
          id={col.name}
          type="email"
          placeholder={col.placeholder ?? 'email@example.com'}
          disabled={disabled}
          className={baseClass}
          {...register(col.name)}
        />
      );

    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input
            id={col.name}
            type="color"
            disabled={disabled}
            className="h-9 w-12 rounded border border-gray-300"
            {...register(col.name)}
          />
          <input
            type="text"
            disabled={disabled}
            className={cn(baseClass, 'flex-1')}
            {...register(col.name)}
          />
        </div>
      );

    default: // text, url
      return (
        <input
          id={col.name}
          type="text"
          placeholder={col.placeholder}
          disabled={disabled}
          className={baseClass}
          {...register(col.name)}
        />
      );
  }
}
