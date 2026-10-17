import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BookStateService } from '../../services/book-state.service';
import { ThemeService } from '../../services/theme.service';
import { FontService } from '../../services/font.service';

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div 
      class="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 transition-colors duration-500 overflow-y-auto"
      [style.backgroundColor]="theme.getThemeConfig().deskBg"
    >
      <!-- Background Ambient Library Atmosphere -->
      <div class="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_30%,rgba(217,119,6,0.15)_0%,transparent_70%)]"></div>

      <!-- Main Closed Book Cover Card -->
      <div class="relative w-full max-w-xl my-8">
        
        <!-- Book Leather Exterior & Gold Inlay Border -->
        <div 
          class="relative rounded-3xl p-6 sm:p-10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] border-4 transition-all duration-300"
          [style.backgroundColor]="theme.getThemeConfig().coverBg"
          [style.borderColor]="theme.getThemeConfig().accentColor"
        >
          <!-- Corner Brass Ornaments -->
          <div class="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg opacity-60" [style.borderColor]="theme.getThemeConfig().accentColor"></div>
          <div class="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg opacity-60" [style.borderColor]="theme.getThemeConfig().accentColor"></div>
          <div class="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg opacity-60" [style.borderColor]="theme.getThemeConfig().accentColor"></div>
          <div class="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 rounded-br-lg opacity-60" [style.borderColor]="theme.getThemeConfig().accentColor"></div>

          <!-- Book Spine Left Crease Overlay -->
          <div class="absolute top-0 bottom-0 left-3 w-3 bg-black/30 blur-xs rounded-l pointer-events-none"></div>

          <!-- Book Title & Emblems -->
          <div class="text-center mb-8 relative">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black/40 border border-amber-500/30 text-3xl shadow-inner mb-3">
              📖
            </div>
            <h1 class="font-serif text-3xl sm:text-4xl font-bold tracking-wider text-amber-100 uppercase drop-shadow-md">
              Digital Q&A Book
            </h1>
            <p class="font-serif text-xs sm:text-sm text-amber-200/80 mt-1 italic tracking-widest">
              Volume I &bull; Full-Stack Engineering Compendium
            </p>
            <div class="w-32 h-0.5 mx-auto mt-4 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          </div>

          <!-- Inner Parchment Plaque -->
          <div 
            class="rounded-2xl p-6 sm:p-8 shadow-2xl border transition-colors duration-300 relative"
            [style.backgroundColor]="theme.getThemeConfig().pageBgLeft"
            [style.color]="theme.getThemeConfig().textColor"
            [style.borderColor]="'rgba(0,0,0,0.1)'"
          >
            <!-- Tab Switcher -->
            <div class="flex border-b border-stone-300/60 dark:border-stone-700/60 pb-3 mb-5 gap-4">
              <button
                (click)="activeTab = 'login'"
                class="flex-1 pb-1 font-serif text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2"
                [style.borderColor]="activeTab === 'login' ? theme.getThemeConfig().accentColor : 'transparent'"
                [style.color]="activeTab === 'login' ? theme.getThemeConfig().accentColor : 'inherit'"
                [class.opacity-60]="activeTab !== 'login'"
              >
                <span>🗝️</span> Sign In
              </button>
              <button
                (click)="activeTab = 'register'"
                class="flex-1 pb-1 font-serif text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2"
                [style.borderColor]="activeTab === 'register' ? theme.getThemeConfig().accentColor : 'transparent'"
                [style.color]="activeTab === 'register' ? theme.getThemeConfig().accentColor : 'inherit'"
                [class.opacity-60]="activeTab !== 'register'"
              >
                <span>✍️</span> Create Account
              </button>
            </div>

            <!-- 1-Click Quick Demo Access (for Login tab) -->
            <div *ngIf="activeTab === 'login'" class="mb-5 p-3 rounded-xl bg-black/5 border border-black/10">
              <div class="text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-2 flex items-center gap-1">
                <span>⚡</span> Click to Auto-Fill & Sign In:
              </div>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="quickDemoLogin('admin@qabook.com', 'Admin@123')"
                  class="p-2 rounded-lg bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/40 text-left transition-all group"
                >
                  <div class="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                    <span>🛡️ Admin</span>
                    <span class="text-[10px] opacity-75 group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                  <div class="text-[10px] opacity-75 font-mono truncate">admin&#64;qabook.com</div>
                </button>
                <button
                  type="button"
                  (click)="quickDemoLogin('reader@qabook.com', 'Reader@123')"
                  class="p-2 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-left transition-all group"
                >
                  <div class="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                    <span>📖 Reader</span>
                    <span class="text-[10px] opacity-75 group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                  <div class="text-[10px] opacity-75 font-mono truncate">reader&#64;qabook.com</div>
                </button>
              </div>
            </div>

            <!-- Error Banner -->
            <div *ngIf="auth.authError()" class="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-900 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{{ auth.authError() }}</span>
            </div>

            <!-- Input Form -->
            <form (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- Username (only on register) -->
              <div *ngIf="activeTab === 'register'">
                <label class="block text-xs font-semibold mb-1 opacity-80">Choose Username</label>
                <input 
                  type="text"
                  [(ngModel)]="registerData.username"
                  name="reg_username"
                  required
                  placeholder="e.g. nikhil_dev"
                  class="w-full bg-white/70 dark:bg-black/30 rounded-lg px-3 py-2 text-xs border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <!-- Identifier / Email -->
              <div>
                <label class="block text-xs font-semibold mb-1 opacity-80">
                  {{ activeTab === 'login' ? 'Email or Username' : 'Email Address' }}
                </label>
                <input 
                  type="text"
                  [ngModel]="activeTab === 'login' ? loginData.identifier : registerData.email"
                  (ngModelChange)="activeTab === 'login' ? loginData.identifier = $event : registerData.email = $event"
                  name="auth_identifier"
                  required
                  placeholder="you&#64;example.com"
                  class="w-full bg-white/70 dark:bg-black/30 rounded-lg px-3 py-2 text-xs border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <!-- Password -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="text-xs font-semibold opacity-80">Password</label>
                  <button 
                    type="button" 
                    (click)="showPassword = !showPassword"
                    class="text-[10px] opacity-75 hover:opacity-100 font-mono"
                  >
                    {{ showPassword ? 'Hide' : 'Show' }}
                  </button>
                </div>
                <input 
                  [type]="showPassword ? 'text' : 'password'"
                  [ngModel]="activeTab === 'login' ? loginData.password : registerData.password"
                  (ngModelChange)="activeTab === 'login' ? loginData.password = $event : registerData.password = $event"
                  name="auth_password"
                  required
                  placeholder="••••••••"
                  class="w-full bg-white/70 dark:bg-black/30 rounded-lg px-3 py-2 text-xs font-mono border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="auth.isLoading() || !isFormValid()"
                class="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-stone-950 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                [style.backgroundColor]="theme.getThemeConfig().accentColor"
              >
                <span *ngIf="auth.isLoading()" class="animate-spin text-sm">⏳</span>
                <span>{{ activeTab === 'login' ? 'Open & Enter Book' : 'Register & Enter Book' }}</span>
              </button>
            </form>

            <!-- Bottom Toggle Link -->
            <div class="mt-4 pt-3 border-t border-stone-300/40 dark:border-stone-700/40 text-center text-xs opacity-80">
              <span *ngIf="activeTab === 'login'">
                Need a library card? 
                <button (click)="activeTab = 'register'" class="font-bold underline ml-1 hover:opacity-100">Sign Up</button>
              </span>
              <span *ngIf="activeTab === 'register'">
                Already registered? 
                <button (click)="activeTab = 'login'" class="font-bold underline ml-1 hover:opacity-100">Sign In</button>
              </span>
            </div>

          </div>

          <!-- Theme and Font Selectors directly on login page -->
          <div class="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-amber-200/80">
            <!-- Theme Dropdown -->
            <div class="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-xl border border-amber-500/30">
              <span>🎨</span>
              <label for="login-theme-select" class="text-[11px] font-semibold text-stone-300">Theme:</label>
              <select
                id="login-theme-select"
                [ngModel]="theme.currentTheme()"
                (ngModelChange)="theme.setTheme($event)"
                class="bg-stone-900 text-stone-100 text-xs rounded-lg px-2 py-1 border border-stone-700 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option *ngFor="let t of theme.themes" [value]="t.id">
                  {{ t.icon }} {{ t.name }}
                </option>
              </select>
            </div>

            <!-- Font Dropdown -->
            <div class="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-xl border border-amber-500/30">
              <span>🔤</span>
              <label for="login-font-select" class="text-[11px] font-semibold text-stone-300">Font:</label>
              <select
                id="login-font-select"
                [ngModel]="fontService.currentFont()"
                (ngModelChange)="fontService.setFont($event)"
                class="bg-stone-900 text-stone-100 text-xs rounded-lg px-2 py-1 border border-stone-700 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option *ngFor="let f of fontService.fonts" [value]="f.id">
                  {{ f.icon }} {{ f.name }}
                </option>
              </select>
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class LoginViewComponent {
  auth = inject(AuthService);
  bookState = inject(BookStateService);
  theme = inject(ThemeService);
  fontService = inject(FontService);

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

  quickDemoLogin(identifier: string, password: string): void {
    this.loginData.identifier = identifier;
    this.loginData.password = password;
    this.onSubmit();
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
          this.bookState.showToast(`Welcome back, ${res.user.username}! The book is now open.`, 'success');
          this.bookState.refreshAll();
        }
      });
    } else {
      this.auth.register(this.registerData).subscribe({
        next: (res) => {
          this.bookState.showToast(`Welcome to the library, ${res.user.username}!`, 'success');
          this.bookState.refreshAll();
        }
      });
    }
  }
}
