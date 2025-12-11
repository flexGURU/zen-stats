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
import { ChartUpdateData } from '../../../core/models/models';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Message } from 'primeng/message';
import { Button } from 'primeng/button';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { DatePicker } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { Breadcrumb } from 'primeng/breadcrumb';
import { DeviceDetailService } from './device-detail.service';

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
  ingredient: string = 'Cheese';
  selectedFrequencyOption = signal('');
  deviceData = deviceDetailQuery(this.deviceId).deviceDataQuery;
  deviceInfo = deviceDetailQuery(this.deviceId).deviceInfoQuery;
  selectedDate = signal<Date | null>(null);
  startTime = signal<Date | null>(null);
  endTime = signal<Date | null>(null);

  items = [{ label: '' }];
  home = { icon: 'pi pi-cog', url: '/devices', label: 'Devices' };

  deviceService = inject(DeviceDetailService);

  constructor() {
    effect(() => {
      this.deviceData.data() ? this.transformDataForChart() : null;

      if (this.selectedDate() && this.startTime() && this.endTime()) {
        this.updateFilters();
      }
    });
  }

  ngOnInit(): void {
    this.initChart();
  }

  updateFilters() {
    const date = this.selectedDate();
    const start = this.startTime();
    const end = this.endTime();

    this.deviceService.date.set(date ? date.toISOString().split('T')[0] : '');

    this.deviceService.startTime.set(start ? start.toISOString() : '');

    this.deviceService.endTime.set(end ? end.toISOString() : '');

    this.deviceData.refetch();
  }

  clearFilters() {
    this.selectedDate.set(null);
    this.startTime.set(null);
    this.endTime.set(null);

    this.deviceService.date.set('');
    this.deviceService.startTime.set('');
    this.deviceService.endTime.set('');
  }

  addQueryParams() {}

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
    const labels = data?.map((entry) => {
      return new Date(entry.payload.server_timestamp).toLocaleString();
    });

    if (data && labels) {
      const tempValues = data.map((entry) => entry.payload.temperature);
      const co2Values = data.map((entry) => entry.payload.co2);
      const pressureValues = data?.map((entry) => entry.payload.pressure);

      const chartData: ChartUpdateData = {
        tempValues,
        co2Values,
        pressureValues,
        labels,
      };
      this.updateChart(chartData);
    }
  }

  updateChart = (chartData: ChartUpdateData) => {
    const { labels, co2Values, pressureValues, tempValues } = chartData;
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = co2Values;
    this.chart.data.datasets[1].data = pressureValues;
    this.chart.data.datasets[2].data = tempValues;
    this.chart.update();
  };

  initChart(): void {
    this.chart = new chart('deviceChart', {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'CO2',
            data: [],
            fill: false,
            borderColor: 'rgb(220, 20, 60)',
            tension: 0.3,
          },
          {
            label: 'Pressure',
            data: [],
            fill: false,
            borderColor: 'rgb(30, 144, 255)',
            tension: 0.3,
          },
          {
            label: 'Temperature',
            data: [],
            fill: false,
            borderColor: 'rgb(34, 139, 34)',
            tension: 0.3,
          },
        ],
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
      },
    });
  }
}
