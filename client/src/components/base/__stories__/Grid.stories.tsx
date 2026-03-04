import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from '..';

const meta: Meta<typeof Grid> = {
  title: 'Base/Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
  argTypes: {
    cols: { control: 'select', options: [1, 2, 3, 4, 6, 12] },
    gap: { control: 'select', options: [0, 2, 3, 4, 6, 8] },
  },
};
export default meta;
type Story = StoryObj<typeof Grid>;

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-primary-100 text-primary-700 p-4 rounded text-center text-sm font-medium">
    {children}
  </div>
);

export const ThreeColumns: Story = {
  render: () => (
    <Grid cols={3} gap={4}>
      {Array.from({ length: 6 }, (_, i) => (
        <Cell key={i}>Cell {i + 1}</Cell>
      ))}
    </Grid>
  ),
};

export const Responsive: Story = {
  render: () => (
    <Grid cols={1} smCols={2} mdCols={3} lgCols={4} gap={4}>
      {Array.from({ length: 8 }, (_, i) => (
        <Cell key={i}>Item {i + 1}</Cell>
      ))}
    </Grid>
  ),
};

export const TwoColumns: Story = {
  render: () => (
    <Grid cols={2} gap={4}>
      <Cell>Left</Cell>
      <Cell>Right</Cell>
    </Grid>
  ),
};

export const DashboardLayout: Story = {
  render: () => (
    <Grid cols={1} mdCols={3} gap={4}>
      <div className="bg-success-light p-6 rounded border border-success/20 text-center">
        <div className="text-2xl font-bold text-success">1,234</div>
        <div className="text-sm text-text-muted">Total Users</div>
      </div>
      <div className="bg-primary-100 p-6 rounded border border-primary-200 text-center">
        <div className="text-2xl font-bold text-primary">567</div>
        <div className="text-sm text-text-muted">Active</div>
      </div>
      <div className="bg-warning-light p-6 rounded border border-warning/20 text-center">
        <div className="text-2xl font-bold text-warning">89</div>
        <div className="text-sm text-text-muted">Pending</div>
      </div>
    </Grid>
  ),
};
