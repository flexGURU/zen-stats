import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { BatchExperiment } from '../../../core/models/models';

@Injectable({
  providedIn: 'root',
})
export class BatchExperimentService {
  private readonly apiUrl = environment.APIURL;
  private http = inject(HttpClient);

  search = signal('');
  date = signal<Date | null>(null);

  constructor() {
    effect(() => {
      console.log('base api url', this.baseApiUrl());
    });
  }

  baseApiUrl = computed(() => {
    const params = new URLSearchParams();

    if (this.search()) params.set('search', this.search());
    if (this.date())
      params.set('date', this.date()!.toISOString().split('T')[0]);

    return `${this.apiUrl}/experiments?${params.toString()}`;
  });

  getBatchExperiments(): Observable<BatchExperiment[]> {
    return this.http
      .get<{ data: BatchExperiment[] }>(`${this.baseApiUrl()}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error(error);
          throw new Error('Error fetching batch experiments');
        })
      );
  }

  createBatchExperiment(
    experiment: BatchExperiment
  ): Observable<BatchExperiment> {
    return this.http
      .post<{ data: BatchExperiment }>(`${this.apiUrl}/experiments`, experiment)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error(error);
          throw new Error('Error creating batch experiment');
        })
      );
  }

  updateBatchExperiment(
    id: string | number,
    experiment: BatchExperiment
  ): Observable<BatchExperiment> {
    return this.http
      .put<{ data: BatchExperiment }>(
        `${this.apiUrl}/experiments/${id}`,
        experiment
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error(error);
          throw new Error('Error updating batch experiment');
        })
      );
  }

  deleteBatchExperiment(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/experiments/${id}`).pipe(
      catchError((error) => {
        console.error(error);
        throw new Error('Error deleting batch experiment');
      })
    );
  }
}
