import React, { useState, useMemo, useCallback, useRef } from 'react';
import { DynamicForm } from '../../components/dynamic/DynamicForm';
import { DynamicTable } from '../../components/dynamic/DynamicTable';
import { schemaRegistry } from '../../config/schema.config';
import type { EntitySchema, FieldSchema, FieldType } from '../../core/metadata/schema.types';
import toast from 'react-hot-toast';

// ============================================================
// ConfigPreviewPage – Screen 7: MODULE CONFIG PREVIEW SCREEN
// "low-code lite mode" — Edit JSON config → Live preview render
// + Schema validation + Export config
//
// Demonstrates platform mindset: Everything is config-driven.
// Dev/user can modify JSON → instantly see rendered UI.
// ============================================================

// ─── Types ───────────────────────────────────────────────────

interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

type PreviewMode = 'table' | 'form-create' | 'form-edit';

// ─── Starter Templates ──────────────────────────────────────

const STARTER_TEMPLATE: EntitySchema = {
  name: 'my_entity',
  label: 'My Entity',
  icon: '📄',
  description: 'A custom entity created from config',
  primaryKey: 'id',
  displayField: 'name',
  defaultSort: { field: 'created_at', direction: 'desc' },
  defaultPageSize: 10,
  fields: [
    {
      name: 'id',
      label: 'ID',
      type: 'number',
      isPrimary: true,
      sortable: true,
      visibleInTable: true,
      visibleInCreate: false,
      visibleInEdit: false,
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      sortable: true,
      filterable: true,
      editable: true,
      visibleInTable: true,
      visibleInCreate: true,
      visibleInEdit: true,
      validation: { required: true, minLength: 2, maxLength: 100 },
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      sortable: true,
      filterable: true,
      editable: true,
      visibleInTable: true,
      visibleInCreate: true,
      visibleInEdit: true,
      validation: { required: true, email: true },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      sortable: true,
      filterable: true,
      editable: true,
      visibleInTable: true,
      visibleInCreate: true,
      visibleInEdit: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      validation: { required: true },
    },
    {
      name: 'is_active',
      label: 'Active',
      type: 'boolean',
      filterable: true,
      editable: true,
      visibleInTable: true,
      visibleInCreate: true,
      visibleInEdit: true,
      defaultValue: true,
    },
    {
      name: 'created_at',
      label: 'Created',
      type: 'datetime',
      sortable: true,
      visibleInTable: true,
      visibleInCreate: false,
      visibleInEdit: false,
    },
  ],
  permissions: { read: true, create: true, update: true, delete: true, export: true },
};

/** Generate mock data from an EntitySchema */
function generateMockData(schema: EntitySchema, count = 5): Record<string, unknown>[] {
  return Array.from({ length: count }, (_, i) => {
    const row: Record<string, unknown> = {};
    for (const field of schema.fields) {
      switch (field.type) {
        case 'number':
          row[field.name] = field.isPrimary ? i + 1 : Math.floor(Math.random() * 1000);
          break;
        case 'text':
        case 'email':
          row[field.name] =
            field.type === 'email' ? `user${i + 1}@example.com` : `${field.label} ${i + 1}`;
          break;
        case 'boolean':
          row[field.name] = i % 3 !== 0;
          break;
        case 'select':
          row[field.name] = field.options?.[i % (field.options.length || 1)]?.value ?? '';
          break;
        case 'multiselect':
          row[field.name] = field.options?.slice(0, 2).map((o) => o.value) ?? [];
          break;
        case 'date':
        case 'datetime':
          row[field.name] = new Date(2026, 0, 15 + i * 3).toISOString();
          break;
        case 'textarea':
          row[field.name] = `Sample text for row ${i + 1}`;
          break;
        case 'url':
          row[field.name] = `https://example.com/${i + 1}`;
          break;
        case 'relation':
          row[field.name] = i + 1;
          if (field.relation) {
            row[field.relation.target] = {
              id: i + 1,
              [field.relation.displayField]: `Related ${i + 1}`,
            };
          }
          break;
        default:
          row[field.name] = `Value ${i + 1}`;
      }
    }
    return row;
  });
}

// ─── Schema Validator ────────────────────────────────────────

const VALID_FIELD_TYPES: FieldType[] = [
  'text',
  'number',
  'boolean',
  'date',
  'datetime',
  'select',
  'multiselect',
  'textarea',
  'email',
  'password',
  'url',
  'phone',
  'json',
  'relation',
];

