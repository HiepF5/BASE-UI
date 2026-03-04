import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BaseRadioGroup } from '..';

const options = [
  { label: 'Option A', value: 'a', description: 'First option with description' },
  { label: 'Option B', value: 'b', description: 'Second option' },
  { label: 'Option C', value: 'c' },
  { label: 'Disabled', value: 'd', disabled: true },
];

const meta: Meta<typeof BaseRadioGroup> = {
  title: 'Base/Form/BaseRadioGroup',
  component: BaseRadioGroup,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['horizontal', 'vertical'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof BaseRadioGroup>;

export const Vertical: Story = {
  render: () => {
    const [val, setVal] = useState<string | number>('a');
    return (
      <BaseRadioGroup
        name="demo-v"
        label="Choose option"
        options={options}
        value={val}
        onChange={setVal}
        direction="vertical"
      />
    );
  },
};

export const Horizontal: Story = {
  render: () => {
    const [val, setVal] = useState<string | number>('a');
    return (
      <BaseRadioGroup
        name="demo-h"
        label="Choose option"
        options={options}
        value={val}
        onChange={setVal}
        direction="horizontal"
      />
    );
  },
};

export const WithError: Story = {
  render: () => (
    <BaseRadioGroup
      name="demo-err"
      label="Required"
      options={options}
      error="Please select an option"
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <BaseRadioGroup name="s-sm" label="Small" options={options.slice(0, 3)} size="sm" />
      <BaseRadioGroup name="s-md" label="Medium" options={options.slice(0, 3)} size="md" />
      <BaseRadioGroup name="s-lg" label="Large" options={options.slice(0, 3)} size="lg" />
    </div>
  ),
};
