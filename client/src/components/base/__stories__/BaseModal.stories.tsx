import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BaseModal } from '../BaseModal';
import { BaseButton } from '../BaseButton';

const meta: Meta<typeof BaseModal> = {
  title: 'Base/Overlay/BaseModal',
  component: BaseModal,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    closeOnBackdrop: { control: 'boolean' },
    closeOnEsc: { control: 'boolean' },
    showClose: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof BaseModal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BaseButton onClick={() => setOpen(true)}>Open Modal</BaseButton>
        <BaseModal open={open} onClose={() => setOpen(false)} title="Default Modal">
          <p className="text-text-secondary">This is a default modal dialog.</p>
        </BaseModal>
      </>
    );
  },
};

export const WithFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BaseButton onClick={() => setOpen(true)}>Open Modal with Footer</BaseButton>
        <BaseModal
          open={open}
          onClose={() => setOpen(false)}
          title="Confirm Action"
          footer={
            <div className="flex justify-end gap-2">
              <BaseButton variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </BaseButton>
              <BaseButton variant="danger" onClick={() => setOpen(false)}>
                Delete
              </BaseButton>
            </div>
          }
        >
          <p className="text-text-secondary">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
        </BaseModal>
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
          <BaseModal open onClose={() => setSize(null)} title={`Size: ${size}`} size={size}>
            <p className="text-text-secondary">
              This modal uses the <strong>{size}</strong> size variant.
            </p>
          </BaseModal>
        )}
      </>
    );
  },
};

export const LongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BaseButton onClick={() => setOpen(true)}>Long Content Modal</BaseButton>
        <BaseModal open={open} onClose={() => setOpen(false)} title="Scrollable Content" size="md">
          <div className="space-y-4">
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i} className="text-text-secondary">
                Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Pellentesque euismod, urna eu tincidunt consectetur.
              </p>
            ))}
          </div>
        </BaseModal>
      </>
    );
  },
};
