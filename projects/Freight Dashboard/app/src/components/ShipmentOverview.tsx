import { useState } from 'react';
import { useCSVData } from '@/hooks/useCSVData';
import type { Shipment } from '@/types';
import { Ship, Plane, Truck, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type FilterMode = 'All' | 'Sea' | 'Air' | 'Land';

const modeIcons: Record<string, React.ElementType> = {
  Sea: Ship,
  Air: Plane,
  Land: Truck,
};

const statusColors: Record<string, string> = {
  'In Transit': 'bg-blue-100 text-blue-700 border-blue-200',
  'Cleared': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Delivered': 'bg-amber-100 text-amber-700 border-amber-200',
  'Delayed': 'bg-red-100 text-red-700 border-red-200',
};

const modeColors: Record<string, string> = {
  Sea: 'bg-blue-500',
  Air: 'bg-sky-500',
  Land: 'bg-amber-500',
};

export function ShipmentOverview() {
  const shipments = useCSVData<Shipment>('shipments.csv');
  const [activeFilter, setActiveFilter] = useState<FilterMode>('All');

  if (!shipments) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  const filteredShipments = activeFilter === 'All' 
    ? shipments 
    : shipments.filter(s => s.mode === activeFilter);

  const filters: FilterMode[] = ['All', 'Sea', 'Air', 'Land'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header with tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-200 gap-3">
        <h3 className="text-lg font-semibold text-gray-900">Shipment Overview</h3>
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
          <span className="font-semibold text-gray-900">{filteredShipments.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shipment ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mode
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ETD
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ETA
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredShipments.map((shipment, index) => {
              const ModeIcon = modeIcons[shipment.mode] || Ship;
              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {shipment.shipmentId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {shipment.customer}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {shipment.route}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${modeColors[shipment.mode]} flex items-center justify-center`}>
                        <ModeIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">{shipment.mode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={statusColors[shipment.status] || 'bg-gray-100'}>
                      {shipment.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {shipment.etd}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {shipment.eta}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer stats */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-4 text-sm">
        <span className="text-gray-600">Total Shipment <span className="font-semibold text-gray-900">1254</span></span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">112</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-gray-600">Customs 18</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-gray-600">14</span>
          </div>
        </div>
      </div>
    </div>
  );
}
