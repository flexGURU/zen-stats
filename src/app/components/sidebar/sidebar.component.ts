import { CommonModule } from '@angular/common';
import { Component, inject, model, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-sidebar',
  imports: [
    DrawerModule,
    ButtonModule,
    RouterLink,
    CommonModule,
    RouterLinkActive,
  ],
  templateUrl: './sidebar.component.html',
  styles: ``,
})
export class SidebarComponent {
  visible = model(false);
  logOut() {}

  sidebarContent = [
    { label: 'Profile', icon: 'pi pi-user', route: '/profile' },
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Reactor', icon: 'pi pi-cog', route: '/reactors' },
    {
      label: 'Batch Experiment',
      icon: 'pi pi-sliders-h',
      route: '/batch-experiments',
    },
  ];

  sidebarLinks = signal(this.sidebarContent);
}
