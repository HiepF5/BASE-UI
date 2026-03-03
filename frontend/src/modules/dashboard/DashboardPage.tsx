import React from 'react';
import {
  Database, Table2, Users, Activity,
  ArrowUpRight, ArrowDownRight,
  Plug, Cpu,
} from 'lucide-react';
import { Card, Badge } from '@/components/base';
import { useTableList } from '@/hooks';

/* ── Stat card ── */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: string; up: boolean };
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color }) => (
  <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-card">
    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {trend && (
        <p className={`mt-0.5 flex items-center gap-1 text-xs ${trend.up ? 'text-success-600' : 'text-danger-600'}`}>
          {trend.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trend.value}
        </p>
      )}
    </div>
  </div>
);

/* ═══ Dashboard ═══ */
const DashboardPage: React.FC = () => {
  const { data: tables, isLoading } = useTableList();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500">Tổng quan hệ thống</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tables"
          value={tables?.length ?? 0}
          icon={<Table2 className="h-6 w-6 text-white" />}
          color="bg-primary-500"
        />
        <StatCard
          label="Connections"
          value={1}
          icon={<Plug className="h-6 w-6 text-white" />}
          color="bg-success-500"
        />
        <StatCard
          label="Users"
          value={1}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-warning-500"
        />
        <StatCard
          label="AI Skills"
          value={10}
          icon={<Cpu className="h-6 w-6 text-white" />}
          color="bg-accent-500"
        />
      </div>

      {/* Table list */}
      <Card title="Database Tables" description="Danh sách bảng trong database hiện tại">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tables?.map((t) => (
              <a
                key={t}
                href={`/crud/${t}`}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
              >
                <Database className="h-4 w-4 text-primary-500" />
                <span className="text-sm font-medium text-gray-700">{t}</span>
              </a>
            ))}
            {(!tables || tables.length === 0) && (
              <p className="text-sm text-gray-400 col-span-full">
                Chưa có bảng nào. Hãy tạo connection trước.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Recent activity placeholder */}
      <Card title="Hoạt động gần đây">
        <p className="text-sm text-gray-400">Coming soon…</p>
      </Card>
    </div>
  );
};

export default DashboardPage;
