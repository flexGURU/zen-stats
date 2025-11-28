import { Component, effect, input, OnInit, signal } from '@angular/core';
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
  ],
  templateUrl: './device-detail.component.html',
  styles: ``,
})
export class DeviceDetailComponent {
  deviceId = input.required<string>();
  chart!: Chart;
  ingredient: string = 'Cheese';
  selectedFrequencyOption = signal('');
  deviceData = deviceDetailQuery(this.deviceId);
  rangeDates = signal<Date[]>([]);
  startTime = signal<Date | null>(null);
  endTime = signal<Date | null>(null);

  constructor() {
    effect(() => {
      this.deviceData.data()
        ? this.transformDataForChart()
        : console.log('No data yet');
    });

    effect(() => {
      console.log('Range Dates:', this.rangeDates());
      console.log('Start Time:', this.startTime());
      console.log('End Time:', this.endTime());
    });
  }

  ngOnInit(): void {
    this.initChart();
  }

  transformDataForChart() {
    const data = this.deviceData.data();
    const labels = data?.map((entry) => {
      return new Date(entry.server_timestamp).toLocaleString();
    });

    if (data && labels) {
      const tempValues = data.map((entry) => entry.temperature_c);
      const co2Values = data.map((entry) => entry.co2_ppm);
      const humidityValues = data?.map((entry) => entry.humidity_pct);

      const chartData: ChartUpdateData = {
        tempValues,
        co2Values,
        humidityValues,
        labels,
      };
      this.updateChart(chartData);
    }
  }

  updateChart = (chartData: ChartUpdateData) => {
    const { labels, co2Values, humidityValues, tempValues } = chartData;
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = co2Values;
    this.chart.data.datasets[1].data = humidityValues;
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
