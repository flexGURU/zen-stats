import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import chart, { Chart } from 'chart.js/auto';
import { SensorValueComponent } from '../../components/sensor-value/sensor-value.component';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { deviceDetailQuery } from './device-detail.query';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Message } from 'primeng/message';
import { Button } from 'primeng/button';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { DatePicker } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { Breadcrumb } from 'primeng/breadcrumb';
import { DeviceDetailService } from './device-detail.service';
import { DeviceSummary } from '../../../core/models/models';

// Updated interfaces
export interface DeviceDetail {
  co2: number;
  pressure: number;
  temperature: number;
  server_timestamp: string;
}

interface DynamicChartData {
  labels: string[];
  datasets: Map<string, number[]>;
}

@Component({
  selector: 'app-device-detail',
  imports: [
    SensorValueComponent,
    SelectModule,
    RadioButtonModule,
    CommonModule,
    FormsModule,
    ProgressSpinner,
    Message,
    Button,
    DatePicker,
    EmptyStateComponent,
    DividerModule,
    Breadcrumb,
  ],
  templateUrl: './device-detail.component.html',
  styles: ``,
})
export class DeviceDetailComponent {
  deviceId = input.required<string | number>();
  chart!: Chart;
  selectedFrequencyOption = signal('');
  deviceData = deviceDetailQuery(this.deviceId).deviceDataQuery;
  deviceInfo = deviceDetailQuery(this.deviceId).deviceInfoQuery;
  selectedDate = signal(null);
  startTime = signal(null);
  endTime = signal(null);

  items = [{ label: '' }];
  home = { icon: 'pi pi-cog', url: '/devices', label: 'Devices' };
  deviceService = inject(DeviceDetailService);

  private colorPalette = [];

  constructor() {
    effect(() => {
      this.deviceData.data() ? this.transformDataForChart() : null;
      if (this.selectedDate() && this.startTime() && this.endTime()) {
        this.updateFilters();
      }
    });
    effect(() => {});
  }

  ngOnInit(): void {
    this.initChart();
  }

  updateFilters() {}

  clearFilters() {
    this.selectedDate.set(null);
    this.startTime.set(null);
    this.endTime.set(null);
    this.deviceService.date.set('');
    this.deviceService.startTime.set('');
    this.deviceService.endTime.set('');
  }

  refreshData() {
    this.deviceData.refetch();
    this.deviceInfo.refetch();
  }

  breadCrumbItem = computed(() => {
    const deviceName = this.deviceInfo.data()?.name || 'Device';
    return [{ label: `${deviceName}` }];
  });

  transformDataForChart() {
    const data = this.deviceData.data();
    if (!data || data.length === 0) return;

    const chartData = this.extractDynamicMeasurements(data);
    this.updateChart(chartData);
  }

  extractDynamicMeasurements(data: DeviceSummary[]): DynamicChartData {
    const labels: string[] = [];
    const datasets = new Map<string, number[]>();

    data.forEach((entry) => {
      const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      labels.push(time);

      let measurement = entry.payload;
      Object.keys(measurement).forEach((key) => {
        if (key.toLowerCase().includes('timestamp') || key === 'id') {
          return;
        }

        const value = measurement[key];

        if (typeof value === 'number') {
          if (!datasets.has(key)) {
            datasets.set(key, []);
          }
          datasets.get(key)!.push(value);
        }
      });
    });

    const expectedLength = labels.length;
    datasets.forEach((values, key) => {
      while (values.length < expectedLength) {
        values.push(null as any);
      }
    });

    return { labels, datasets };
  }

  updateChart(chartData: DynamicChartData): void {
    const { labels, datasets } = chartData;

    this.chart.data.labels = labels;

    this.chart.data.datasets = [];

    let colorIndex = 0;
    datasets.forEach((values, measurementName) => {
      this.chart.data.datasets.push({
        label: this.formatLabel(measurementName),
        data: values,
        fill: false,
        borderColor: this.colorPalette[colorIndex % this.colorPalette.length],
        tension: 0.3,
      });
      colorIndex++;
    });

    this.chart.update();
  }

  formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  initChart(): void {
    this.chart = new chart('deviceChart', {
      type: 'line',
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: 'Device Data Over Time',
          },
        },
        scales: {
          y: {
            beginAtZero: false,
          },
        },
      },
    });
  }
}
