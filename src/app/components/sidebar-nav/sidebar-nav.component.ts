import { Component, signal } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Divider } from 'primeng/divider';
import { DockModule } from 'primeng/dock';
import { TooltipModule } from 'primeng/tooltip';
import { PanelModule } from 'primeng/panel';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-sidebar-nav',
  imports: [MenuModule, DockModule, TooltipModule, PanelModule, MenubarModule],
  templateUrl: './sidebar-nav.component.html',
  styles: ``,
})
export class SidebarNavComponent {
  items = signal([
    { label: 'Home', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'Device', icon: 'pi pi-tablet', routerLink: '/devices' },
    { label: 'Reactor', icon: 'pi pi-cog', routerLink: '/reactors' },
    {
      label: 'Batch',
      icon: 'pi pi-sliders-h',
      routerLink: '/batch-experiments',
    },
    {
      label: 'Users',
      icon: 'pi pi-users',
      routerLink: '/users',
    },
  ]);
}