function validateSchema(json: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!json || typeof json !== 'object') {
    errors.push({ path: '$', message: 'Config must be a JSON object', severity: 'error' });
    return errors;
  }

  const schema = json as Record<string, unknown>;

  // Required top-level fields
  if (!schema.name || typeof schema.name !== 'string') {
    errors.push({
      path: '$.name',
      message: '"name" is required and must be a string',
      severity: 'error',
    });
  }
  if (!schema.label || typeof schema.label !== 'string') {
    errors.push({
      path: '$.label',
      message: '"label" is required and must be a string',
      severity: 'error',
    });
  }
  if (!Array.isArray(schema.fields)) {
    errors.push({
      path: '$.fields',
      message: '"fields" is required and must be an array',
      severity: 'error',
    });
    return errors;
  }

  // Validate each field
  const fieldNames = new Set<string>();
  (schema.fields as Record<string, unknown>[]).forEach((field, idx) => {
    const prefix = `$.fields[${idx}]`;

    if (!field.name || typeof field.name !== 'string') {
      errors.push({
        path: `${prefix}.name`,
        message: `Field ${idx}: "name" is required`,
        severity: 'error',
      });
    } else if (fieldNames.has(field.name as string)) {
      errors.push({
        path: `${prefix}.name`,
        message: `Duplicate field name: "${field.name}"`,
        severity: 'error',
      });
    } else {
      fieldNames.add(field.name as string);
    }

    if (!field.label || typeof field.label !== 'string') {
      errors.push({
        path: `${prefix}.label`,
        message: `Field ${idx}: "label" is required`,
        severity: 'error',
      });
    }

    if (!field.type || !VALID_FIELD_TYPES.includes(field.type as FieldType)) {
      errors.push({
        path: `${prefix}.type`,
        message: `Field ${idx}: invalid type "${String(field.type)}". Must be one of: ${VALID_FIELD_TYPES.join(', ')}`,
        severity: 'error',
      });
    }

    // select/multiselect must have options
    if (
      (field.type === 'select' || field.type === 'multiselect') &&
      !Array.isArray(field.options)
    ) {
      errors.push({
        path: `${prefix}.options`,
        message: `Field "${field.name}": select/multiselect requires "options" array`,
        severity: 'warning',
      });
    }

    // relation must have relation config
    if (field.type === 'relation' && !field.relation) {
      errors.push({
        path: `${prefix}.relation`,
        message: `Field "${field.name}": relation type requires "relation" config`,
        severity: 'warning',
      });
    }

    // Validation object checks
    if (field.validation && typeof field.validation === 'object') {
      const v = field.validation as Record<string, unknown>;
      if (v.min !== undefined && typeof v.min !== 'number') {
        errors.push({
          path: `${prefix}.validation.min`,
          message: `Field "${field.name}": validation.min must be a number`,
          severity: 'error',
        });
      }
      if (v.max !== undefined && typeof v.max !== 'number') {
        errors.push({
          path: `${prefix}.validation.max`,
          message: `Field "${field.name}": validation.max must be a number`,
          severity: 'error',
        });
      }
    }
  });

  // Warnings for missing optional but recommended fields
  if (!schema.primaryKey) {
    errors.push({
      path: '$.primaryKey',
      message: '"primaryKey" recommended for table identity',
      severity: 'warning',
    });
  }
  if (!schema.displayField) {
    errors.push({
      path: '$.displayField',
      message: '"displayField" recommended for relation display',
      severity: 'warning',
    });
  }

  // Check primaryKey field exists
  if (schema.primaryKey && Array.isArray(schema.fields)) {
    const pk = (schema.fields as Record<string, unknown>[]).find(
      (f) => f.name === schema.primaryKey,
    );
    if (!pk) {
      errors.push({
        path: '$.primaryKey',
        message: `primaryKey "${schema.primaryKey}" not found in fields`,
        severity: 'error',
      });
    }
  }

  return errors;
}

// ─── Section Wrapper ─────────────────────────────────────────

