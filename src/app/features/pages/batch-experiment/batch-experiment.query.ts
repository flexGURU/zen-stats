import { inject } from '@angular/core';
import { BatchExperimentService } from './batch-experiment.service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

export const batchExperimentQuery = () => {
  const batchExperimentService = inject(BatchExperimentService);

  const batchExperimentData = injectQuery(() => ({
    queryKey: ['batchExperimentData', batchExperimentService.baseApiUrl()],
    queryFn: () => lastValueFrom(batchExperimentService.getBatchExperiments()),
    staleTime: 1000 * 60 * 1,
  }));

  return { batchExperimentData };
};
