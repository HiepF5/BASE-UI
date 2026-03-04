import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BaseMultiSelect } from '..';

const options = [
  { label: 'React', value: 'react' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Tailwind CSS', value: 'tailwind' },
  { label: 'Vite', value: 'vite' },
  { label: 'Zustand', value: 'zustand' },
  { label: 'React Query', value: 'react-query' },
];

const meta: Meta<typeof BaseMultiSelect> = {
  title: 'Base/Form/BaseMultiSelect',
  component: BaseMultiSelect,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    searchable: { control: 'boolean' },
    maxDisplay: { control: 'number' },
  },
};
export default meta;
type Story = StoryObj<typeof BaseMultiSelect>;

export const Default: Story = {
  render: () => {
    const [val, setVal] = useState<(string | number)[]>(['react']);
    return (
      <BaseMultiSelect
        label="Tech Stack"
        options={options}
        value={val}
        onChange={setVal}
        placeholder="Select technologies..."
      />
    );
  },
};

export const Searchable: Story = {
  render: () => {
    const [val, setVal] = useState<(string | number)[]>([]);
    return (
      <BaseMultiSelect
        label="Searchable"
        options={options}
        value={val}
        onChange={setVal}
        searchable
        placeholder="Type to search..."
      />
    );
  },
};

export const WithError: Story = {
  render: () => {
    const [val, setVal] = useState<(string | number)[]>([]);
    return (
      <BaseMultiSelect
        label="Required Field"
        options={options}
        value={val}
        onChange={setVal}
        error="Please select at least one"
        required
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <BaseMultiSelect
      label="Disabled"
      options={options}
      value={['react', 'typescript']}
      onChange={() => {}}
      disabled
    />
  ),
};
