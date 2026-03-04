import { useCallback, useMemo, useRef } from 'react';
import { useForm, type UseFormReturn, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import type { EntitySchema, FieldSchema } from '../core/metadata/schema.types';
import {
  buildFormSchema,
  buildDefaultValues,
  getCreateFields,
  getEditFields,
} from '../core/metadata';

// ============================================================
// useFormEngine - Bridge between Metadata → Form → Mutations
// Connects: EntitySchema → Zod validation → React Hook Form → CRUD mutation
// Pattern: Form State lives in RHF, NOT in Zustand/React Query
// Production: automatic schema generation, dirty tracking, reset
// ============================================================

/** Mode of the form */
export type FormMode = 'create' | 'edit';

/** Options for useFormEngine */
export interface UseFormEngineOptions<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Entity schema (full metadata) */
  schema: EntitySchema | null;
  /** Or provide raw fields */
  fields?: FieldSchema[];
  /** Form mode */
  mode?: FormMode;
  /** Existing data for edit mode */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues?: Record<string, any>;
  /** Submit handler (create or update mutation) */
  onSubmit: (data: Partial<T>) => Promise<unknown>;
  /** Success callback (after mutation resolves) */
  onSuccess?: () => void;
  /** Error callback */
  onError?: (error: Error) => void;
}

/** Return type for useFormEngine */
export interface UseFormEngineReturn {
  // ─── Form ──────────────────
  /** React Hook Form instance */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  /** Filtered fields for the current mode */
  fields: FieldSchema[];
  /** Zod schema used for validation */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zodSchema: z.ZodObject<any>;
  /** Default values computed from schema + existing data */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues: Record<string, any>;

  // ─── State ─────────────────
  /** Whether the form has unsaved changes */
  isDirty: boolean;
  /** Whether submit is in progress */
  isSubmitting: boolean;
  /** Whether form is valid */
  isValid: boolean;
  /** Current form mode */
  mode: FormMode;

  // ─── Actions ───────────────
  /** Handle form submission (wraps RHF handleSubmit + mutation) */
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  /** Reset form to initial/default values */
  reset: () => void;
  /** Reset form with new data (e.g. after switching edit target) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resetWithData: (data: Record<string, any>) => void;
}

export function useFormEngine<T extends Record<string, unknown> = Record<string, unknown>>(
  options: UseFormEngineOptions<T>,
): UseFormEngineReturn {
  const {
    schema,
    fields: fieldsProp,
    mode = 'create',
    defaultValues: defaultValuesProp,
    onSubmit,
    onSuccess,
    onError,
  } = options;

  // ─── Derive fields from schema or props ─────────────────
  const fields = useMemo(() => {
    if (fieldsProp) return fieldsProp;
    if (!schema) return [];
    return mode === 'create' ? getCreateFields(schema) : getEditFields(schema);
  }, [schema, fieldsProp, mode]);

  // ─── Build Zod schema ───────────────────────────────────
  const zodSchema = useMemo(() => buildFormSchema(fields, mode), [fields, mode]);

  // ─── Build default values ───────────────────────────────
  const computedDefaults = useMemo(
    () => buildDefaultValues(fields, defaultValuesProp),
    [fields, defaultValuesProp],
  );

  // ─── React Hook Form ───────────────────────────────────
  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: computedDefaults as DefaultValues<Record<string, unknown>>,
    mode: 'onBlur', // Validate on blur (production pattern)
  });

  const {
    handleSubmit: rhfHandleSubmit,
    reset: rhfReset,
    formState: { isDirty, isSubmitting, isValid },
  } = form;

  // Track submission in progress (for external callers)
  const submittingRef = useRef(false);

  // ─── Submit handler ─────────────────────────────────────
  const handleSubmit = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      if (submittingRef.current) return;

      await rhfHandleSubmit(async (formData) => {
        submittingRef.current = true;
        try {
          // Clean empty strings → undefined for optional fields
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cleaned: Record<string, any> = {};
          for (const [key, value] of Object.entries(formData)) {
            if (value === '' || value === undefined) continue;
            cleaned[key] = value;
          }

          await onSubmit(cleaned as Partial<T>);
          onSuccess?.();
        } catch (err) {
          onError?.(err instanceof Error ? err : new Error(String(err)));
        } finally {
          submittingRef.current = false;
        }
      })(e);
    },
    [rhfHandleSubmit, onSubmit, onSuccess, onError],
  );

  // ─── Reset helpers ──────────────────────────────────────
  const reset = useCallback(() => {
    rhfReset(computedDefaults);
  }, [rhfReset, computedDefaults]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resetWithData = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: Record<string, any>) => {
      const newDefaults = buildDefaultValues(fields, data);
      rhfReset(newDefaults);
    },
    [rhfReset, fields],
  );

  return {
    form,
    fields,
    zodSchema,
    defaultValues: computedDefaults,
    isDirty,
    isSubmitting,
    isValid,
    mode,
    handleSubmit,
    reset,
    resetWithData,
  };
}
