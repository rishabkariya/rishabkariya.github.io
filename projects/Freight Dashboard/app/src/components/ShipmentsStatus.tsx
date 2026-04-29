import { useCSVData } from '@/hooks/useCSVData';
import type { StatusData } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Ship, CheckCircle, Package, AlertTriangle, Clock } from 'lucide-react';

const statusIcons: Record<string, React.ElementType> = {
  'In Transit': Ship,
  'Cleared': CheckCircle,
  'Delivered': Package,
  'Delayed': AlertTriangle,
  'Customs Hold': Clock,
};

export function ShipmentsStatus() {
  const statusData = useCSVData<StatusData>('status_data.csv');

  if (!statusData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  const data = statusData.map(item => ({
    name: item.status,
    value: Number(item.value) || 0,
    color: item.color,
    percentage: item.percentage,
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Shipments Status</h3>
      </div>

      <div className="p-4">
        <div className="flex flex-col items-center">
          {/* Pie Chart */}
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} (${((value / total) * 100).toFixed(0)}%)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="w-full mt-4 space-y-2">
            {data.map((item, index) => {
              const Icon = statusIcons[item.name] || Package;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      {item.percentage}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {item.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Total</span>
            <Ship className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-gray-900">6</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Ship className="w-4 h-4 text-emerald-500" />
              <span className="text-gray-600">InTransit</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4 text-amber-500" />
              <span className="text-gray-600">75</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-600">ISU</span>
              <span className="font-semibold text-gray-900">$388</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
