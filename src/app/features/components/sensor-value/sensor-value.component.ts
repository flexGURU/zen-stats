import { Component, computed, input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { DeviceDetail, DeviceSummary } from '../../../core/models/models';
@Component({
  selector: 'app-sensor-value',
  imports: [TableModule],
  templateUrl: './sensor-value.component.html',
  styles: ``,
})
export class SensorValueComponent {
  sensorTable = [
    { sensor: 'Temperature', value: '' },
    { sensor: 'Pressure', value: '' },
    { sensor: 'Co2', value: '' },
  ];

  sensorData = input.required<DeviceSummary | undefined>();

  sensorDataFinal = computed(() => {
    const sens = this.sensorData();

    this.sensorTable.forEach((element) => {
      if (element.sensor === 'Temperature') {
        element.value = sens ? sens.payload.temperature.toString() : 'N/A';
      } else if (element.sensor === 'Pressure') {
        element.value = sens ? sens.payload.pressure.toString() : 'N/A';
      } else if (element.sensor === 'Co2') {
        element.value = sens ? sens.payload.co2.toString() : 'N/A';
      }
    });
    return this.sensorTable;
  });
}
