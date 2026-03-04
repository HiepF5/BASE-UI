import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from '..';
import { BaseButton } from '..';

const meta: Meta = {
  title: 'Base/Feedback/Toast',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider position="top-right">
        <Story />
      </ToastProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj;

function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <BaseButton variant="primary" size="sm" onClick={() => toast.info('Info message', 'Info')}>
        Info
      </BaseButton>
      <BaseButton variant="primary" size="sm" onClick={() => toast.success('Saved!', 'Success')}>
        Success
      </BaseButton>
      <BaseButton
        variant="outline"
        size="sm"
        onClick={() => toast.warning('Check input', 'Warning')}
      >
        Warning
      </BaseButton>
      <BaseButton variant="danger" size="sm" onClick={() => toast.error('Failed!', 'Error')}>
        Error
      </BaseButton>
      <BaseButton variant="ghost" size="sm" onClick={() => toast.dismissAll()}>
        Dismiss All
      </BaseButton>
    </div>
  );
}

export const AllVariants: Story = {
  render: () => <ToastDemo />,
};
