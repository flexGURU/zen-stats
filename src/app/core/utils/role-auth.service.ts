import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../features/pages/login/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleAuthService {
  private readonly PERMISSIONS = {
    user: ['view'],
    admin: ['view', 'edit', 'delete', 'create'],
  };

  private currentUser = inject(AuthService).currentUser();

  hasPermission = (action: string) => {
    const permissions = this.PERMISSIONS[this.currentUser!.role];

    if (!permissions) {
      return false;
    }
    return permissions.includes(action);
  };
}