function Section({
  title,
  description,
  children,
  badge,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
      <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        </div>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// JSON EDITOR PANEL
// ═══════════════════════════════════════════════════════════════

function JsonEditorPanel({
  value,
  onChange,
  errors,
}: {
  value: string;
  onChange: (v: string) => void;
  errors: ValidationError[];
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineCount = value.split('\n').length;

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
      toast.success('Formatted');
    } catch {
      toast.error('Cannot format: invalid JSON');
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed));
      toast.success('Minified');
    } catch {
      toast.error('Cannot minify: invalid JSON');
    }
  };

  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warnCount = errors.filter((e) => e.severity === 'warning').length;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-neutral-800 rounded-t-lg border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-mono">EntitySchema JSON</span>
          <span className="text-[10px] text-neutral-500">{lineCount} lines</span>
        </div>
        <div className="flex items-center gap-1">
          {errorCount > 0 && (
            <span className="text-[10px] bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full">
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-[10px] bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full">
              {warnCount} warning{warnCount !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={handleFormat}
            className="text-[10px] text-neutral-400 hover:text-white px-2 py-0.5 rounded hover:bg-neutral-700 transition-colors"
          >
            Format
          </button>
          <button
            onClick={handleMinify}
            className="text-[10px] text-neutral-400 hover:text-white px-2 py-0.5 rounded hover:bg-neutral-700 transition-colors"
          >
            Minify
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative flex-1 min-h-0">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full h-full font-mono text-[12px] leading-5 text-green-400 bg-neutral-900 p-4 pl-12
            resize-none outline-none focus:ring-2 focus:ring-primary-500/40 rounded-b-lg
            scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900"
          style={{ tabSize: 2 }}
        />
        {/* Line numbers */}
        <div className="absolute top-0 left-0 w-10 h-full pt-4 pr-2 text-right font-mono text-[12px] leading-5 text-neutral-600 select-none overflow-hidden pointer-events-none">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION PANEL
// ═══════════════════════════════════════════════════════════════

function ValidationPanel({ errors }: { errors: ValidationError[] }) {
  if (errors.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
        <span className="text-green-600 text-sm">✓</span>
        <span className="text-xs text-green-700 font-medium">
          Schema is valid. All checks passed.
        </span>
      </div>
    );
  }

  const errs = errors.filter((e) => e.severity === 'error');
  const warns = errors.filter((e) => e.severity === 'warning');

  return (
    <div className="space-y-2">
      {errs.length > 0 && (
        <div className="border border-red-200 rounded-lg overflow-hidden">
          <div className="bg-red-50 px-3 py-1.5 border-b border-red-200">
            <span className="text-[10px] font-semibold text-red-700 uppercase tracking-wider">
              Errors ({errs.length})
            </span>
          </div>
          <div className="divide-y divide-red-100">
            {errs.map((e, i) => (
              <div key={i} className="px-3 py-2 text-xs flex gap-2">
                <code className="text-red-500 font-mono text-[10px] shrink-0">{e.path}</code>
                <span className="text-red-700">{e.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {warns.length > 0 && (
        <div className="border border-amber-200 rounded-lg overflow-hidden">
          <div className="bg-amber-50 px-3 py-1.5 border-b border-amber-200">
            <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
              Warnings ({warns.length})
            </span>
          </div>
          <div className="divide-y divide-amber-100">
            {warns.map((e, i) => (
              <div key={i} className="px-3 py-2 text-xs flex gap-2">
                <code className="text-amber-500 font-mono text-[10px] shrink-0">{e.path}</code>
                <span className="text-amber-700">{e.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCHEMA INFO PANEL
// ═══════════════════════════════════════════════════════════════

function SchemaInfoPanel({ schema }: { schema: EntitySchema }) {
  const fieldsByType = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of schema.fields) {
      map.set(f.type, (map.get(f.type) ?? 0) + 1);
    }
    return map;
  }, [schema.fields]);

  const tableFields = schema.fields.filter((f) => f.visibleInTable).length;
  const formFields = schema.fields.filter((f) => f.visibleInCreate || f.visibleInEdit).length;
  const filterableFields = schema.fields.filter((f) => f.filterable).length;
  const sortableFields = schema.fields.filter((f) => f.sortable).length;
  const requiredFields = schema.fields.filter((f) => f.validation?.required).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <InfoCard label="Entity" value={schema.label} sub={schema.name} />
      <InfoCard
        label="Fields"
        value={String(schema.fields.length)}
        sub={`${tableFields} in table, ${formFields} in form`}
      />
      <InfoCard
        label="Filterable"
        value={String(filterableFields)}
        sub={`${sortableFields} sortable`}
      />
      <InfoCard label="Required" value={String(requiredFields)} sub={`validation rules`} />

      {/* Field type breakdown */}
      <div className="col-span-2 md:col-span-4 flex flex-wrap gap-1.5">
        {Array.from(fieldsByType.entries()).map(([type, count]) => (
          <span
            key={type}
            className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-mono"
          >
            {type}: {count}
          </span>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-neutral-200 rounded-lg px-3 py-2 bg-white">
      <div className="text-[10px] text-neutral-500 uppercase tracking-wider">{label}</div>
      <div className="text-lg font-bold text-neutral-800 mt-0.5">{value}</div>
      <div className="text-[10px] text-neutral-400 mt-0.5">{sub}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LIVE PREVIEW PANEL
// ═══════════════════════════════════════════════════════════════

function LivePreview({
  schema,
  mode,
  onModeChange,
}: {
  schema: EntitySchema;
  mode: PreviewMode;
  onModeChange: (m: PreviewMode) => void;
}) {
  const mockData = useMemo(() => generateMockData(schema, 5), [schema]);
  const [tablePage, setTablePage] = useState(1);

  // Mock edit row (first row)
  const editData = useMemo(() => mockData[0] ?? {}, [mockData]);

  return (
    <div className="space-y-3">
      {/* Mode switcher */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg w-fit">
        {(
          [
            { key: 'table', label: 'Table', icon: '📋' },
            { key: 'form-create', label: 'Create Form', icon: '➕' },
            { key: 'form-edit', label: 'Edit Form', icon: '✏️' },
          ] as const
        ).map((m) => (
          <button
            key={m.key}
            onClick={() => onModeChange(m.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${
                mode === m.key
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
              }`}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Preview content */}
      <div className="border border-dashed border-primary-300 rounded-lg p-4 bg-primary-50/30 min-h-[300px]">
        <div className="text-[10px] text-primary-500 font-medium uppercase tracking-wider mb-3">
          Live Preview — rendered from config
        </div>

        {mode === 'table' && (
          <DynamicTable
            schema={schema}
            data={mockData}
            total={mockData.length}
            page={tablePage}
            limit={schema.defaultPageSize ?? 10}
            onPageChange={setTablePage}
            onLimitChange={() => {}}
            onEdit={() => toast('Edit clicked (preview mode)')}
            onDelete={() => toast('Delete clicked (preview mode)')}
            compact
          />
        )}

        {mode === 'form-create' && (
          <DynamicForm
            schema={schema}
            mode="create"
            onSubmit={(data) => {
              toast.success('Form submitted (preview mode)');
              // eslint-disable-next-line no-console
              console.log('Create form data:', data);
            }}
            onCancel={() => toast('Cancel clicked')}
            submitText="Create"
            layout="grid"
          />
        )}

        {mode === 'form-edit' && (
          <DynamicForm
            schema={schema}
            mode="edit"
            defaultValues={editData}
            onSubmit={(data) => {
              toast.success('Form updated (preview mode)');
              // eslint-disable-next-line no-console
              console.log('Edit form data:', data);
            }}
            onCancel={() => toast('Cancel clicked')}
            submitText="Save Changes"
            layout="grid"
          />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRESET SELECTOR
// ═══════════════════════════════════════════════════════════════

function PresetSelector({ onSelect }: { onSelect: (schema: EntitySchema) => void }) {
  const presets = useMemo(
    () =>
      Object.entries(schemaRegistry).map(([key, schema]) => ({
        key,
        label: schema.label,
        icon: schema.icon ?? '📄',
        fieldCount: schema.fields.length,
      })),
    [],
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-neutral-500 font-medium">Load preset:</span>
      {presets.map((p) => (
        <button
          key={p.key}
          onClick={() => onSelect(schemaRegistry[p.key])}
          className="text-xs px-3 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-700
            hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-colors"
        >
          {p.icon} {p.label}
          <span className="ml-1 text-[10px] text-neutral-400">({p.fieldCount})</span>
        </button>
      ))}
      <button
        onClick={() => onSelect(STARTER_TEMPLATE)}
        className="text-xs px-3 py-1.5 rounded-md border border-dashed border-primary-300 bg-primary-50 text-primary-700
          hover:bg-primary-100 transition-colors"
      >
        ✨ Starter Template
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FIELD VISUAL BUILDER (quick add)
// ═══════════════════════════════════════════════════════════════

function FieldQuickAdd({ onAdd }: { onAdd: (field: FieldSchema) => void }) {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState<FieldType>('text');
  const [required, setRequired] = useState(false);

  const handleAdd = () => {
    if (!name.trim() || !label.trim()) {
      toast.error('Field name and label are required');
      return;
    }
    const field: FieldSchema = {
      name: name.trim().toLowerCase().replace(/\s+/g, '_'),
      label: label.trim(),
      type,
      sortable: ['text', 'number', 'date', 'datetime', 'email'].includes(type),
      filterable: !['textarea', 'password', 'json'].includes(type),
      editable: true,
      visibleInTable: type !== 'textarea' && type !== 'password',
      visibleInCreate: true,
      visibleInEdit: true,
      ...(required ? { validation: { required: true } } : {}),
      ...(type === 'select' || type === 'multiselect'
        ? {
            options: [
              { label: 'Option 1', value: 'option_1' },
              { label: 'Option 2', value: 'option_2' },
            ],
          }
        : {}),
    };
    onAdd(field);
    setName('');
    setLabel('');
    setType('text');
    setRequired(false);
    toast.success(`Field "${field.label}" added`);
  };

  return (
    <div className="flex items-end gap-2 flex-wrap">
      <div>
        <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="field_name"
          className="border border-neutral-300 rounded-md px-2.5 py-1.5 text-xs w-32 focus:ring-2 focus:ring-primary-500 outline-none font-mono"
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">Label</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Display Label"
          className="border border-neutral-300 rounded-md px-2.5 py-1.5 text-xs w-32 focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as FieldType)}
          className="border border-neutral-300 rounded-md px-2.5 py-1.5 text-xs w-28 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          {VALID_FIELD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-1 text-xs text-neutral-600 pb-1.5">
        <input
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          className="rounded border-neutral-300"
        />
        Required
      </label>
      <button
        onClick={handleAdd}
        className="px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-md hover:bg-primary-700 transition-colors"
      >
        + Add Field
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATUS BADGE
// ═══════════════════════════════════════════════════════════════

function StatusBadge({
  parseError,
  validationErrors,
}: {
  parseError: string | null;
  validationErrors: ValidationError[];
}) {
  if (parseError) {
    return (
      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
        JSON Parse Error
      </span>
    );
  }
  const errorCount = validationErrors.filter((e) => e.severity === 'error').length;
  if (errorCount > 0) {
    return (
      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
        {errorCount} Schema Error{errorCount !== 1 ? 's' : ''}
      </span>
    );
  }
  return (
    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Valid</span>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function ConfigPreviewPage() {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(STARTER_TEMPLATE, null, 2));
  const [previewMode, setPreviewMode] = useState<PreviewMode>('table');
  const [showEditor, setShowEditor] = useState(true);

  // Parse JSON and validate
  const { parsed, parseError, validationErrors } = useMemo(() => {
    try {
      const obj = JSON.parse(jsonText);
      const errs = validateSchema(obj);
      const hasBlockingErrors = errs.some((e) => e.severity === 'error');
      return {
        parsed: hasBlockingErrors ? null : (obj as EntitySchema),
        parseError: null,
        validationErrors: errs,
      };
    } catch (e) {
      return {
        parsed: null,
        parseError: e instanceof Error ? e.message : 'Invalid JSON',
        validationErrors: [] as ValidationError[],
      };
    }
  }, [jsonText]);

  // Update JSON from preset
  const loadPreset = useCallback((schema: EntitySchema) => {
    setJsonText(JSON.stringify(schema, null, 2));
    toast.success(`Loaded: ${schema.label}`);
  }, []);

  // Add field via visual builder
  const addField = useCallback(
    (field: FieldSchema) => {
      try {
        const current = JSON.parse(jsonText) as EntitySchema;
        current.fields = [...(current.fields ?? []), field];
        setJsonText(JSON.stringify(current, null, 2));
      } catch {
        toast.error('Cannot add field: fix JSON errors first');
      }
    },
    [jsonText],
  );

  // Export config
  const handleExport = useCallback(() => {
    try {
      const obj = JSON.parse(jsonText);
      const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${obj.name ?? 'entity'}.schema.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Config exported');
    } catch {
      toast.error('Cannot export: invalid JSON');
    }
  }, [jsonText]);

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(jsonText).then(
      () => toast.success('Copied to clipboard'),
      () => toast.error('Failed to copy'),
    );
  }, [jsonText]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-800">🧩 Module Config Preview</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Low-code lite mode — Edit EntitySchema JSON config, see live rendered UI (table + forms),
          validate schema, and export config. Platform mindset: everything is config-driven.
        </p>
      </div>

      {/* Architecture Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <h3 className="text-xs font-semibold text-blue-800 mb-1">Config-Driven Architecture</h3>
        <p className="text-xs text-blue-700">
          <code className="bg-blue-100 px-1 rounded">EntitySchema</code> → defines fields, types,
          validation, relations, permissions →{' '}
          <code className="bg-blue-100 px-1 rounded">DynamicTable</code> auto-renders columns +{' '}
          <code className="bg-blue-100 px-1 rounded">DynamicForm</code> auto-renders inputs +{' '}
          <code className="bg-blue-100 px-1 rounded">QueryBuilder</code> auto-resolves fields. One
          JSON config drives the entire CRUD module.
        </p>
      </div>

      {/* Presets */}
      <Section
        title="Load Config Preset"
        description="Load an existing entity schema from the registry, or start from the template."
      >
        <PresetSelector onSelect={loadPreset} />
      </Section>

      {/* Editor + Preview Split */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditor(!showEditor)}
            className={`text-xs px-3 py-1.5 rounded-md border transition-all ${
              showEditor
                ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {showEditor ? '{ } Editor' : '{ } Show Editor'}
          </button>
          <button
            onClick={handleCopy}
            className="text-xs px-3 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-600
              hover:bg-neutral-50 transition-colors"
          >
            Copy
          </button>
          <button
            onClick={handleExport}
            className="text-xs px-3 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-600
              hover:bg-neutral-50 transition-colors"
          >
            Export JSON
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <StatusBadge parseError={parseError} validationErrors={validationErrors} />
        </div>
      </div>

      <div className={`grid gap-4 ${showEditor ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* JSON Editor */}
        {showEditor && (
          <div className="min-h-[500px] flex flex-col">
            <JsonEditorPanel
              value={jsonText}
              onChange={setJsonText}
              errors={[
                ...(parseError
                  ? [{ path: 'JSON', message: parseError, severity: 'error' as const }]
                  : []),
                ...validationErrors,
              ]}
            />
          </div>
        )}

        {/* Right side: Preview + Validation */}
        <div className="space-y-4">
          {/* Schema Info */}
          {parsed && (
            <Section
              title={`${parsed.icon ?? '📄'} ${parsed.label}`}
              description={parsed.description ?? parsed.name}
              badge={
                <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                  {parsed.fields.length} fields
                </span>
              }
            >
              <SchemaInfoPanel schema={parsed} />
            </Section>
          )}

          {/* Validation Results */}
          <Section
            title="Schema Validation"
            description="Real-time validation of EntitySchema structure, field types, and constraints."
          >
            <ValidationPanel
              errors={[
                ...(parseError
                  ? [{ path: 'JSON', message: parseError, severity: 'error' as const }]
                  : []),
                ...validationErrors,
              ]}
            />
          </Section>

          {/* Live Preview */}
          {parsed && (
            <Section
              title="Live Preview"
              description="Config-driven rendering: DynamicTable and DynamicForm from EntitySchema."
            >
              <LivePreview schema={parsed} mode={previewMode} onModeChange={setPreviewMode} />
            </Section>
          )}
        </div>
      </div>

      {/* Visual Field Builder */}
      <Section
        title="Quick Field Builder"
        description="Visually add a new field to the current config. Inserted into the JSON editor automatically."
      >
        <FieldQuickAdd onAdd={addField} />
      </Section>

      {/* Checklist */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <h3 className="text-xs font-semibold text-green-800 mb-2">Checklist</h3>
        <ul className="text-xs text-green-700 space-y-0.5">
          <li>✅ Edit JSON config — Full JSON editor with line numbers, format, minify</li>
          <li>
            ✅ Live preview render — DynamicTable + DynamicForm (create & edit) from EntitySchema
          </li>
          <li>
            ✅ Validate schema — Real-time validation (required fields, types, duplicates,
            relations)
          </li>
          <li>✅ Export config — Download as .schema.json file + copy to clipboard</li>
          <li>
            ✅ Preset loader — Load any registered entity schema (Users, Orders, Products, etc.)
          </li>
          <li>✅ Visual field builder — Quick-add fields without writing JSON</li>
          <li>✅ Schema info panel — Field type breakdown, visibility stats, validation summary</li>
        </ul>
      </div>
    </div>
  );
}
