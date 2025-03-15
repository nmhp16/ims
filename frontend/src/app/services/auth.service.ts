import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, tap } from 'rxjs';
import { throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8084/auth';
  private tokenSubject: BehaviorSubject<string | null>;
  private isBrowser: boolean;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    withCredentials: true
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.tokenSubject = new BehaviorSubject<string | null>(
      this.isBrowser ? localStorage.getItem('jwt') : null
    );
  }

  login(username: string, password: string): Observable<any> {
    console.log('Attempting login for user:', username);
    return this.http.post(`${this.apiUrl}/login`, { username, password }, this.httpOptions)
      .pipe(
        tap((response: any) => {
          console.log('Login response:', response);
          if (response.token && this.isBrowser) {
            localStorage.setItem('jwt', response.token);
            this.tokenSubject.next(response.token);
            this.router.navigate(['/items']);
          }
        }),
        catchError(this.handleError)
      );
  }

  register(username: string, password: string): Observable<any> {
    console.log('Attempting registration for user:', username);
    const body = { username, password };
    console.log('Registration payload:', body);
    
    return this.http.post(`${this.apiUrl}/register`, body, this.httpOptions)
      .pipe(
        tap(response => console.log('Registration response:', response)),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else if (error.status === 0) {
      // Network error
      errorMessage = 'Cannot connect to the server. Please check if the backend is running.';
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Server error: ${error.status} - ${error.statusText}`;
    }
    
    console.error('Error details:', errorMessage);
    return throwError(() => errorMessage);
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('jwt');
    }
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
