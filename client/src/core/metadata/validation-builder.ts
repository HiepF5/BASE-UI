// ============================================================
// Validation Builder - Sinh Zod schema từ metadata (FieldSchema[])
// Runtime validation generation cho DynamicForm (React Hook Form + Zod)
// ============================================================

import { z, type ZodTypeAny } from 'zod';
import type { FieldSchema } from './schema.types';

// ─── Build Zod schema for a single field ─────────────────────

/** Generate Zod validator for a single FieldSchema */
export function buildFieldValidator(field: FieldSchema): ZodTypeAny {
  const v = field.validation || {};
  const msgs = v.messages || {};

  let schema: ZodTypeAny;

  switch (field.type) {
    case 'number': {
      let s = z.coerce.number({ invalid_type_error: `${field.label} must be a number` });
      if (v.min !== undefined) s = s.min(v.min, msgs.min || `Min: ${v.min}`);
      if (v.max !== undefined) s = s.max(v.max, msgs.max || `Max: ${v.max}`);
      schema = v.required ? s : s.optional().or(z.literal('').transform(() => undefined));
      break;
    }

    case 'boolean': {
      schema = z.boolean().default(false);
      break;
    }

    case 'date':
    case 'datetime': {
      let s = z.string();
      if (v.required) {
        s = s.min(1, msgs.required || `${field.label} is required`);
      }
      schema = v.required ? s : s.optional().or(z.literal(''));
      break;
    }

    case 'email': {
      let s = z.string();
      if (v.required) s = s.min(1, msgs.required || `${field.label} is required`);
      s = s.email(msgs.email || `Invalid email format`);
      if (v.maxLength) s = s.max(v.maxLength, msgs.maxLength || `Max ${v.maxLength} characters`);
      schema = v.required ? s : s.optional().or(z.literal(''));
      break;
    }

    case 'url': {
      let s = z.string();
      if (v.required) s = s.min(1, msgs.required || `${field.label} is required`);
      s = s.url(msgs.url || `Invalid URL format`);
      schema = v.required ? s : s.optional().or(z.literal(''));
      break;
    }

    case 'select':
    case 'relation': {
      let s = z.string();
      if (v.required) s = s.min(1, msgs.required || `${field.label} is required`);
      schema = v.required ? s : s.optional().or(z.literal(''));
      break;
    }

    case 'multiselect': {
      let s = z.array(z.string());
      if (v.required) s = s.min(1, msgs.required || `Select at least one ${field.label}`);
      schema = s;
      break;
    }

    case 'json': {
      // JSON → accept string, validate it parses
      const s = z.string().refine(
        (val) => {
          if (!val) return !v.required;
          try {
            JSON.parse(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: 'Invalid JSON format' },
      );
      schema = s;
      break;
    }

    // text, textarea, password, phone, etc.
    default: {
      let s = z.string();
      if (v.required) s = s.min(1, msgs.required || `${field.label} is required`);
      if (v.minLength) s = s.min(v.minLength, msgs.minLength || `Min ${v.minLength} characters`);
      if (v.maxLength) s = s.max(v.maxLength, msgs.maxLength || `Max ${v.maxLength} characters`);
      if (v.pattern) s = s.regex(new RegExp(v.pattern), msgs.pattern || `Invalid format`);
      schema = v.required ? s : s.optional().or(z.literal(''));
      break;
    }
  }

  return schema;
}

// ─── Build Zod object schema from FieldSchema[] ──────────────

/** Generate complete Zod object schema for a form */
export function buildFormSchema(
  fields: FieldSchema[],
  mode: 'create' | 'edit' = 'create',
): z.ZodObject<any> {
  const shape: Record<string, ZodTypeAny> = {};

  for (const field of fields) {
    // Skip primary key in create, skip non-editable in both modes
    if (field.isPrimary && mode === 'create') continue;
    if (!field.editable && !field.isPrimary) continue;

    // In edit mode, all fields are optional (partial update)
    if (mode === 'edit') {
      shape[field.name] = buildFieldValidator(field).optional();
    } else {
      shape[field.name] = buildFieldValidator(field);
    }
  }

  return z.object(shape);
}

// ─── Generate default values from schema ─────────────────────

/** Generate default form values from FieldSchema[] */
export function buildDefaultValues(
  fields: FieldSchema[],
  existingData?: Record<string, any>,
): Record<string, any> {
  const defaults: Record<string, any> = {};

  for (const field of fields) {
    if (field.isPrimary) continue;

    if (existingData && existingData[field.name] !== undefined) {
      defaults[field.name] = existingData[field.name];
      continue;
    }

    // Type-based defaults
    switch (field.type) {
      case 'boolean':
        defaults[field.name] = field.defaultValue ?? false;
        break;
      case 'number':
        defaults[field.name] = field.defaultValue ?? '';
        break;
      case 'multiselect':
        defaults[field.name] = field.defaultValue ?? [];
        break;
      default:
        defaults[field.name] = field.defaultValue ?? '';
        break;
    }
  }

  return defaults;
}
