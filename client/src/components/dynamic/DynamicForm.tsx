import React, { useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BaseButton } from '../base';
import { FieldRenderer } from './FieldRenderer';
import type { FieldSchema, EntitySchema } from '../../core/metadata/schema.types';
import {
  buildFormSchema,
  buildDefaultValues,
  getCreateFields,
  getEditFields,
} from '../../core/metadata';
import { cn } from '../../core/utils';

// ============================================================
// DynamicForm - Metadata-driven form component
// Renders form from EntitySchema/FieldSchema[] với Zod validation
// Uses FieldRenderer cho mỗi field
// Supports create & edit modes, relation fields, custom layout
// ============================================================

export interface DynamicFormProps {
  /** Entity schema (full metadata) */
  schema?: EntitySchema;
  /** Or provide fields directly */
  fields?: FieldSchema[];
  /** Mode: create or edit */
  mode?: 'create' | 'edit';
  /** Default / existing values */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues?: Record<string, any>;
  /** Submit handler */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  /** Cancel handler */
  onCancel?: () => void;
  /** Loading state (disables submit) */
  loading?: boolean;
  /** Disabled state (disables all fields) */
  disabled?: boolean;
  /** Submit button text override */
  submitText?: string;
  /** Cancel button text override */
  cancelText?: string;
  /** Layout: vertical (1 col) or grid (2 col) */
  layout?: 'vertical' | 'grid';
  /** Relation options map: { fieldName: options[] } */
  relationOptions?: Record<string, Array<{ label: string; value: string | number }>>;
  /** Relation loading states: { fieldName: boolean } */
  relationLoading?: Record<string, boolean>;
  /** Extra content to render at the bottom (before buttons) */
  footer?: React.ReactNode;
  /** Custom class */
  className?: string;
}

export function DynamicForm({
  schema,
  fields: fieldsProp,
  mode = 'create',
  defaultValues: defaultValuesProp,
  onSubmit,
  onCancel,
  loading,
  disabled,
  submitText,
  cancelText,
  layout = 'vertical',
  relationOptions,
  relationLoading,
  footer,
  className,
}: DynamicFormProps) {
  // ─── Derive fields from schema or props ─────────────────
  const fields = useMemo(() => {
    if (fieldsProp) return fieldsProp;
    if (!schema) return [];
    return mode === 'create' ? getCreateFields(schema) : getEditFields(schema);
  }, [schema, fieldsProp, mode]);

  // ─── Build Zod validation schema ────────────────────────
  const zodSchema = useMemo(() => buildFormSchema(fields, mode), [fields, mode]);

  // ─── Build default values ───────────────────────────────
  const defaultValues = useMemo(
    () => buildDefaultValues(fields, defaultValuesProp),
    [fields, defaultValuesProp],
  );

  // ─── React Hook Form ───────────────────────────────────
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  // ─── Submit handler ─────────────────────────────────────
  const handleFormSubmit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (data: Record<string, any>) => {
      // Clean empty strings to undefined for optional fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleaned: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value === '' || value === undefined) continue;
        cleaned[key] = value;
      }
      await onSubmit(cleaned);
    },
    [onSubmit],
  );

  // ─── Separate regular fields and OneToMany relations ────
  const regularFields = fields.filter(
    (f) => f.type !== 'relation' || f.relation?.type !== 'OneToMany',
  );

  const oneToManyFields = fields.filter(
    (f) => f.type === 'relation' && f.relation?.type === 'OneToMany',
  );

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('space-y-4', className)}
      noValidate
    >
      {/* Regular fields */}
      <div
        className={cn(layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4')}
      >
        {regularFields.map((field) => (
          <div
            key={field.name}
            className={cn(
              // Full-width for textarea, json, and relation fields
              layout === 'grid' &&
                (field.type === 'textarea' || field.type === 'json') &&
                'md:col-span-2',
            )}
          >
            <FieldRenderer
              field={field}
              register={register}
              control={control}
              errors={errors}
              disabled={disabled || loading}
              relationOptions={relationOptions?.[field.name]}
              relationLoading={relationLoading?.[field.name]}
            />
          </div>
        ))}
      </div>

      {/* OneToMany relation placeholders */}
      {oneToManyFields.length > 0 && (
        <div className="border-t border-border pt-4 space-y-4">
          <h3 className="text-sm font-semibold text-text-secondary">Related Records</h3>
          {oneToManyFields.map((field) => (
            <div key={field.name} className="p-4 border border-border rounded-lg bg-bg-secondary">
              <p className="text-sm font-medium text-text-secondary mb-2">{field.label}</p>
              <p className="text-xs text-text-muted">
                OneToMany inline editing – managed after saving the main record.
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer / extra content */}
      {footer}

      {/* Action buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        {onCancel && (
          <BaseButton
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading || isSubmitting}
          >
            {cancelText || 'Cancel'}
          </BaseButton>
        )}
        <BaseButton type="submit" loading={loading || isSubmitting} disabled={disabled}>
          {submitText || (mode === 'create' ? 'Create' : 'Update')}
        </BaseButton>
      </div>
    </form>
  );
}

DynamicForm.displayName = 'DynamicForm';
