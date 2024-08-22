import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, WritableSignal, inject, signal } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

/* eslint-disable  @typescript-eslint/no-explicit-any */

/**
 * A generic Angular service providing a streamlined interface for interacting with PostgREST APIs using signals for reactive updates.
 *
 * @template T The type of entities managed by this service.
 */
@Injectable({
  providedIn: 'root'
})
export class PGService<T> {
  /**
   * The HttpClient instance used to make HTTP requests.
   */
  private http = inject(HttpClient);

  /**
   * An observable stream of items of type T, shared among multiple subscribers.
   */
  items$: Observable<T[]>;

  /**
   * A reactive signal representing the current state of items$, offering real-time updates to components.
   */
  items: WritableSignal<T[] | undefined>;

  /**
   * Initializes a new instance of the PGService.
   *
   * @param apiUrl The base URL of the PostgREST API.
   * @param http The HttpClient instance for making HTTP requests (injected).
   */
  constructor(
    @Inject(String) private apiUrl: string,
    http: HttpClient
  ) {
    this.http = http;

    // Fetches initial data and shares the resulting observable for efficiency
    this.items$ = this.http
      .get<T[]>(`${this.apiUrl}`)
      .pipe(shareReplay(1));

    // Initializes the reactive signal with an initial undefined state
    this.items = signal<T[] | undefined>(undefined);
  }

  /**
   * Retrieves data from the API using a GET request.
   *
   * @param pathQuery A string representing the path and query parameters for the request (e.g., '/items?status=active').
   * @returns An observable emitting the retrieved data and updating the 'items' signal.
   */
  get(pathQuery: string): Observable<T[]> {
    return this.http
      .get<T[]>(`${this.apiUrl}${pathQuery}`)
      .pipe(
        map((data: T[]) => {
          // Updates the signal with the latest data
          this.items.set(data);
          return data;
        })
      );
  }

  /**
   * Updates data on the server using a PATCH request.
   *
   * @param pathQuery A string representing the path and query parameters for the request.
   * @param item The updated entity data to send in the request body.
   * @returns An observable emitting the server's response.
   */
  patch(pathQuery: string, item: T): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}${pathQuery}`, item);
  }

  /**
   * Creates a new entity on the server using a POST request.
   *
   * @param pathQuery A string representing the path and query parameters for the request.
   * @param item The new entity data to send in the request body.
   * @param insertReturning (Optional) If true, requests the server to return the newly created entity in the response.
   * @returns An observable emitting the server's response (potentially the new entity if 'insertReturning' is true).
   */
  post(pathQuery: string, item: T, insertReturning?: boolean): Observable<T> {
    if (insertReturning) {
      const headers = new HttpHeaders({
        'Prefer': 'return=representation'
      });
      return this.http.post<T>(`${this.apiUrl}${pathQuery}`, item, { headers });
    }

    return this.http.post<T>(`${this.apiUrl}${pathQuery}`, item);
  }

  /**
   * Deletes an entity on the server using a DELETE request.
   *
   * @param pathQuery A string representing the path and query parameters for the request.
   * @returns An observable emitting the server's response.
   */
  delete(pathQuery: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${pathQuery}`);
  }
}
