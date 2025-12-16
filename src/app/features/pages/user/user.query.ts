import { inject } from '@angular/core';
import { UserService } from './user.service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

export const userQuery = () => {
  const userService = inject(UserService);

  const userData = injectQuery(() => ({
    queryKey: ['userData'],
    queryFn: () => lastValueFrom(userService.getUsers()),
    staleTime: 1000 * 60 * 5,
  }));

  return { userData };
};
