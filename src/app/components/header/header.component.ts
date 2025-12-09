import { Component, effect, inject, model, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../features/pages/login/auth.service';

@Component({
  selector: 'app-header',
  imports: [ButtonModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  sidebarVisible = model(false);
  username = inject(AuthService).currentUser;
  logOut() {}
}
