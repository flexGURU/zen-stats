import { inject } from '@angular/core';
import { ReactorService } from './reactor.service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

export const reactorQuery = () => {
  const reactorService = inject(ReactorService);

  const reactorData = injectQuery(() => ({
    queryKey: ['reactorData', reactorService.baseApiUrl()],
    queryFn: () => lastValueFrom(reactorService.getReactors()),
    staleTime: 1000 * 60 * 1,
  }));

  return { reactorData };
};
