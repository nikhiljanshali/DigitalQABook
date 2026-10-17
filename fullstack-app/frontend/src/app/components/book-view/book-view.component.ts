import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookStateService } from '../../services/book-state.service';
import { ThemeService } from '../../services/theme.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-book-view',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  template: `
    <div 
      class="h-full flex flex-col justify-between p-3 sm:p-6 md:p-8 lg:p-10 overflow-y-auto transition-colors duration-500"
      [style.backgroundColor]="theme.getThemeConfig().deskBg"
    >
      
      <!-- Top Navigation & Info Bar -->
      <div class="max-w-[1440px] w-full mx-auto mb-4 flex items-center justify-between text-xs px-2">
        <div class="flex items-center gap-3">
          <button 
            (click)="state.toggleSidebar()"
            class="px-3 py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-200 flex items-center gap-2 transition-colors shadow border border-stone-700/60 font-medium"
            title="Toggle Sidebar"
          >
            <span>📑</span>
            <span>{{ state.isSidebarOpen() ? 'Hide Contents' : 'Show Contents' }}</span>
          </button>

          <span *ngIf="state.currentChapter()" class="hidden md:inline font-serif font-semibold text-stone-300">
            {{ state.currentChapter()?.title }}
          </span>
        </div>

        <!-- Progress Counter -->
        <div class="flex items-center gap-2 font-mono">
          <span class="text-stone-400 text-xs hidden sm:inline">Entry:</span>
          <span 
            class="font-bold text-xs sm:text-sm px-3 py-1 rounded-lg border shadow-inner"
            [style.color]="theme.getThemeConfig().accentColor"
            [style.backgroundColor]="'rgba(0,0,0,0.4)'"
            [style.borderColor]="theme.getThemeConfig().accentColor + '60'"
          >
            {{ state.currentPageNumber() }} of {{ state.totalItems() }}
          </span>
        </div>
      </div>

      <!-- Main Open Book Canvas (Expanded Width & Height) -->
      <div class="max-w-[1440px] w-full mx-auto flex-1 flex flex-col justify-center my-auto">
        
        <!-- Loading State -->
        <div 
          *ngIf="state.isLoading()" 
          class="rounded-3xl shadow-2xl p-20 text-center border-8 border-stone-800 max-w-2xl mx-auto w-full"
          [style.backgroundColor]="theme.getThemeConfig().pageBgLeft"
          [style.color]="theme.getThemeConfig().textColor"
        >
          <div class="animate-spin text-5xl mb-4">📖</div>
          <p class="font-serif text-xl font-bold">Turning the pages...</p>
        </div>

        <!-- Empty State -->
        <div 
          *ngIf="!state.isLoading() && state.totalItems() === 0" 
          class="rounded-3xl shadow-2xl p-16 text-center border-8 max-w-2xl mx-auto w-full transition-colors"
          [style.backgroundColor]="theme.getThemeConfig().pageBgLeft"
          [style.color]="theme.getThemeConfig().textColor"
          [style.borderColor]="theme.getThemeConfig().accentColor"
        >
          <div class="text-6xl mb-4">📭</div>
          <h3 class="text-2xl sm:text-3xl font-serif font-bold mb-3">No Questions Found</h3>
          <p class="text-sm opacity-75 mb-6 max-w-md mx-auto">
            {{ state.searchQuery() ? 'No entries match your search criteria. Try a different query or difficulty.' : 'This chapter is currently empty. Add your first Q&A pair!' }}
          </p>
          <button 
            (click)="state.openCreateModal()"
            class="px-6 py-3 font-bold rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider text-stone-950 inline-flex items-center gap-2"
            [style.backgroundColor]="theme.getThemeConfig().accentColor"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            Add New Question
          </button>
        </div>

        <!-- ================= TWO-PAGE EXPANDED OPEN BOOK ================= -->
        <div 
          *ngIf="!state.isLoading() && state.currentQa() as qa" 
          class="relative rounded-3xl p-3 sm:p-5 md:p-6 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] border-4 transition-all duration-300"
          [style.backgroundColor]="theme.getThemeConfig().coverBg"
          [style.borderColor]="theme.getThemeConfig().accentColor + '80'"
        >
          <!-- Silk Ribbon Bookmark hanging from top spine -->
          <div 
            class="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-16 rounded-b shadow-lg z-30 pointer-events-none opacity-90 transition-all"
            [style.backgroundColor]="theme.getThemeConfig().accentColor"
          >
            <div class="absolute bottom-0 inset-x-0 h-3 bg-black/20 clip-v"></div>
          </div>

          <!-- Open Book Pages Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden relative shadow-2xl">
            
            <!-- Center Spine Shadow & Stitching Overlay (desktop) -->
            <div class="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-16 pointer-events-none z-20 bg-gradient-to-r from-black/25 via-black/45 to-black/25"></div>
            <div class="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 pointer-events-none z-25 bg-black/60"></div>

            <!-- ================= LEFT PAGE: QUESTION & METADATA ================= -->
            <div 
              class="relative flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:p-16 md:border-r border-black/10 shadow-[inset_-16px_0_30px_-10px_rgba(0,0,0,0.1)] min-h-[520px] sm:min-h-[620px] lg:min-h-[700px] transition-colors duration-300"
              [style.backgroundColor]="theme.getThemeConfig().pageBgLeft"
              [style.color]="theme.getThemeConfig().textColor"
            >
              <!-- Left Page Body -->
              <div class="space-y-6">
                <!-- Chapter & Difficulty Header -->
                <div class="flex items-center justify-between border-b pb-4 border-current/15">
                  <div class="flex items-center gap-2">
                    <span class="text-xs uppercase tracking-widest font-mono font-bold opacity-80">
                      {{ qa.chapter_title || 'Chapter ' + qa.chapter_id }}
                    </span>
                  </div>

                  <!-- Difficulty Badge -->
                  <span 
                    class="text-xs px-3 py-1 rounded-full font-semibold border shadow-sm"
                    [ngClass]="{
                      'bg-emerald-100 text-emerald-900 border-emerald-300': qa.difficulty === 'Beginner',
                      'bg-sky-100 text-sky-900 border-sky-300': qa.difficulty === 'Intermediate',
                      'bg-purple-100 text-purple-900 border-purple-300': qa.difficulty === 'Advanced'
                    }"
                  >
                    {{ qa.difficulty }}
                  </span>
                </div>

                <!-- Question Prompt -->
                <div class="pt-2">
                  <div class="flex items-center gap-2 mb-3">
                    <span 
                      class="text-xs font-mono font-bold px-2.5 py-1 rounded-md text-white shadow-sm"
                      [style.backgroundColor]="theme.getThemeConfig().accentColor"
                    >
                      Question {{ state.currentPageNumber() }}
                    </span>
                  </div>
                  <h2 class="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug tracking-tight">
                    {{ qa.question }}
                  </h2>
                </div>

                <!-- Topic Tags -->
                <div class="pt-4 space-y-2">
                  <div class="text-xs font-semibold uppercase tracking-wider opacity-60">Tagged Categories:</div>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      *ngFor="let tag of qa.tags"
                      class="text-xs font-medium px-3 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors border border-current/10"
                    >
                      #{{ tag }}
                    </span>
                    <span *ngIf="!qa.tags || qa.tags.length === 0" class="text-xs opacity-50 italic">None</span>
                  </div>
                </div>

                <!-- Metadata Row -->
                <div class="pt-2 text-xs opacity-60 flex items-center gap-4">
                  <span>📅 Recorded: {{ qa.created_at | date:'mediumDate' }}</span>
                </div>
              </div>

              <!-- Left Page Footer -->
              <div class="mt-10 pt-4 border-t border-current/15 flex items-center justify-between text-xs font-mono opacity-60">
                <span>Digital Q&A Book &bull; Vol. I</span>
                <span class="font-bold text-sm">p. {{ state.currentPageNumber() * 2 - 1 }}</span>
              </div>
            </div>

            <!-- ================= RIGHT PAGE: ANSWER & ACTIONS ================= -->
            <div 
              class="relative flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:p-16 shadow-[inset_16px_0_30px_-10px_rgba(0,0,0,0.1)] min-h-[520px] sm:min-h-[620px] lg:min-h-[700px] transition-colors duration-300"
              [style.backgroundColor]="theme.getThemeConfig().pageBgRight"
              [style.color]="theme.getThemeConfig().textColor"
            >
              <!-- Right Page Body -->
              <div class="space-y-6">
                <!-- Answer Section Header & Edit Actions -->
                <div class="flex items-center justify-between border-b pb-4 border-current/15">
                  <div class="flex items-center gap-2">
                    <span class="text-base">💡</span>
                    <span class="text-xs uppercase tracking-widest font-mono font-bold opacity-80">Authoritative Answer</span>
                  </div>

                  <!-- Quick Action Buttons -->
                  <div class="flex items-center gap-1.5">
                    <button
                      (click)="state.openEditModal(qa)"
                      class="p-2 opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all"
                      title="Edit this entry"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      (click)="state.openDeleteModal(qa)"
                      class="p-2 opacity-60 hover:opacity-100 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete this entry"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Answer Content with Rich HTML Rendering (Supports formatting, images, bullet lists, etc.) -->
                <div class="pt-2">
                  <div 
                    class="book-answer-content font-serif text-base sm:text-lg leading-relaxed tracking-wide opacity-90 overflow-y-auto max-h-[480px] pr-2"
                    [innerHTML]="qa.answer | safeHtml"
                  ></div>
                </div>
              </div>

              <!-- Right Page Footer: Controls & Page Number -->
              <div class="mt-10 pt-4 border-t border-current/15 flex items-center justify-between">
                
                <!-- Page Navigation Buttons -->
                <div class="flex items-center gap-3">
                  <button
                    (click)="state.prevPage()"
                    [disabled]="!state.hasPrevious()"
                    class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-black/10 hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                    title="Previous page (Left Arrow)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    <span>Previous</span>
                  </button>

                  <button
                    (click)="state.nextPage()"
                    [disabled]="!state.hasNext()"
                    class="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-stone-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                    [style.backgroundColor]="theme.getThemeConfig().accentColor"
                    title="Next page (Right Arrow)"
                  >
                    <span>Next</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>

                <!-- Page Number -->
                <div class="text-xs font-mono font-bold opacity-60 text-sm">
                  p. {{ state.currentPageNumber() * 2 }}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      <!-- Bottom Keyboard Navigation Hint (High Contrast & Pure White Readability) -->
      <div class="max-w-[1440px] w-full mx-auto mt-5 text-center flex items-center justify-center">
        <div class="inline-flex items-center gap-2 sm:gap-3 px-5 py-2.5 rounded-full bg-stone-950/90 border border-stone-600/90 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.7)] text-white text-xs sm:text-sm">
          <span class="text-base">💡</span>
          <span class="text-white font-bold tracking-wide">Keyboard Controls:</span>
          
          <div class="flex items-center gap-1.5 ml-1">
            <kbd class="px-2 py-0.5 bg-stone-800 text-amber-300 font-mono font-bold rounded border border-stone-600 shadow-sm text-xs">←</kbd>
            <span class="text-white font-medium">Previous Page</span>
          </div>

          <span class="text-stone-500 font-bold mx-1">|</span>

          <div class="flex items-center gap-1.5">
            <kbd class="px-2 py-0.5 bg-stone-800 text-amber-300 font-mono font-bold rounded border border-stone-600 shadow-sm text-xs">→</kbd>
            <span class="text-white font-medium">Next Page</span>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host ::ng-deep .book-answer-content ul {
      list-style-type: disc !important;
      padding-left: 1.75rem !important;
      margin: 0.75rem 0 !important;
    }
    :host ::ng-deep .book-answer-content ol {
      list-style-type: decimal !important;
      padding-left: 1.75rem !important;
      margin: 0.75rem 0 !important;
    }
    :host ::ng-deep .book-answer-content li {
      margin-bottom: 0.35rem;
    }
    :host ::ng-deep .book-answer-content b,
    :host ::ng-deep .book-answer-content strong {
      font-weight: 700;
    }
    :host ::ng-deep .book-answer-content i,
    :host ::ng-deep .book-answer-content em {
      font-style: italic;
    }
    :host ::ng-deep .book-answer-content u {
      text-decoration: underline;
    }
    :host ::ng-deep .book-answer-content blockquote {
      border-left: 4px solid #d97706;
      padding: 0.5rem 1rem;
      margin: 0.75rem 0;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 0 0.5rem 0.5rem 0;
      font-style: italic;
    }
    :host ::ng-deep .book-answer-content pre {
      background: #1c1917;
      color: #fef08a;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-family: 'Fira Code', monospace;
      font-size: 0.875rem;
      overflow-x: auto;
      margin: 0.75rem 0;
    }
    :host ::ng-deep .book-answer-content img {
      max-width: 100%;
      max-height: 320px;
      object-fit: contain;
      border-radius: 0.75rem;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
      margin: 0.75rem auto;
      display: block;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    :host ::ng-deep .book-answer-content hr {
      border: 0;
      height: 1px;
      background: currentColor;
      opacity: 0.2;
      margin: 1.25rem 0;
    }
    :host ::ng-deep .book-answer-content h2 {
      font-size: 1.35rem;
      font-weight: bold;
      margin: 1rem 0 0.5rem;
    }
    :host ::ng-deep .book-answer-content h3 {
      font-size: 1.15rem;
      font-weight: bold;
      margin: 0.75rem 0 0.35rem;
    }
    :host ::ng-deep .book-answer-content a {
      color: #d97706;
      text-decoration: underline;
    }
  `]
})
export class BookViewComponent {
  state = inject(BookStateService);
  theme = inject(ThemeService);

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.state.isFormModalOpen() || this.state.isDeleteModalOpen()) {
      return;
    }
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
      this.state.nextPage();
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      this.state.prevPage();
    }
  }
}
