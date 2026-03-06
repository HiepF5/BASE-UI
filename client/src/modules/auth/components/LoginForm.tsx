// ============================================================
// LoginForm - Reusable login form component
// ============================================================

import React, { useState } from 'react';
import { BaseButton } from '../../../components/base';

interface LoginFormProps {
  onSubmit: (username: string, password: string) => Promise<void>;
  loading?: boolean;
}

export function LoginForm({ onSubmit, loading = false }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(username, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter username"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter password"
          required
        />
      </div>
      <BaseButton type="submit" className="w-full" loading={loading}>
        Login
      </BaseButton>
    </form>
  );
}
