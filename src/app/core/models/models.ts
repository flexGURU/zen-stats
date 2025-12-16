export interface DeviceDetail {
  co2: number;
  pressure: number;
  temperature: number;
  server_timestamp: string;
}

export interface DeviceSummary {
  device_id: string;
  timestamp: string;
  payload: Record<string, string | number>;
}

export interface ChartUpdateData {
  tempValues: number[];
  co2Values: number[];
  pressureValues: number[];
  labels: string[];
}

export interface Device {
  id: string;
  name: string;
  status: boolean;
  created_at: string;
}

export interface Reactor {
  id: number;
  name: string;
  status: 'Active' | 'Inactive';
  pdfUrl: string;
  pathway: 'Gaseous' | 'Carbonated' | 'Liquid';
}

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  roles: 'admin' | 'user';
  isActive: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface MaterialFeedstock {
  mixDesign: string;
  cement: string;
  fineAggregate: string;
  coarseAggregate: string;
  water: string;
  waterCementRatio: string;
  blockSizeLength: string;
  blockSizeWidth: string;
  blockSizeHeight: string;
}

export interface ExposureConditions {
  co2Form: 'liquid' | 'gas' | 'carbonated';
  co2Mass: string;
  injectionPressure: string;
  headSpace: string;
  reactionTime: string;
}

export interface AnalyticalTest {
  name: string;
  sampleId: string;
  date: Date;
  pdfUrl: string;
}

export interface BatchExperiment {
  id: number;
  batchId: string;
  reactorId: number;
  operator: string;
  date: Date;
  blockId: string;
  timeStart: string;
  timeEnd: string;
  materialFeedstock: MaterialFeedstock;
  exposureConditions: ExposureConditions;
  analyticalTests: AnalyticalTest[];
  deletedAt: string | null;
  createdAt: string;
}


export interface PaginationMeta {
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}
