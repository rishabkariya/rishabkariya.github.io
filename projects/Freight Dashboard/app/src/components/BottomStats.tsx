import { useCSVData } from '@/hooks/useCSVData';
import type { BottomStat } from '@/types';
import { DollarSign, TrendingUp, Ship, AlertTriangle, BarChart3 } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  dollar: DollarSign,
  chart: TrendingUp,
  ship: Ship,
  alert: AlertTriangle,
};

export function BottomStats() {
  const stats = useCSVData<BottomStat>('bottom_stats.csv');

  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.icon] || BarChart3;
        return (
          <div
            key={index}
            className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100 mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold">{stat.value}</span>
                  {stat.subValue && (
                    <span className="text-sm text-blue-200">{stat.subValue}</span>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
