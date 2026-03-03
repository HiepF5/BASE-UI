import React, { useState } from 'react';
import {
  BaseButton,
  BaseInput,
  BaseSelect,
  BaseMultiSelect,
  BaseCheckbox,
  BaseRadioGroup,
  BaseDatePicker,
  BaseSwitch,
  Stack,
  Flex,
  Grid,
  Container,
  BaseSpinner,
  BaseAlert,
} from '../../components/base';
import { ToastProvider, useToast } from '../../components/base/BaseToast';
import { cn } from '../../core/utils';

// ============================================================
// ComponentShowcasePage – Visual reference for all Week 2 components
// Form / Layout / Feedback
// ============================================================

/* ── Section wrapper ──────────────────────────────────────── */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-text border-b border-border pb-2">{title}</h2>
        {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Card({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-border bg-bg-elevated p-5', className)}>
      {title && <p className="text-sm font-semibold text-text mb-4">{title}</p>}
      {children}
    </div>
  );
}

/* ── Toast Demo (needs to be inside ToastProvider) ────────── */
function ToastDemo() {
  const toast = useToast();
  return (
    <Flex gap={3} className="flex-wrap">
      <BaseButton
        size="sm"
        variant="primary"
        onClick={() => toast.info('This is an info toast', 'Info')}
      >
        Info Toast
      </BaseButton>
      <BaseButton
        size="sm"
        variant="primary"
        onClick={() => toast.success('Operation completed successfully!', 'Success')}
      >
        Success Toast
      </BaseButton>
      <BaseButton
        size="sm"
        variant="danger"
        onClick={() => toast.error('Something went wrong.', 'Error')}
      >
        Error Toast
      </BaseButton>
      <BaseButton
        size="sm"
        variant="outline"
        onClick={() => toast.warning('Please check your input.', 'Warning')}
      >
        Warning Toast
      </BaseButton>
    </Flex>
  );
}

/* ── Main Component ───────────────────────────────────────── */
export function ComponentShowcasePage() {
  // Form state
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [multiValue, setMultiValue] = useState<(string | number)[]>(['react']);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);
  const [radioValue, setRadioValue] = useState<string | number>('option1');
  const [dateValue, setDateValue] = useState('');
  const [switchOn, setSwitchOn] = useState(false);
  const [switchTwo, setSwitchTwo] = useState(true);

  const selectOptions = [
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' },
    { label: 'Angular', value: 'angular' },
    { label: 'Svelte', value: 'svelte' },
  ];

  const multiSelectOptions = [
    { label: 'React', value: 'react' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Tailwind CSS', value: 'tailwind' },
    { label: 'Vite', value: 'vite' },
    { label: 'Zustand', value: 'zustand' },
    { label: 'React Query', value: 'react-query' },
  ];

  const radioOptions = [
    { label: 'Option A', value: 'option1', description: 'First option description' },
    { label: 'Option B', value: 'option2', description: 'Second option description' },
    { label: 'Option C', value: 'option3' },
    { label: 'Disabled', value: 'option4', disabled: true },
  ];

  const [alertOpen, setAlertOpen] = useState(true);

  return (
    <ToastProvider position="top-right">
      <div className="space-y-10 max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text">🧩 Core Components</h1>
          <p className="text-sm text-text-secondary mt-1">
            Week 2 – Form, Layout & Feedback Components | All pure presentational, CVA-driven
          </p>
        </div>

        {/* ════════════════════════════════════════════════════
            FORM COMPONENTS
           ════════════════════════════════════════════════════ */}
        <Section
          title="Form Components"
          description="Input, Select, MultiSelect, Checkbox, Radio, DatePicker, Switch"
        >
          {/* ── Button ──────────────────────────────────────── */}
          <Card title="Button – Variants & Sizes">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-muted mb-2">Variants</p>
                <Flex gap={3} className="flex-wrap">
                  <BaseButton variant="primary">Primary</BaseButton>
                  <BaseButton variant="secondary">Secondary</BaseButton>
                  <BaseButton variant="danger">Danger</BaseButton>
                  <BaseButton variant="outline">Outline</BaseButton>
                  <BaseButton variant="ghost">Ghost</BaseButton>
                </Flex>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-2">Sizes</p>
                <Flex gap={3} align="center" className="flex-wrap">
                  <BaseButton size="xs">XS</BaseButton>
                  <BaseButton size="sm">Small</BaseButton>
                  <BaseButton size="md">Medium</BaseButton>
                  <BaseButton size="lg">Large</BaseButton>
                  <BaseButton size="icon">🔔</BaseButton>
                  <BaseButton size="icon-sm">✕</BaseButton>
                </Flex>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-2">States</p>
                <Flex gap={3} className="flex-wrap">
                  <BaseButton loading>Loading...</BaseButton>
                  <BaseButton disabled>Disabled</BaseButton>
                  <BaseButton variant="danger" loading>
                    Deleting...
                  </BaseButton>
                </Flex>
              </div>
            </div>
          </Card>

          {/* ── Input ──────────────────────────────────────── */}
          <Card title="Input">
            <Grid cols={1} mdCols={2} gap={4}>
              <BaseInput
                label="Default Input"
                placeholder="Enter text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                hint="A helpful hint message"
              />
              <BaseInput
                label="With Error"
                placeholder="Invalid input"
                defaultValue="wrong"
                variant="error"
                error="This field is required"
              />
              <BaseInput
                label="Success State"
                placeholder="Validated"
                defaultValue="correct@email.com"
                variant="success"
              />
              <BaseInput
                label="Disabled"
                placeholder="Cannot edit"
                disabled
                defaultValue="Readonly value"
              />
              <BaseInput label="Small Size" size="sm" placeholder="Small input" />
              <BaseInput label="Large Size" size="lg" placeholder="Large input" />
              <BaseInput
                label="With Left Icon"
                placeholder="Search..."
                leftIcon={<span className="text-sm">🔍</span>}
              />
              <BaseInput
                label="Required Field"
                placeholder="Required"
                required
                rightIcon={<span className="text-sm">*</span>}
              />
            </Grid>
          </Card>

          {/* ── Select ─────────────────────────────────────── */}
          <Card title="Select">
            <Grid cols={1} mdCols={2} gap={4}>
              <BaseSelect
                label="Framework"
                options={selectOptions}
                placeholder="Choose a framework..."
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
              />
              <BaseSelect
                label="With Error"
                options={selectOptions}
                error="Please select a value"
                placeholder="Select..."
              />
              <BaseSelect
                label="Small"
                size="sm"
                options={selectOptions}
                placeholder="Small select"
              />
              <BaseSelect
                label="Disabled"
                options={selectOptions}
                disabled
                placeholder="Cannot change"
              />
            </Grid>
          </Card>

          {/* ── MultiSelect ────────────────────────────────── */}
          <Card title="MultiSelect">
            <Grid cols={1} mdCols={2} gap={4}>
              <BaseMultiSelect
                label="Technologies"
                options={multiSelectOptions}
                value={multiValue}
                onChange={setMultiValue}
                placeholder="Select technologies..."
                hint="Choose multiple options"
              />
              <BaseMultiSelect
                label="With Error"
                options={multiSelectOptions}
                value={[]}
                onChange={() => {}}
                error="At least one option is required"
                placeholder="Select..."
              />
            </Grid>
          </Card>

          {/* ── Checkbox ───────────────────────────────────── */}
          <Card title="Checkbox">
            <Flex gap={6} className="flex-wrap">
              <BaseCheckbox
                label="Accept Terms"
                description="I agree to the terms and conditions"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <BaseCheckbox
                label="Indeterminate"
                indeterminate={indeterminate}
                onChange={() => setIndeterminate(false)}
              />
              <BaseCheckbox label="Disabled" disabled checked />
              <BaseCheckbox label="With Error" error="This field is required" />
              <BaseCheckbox label="Small" size="sm" />
              <BaseCheckbox label="Large" size="lg" />
            </Flex>
          </Card>

          {/* ── Radio ──────────────────────────────────────── */}
          <Card title="Radio Group">
            <Grid cols={1} mdCols={2} gap={6}>
              <BaseRadioGroup
                name="demo-radio-v"
                label="Vertical (default)"
                options={radioOptions}
                value={radioValue}
                onChange={setRadioValue}
                required
              />
              <BaseRadioGroup
                name="demo-radio-h"
                label="Horizontal"
                options={radioOptions.slice(0, 3)}
                value={radioValue}
                onChange={setRadioValue}
                direction="horizontal"
              />
            </Grid>
          </Card>

          {/* ── DatePicker ─────────────────────────────────── */}
          <Card title="DatePicker">
            <Grid cols={1} mdCols={3} gap={4}>
              <BaseDatePicker
                label="Date"
                mode="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
              />
              <BaseDatePicker label="Date & Time" mode="datetime-local" />
              <BaseDatePicker label="Time Only" mode="time" />
            </Grid>
          </Card>

          {/* ── Switch ─────────────────────────────────────── */}
          <Card title="Switch">
            <Flex gap={8} className="flex-wrap">
              <BaseSwitch
                label="Notifications"
                description="Receive push notifications"
                checked={switchOn}
                onChange={(e) => setSwitchOn(e.target.checked)}
              />
              <BaseSwitch
                label="Dark Mode"
                checked={switchTwo}
                onChange={(e) => setSwitchTwo(e.target.checked)}
                size="sm"
              />
              <BaseSwitch label="Disabled" disabled checked={false} onChange={() => {}} />
              <BaseSwitch label="Large & On" size="lg" checked onChange={() => {}} />
            </Flex>
          </Card>
        </Section>

        {/* ════════════════════════════════════════════════════
            LAYOUT COMPONENTS
           ════════════════════════════════════════════════════ */}
        <Section title="Layout Components" description="Stack, Flex, Grid, Container">
          {/* ── Stack ──────────────────────────────────────── */}
          <Card title="Stack (vertical)">
            <Stack gap={3}>
              <div className="bg-primary/10 border border-primary/30 rounded-md p-3 text-sm text-text">
                Item 1
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-md p-3 text-sm text-text">
                Item 2
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-md p-3 text-sm text-text">
                Item 3
              </div>
            </Stack>
          </Card>

          {/* ── Flex ───────────────────────────────────────── */}
          <Card title="Flex (horizontal)">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-muted mb-2">justify="between" | align="center"</p>
                <Flex justify="between" align="center" gap={4}>
                  <div className="bg-accent/10 border border-accent/30 rounded-md px-4 py-2 text-sm text-text">
                    Left
                  </div>
                  <div className="bg-accent/10 border border-accent/30 rounded-md px-4 py-2 text-sm text-text">
                    Center
                  </div>
                  <div className="bg-accent/10 border border-accent/30 rounded-md px-4 py-2 text-sm text-text">
                    Right
                  </div>
                </Flex>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-2">wrap | gap={3}</p>
                <Flex gap={3} wrap>
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-accent/10 border border-accent/30 rounded-md px-4 py-2 text-sm text-text"
                    >
                      Tag {i + 1}
                    </div>
                  ))}
                </Flex>
              </div>
            </div>
          </Card>

          {/* ── Grid ───────────────────────────────────────── */}
          <Card title="Grid">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-muted mb-2">
                  cols={4} | responsive: smCols={1} mdCols={2} lgCols={4}
                </p>
                <Grid cols={4} smCols={1} mdCols={2} lgCols={4} gap={3}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-success/10 border border-success/30 rounded-md p-4 text-center text-sm text-text"
                    >
                      Cell {i + 1}
                    </div>
                  ))}
                </Grid>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-2">
                  cols={3} | gap={4}
                </p>
                <Grid cols={3} gap={4}>
                  <div className="bg-warning/10 border border-warning/30 rounded-md p-6 text-center text-text">
                    1/3
                  </div>
                  <div className="bg-warning/10 border border-warning/30 rounded-md p-6 text-center text-text">
                    2/3
                  </div>
                  <div className="bg-warning/10 border border-warning/30 rounded-md p-6 text-center text-text">
                    3/3
                  </div>
                </Grid>
              </div>
            </div>
          </Card>

          {/* ── Container ──────────────────────────────────── */}
          <Card title="Container">
            <div className="space-y-4">
              {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                <div key={size}>
                  <p className="text-xs text-text-muted mb-1">size="{size}"</p>
                  <Container size={size} className="bg-info/5 border border-info/20 rounded-md p-3">
                    <p className="text-sm text-text text-center">Container {size}</p>
                  </Container>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* ════════════════════════════════════════════════════
            FEEDBACK COMPONENTS
           ════════════════════════════════════════════════════ */}
        <Section title="Feedback Components" description="Spinner, Alert, Toast">
          {/* ── Spinner ────────────────────────────────────── */}
          <Card title="Spinner">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-muted mb-3">Sizes</p>
                <Flex gap={6} align="center">
                  <div className="flex flex-col items-center gap-1">
                    <BaseSpinner size="xs" />
                    <span className="text-[10px] text-text-muted">xs</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <BaseSpinner size="sm" />
                    <span className="text-[10px] text-text-muted">sm</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <BaseSpinner size="md" />
                    <span className="text-[10px] text-text-muted">md</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <BaseSpinner size="lg" />
                    <span className="text-[10px] text-text-muted">lg</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <BaseSpinner size="xl" />
                    <span className="text-[10px] text-text-muted">xl</span>
                  </div>
                </Flex>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-3">Colors</p>
                <Flex gap={6} align="center">
                  <div className="flex flex-col items-center gap-1">
                    <BaseSpinner color="primary" />
                    <span className="text-[10px] text-text-muted">primary</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <BaseSpinner color="muted" />
                    <span className="text-[10px] text-text-muted">muted</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-neutral-800 rounded-lg px-4 py-3">
                    <BaseSpinner color="white" />
                    <span className="text-[10px] text-neutral-300">white</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <BaseSpinner color="current" className="text-danger" />
                    <span className="text-[10px] text-text-muted">current</span>
                  </div>
                </Flex>
              </div>
            </div>
          </Card>

          {/* ── Alert ──────────────────────────────────────── */}
          <Card title="Alert">
            <Stack gap={3}>
              <BaseAlert variant="info" title="Information">
                This is an informational alert message with helpful details.
              </BaseAlert>
              <BaseAlert variant="success" title="Success">
                Your changes have been saved successfully.
              </BaseAlert>
              <BaseAlert variant="warning" title="Warning">
                Please review your settings before proceeding.
              </BaseAlert>
              <BaseAlert variant="danger" title="Error">
                Failed to connect to the database. Please check your credentials.
              </BaseAlert>
              <BaseAlert variant="neutral">A neutral notification without a title.</BaseAlert>
              {alertOpen && (
                <BaseAlert
                  variant="info"
                  title="Closable Alert"
                  closable
                  onClose={() => setAlertOpen(false)}
                >
                  Click the × button to dismiss this alert.
                </BaseAlert>
              )}
              {!alertOpen && (
                <BaseButton size="sm" variant="outline" onClick={() => setAlertOpen(true)}>
                  Show Closable Alert Again
                </BaseButton>
              )}
            </Stack>
          </Card>

          {/* ── Toast ──────────────────────────────────────── */}
          <Card title="Toast (click to trigger)">
            <ToastDemo />
          </Card>
        </Section>
      </div>
    </ToastProvider>
  );
}
