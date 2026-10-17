import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BookStateService } from '../../services/book-state.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div 
      *ngIf="auth.isAuthModalOpen()"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div class="bg-stone-900 border border-stone-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-stone-100">
        
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-stone-950/90 border-b border-stone-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">🗝️</span>
            <div>
              <h3 class="font-serif font-bold text-amber-100 text-lg">
                {{ activeTab === 'login' ? 'Reader Sign In' : 'Join the Library' }}
              </h3>
              <p class="text-[11px] text-stone-400">Digital Q&A Book Authentication</p>
            </div>
          </div>
          <button 
            (click)="auth.closeModal()"
            class="text-stone-400 hover:text-stone-200 transition-colors p-1.5 rounded-lg hover:bg-stone-800"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Tab Switcher -->
        <div class="flex border-b border-stone-800 bg-stone-950/40">
          <button 
            (click)="activeTab = 'login'"
            class="flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors"
            [ngClass]="activeTab === 'login' ? 'border-amber-500 text-amber-300 bg-stone-900/60' : 'border-transparent text-stone-400 hover:text-stone-200'"
          >
            Sign In
          </button>
          <button 
            (click)="activeTab = 'register'"
            class="flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors"
            [ngClass]="activeTab === 'register' ? 'border-amber-500 text-amber-300 bg-stone-900/60' : 'border-transparent text-stone-400 hover:text-stone-200'"
          >
            Create Account
          </button>
        </div>

        <!-- Quick Demo Accounts -->
        <div *ngIf="activeTab === 'login'" class="px-6 pt-4">
          <div class="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
            ⚡ Quick Demo Accounts:
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              (click)="fillDemo('admin@qabook.com', 'Admin@123')"
              class="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-[11px] text-amber-300 text-left border border-stone-700/80 transition-colors"
            >
              <div class="font-bold flex items-center gap-1">
                <span>🛡️</span> Admin
              </div>
              <div class="text-[9px] text-stone-400 truncate">admin&#64;qabook.com</div>
            </button>
            <button
              type="button"
              (click)="fillDemo('reader@qabook.com', 'Reader@123')"
              class="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-[11px] text-stone-300 text-left border border-stone-700/80 transition-colors"
            >
              <div class="font-bold flex items-center gap-1">
                <span>📖</span> Reader
              </div>
              <div class="text-[9px] text-stone-400 truncate">reader&#64;qabook.com</div>
            </button>
          </div>
        </div>

        <!-- Error Message Alert -->
        <div *ngIf="auth.authError()" class="mx-6 mt-4 p-3 rounded-lg bg-red-950/80 border border-red-800/80 text-xs text-red-200 flex items-start gap-2">
          <span>⚠️</span>
          <span>{{ auth.authError() }}</span>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          
          <!-- Username (Register only) -->
          <div *ngIf="activeTab === 'register'">
            <label class="block text-xs font-semibold text-stone-300 mb-1">Username</label>
            <input 
              type="text"
              [(ngModel)]="registerData.username"
              name="reg_username"
              required
              placeholder="e.g. janesmith"
              class="w-full bg-stone-800 text-stone-100 rounded-lg px-3 py-2 border border-stone-700 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          <!-- Email or Identifier -->
          <div>
            <label class="block text-xs font-semibold text-stone-300 mb-1">
              {{ activeTab === 'login' ? 'Email or Username' : 'Email Address' }}
            </label>
            <input 
              type="text"
              [ngModel]="activeTab === 'login' ? loginData.identifier : registerData.email"
              (ngModelChange)="activeTab === 'login' ? loginData.identifier = $event : registerData.email = $event"
              name="identifier"
              required
              placeholder="you&#64;example.com"
              class="w-full bg-stone-800 text-stone-100 rounded-lg px-3 py-2 border border-stone-700 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs font-semibold text-stone-300">Password</label>
              <button 
                type="button" 
                (click)="showPassword = !showPassword"
                class="text-[10px] text-amber-500 hover:text-amber-400 font-mono"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <input 
              [type]="showPassword ? 'text' : 'password'"
              [ngModel]="activeTab === 'login' ? loginData.password : registerData.password"
              (ngModelChange)="activeTab === 'login' ? loginData.password = $event : registerData.password = $event"
              name="password"
              required
              placeholder="••••••••"
              class="w-full bg-stone-800 text-stone-100 rounded-lg px-3 py-2 border border-stone-700 focus:outline-none focus:border-amber-500 text-xs font-mono"
            />
            <p *ngIf="activeTab === 'register'" class="text-[10px] text-stone-400 mt-1">Minimum 6 characters</p>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            [disabled]="auth.isLoading() || !isFormValid()"
            class="w-full mt-2 py-2.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span *ngIf="auth.isLoading()" class="animate-spin text-sm">⏳</span>
            <span>{{ activeTab === 'login' ? 'Sign In to Book' : 'Create Account & Sign In' }}</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="px-6 py-3 bg-stone-950/60 border-t border-stone-800 text-center text-[11px] text-stone-400">
          <span *ngIf="activeTab === 'login'">
            Don't have an account? 
            <button (click)="activeTab = 'register'" class="text-amber-400 hover:underline font-semibold ml-1">Sign up</button>
          </span>
          <span *ngIf="activeTab === 'register'">
            Already have an account? 
            <button (click)="activeTab = 'login'" class="text-amber-400 hover:underline font-semibold ml-1">Sign in</button>
          </span>
        </div>

      </div>
    </div>
  `
})
export class LoginModalComponent {
  auth = inject(AuthService);
  bookState = inject(BookStateService);

  activeTab: 'login' | 'register' = 'login';
  showPassword = false;

  loginData = {
    identifier: '',
    password: ''
  };

  registerData = {
    username: '',
    email: '',
    password: ''
  };

  fillDemo(identifier: string, password: string): void {
    this.loginData.identifier = identifier;
    this.loginData.password = password;
  }

  isFormValid(): boolean {
    if (this.activeTab === 'login') {
      return !!(this.loginData.identifier.trim() && this.loginData.password);
    } else {
      return !!(
        this.registerData.username.trim() &&
        this.registerData.email.trim() &&
        this.registerData.password.length >= 6
      );
    }
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    if (this.activeTab === 'login') {
      this.auth.login(this.loginData).subscribe({
        next: (res) => {
          this.bookState.showToast(`Welcome back, ${res.user.username}!`, 'success');
        }
      });
    } else {
      this.auth.register(this.registerData).subscribe({
        next: (res) => {
          this.bookState.showToast(`Account created! Welcome, ${res.user.username}.`, 'success');
        }
      });
    }
  }
}
