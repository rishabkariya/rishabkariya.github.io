export interface KPIData {
  title: string;
  value: string;
  change: string;
  changeLabel: string;
  icon: string;
  color: string;
}

export interface Shipment {
  shipmentId: string;
  customer: string;
  route: string;
  mode: 'Sea' | 'Air' | 'Land';
  status: string;
  etd: string;
  eta: string;
}

export interface StatusData {
  status: string;
  value: number;
  percentage: string;
  color: string;
}

export interface DocumentationTask {
  customer: string;
  shipmentId: string;
  responsible: string;
  lastUpdate: string;
  docsPending: string;
  priority: 'High' | 'Medium' | 'Low';
  mode: 'Sea' | 'Air' | 'Land';
}

export interface ProfitData {
  month: string;
  cost: number;
  revenue: number;
  profit: number;
}

export interface BottomStat {
  label: string;
  value: string;
  subValue: string;
  icon: string;
}
