import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BaseAlert } from '..';

const meta: Meta<typeof BaseAlert> = {
  title: 'Base/Feedback/BaseAlert',
  component: BaseAlert,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'danger', 'neutral'] },
    title: { control: 'text' },
    closable: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof BaseAlert>;

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    children: 'This is an informational message.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success',
    children: 'Your changes have been saved successfully.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'Please review your input before proceeding.',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    title: 'Error',
    children: 'An unexpected error occurred. Please try again.',
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    title: 'Note',
    children: 'This is a neutral informational note.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-3">
      <BaseAlert variant="info" title="Info">
        Info message content.
      </BaseAlert>
      <BaseAlert variant="success" title="Success">
        Success message content.
      </BaseAlert>
      <BaseAlert variant="warning" title="Warning">
        Warning message content.
      </BaseAlert>
      <BaseAlert variant="danger" title="Error">
        Error message content.
      </BaseAlert>
      <BaseAlert variant="neutral" title="Note">
        Neutral message content.
      </BaseAlert>
    </div>
  ),
};

export const Closable: Story = {
  render: () => {
    const [show, setShow] = useState(true);
    if (!show) {
      return (
        <button className="text-sm text-primary underline" onClick={() => setShow(true)}>
          Show alert again
        </button>
      );
    }
    return (
      <BaseAlert variant="success" title="Closable" closable onClose={() => setShow(false)}>
        Click the × to dismiss this alert.
      </BaseAlert>
    );
  },
};
