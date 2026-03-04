import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BaseSelect } from '..';

const options = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Disabled Option', value: 'disabled', disabled: true },
];

const meta: Meta<typeof BaseSelect> = {
  title: 'Base/Form/BaseSelect',
  component: BaseSelect,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['default', 'error'] },
    label: { control: 'text' },
    error: { control: 'text' },
    hint: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof BaseSelect>;

export const Default: Story = {
  args: { label: 'Framework', options, placeholder: 'Choose a framework...' },
};

export const WithError: Story = {
  args: { label: 'Framework', options, variant: 'error', error: 'Required field' },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-3 max-w-sm">
      <BaseSelect label="Small" size="sm" options={options} placeholder="Select..." />
      <BaseSelect label="Medium" size="md" options={options} placeholder="Select..." />
      <BaseSelect label="Large" size="lg" options={options} placeholder="Select..." />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [val, setVal] = useState('');
    return (
      <BaseSelect
        label="Pick Framework"
        options={options}
        placeholder="Select..."
        value={val}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVal(e.target.value)}
        hint={val ? `Selected: ${val}` : undefined}
      />
    );
  },
};
