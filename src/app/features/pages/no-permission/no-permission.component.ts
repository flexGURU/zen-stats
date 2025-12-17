import { Component } from '@angular/core';

@Component({
  selector: 'app-no-permission',
  imports: [],
  templateUrl: './no-permission.component.html',
  styles: ``,
})
export class NoPermissionComponent {
  goToHome() {
    window.location.href = '/';
  }
}
