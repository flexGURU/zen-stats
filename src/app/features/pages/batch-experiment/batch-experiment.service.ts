import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, tap } from 'rxjs';
import { BatchExperiment, PaginationMeta } from '../../../core/models/models';

@Injectable({
  providedIn: 'root',
})
export class BatchExperimentService {
  private apiUrl = import.meta.env.NG_APP_APIURL;
  private http = inject(HttpClient);

  search = signal('');
  date = signal<Date | null>(null);
  limit = signal(10);
  page = signal(1);

  private _paginationState = signal<PaginationMeta>({
    has_next: false,
    has_previous: false,
    next_page: null,
    previous_page: null,
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0,
  });

  total = computed(() => {
    return this._paginationState().total;
  });

  pageSize = computed(() => {
    return this._paginationState().page_size;
  });

  constructor() {
    effect(() => {});
  }

  baseApiUrl = computed(() => {
    const params = new URLSearchParams();

    if (this.search()) params.set('search', this.search());
    if (this.date())
      params.set('date', this.date()!.toISOString().split('T')[0]);
    if (this.limit()) params.set('limit', this.limit().toString());
    if (this.page()) params.set('page', this.page().toString());

    return `${this.apiUrl}/experiments?${params.toString()}`;
  });

  getBatchExperiments(): Observable<BatchExperiment[]> {
    return this.http
      .get<{ data: BatchExperiment[]; pagination: PaginationMeta }>(
        `${this.baseApiUrl()}`
      )
      .pipe(
        tap((response) => {
          this._paginationState.set(response.pagination);
        }),
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
