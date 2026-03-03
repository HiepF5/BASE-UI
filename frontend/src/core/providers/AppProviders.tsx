import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,          // 30s trước khi stale
      gcTime: 5 * 60_000,         // 5m cache
    },
    mutations: {
      retry: 0,
    },
  },
});

interface Props {
  children: ReactNode;
}

export const AppProviders: React.FC<Props> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' }, duration: 6000 },
      }}
    />
  </QueryClientProvider>
);
