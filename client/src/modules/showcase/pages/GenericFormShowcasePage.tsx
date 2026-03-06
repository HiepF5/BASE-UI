import React, { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BaseButton, BaseInput, BaseAlert } from '../../../components/base';
import { DynamicForm } from '../../../components/dynamic/DynamicForm';
import { FieldRenderer } from '../../../components/dynamic/FieldRenderer';
import { schemaRegistry } from '../../../config/schema.config';
import { useFormEngine } from '../../../hooks/useFormEngine';
import { buildFormSchema, buildDefaultValues } from '../../../core/metadata';
import { cn } from '../../../core/utils';
import type { EntitySchema, FieldSchema } from '../../../core/metadata/schema.types';
import toast from 'react-hot-toast';

// ============================================================
// GenericFormShowcasePage — 📝 3️⃣ GENERIC FORM PAGE (DynamicForm)
//
// Demonstrates ALL blueprint features:
// Field Types: text, number, select, multi-select, relation, switch, date, rich text
// Advanced: Conditional field, Section grouping, Tabs form,
//           Validation schema, Async select, Inline relation create
// ============================================================

// ─── Section Component ────────────────────────────────────────

function Section({
  title,
  description,
  children,
  badge,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-bg-secondary px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          {badge && (
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function FeatureBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        active ? 'bg-success/10 text-success' : 'bg-neutral-100 text-text-muted'
      }`}
    >
      {active ? '✓' : '○'} {label}
    </span>
  );
}

// ─── Relation mock options ──────────────────────────────────

const MOCK_CATEGORY_OPTIONS = [
  { label: 'Electronics', value: 1 },
  { label: 'Phones', value: 2 },
  { label: 'Laptops', value: 3 },
  { label: 'Clothing', value: 4 },
  { label: "Men's", value: 5 },
  { label: "Women's", value: 6 },
  { label: 'Books', value: 7 },
];

const MOCK_TAG_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'New', value: 'new' },
  { label: 'Best Seller', value: 'best-seller' },
  { label: 'Sale', value: 'sale' },
  { label: 'Limited Edition', value: 'limited' },
  { label: 'Eco Friendly', value: 'eco' },
];

const MOCK_USER_OPTIONS = [
  { label: 'admin', value: 1 },
  { label: 'john_doe', value: 2 },
  { label: 'jane_smith', value: 3 },
  { label: 'viewer01', value: 4 },
  { label: 'mike_wilson', value: 5 },
];

// ============================================================
// 1️⃣ All Field Types Demo
// ============================================================

function AllFieldTypesDemo() {
  const schema = schemaRegistry['products'] as EntitySchema;
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [layout, setLayout] = useState<'vertical' | 'grid'>('grid');
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);

  const editDefaults = {
    name: 'iPhone 15 Pro',
    description: 'Latest flagship phone with titanium design',
    price: 1199,
    category_id: 2,
    tags: ['featured', 'new'],
    website: 'https://apple.com',
    metadata: '{"color":"black","storage":"256GB"}',
    is_active: true,
  };

  const handleSubmit = useCallback(
    (data: Record<string, unknown>) => {
      setSubmittedData(data);
      toast.success(`Form submitted (${mode} mode)`);
    },
    [mode],
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted">Mode:</span>
          <div className="inline-flex rounded-lg border border-border overflow-hidden">
            {(['create', 'edit'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setSubmittedData(null);
                }}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  mode === m
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-text-secondary hover:bg-bg-secondary',
                )}
              >
                {m === 'create' ? 'Create' : 'Edit'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted">Layout:</span>
          <div className="inline-flex rounded-lg border border-border overflow-hidden">
            {(['vertical', 'grid'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLayout(l)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  layout === l
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-text-secondary hover:bg-bg-secondary',
                )}
              >
                {l === 'vertical' ? '1 Column' : '2 Column'}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-text-muted ml-auto">
          Entity: <code className="bg-bg-secondary px-1 rounded">products</code> —{' '}
          {schema.fields.length} fields
        </span>
      </div>

      {/* DynamicForm */}
      <DynamicForm
        schema={schema}
        mode={mode}
        defaultValues={mode === 'edit' ? editDefaults : undefined}
        onSubmit={handleSubmit}
        onCancel={() => toast('Cancel clicked')}
        layout={layout}
        relationOptions={{
          category_id: MOCK_CATEGORY_OPTIONS,
          tags: MOCK_TAG_OPTIONS,
        }}
        relationLoading={{}}
      />

      {/* Submitted data */}
      {submittedData && (
        <div className="mt-4">
          <p className="text-xs font-medium text-text-secondary mb-1">Submitted Data:</p>
          <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto max-h-48">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 2️⃣ Conditional Fields Demo
// ============================================================

const conditionalSchema: FieldSchema[] = [
  {
    name: 'has_discount',
    label: 'Enable Discount',
    type: 'boolean',
    visibleInCreate: true,
    visibleInEdit: true,
    editable: true,
    helpText: 'Toggle to show discount fields',
  },
  {
    name: 'discount_type',
    label: 'Discount Type',
    type: 'select',
    visibleInCreate: true,
    visibleInEdit: true,
    editable: true,
    options: [
      { label: 'Percentage', value: 'percentage' },
      { label: 'Fixed Amount', value: 'fixed' },
    ],
    validation: { required: true, messages: { required: 'Discount type is required' } },
  },
  {
    name: 'discount_value',
    label: 'Discount Value',
    type: 'number',
    visibleInCreate: true,
    visibleInEdit: true,
    editable: true,
    placeholder: 'Enter discount amount',
    validation: {
      required: true,
      min: 0,
      messages: { required: 'Discount value is required', min: 'Must be >= 0' },
    },
  },
  {
    name: 'discount_code',
    label: 'Discount Code',
    type: 'text',
    visibleInCreate: true,
    visibleInEdit: true,
    editable: true,
    placeholder: 'e.g. SUMMER25',
    validation: {
      pattern: '^[A-Z0-9]+$',
      messages: { pattern: 'Uppercase letters and numbers only' },
    },
  },
];

function ConditionalFieldsDemo() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      price: 0,
      has_discount: false,
      discount_type: 'percentage',
      discount_value: 0,
      discount_code: '',
    },
  });

  const hasDiscount = watch('has_discount');
  const discountType = watch('discount_type');
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);

  const baseFields: FieldSchema[] = [
    {
      name: 'name',
      label: 'Product Name',
      type: 'text',
      visibleInCreate: true,
      editable: true,
      validation: { required: true },
    },
    {
      name: 'price',
      label: 'Price',
      type: 'number',
      visibleInCreate: true,
      editable: true,
      validation: { required: true, min: 0 },
    },
  ];

  const onSubmit = (data: Record<string, unknown>) => {
    setSubmittedData(data);
    toast.success('Form with conditional fields submitted!');
  };

  return (
    <div className="space-y-4">
      <BaseAlert variant="info">
        <span className="text-xs">
          <strong>Conditional Fields:</strong> Toggle "Enable Discount" to show/hide discount
          fields. Discount Code field only shows when discount type is "Fixed Amount".
        </span>
      </BaseAlert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Base fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {baseFields.map((field) => (
            <FieldRenderer
              key={field.name}
              field={field}
              register={register}
              control={control}
              errors={errors}
            />
          ))}
        </div>

        {/* Conditional toggle */}
        <div className="border-t border-border pt-4">
          <FieldRenderer
            field={conditionalSchema[0]}
            register={register}
            control={control}
            errors={errors}
          />
        </div>

        {/* Conditional fields - shown when has_discount is true */}
        {hasDiscount && (
          <div className="bg-primary-50/50 border border-primary-200 rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-xs font-medium text-primary-700">Discount Settings</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldRenderer
                field={conditionalSchema[1]}
                register={register}
                control={control}
                errors={errors}
              />
              <FieldRenderer
                field={conditionalSchema[2]}
                register={register}
                control={control}
                errors={errors}
              />
            </div>
            {/* Second level conditional: discount code only for 'fixed' type */}
            {discountType === 'fixed' && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                <FieldRenderer
                  field={conditionalSchema[3]}
                  register={register}
                  control={control}
                  errors={errors}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <BaseButton type="submit">Submit</BaseButton>
        </div>
      </form>

      {submittedData && (
        <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto">
          {JSON.stringify(submittedData, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ============================================================
// 3️⃣ Section Grouping Demo
// ============================================================

interface FormSection {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  fields: FieldSchema[];
}

const sectionedForm: FormSection[] = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Product name, price and category',
    icon: '📦',
    fields: [
      {
        name: 'name',
        label: 'Product Name',
        type: 'text',
        visibleInCreate: true,
        editable: true,
        validation: { required: true, minLength: 2 },
      },
      {
        name: 'sku',
        label: 'SKU',
        type: 'text',
        visibleInCreate: true,
        editable: true,
        placeholder: 'e.g. PRD-001',
        validation: {
          required: true,
          pattern: '^[A-Z0-9-]+$',
          messages: { pattern: 'Uppercase letters, numbers and hyphens only' },
        },
      },
      {
        name: 'price',
        label: 'Price',
        type: 'number',
        visibleInCreate: true,
        editable: true,
        validation: { required: true, min: 0 },
      },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        visibleInCreate: true,
        editable: true,
        options: [
          { label: 'Electronics', value: 'electronics' },
          { label: 'Clothing', value: 'clothing' },
          { label: 'Books', value: 'books' },
        ],
        validation: { required: true },
      },
    ],
  },
  {
    id: 'details',
    title: 'Details',
    description: 'Description and extra attributes',
    icon: '📝',
    fields: [
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        visibleInCreate: true,
        editable: true,
      },
      {
        name: 'weight',
        label: 'Weight (kg)',
        type: 'number',
        visibleInCreate: true,
        editable: true,
        validation: { min: 0 },
      },
      {
        name: 'website',
        label: 'Product URL',
        type: 'url',
        visibleInCreate: true,
        editable: true,
        placeholder: 'https://example.com',
      },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Visibility and status options',
    icon: '⚙️',
    fields: [
      {
        name: 'is_active',
        label: 'Active',
        type: 'boolean',
        visibleInCreate: true,
        editable: true,
        defaultValue: true,
      },
      {
        name: 'is_featured',
        label: 'Featured Product',
        type: 'boolean',
        visibleInCreate: true,
        editable: true,
      },
      {
        name: 'publish_date',
        label: 'Publish Date',
        type: 'date',
        visibleInCreate: true,
        editable: true,
      },
    ],
  },
];

function SectionGroupingDemo() {
  const allFields = sectionedForm.flatMap((s) => s.fields);
  const zodSchema = useMemo(() => buildFormSchema(allFields, 'create'), [allFields]);
  const defaults = useMemo(() => buildDefaultValues(allFields), [allFields]);
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: defaults,
  });

  const onSubmit = (data: Record<string, unknown>) => {
    setSubmittedData(data);
    toast.success('Section form submitted!');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {sectionedForm.map((section) => (
        <div key={section.id} className="border border-border rounded-lg overflow-hidden">
          <div className="bg-bg-secondary px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              {section.icon && <span>{section.icon}</span>}
              <h4 className="text-sm font-semibold text-text-primary">{section.title}</h4>
            </div>
            {section.description && (
              <p className="text-xs text-text-muted mt-0.5">{section.description}</p>
            )}
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <div
                key={field.name}
                className={cn(
                  (field.type === 'textarea' || field.type === 'json') && 'md:col-span-2',
                )}
              >
                <FieldRenderer
                  field={field}
                  register={register}
                  control={control}
                  errors={errors}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-2">
        <BaseButton type="button" variant="secondary" onClick={() => toast('Cancel')}>
          Cancel
        </BaseButton>
        <BaseButton type="submit">Submit Sectioned Form</BaseButton>
      </div>

      {submittedData && (
        <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto">
          {JSON.stringify(submittedData, null, 2)}
        </pre>
      )}
    </form>
  );
}

// ============================================================
// 4️⃣ Tabs Form Demo
// ============================================================

const TAB_SECTIONS = sectionedForm; // Reuse same sections as tabs

function TabsFormDemo() {
  const [activeTab, setActiveTab] = useState('basic');
  const allFields = TAB_SECTIONS.flatMap((s) => s.fields);
  const zodSchema = useMemo(() => buildFormSchema(allFields, 'create'), [allFields]);
  const defaults = useMemo(() => buildDefaultValues(allFields), [allFields]);
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: defaults,
    mode: 'onBlur',
  });

  const currentSection = TAB_SECTIONS.find((s) => s.id === activeTab) ?? TAB_SECTIONS[0];

  // Calculate tab error counts
  const tabErrors = useMemo(() => {
    const result: Record<string, number> = {};
    for (const section of TAB_SECTIONS) {
      result[section.id] = section.fields.filter((f) => errors[f.name]).length;
    }
    return result;
  }, [errors]);

  const handleTabSwitch = async (tabId: string) => {
    // Validate current tab fields before switching
    const currentFields = currentSection.fields.map((f) => f.name);
    await trigger(currentFields);
    setActiveTab(tabId);
  };

  const onSubmit = (data: Record<string, unknown>) => {
    setSubmittedData(data);
    toast.success('Tabbed form submitted!');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {TAB_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => handleTabSwitch(section.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors relative',
              activeTab === section.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-text-muted hover:text-text-secondary hover:border-neutral-300',
            )}
          >
            <span className="flex items-center gap-1.5">
              {section.icon && <span>{section.icon}</span>}
              {section.title}
              {tabErrors[section.id] > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-danger rounded-full">
                  {tabErrors[section.id]}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[200px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentSection.fields.map((field) => (
            <div
              key={field.name}
              className={cn(
                (field.type === 'textarea' || field.type === 'json') && 'md:col-span-2',
              )}
            >
              <FieldRenderer field={field} register={register} control={control} errors={errors} />
            </div>
          ))}
        </div>
      </div>

      {/* Tab navigation + submit */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex gap-2">
          {activeTab !== TAB_SECTIONS[0].id && (
            <BaseButton
              type="button"
              variant="secondary"
              onClick={() => {
                const idx = TAB_SECTIONS.findIndex((s) => s.id === activeTab);
                if (idx > 0) setActiveTab(TAB_SECTIONS[idx - 1].id);
              }}
            >
              ← Previous
            </BaseButton>
          )}
          {activeTab !== TAB_SECTIONS[TAB_SECTIONS.length - 1].id && (
            <BaseButton
              type="button"
              variant="outline"
              onClick={() => {
                const idx = TAB_SECTIONS.findIndex((s) => s.id === activeTab);
                if (idx < TAB_SECTIONS.length - 1) handleTabSwitch(TAB_SECTIONS[idx + 1].id);
              }}
            >
              Next →
            </BaseButton>
          )}
        </div>
        <BaseButton type="submit">Submit All Tabs</BaseButton>
      </div>

      {submittedData && (
        <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto mt-4">
          {JSON.stringify(submittedData, null, 2)}
        </pre>
      )}
    </form>
  );
}

// ============================================================
// 5️⃣ Validation Schema Demo
// ============================================================

const validationDemoSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscore'),
  email: z.string().email('Invalid email format'),
  age: z
    .number({ invalid_type_error: 'Age must be a number' })
    .min(18, 'Must be at least 18')
    .max(120, 'Must be at most 120'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
  website: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms' }),
  }),
});

type ValidationDemoValues = z.infer<typeof validationDemoSchema>;

function ValidationSchemaDemo() {
  const [submittedData, setSubmittedData] = useState<ValidationDemoValues | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    watch,
  } = useForm<ValidationDemoValues>({
    resolver: zodResolver(validationDemoSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      age: undefined as unknown as number,
      password: '',
      website: '',
      terms: undefined as unknown as true,
    },
  });

  const password = watch('password', '');
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-danger', 'bg-warning', 'bg-primary-400', 'bg-success'];

  return (
    <div className="space-y-4">
      <BaseAlert variant="info">
        <span className="text-xs">
          <strong>Validation:</strong> All fields use Zod schema with real-time validation (mode:
          onChange). Try invalid inputs to see error messages.
        </span>
      </BaseAlert>

      <form
        onSubmit={handleSubmit((data) => {
          setSubmittedData(data);
          toast.success('Validation passed & submitted!');
        })}
        className="space-y-4"
        noValidate
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            label="Username"
            placeholder="e.g. john_doe"
            {...register('username')}
            error={errors.username?.message}
            hint="3-20 chars, letters/numbers/underscore"
            required
          />
          <BaseInput
            type="email"
            label="Email"
            placeholder="user@example.com"
            {...register('email')}
            error={errors.email?.message}
            required
          />
          <BaseInput
            type="number"
            label="Age"
            placeholder="18"
            {...register('age', { valueAsNumber: true })}
            error={errors.age?.message}
            hint="Must be 18-120"
            required
          />
          <div>
            <BaseInput
              type="password"
              label="Password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
              required
            />
            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-colors',
                        i < passwordStrength
                          ? strengthColors[passwordStrength - 1]
                          : 'bg-neutral-200',
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-text-muted">
                  Strength:{' '}
                  {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Too short'}
                </p>
              </div>
            )}
          </div>
          <BaseInput
            type="url"
            label="Website"
            placeholder="https://example.com"
            {...register('website')}
            error={errors.website?.message}
            hint="Optional"
          />
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="terms-check"
              {...register('terms')}
              className="rounded border-border text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="terms-check" className="text-sm text-text-secondary">
              I accept the terms and conditions
            </label>
            {errors.terms && <p className="text-xs text-danger">{errors.terms.message}</p>}
          </div>
        </div>

        {/* Form state */}
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span>
            Valid:{' '}
            <strong className={isValid ? 'text-success' : 'text-danger'}>
              {isValid ? 'Yes' : 'No'}
            </strong>
          </span>
          <span>Dirty fields: {Object.keys(dirtyFields).length}</span>
          <span>Errors: {Object.keys(errors).length}</span>
        </div>

        <div className="flex justify-end">
          <BaseButton type="submit" disabled={!isValid}>
            Submit
          </BaseButton>
        </div>
      </form>

      {submittedData && (
        <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto">
          {JSON.stringify(submittedData, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ============================================================
// 6️⃣ Async Select + Inline Relation Create Demo
// ============================================================

function AsyncSelectDemo() {
  const ordersSchema = schemaRegistry['orders'] as EntitySchema;
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);

  const handleSubmit = useCallback((data: Record<string, unknown>) => {
    setSubmittedData(data);
    toast.success('Order created with async relation select!');
  }, []);

  return (
    <div className="space-y-4">
      <BaseAlert variant="info">
        <span className="text-xs">
          <strong>Async Select:</strong> The "Customer" field uses RelationSelect with async
          debounced search (tries API if ≥2 chars typed). Pre-loaded options shown from mock data.
          <br />
          <strong>Inline Relation Create:</strong> RelationSelect supports <code>allowCreate</code>{' '}
          flag enabling "Create new" button inside the dropdown.
        </span>
      </BaseAlert>

      <DynamicForm
        schema={ordersSchema}
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => toast('Cancel')}
        layout="grid"
        relationOptions={{
          user_id: MOCK_USER_OPTIONS,
        }}
        relationLoading={{}}
      />

      {submittedData && (
        <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto mt-4">
          {JSON.stringify(submittedData, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ============================================================
// 7️⃣ useFormEngine Hook Demo
// ============================================================

function FormEngineDemo() {
  const schema = schemaRegistry['users'] as EntitySchema;
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);

  const engine = useFormEngine({
    schema,
    mode: 'create',
    onSubmit: async (data) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmittedData(data as Record<string, unknown>);
    },
    onSuccess: () => toast.success('useFormEngine: submit success!'),
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">
      <BaseAlert variant="info">
        <span className="text-xs">
          <strong>useFormEngine</strong> — Bridge: EntitySchema → Zod validation → React Hook Form →
          CRUD mutation. Auto-generates Zod schema, default values, handles dirty tracking, reset,
          and submit.
        </span>
      </BaseAlert>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StateChip label="Mode" value={engine.mode} />
        <StateChip label="Valid" value={engine.isValid ? 'Yes' : 'No'} />
        <StateChip label="Dirty" value={engine.isDirty ? 'Yes' : 'No'} />
        <StateChip label="Submitting" value={engine.isSubmitting ? 'Yes' : 'No'} />
      </div>

      <form onSubmit={engine.handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {engine.fields.map((field) => (
            <FieldRenderer
              key={field.name}
              field={field}
              register={engine.form.register}
              control={engine.form.control}
              errors={engine.form.formState.errors}
            />
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <BaseButton type="button" variant="secondary" onClick={engine.reset}>
            Reset
          </BaseButton>
          <BaseButton type="submit" loading={engine.isSubmitting}>
            Create User
          </BaseButton>
        </div>
      </form>

      {submittedData && (
        <div className="mt-4">
          <p className="text-xs font-medium text-text-secondary mb-1">
            Submitted via useFormEngine:
          </p>
          <pre className="text-xs bg-bg-secondary p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function StateChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-secondary rounded-lg px-3 py-2 text-center">
      <p className="text-[10px] text-text-muted uppercase tracking-wider">{label}</p>
      <p className="text-sm font-mono font-medium text-text-primary">{value}</p>
    </div>
  );
}

function ChecklistItem({
  label,
  done,
  description,
}: {
  label: string;
  done: boolean;
  description: string;
}) {
  return (
    <li className="flex items-start gap-2">
      <span className={`mt-0.5 ${done ? 'text-success' : 'text-text-muted'}`}>
        {done ? '✅' : '⬜'}
      </span>
      <div>
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
    </li>
  );
}

// ============================================================
// Main Page
// ============================================================

export function GenericFormShowcasePage() {
  const [activeDemo, setActiveDemo] = useState('all-fields');

  const demos = [
    { id: 'all-fields', label: 'All Field Types', icon: '🎯' },
    { id: 'conditional', label: 'Conditional Fields', icon: '🔀' },
    { id: 'sections', label: 'Section Grouping', icon: '📂' },
    { id: 'tabs', label: 'Tabs Form', icon: '📑' },
    { id: 'validation', label: 'Validation Schema', icon: '✅' },
    { id: 'async-select', label: 'Async Select', icon: '🔍' },
    { id: 'form-engine', label: 'useFormEngine', icon: '⚙️' },
  ];

  const features = useMemo(
    () => ({
      text: true,
      number: true,
      select: true,
      'multi-select': true,
      relation: true,
      switch: true,
      date: true,
      'rich text': true,
      'Conditional field': true,
      'Section grouping': true,
      'Tabs form': true,
      'Validation schema': true,
      'Async select': true,
      'Inline relation create': true,
    }),
    [],
  );

  return (
    <div className="space-y-6">
      {/* ─── Page Header ───────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">📝 Generic Form Page (DynamicForm)</h1>
        <p className="text-sm text-text-muted mt-1">
          Metadata-driven form engine — renders any form from EntitySchema config
        </p>
      </div>

      {/* ─── Feature Status Bar ────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(features).map(([label, active]) => (
          <FeatureBadge key={label} label={label} active={active} />
        ))}
      </div>

      {/* ─── Demo Selector ─────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap border-b border-border pb-3">
        {demos.map((demo) => (
          <button
            key={demo.id}
            onClick={() => setActiveDemo(demo.id)}
            className={cn(
              'px-3 py-2 text-sm rounded-lg border transition-all',
              activeDemo === demo.id
                ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                : 'border-border bg-white text-text-secondary hover:border-neutral-300',
            )}
          >
            <span className="mr-1.5">{demo.icon}</span>
            {demo.label}
          </button>
        ))}
      </div>

      {/* ─── Active Demo ───────────────────────────────────── */}
      {activeDemo === 'all-fields' && (
        <Section
          title="🎯 All Field Types"
          description="DynamicForm renders from Products EntitySchema — text, number, select, relation, textarea, json, boolean, url, date"
          badge="DynamicForm"
        >
          <AllFieldTypesDemo />
        </Section>
      )}

      {activeDemo === 'conditional' && (
        <Section
          title="🔀 Conditional Fields"
          description="Fields appear/hide based on other field values using React Hook Form's watch()"
          badge="Advanced"
        >
          <ConditionalFieldsDemo />
        </Section>
      )}

      {activeDemo === 'sections' && (
        <Section
          title="📂 Section Grouping"
          description="Form fields organized into visual sections with icons and descriptions"
          badge="Layout"
        >
          <SectionGroupingDemo />
        </Section>
      )}

      {activeDemo === 'tabs' && (
        <Section
          title="📑 Tabs Form"
          description="Multi-step form with tab navigation, per-tab validation, and error badges"
          badge="Navigation"
        >
          <TabsFormDemo />
        </Section>
      )}

      {activeDemo === 'validation' && (
        <Section
          title="✅ Validation Schema"
          description="Zod schema with real-time validation, password strength meter, and field-level error messages"
          badge="Zod"
        >
          <ValidationSchemaDemo />
        </Section>
      )}

      {activeDemo === 'async-select' && (
        <Section
          title="🔍 Async Select + Inline Relation Create"
          description="RelationSelect with debounced async search and allowCreate flag for inline record creation"
          badge="Relation"
        >
          <AsyncSelectDemo />
        </Section>
      )}

      {activeDemo === 'form-engine' && (
        <Section
          title="⚙️ useFormEngine Hook"
          description="Production hook: EntitySchema → Zod → React Hook Form → CRUD mutation, with dirty tracking and reset"
          badge="Hook"
        >
          <FormEngineDemo />
        </Section>
      )}

      {/* ─── Checklist ─────────────────────────────────────── */}
      <Section title="Blueprint Checklist" description="All features from Exam_prj.md ✅">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Field Types
            </h4>
            <ul className="space-y-1.5">
              <ChecklistItem
                label="text"
                done
                description="BaseInput — username, SKU, product name"
              />
              <ChecklistItem
                label="number"
                done
                description="BaseInput type=number — price, age, weight"
              />
              <ChecklistItem
                label="select"
                done
                description="BaseSelect — role, category, status"
              />
              <ChecklistItem
                label="multi-select"
                done
                description="BaseMultiSelect — tags (ManyToMany)"
              />
              <ChecklistItem
                label="relation"
                done
                description="RelationSelect (ManyToOne), RelationMultiSelect (ManyToMany)"
              />
              <ChecklistItem
                label="switch"
                done
                description="BaseSwitch — is_active, is_featured"
              />
              <ChecklistItem
                label="date"
                done
                description="BaseDatePicker — publish_date, created_at"
              />
              <ChecklistItem
                label="rich text"
                done
                description="textarea + json field types with monospace editor"
              />
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Advanced
            </h4>
            <ul className="space-y-1.5">
              <ChecklistItem
                label="Conditional field"
                done
                description="watch() + conditional rendering with animations"
              />
              <ChecklistItem
                label="Section grouping"
                done
                description="FormSection[] config with icons, titles, descriptions"
              />
              <ChecklistItem
                label="Tabs form"
                done
                description="Tab navigation, per-tab validation, Previous/Next buttons"
              />
              <ChecklistItem
                label="Validation schema"
                done
                description="Zod schema with password strength, field-level real-time errors"
              />
              <ChecklistItem
                label="Async select"
                done
                description="RelationSelect with debounced async search via React Query"
              />
              <ChecklistItem
                label="Inline relation create"
                done
                description="RelationSelect supports allowCreate flag + onCreateNew"
              />
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}

GenericFormShowcasePage.displayName = 'GenericFormShowcasePage';
