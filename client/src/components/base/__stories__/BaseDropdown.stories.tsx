import type { Meta, StoryObj } from '@storybook/react';
import { BaseDropdown, type DropdownMenuEntry } from '../BaseDropdown';
import { BaseButton } from '../BaseButton';

const meta: Meta<typeof BaseDropdown> = {
  title: 'Base/Overlay/BaseDropdown',
  component: BaseDropdown,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'],
    },
    closeOnSelect: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof BaseDropdown>;

const basicItems: DropdownMenuEntry[] = [
  { key: 'edit', label: 'Edit' },
  { key: 'duplicate', label: 'Duplicate' },
  { key: 'archive', label: 'Archive' },
  { key: 'divider-1', type: 'divider' },
  { key: 'delete', label: 'Delete', danger: true },
];

export const Default: Story = {
  render: () => (
    <BaseDropdown
      trigger={({ toggle }) => (
        <BaseButton variant="outline" onClick={toggle}>
          Actions ▾
        </BaseButton>
      )}
      items={basicItems}
      onSelect={(key) => alert(`Selected: ${key}`)}
    />
  ),
};

const itemsWithIcons: DropdownMenuEntry[] = [
  { key: 'edit', label: 'Edit', icon: <span>✏️</span> },
  { key: 'copy', label: 'Copy', icon: <span>📋</span> },
  { key: 'share', label: 'Share', icon: <span>🔗</span> },
  { key: 'divider-1', type: 'divider' },
  { key: 'export', label: 'Export', icon: <span>📤</span> },
  { key: 'delete', label: 'Delete', icon: <span>🗑️</span>, danger: true },
];

export const WithIcons: Story = {
  render: () => (
    <BaseDropdown
      trigger={({ toggle }) => <BaseButton onClick={toggle}>Menu ▾</BaseButton>}
      items={itemsWithIcons}
      onSelect={(key) => alert(`Selected: ${key}`)}
    />
  ),
};

const disabledItems: DropdownMenuEntry[] = [
  { key: 'view', label: 'View' },
  { key: 'edit', label: 'Edit', disabled: true },
  { key: 'delete', label: 'Delete', disabled: true, danger: true },
];

export const WithDisabledItems: Story = {
  render: () => (
    <BaseDropdown
      trigger={({ toggle }) => (
        <BaseButton variant="outline" onClick={toggle}>
          Limited Actions ▾
        </BaseButton>
      )}
      items={disabledItems}
      onSelect={(key) => alert(`Selected: ${key}`)}
    />
  ),
};

export const Placements: Story = {
  render: () => (
    <div className="flex gap-4 items-center justify-center py-32">
      {(['bottom-start', 'bottom-end', 'top-start', 'top-end'] as const).map((pl) => (
        <BaseDropdown
          key={pl}
          trigger={({ toggle }) => (
            <BaseButton variant="outline" size="sm" onClick={toggle}>
              {pl}
            </BaseButton>
          )}
          items={basicItems}
          placement={pl}
          onSelect={(key) => alert(`${pl}: ${key}`)}
        />
      ))}
    </div>
  ),
};
