import { useState } from 'react';
import { useCSVData } from '@/hooks/useCSVData';
import type { DocumentationTask } from '@/types';
import { Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type FilterMode = 'All' | 'Sea' | 'Air' | 'Land';

const priorityColors: Record<string, string> = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const priorityIcons: Record<string, React.ElementType> = {
  High: AlertCircle,
  Medium: Clock,
  Low: CheckCircle,
};

export function DocumentationTasks() {
  const tasks = useCSVData<DocumentationTask>('documentation.csv');
  const [activeFilter, setActiveFilter] = useState<FilterMode>('All');

  if (!tasks) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  const filteredTasks = activeFilter === 'All' 
    ? tasks 
    : tasks.filter(t => t.mode === activeFilter);

  const filters: FilterMode[] = ['All', 'Sea', 'Air', 'Land'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header with tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-200 gap-3">
        <h3 className="text-lg font-semibold text-gray-900">Documentation Tasks</h3>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeFilter === filter
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>Total</span>
          <span className="font-semibold text-gray-900">{filteredTasks.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shipment ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responsible
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Update
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Docs Pending
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTasks.map((task, index) => {
              const PriorityIcon = priorityIcons[task.priority] || Clock;
              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {task.customer}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {task.shipmentId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {task.responsible}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {task.lastUpdate}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {task.docsPending}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`flex items-center gap-1 w-fit ${priorityColors[task.priority]}`}>
                      <PriorityIcon className="w-3 h-3" />
                      {task.priority}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
