import { useCSVData } from '@/hooks/useCSVData';
import type { ProfitData } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ProfitSummary() {
  const profitData = useCSVData<ProfitData>('profit_data.csv');

  if (!profitData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  const data = profitData.map(item => ({
    month: item.month,
    Cost: item.cost,
    Revenue: item.revenue,
    Profit: item.profit,
  }));

  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const latestMonth = data[data.length - 1];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Profit Summary</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span className="text-gray-600">Cost</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-gray-600">Rev</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-600">$230</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Income In June</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">${(latestMonth.Revenue / 1000).toFixed(0)}K</span>
              <span className="text-sm text-gray-500">${(latestMonth.Cost / 1000).toFixed(0)}K</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Prepaid Shipments</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">$350K</span>
              <span className="text-sm text-gray-500">$1,500K</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="Cost" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Revenue" fill="#10B981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-gray-600">Cost</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <span className="text-gray-500">Povenue</span>
                <span className="ml-2 font-semibold text-gray-900">${latestMonth.Profit}K</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500">Cost</span>
                <span className="ml-2 font-semibold text-gray-900">${latestMonth.Cost}K</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
