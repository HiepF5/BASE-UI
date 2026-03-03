import React, { useState } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, BaseButton, Tabs } from '@/components/base';
import { useLocalStorage } from '@/hooks';

const TABS = [
  { key: 'general', label: 'Chung' },
  { key: 'appearance', label: 'Giao diện' },
  { key: 'api', label: 'API' },
];

const SettingsPage: React.FC = () => {
  const [tab, setTab] = useState('general');
  const [appName, setAppName] = useLocalStorage('settings.appName', 'Base UI');
  const [pageSize, setPageSize] = useLocalStorage('settings.pageSize', 25);
  const [apiUrl, setApiUrl] = useLocalStorage('settings.apiUrl', '/api');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('settings.theme', 'light');

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

  const handleSave = () => {
    toast.success('Đã lưu cài đặt');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cài đặt</h2>
          <p className="text-sm text-gray-500">Cấu hình hệ thống</p>
        </div>
        <BaseButton size="sm" onClick={handleSave}>
          <Save className="h-4 w-4" /> Lưu
        </BaseButton>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'general' && (
        <Card title="Cài đặt chung">
          <div className="max-w-lg space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tên ứng dụng</label>
              <input className={inputClass} value={appName} onChange={(e) => setAppName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Số bản ghi / trang</label>
              <select className={inputClass} value={pageSize} onChange={(e) => setPageSize(+e.target.value)}>
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {tab === 'appearance' && (
        <Card title="Giao diện">
          <div className="max-w-lg space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Theme</label>
              <select className={inputClass} value={theme} onChange={(e) => setTheme(e.target.value as any)}>
                <option value="light">Sáng</option>
                <option value="dark">Tối</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {tab === 'api' && (
        <Card title="API Configuration">
          <div className="max-w-lg space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">API Base URL</label>
              <input className={inputClass} value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
              <p className="mt-1 text-xs text-gray-400">URL gốc của backend API</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
