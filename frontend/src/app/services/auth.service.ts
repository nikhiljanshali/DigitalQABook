import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse, LoginDto, RegisterDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/v1/auth';
  private readonly TOKEN_KEY = 'qa_book_auth_token';
  private readonly USER_KEY = 'qa_book_auth_user';

  // State signals
  readonly currentUser = signal<User | null>(null);
  readonly token = signal<string | null>(null);
  readonly isAuthModalOpen = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly authError = signal<string | null>(null);

  // Computed signals
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    this.restoreSession();
  }

  // Restore stored session from localStorage
  private restoreSession(): void {
    try {
      const storedToken = localStorage.getItem(this.TOKEN_KEY);
      const storedUser = localStorage.getItem(this.USER_KEY);

      if (storedToken && storedUser) {
        this.token.set(storedToken);
        this.currentUser.set(JSON.parse(storedUser));
        // Verify with /me
        this.fetchCurrentUser().subscribe({
          error: () => this.logout() // clear if expired
        });
      }
    } catch (e) {
      this.clearStorage();
    }
  }

  fetchCurrentUser(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.baseUrl}/me`).pipe(
      tap({
        next: (res) => {
          if (res.user) {
            this.currentUser.set(res.user);
            localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
          }
        }
      })
    );
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    this.isLoading.set(true);
    this.authError.set(null);

    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, dto).pipe(
      tap({
        next: (res) => {
          this.isLoading.set(false);
          this.handleAuthSuccess(res);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.authError.set(err?.error?.message || 'Login failed. Please check your credentials.');
        }
      })
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    this.isLoading.set(true);
    this.authError.set(null);

    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, dto).pipe(
      tap({
        next: (res) => {
          this.isLoading.set(false);
          this.handleAuthSuccess(res);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.authError.set(err?.error?.message || 'Registration failed. Please check your details.');
        }
      })
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    this.clearStorage();
  }

  private handleAuthSuccess(res: AuthResponse): void {
    if (res.success && res.token && res.user) {
      this.token.set(res.token);
      this.currentUser.set(res.user);
      localStorage.setItem(this.TOKEN_KEY, res.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
      this.closeModal();
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (e) {
      // storage unavailable
    }
  }

  openModal(): void {
    this.authError.set(null);
    this.isAuthModalOpen.set(true);
  }

  closeModal(): void {
    this.isAuthModalOpen.set(false);
    this.authError.set(null);
  }
}
