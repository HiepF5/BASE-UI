import type { Meta, StoryObj } from '@storybook/react';
import { Flex } from '..';

const meta: Meta<typeof Flex> = {
  title: 'Base/Layout/Flex',
  component: Flex,
  tags: ['autodocs'],
  argTypes: {
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 5, 6, 8] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    direction: { control: 'select', options: ['row', 'row-reverse', 'col', 'col-reverse'] },
    wrap: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Flex>;

const Box = ({ children, w }: { children: React.ReactNode; w?: string }) => (
  <div className={`bg-accent-100 text-accent-700 px-4 py-2 rounded text-sm font-medium ${w || ''}`}>
    {children}
  </div>
);

export const Row: Story = {
  render: () => (
    <Flex gap={3}>
      <Box>One</Box>
      <Box>Two</Box>
      <Box>Three</Box>
    </Flex>
  ),
};

export const SpaceBetween: Story = {
  render: () => (
    <Flex justify="between" align="center">
      <Box>Left</Box>
      <Box>Center</Box>
      <Box>Right</Box>
    </Flex>
  ),
};

export const CenterAll: Story = {
  render: () => (
    <Flex justify="center" align="center" className="h-32 border border-border rounded">
      <Box>Centered Content</Box>
    </Flex>
  ),
};

export const Wrapping: Story = {
  render: () => (
    <Flex gap={2} wrap className="max-w-xs">
      {Array.from({ length: 8 }, (_, i) => (
        <Box key={i}>Tag {i + 1}</Box>
      ))}
    </Flex>
  ),
};

export const Column: Story = {
  render: () => (
    <Flex direction="col" gap={2} align="start">
      <Box>First</Box>
      <Box>Second</Box>
      <Box>Third</Box>
    </Flex>
  ),
};
