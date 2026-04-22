import { KPICards } from '@/components/KPICards';
import { ShipmentOverview } from '@/components/ShipmentOverview';
import { ShipmentsStatus } from '@/components/ShipmentsStatus';
import { DocumentationTasks } from '@/components/DocumentationTasks';
import { ProfitSummary } from '@/components/ProfitSummary';
import { BottomStats } from '@/components/BottomStats';
import { Ship, Plane, Truck, Container, Globe } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Container className="w-7 h-7" />
                <Ship className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                FREIGHT FORWARDER DASHBOARD
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <Globe className="w-4 h-4" />
                <span>Global Operations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Plane className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Ship className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Cards */}
        <section className="mb-6">
          <KPICards />
        </section>

        {/* Middle Section - Tables and Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Shipment Overview - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ShipmentOverview />
          </div>

          {/* Shipments Status - Takes 1 column */}
          <div>
            <ShipmentsStatus />
          </div>
        </section>

        {/* Bottom Section - Documentation and Profit */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Documentation Tasks */}
          <DocumentationTasks />

          {/* Profit Summary */}
          <ProfitSummary />
        </section>

        {/* Bottom Stats Row */}
        <section>
          <BottomStats />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>Freight Forwarder Dashboard System</p>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
