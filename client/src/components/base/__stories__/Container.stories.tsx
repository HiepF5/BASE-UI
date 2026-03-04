import type { Meta, StoryObj } from '@storybook/react';
import { Container } from '..';

const meta: Meta<typeof Container> = {
  title: 'Base/Layout/Container',
  component: Container,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'] },
    noPadding: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Container>;

const Inner = () => (
  <div className="bg-primary-100 text-primary-700 p-4 rounded text-sm">
    Content inside container. Resize browser to see max-width.
  </div>
);

export const Default: Story = {
  render: () => (
    <Container>
      <Inner />
    </Container>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      {(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((size) => (
        <div key={size}>
          <p className="text-xs text-text-muted mb-1">size="{size}"</p>
          <Container size={size} className="border border-border rounded">
            <Inner />
          </Container>
        </div>
      ))}
    </div>
  ),
};

export const NoPadding: Story = {
  render: () => (
    <Container noPadding className="border border-border">
      <Inner />
    </Container>
  ),
};
