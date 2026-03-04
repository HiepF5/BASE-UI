import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '..';

const meta: Meta<typeof Stack> = {
  title: 'Base/Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
  argTypes: {
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between', 'around'] },
  },
};
export default meta;
type Story = StoryObj<typeof Stack>;

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded text-sm font-medium">
    {children}
  </div>
);

export const Default: Story = {
  render: () => (
    <Stack gap={3}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
};

export const WithAlignment: Story = {
  render: () => (
    <Stack gap={3} align="center">
      <Box>Short</Box>
      <Box>Medium Item</Box>
      <Box>A Much Longer Item</Box>
    </Stack>
  ),
};

export const Gaps: Story = {
  render: () => (
    <div className="space-y-6">
      {([1, 3, 6, 10] as const).map((gap) => (
        <div key={gap}>
          <p className="text-xs text-text-muted mb-1">gap={gap}</p>
          <Stack gap={gap}>
            <Box>A</Box>
            <Box>B</Box>
            <Box>C</Box>
          </Stack>
        </div>
      ))}
    </div>
  ),
};
