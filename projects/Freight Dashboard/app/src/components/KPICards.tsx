import { useCSVData } from '@/hooks/useCSVData';
import type { KPIData } from '@/types';
import { Ship, FileText, TrendingUp, DollarSign, AlertTriangle, ArrowUp } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  ship: Ship,
  document: FileText,
  chart: TrendingUp,
  dollar: DollarSign,
};

const colorMap: Record<string, { bg: string; text: string; accent: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', accent: 'bg-blue-500' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-600', accent: 'bg-orange-500' },
  green: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', accent: 'bg-emerald-500' },
  red: { bg: 'bg-red-500/10', text: 'text-red-600', accent: 'bg-red-500' },
};

export function KPICards() {
  const kpiData = useCSVData<KPIData>('kpi_data.csv');

  if (!kpiData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => {
        const Icon = iconMap[kpi.icon] || Ship;
        const colors = colorMap[kpi.color] || colorMap.blue;
        const isNegative = kpi.change.includes('Delayed');
        const showArrow = !isNegative && kpi.change && !kpi.change.includes('Delayed');
        
        return (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bg} rounded-bl-full opacity-50`} />
            <div className="absolute bottom-2 right-2 opacity-10">
              <Icon className={`w-16 h-16 ${colors.text}`} />
            </div>
            
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{kpi.value}</p>
              
              <div className="flex items-center gap-1">
                {showArrow && (
                  <ArrowUp className={`w-4 h-4 ${kpi.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`} />
                )}
                {isNegative && (
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                )}
                <span className={`text-sm font-medium ${isNegative ? 'text-orange-600' : kpi.change.startsWith('+') ? 'text-emerald-600' : 'text-gray-600'}`}>
                  {kpi.change}
                </span>
                {kpi.changeLabel && (
                  <span className="text-sm text-gray-500">{kpi.changeLabel}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
