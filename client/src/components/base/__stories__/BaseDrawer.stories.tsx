import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BaseDrawer } from '../BaseDrawer';
import { BaseButton } from '../BaseButton';

const meta: Meta<typeof BaseDrawer> = {
  title: 'Base/Overlay/BaseDrawer',
  component: BaseDrawer,
  tags: ['autodocs'],
  argTypes: {
    placement: { control: 'select', options: ['left', 'right', 'top', 'bottom'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    closeOnBackdrop: { control: 'boolean' },
    closeOnEsc: { control: 'boolean' },
    showClose: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof BaseDrawer>;

export const Right: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BaseButton onClick={() => setOpen(true)}>Open Right Drawer</BaseButton>
        <BaseDrawer
          open={open}
          onClose={() => setOpen(false)}
          title="Right Drawer"
          placement="right"
        >
          <p className="text-text-secondary">This drawer slides in from the right.</p>
        </BaseDrawer>
      </>
    );
  },
};

export const Left: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BaseButton onClick={() => setOpen(true)}>Open Left Drawer</BaseButton>
        <BaseDrawer open={open} onClose={() => setOpen(false)} title="Left Drawer" placement="left">
          <p className="text-text-secondary">This drawer slides in from the left.</p>
        </BaseDrawer>
      </>
    );
  },
};

export const Bottom: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BaseButton onClick={() => setOpen(true)}>Open Bottom Drawer</BaseButton>
        <BaseDrawer
          open={open}
          onClose={() => setOpen(false)}
          title="Bottom Drawer"
          placement="bottom"
          size="md"
        >
          <p className="text-text-secondary">This drawer slides in from the bottom.</p>
        </BaseDrawer>
      </>
    );
  },
};

export const WithFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BaseButton onClick={() => setOpen(true)}>Drawer with Footer</BaseButton>
        <BaseDrawer
          open={open}
          onClose={() => setOpen(false)}
          title="Edit Item"
          placement="right"
          size="lg"
          footer={
            <div className="flex justify-end gap-2">
              <BaseButton variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </BaseButton>
              <BaseButton onClick={() => setOpen(false)}>Save Changes</BaseButton>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-text-secondary">
              Drawer body with a footer containing action buttons.
            </p>
            <div className="h-96 bg-bg-secondary rounded-lg flex items-center justify-center text-text-muted">
              Form content area
            </div>
          </div>
        </BaseDrawer>
      </>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full' | null>(null);
    return (
      <>
        <div className="flex gap-2 flex-wrap">
          {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((s) => (
            <BaseButton key={s} variant="outline" onClick={() => setSize(s)}>
              {s}
            </BaseButton>
          ))}
        </div>
        {size && (
          <BaseDrawer
            open
            onClose={() => setSize(null)}
            title={`Size: ${size}`}
            placement="right"
            size={size}
          >
            <p className="text-text-secondary">
              Drawer with <strong>{size}</strong> size.
            </p>
          </BaseDrawer>
        )}
      </>
    );
  },
};
