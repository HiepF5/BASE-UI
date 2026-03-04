import React from 'react';
import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { BaseInput, BaseSelect, BaseMultiSelect, BaseDatePicker, BaseSwitch } from '../base';
import { RelationSelect } from '../relation/RelationSelect';
import { RelationMultiSelect } from '../relation/RelationMultiSelect';
import type { FieldSchema } from '../../core/metadata/schema.types';
import { cn } from '../../core/utils';

// ============================================================
// FieldRenderer - Render đúng input component từ FieldSchema
// Core component của Metadata Engine
// Switch field.type → BaseInput / BaseSelect / BaseDatePicker / ...
// Pure presentational – KHÔNG fetch data
// ============================================================

export interface FieldRendererProps {
  /** Field metadata */
  field: FieldSchema;
  /** React Hook Form register */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  /** React Hook Form control (for Controller-wrapped fields) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  /** Form errors */
  errors: FieldErrors;
  /** Disabled state */
  disabled?: boolean;
  /** Relation options (pre-loaded by parent for relation fields) */
  relationOptions?: Array<{ label: string; value: string | number }>;
  /** Loading relation options */
  relationLoading?: boolean;
  /** Connection ID for async relation search */
  connectionId?: string;
}

export const FieldRenderer = React.memo(function FieldRenderer({
  field,
  register,
  control,
  errors,
  disabled,
  relationOptions,
  relationLoading,
  connectionId = 'default',
}: FieldRendererProps) {
  const error = errors[field.name];
  const errorMessage = error
    ? (error as { message?: string }).message || `${field.label} is invalid`
    : undefined;

  const isRequired = field.validation?.required || false;

  switch (field.type) {
    // ─── Text ──────────────────────────────────────────────
    case 'text':
      return (
        <BaseInput
          {...register(field.name)}
          label={field.label}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          error={errorMessage}
          hint={field.helpText}
          required={isRequired}
          disabled={disabled}
        />
      );

    // ─── Email ─────────────────────────────────────────────
    case 'email':
      return (
        <BaseInput
          type="email"
          {...register(field.name)}
          label={field.label}
          placeholder={field.placeholder || 'email@example.com'}
          error={errorMessage}
          hint={field.helpText}
          required={isRequired}
          disabled={disabled}
        />
      );

    // ─── Password ──────────────────────────────────────────
    case 'password':
      return (
        <BaseInput
          type="password"
          {...register(field.name)}
          label={field.label}
          placeholder={field.placeholder || '••••••••'}
          error={errorMessage}
          hint={field.helpText}
          required={isRequired}
          disabled={disabled}
        />
      );

    // ─── URL ───────────────────────────────────────────────
    case 'url':
      return (
        <BaseInput
          type="url"
          {...register(field.name)}
          label={field.label}
          placeholder={field.placeholder || 'https://'}
          error={errorMessage}
          hint={field.helpText}
          required={isRequired}
          disabled={disabled}
        />
      );

    // ─── Phone ─────────────────────────────────────────────
    case 'phone':
      return (
        <BaseInput
          type="tel"
          {...register(field.name)}
          label={field.label}
          placeholder={field.placeholder || '+84 ...'}
          error={errorMessage}
          hint={field.helpText}
          required={isRequired}
          disabled={disabled}
        />
      );

    // ─── Number ────────────────────────────────────────────
    case 'number':
      return (
        <BaseInput
          type="number"
          {...register(field.name, { valueAsNumber: true })}
          label={field.label}
          placeholder={field.placeholder || '0'}
          error={errorMessage}
          hint={field.helpText}
          required={isRequired}
          disabled={disabled}
        />
      );

    // ─── Textarea ──────────────────────────────────────────
    case 'textarea':
      return (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">
            {field.label}
            {isRequired && <span className="text-danger ml-0.5">*</span>}
          </label>
          <textarea
            {...register(field.name)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            rows={4}
            disabled={disabled}
            className={cn(
              'w-full rounded-md border bg-bg text-text text-sm px-3 py-2 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 focus:border-primary-500',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-tertiary',
              'placeholder:text-text-muted resize-y',
              errorMessage
                ? 'border-danger focus:ring-danger'
                : 'border-border hover:border-border-hover',
            )}
          />
          {errorMessage && (
            <p className="text-xs text-danger" role="alert">
              {errorMessage}
            </p>
          )}
          {!errorMessage && field.helpText && (
            <p className="text-xs text-text-muted">{field.helpText}</p>
          )}
        </div>
      );

    // ─── JSON ──────────────────────────────────────────────
    case 'json':
      return (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">
            {field.label}
            {isRequired && <span className="text-danger ml-0.5">*</span>}
          </label>
          <textarea
            {...register(field.name)}
            placeholder={field.placeholder || '{ }'}
            rows={6}
            disabled={disabled}
            className={cn(
              'w-full rounded-md border bg-bg text-text text-sm px-3 py-2 transition-colors font-mono',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 focus:border-primary-500',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-tertiary',
              'placeholder:text-text-muted resize-y',
              errorMessage
                ? 'border-danger focus:ring-danger'
                : 'border-border hover:border-border-hover',
            )}
          />
          {errorMessage && (
            <p className="text-xs text-danger" role="alert">
              {errorMessage}
            </p>
          )}
          {!errorMessage && field.helpText && (
            <p className="text-xs text-text-muted">{field.helpText}</p>
          )}
        </div>
      );

    // ─── Boolean (Switch) ──────────────────────────────────
    case 'boolean':
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: formField }) => (
            <BaseSwitch
              label={field.label}
              checked={formField.value || false}
              onChange={(e) => formField.onChange((e.target as HTMLInputElement).checked)}
              error={errorMessage}
              disabled={disabled}
            />
          )}
        />
      );

    // ─── Date ──────────────────────────────────────────────
    case 'date':
      return (
        <BaseDatePicker
          mode="date"
          {...register(field.name)}
          label={field.label}
          error={errorMessage}
          hint={field.helpText}
          required={isRequired}
          disabled={disabled}
        />
      );

    // ─── DateTime ──────────────────────────────────────────
    case 'datetime':
      return (
        <BaseDatePicker
          mode="datetime-local"
          {...register(field.name)}
          label={field.label}
          error={errorMessage}
          hint={field.helpText}
          required={isRequired}
          disabled={disabled}
        />
      );

    // ─── Select ────────────────────────────────────────────
    case 'select':
      return (
        <BaseSelect
          {...register(field.name)}
          label={field.label}
          placeholder={`Select ${field.label.toLowerCase()}`}
          options={
            field.options?.map((o) => ({
              label: o.label,
              value: o.value,
            })) || []
          }
          error={errorMessage}
          hint={field.helpText}
          required={isRequired}
          disabled={disabled}
        />
      );

    // ─── MultiSelect ──────────────────────────────────────
    case 'multiselect':
      return (
        <Controller
          name={field.name}
          control={control}
          render={({ field: formField }) => (
            <BaseMultiSelect
              label={field.label}
              placeholder={`Select ${field.label.toLowerCase()}`}
              options={
                field.options?.map((o) => ({
                  label: o.label,
                  value: o.value,
                })) || []
              }
              value={formField.value || []}
              onChange={formField.onChange}
              error={errorMessage}
              hint={field.helpText}
              required={isRequired}
              disabled={disabled}
            />
          )}
        />
      );

    // ─── Relation (ManyToOne → RelationSelect, ManyToMany → RelationMultiSelect) ───
    case 'relation': {
      if (!field.relation) return null;

      const relationType = field.relation.type;

      // ManyToOne / OneToOne → async searchable dropdown
      if (relationType === 'ManyToOne' || relationType === 'OneToOne') {
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <RelationSelect
                label={field.label}
                value={formField.value}
                onChange={formField.onChange}
                options={
                  relationOptions?.map((o) => ({
                    label: o.label,
                    value: o.value,
                  })) || []
                }
                loading={relationLoading}
                error={errorMessage}
                hint={field.helpText}
                required={isRequired}
                disabled={disabled || relationLoading}
                placeholder={`Select ${field.label.toLowerCase()}`}
                targetEntity={field.relation?.target}
                displayField={field.relation?.displayField}
                connectionId={connectionId}
                allowCreate={field.relation?.allowCreate}
              />
            )}
          />
        );
      }

      // ManyToMany → async searchable multi-select
      if (relationType === 'ManyToMany') {
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <RelationMultiSelect
                label={field.label}
                value={formField.value || []}
                onChange={formField.onChange}
                options={
                  relationOptions?.map((o) => ({
                    label: o.label,
                    value: o.value,
                  })) || []
                }
                loading={relationLoading}
                error={errorMessage}
                hint={field.helpText}
                required={isRequired}
                disabled={disabled || relationLoading}
                placeholder={`Select ${field.label.toLowerCase()}`}
                targetEntity={field.relation?.target}
                displayField={field.relation?.displayField}
                connectionId={connectionId}
              />
            )}
          />
        );
      }

      // OneToMany → placeholder (handled by DynamicForm as separate section)
      return (
        <div className="text-sm text-text-muted italic">
          {field.label} (OneToMany) – managed in separate section below
        </div>
      );
    }

    // ─── Fallback ──────────────────────────────────────────
    default:
      return (
        <BaseInput
          {...register(field.name)}
          label={field.label}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          error={errorMessage}
          hint={field.helpText}
          required={isRequired}
          disabled={disabled}
        />
      );
  }
});

FieldRenderer.displayName = 'FieldRenderer';
