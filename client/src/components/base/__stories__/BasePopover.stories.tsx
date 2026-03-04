import type { Meta, StoryObj } from '@storybook/react';
import { BasePopover } from '../BasePopover';
import { BaseButton } from '../BaseButton';

const meta: Meta<typeof BasePopover> = {
  title: 'Base/Overlay/BasePopover',
  component: BasePopover,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'right',
      ],
    },
    closeOnOutsideClick: { control: 'boolean' },
    closeOnEsc: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof BasePopover>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
      <BasePopover
        trigger={({ toggle }) => (
          <BaseButton variant="outline" onClick={toggle}>
            Toggle Popover
          </BaseButton>
        )}
        placement="bottom-start"
      >
        <div className="p-4">
          <p className="font-semibold mb-1">Popover Title</p>
          <p className="text-sm text-text-muted">Some descriptive content here.</p>
        </div>
      </BasePopover>
    </div>
  ),
};

export const Placements: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-8 p-12">
      {(
        [
          'top',
          'bottom',
          'left',
          'right',
          'top-start',
          'top-end',
          'bottom-start',
          'bottom-end',
        ] as const
      ).map((pl) => (
        <BasePopover
          key={pl}
          trigger={({ toggle }) => (
            <BaseButton variant="outline" size="sm" onClick={toggle}>
              {pl}
            </BaseButton>
          )}
          placement={pl}
        >
          <div className="p-3 text-sm">
            Placement: <strong>{pl}</strong>
          </div>
        </BasePopover>
      ))}
    </div>
  ),
};

export const CustomWidth: Story = {
  render: () => (
    <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
      <BasePopover
        trigger={({ toggle }) => <BaseButton onClick={toggle}>Wide Popover</BaseButton>}
        width={360}
      >
        <div className="p-4">
          <p className="font-semibold mb-2">Custom Width Popover</p>
          <p className="text-sm text-text-muted">
            This popover has a fixed width of 360px set via the width prop.
          </p>
        </div>
      </BasePopover>
    </div>
  ),
};

export const RichContent: Story = {
  render: () => (
    <div className="flex items-center justify-center" style={{ minHeight: 300 }}>
      <BasePopover
        trigger={({ toggle }) => <BaseButton onClick={toggle}>User Info</BaseButton>}
        width={280}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              JD
            </div>
            <div>
              <p className="font-semibold text-sm">John Doe</p>
              <p className="text-xs text-text-muted">john@example.com</p>
            </div>
          </div>
          <hr className="border-border" />
          <div className="text-sm space-y-1">
            <p className="text-text-secondary">
              Role: <span className="font-medium">Admin</span>
            </p>
            <p className="text-text-secondary">
              Status: <span className="text-success-600 font-medium">Active</span>
            </p>
          </div>
        </div>
      </BasePopover>
    </div>
  ),
};
