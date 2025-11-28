export interface DeviceDetail {
  co2: number;
  pressure: number;
  temperature: number;
  server_timestamp: string;
}

export interface DeviceSummary {
  id: string | number;
  device_id: string;
  payload: DeviceDetail;
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
