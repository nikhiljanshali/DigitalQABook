import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookStateService } from '../../services/book-state.service';
import { ThemeService } from '../../services/theme.service';
import { Chapter } from '../../models/chapter.model';

@Component({
  selector: 'app-table-of-contents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <aside 
      class="h-full flex flex-col bg-stone-900 border-r border-stone-800 transition-all duration-300 select-none shadow-xl"
      [class.w-80]="state.isSidebarOpen()"
      [class.w-0]="!state.isSidebarOpen()"
      [class.overflow-hidden]="!state.isSidebarOpen()"
    >
      <!-- Header with Action Buttons -->
      <div class="p-4 border-b border-stone-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">📑</span>
          <h2 class="font-serif font-bold text-amber-100 tracking-wide text-sm">Contents</h2>
        </div>
        <div class="flex items-center gap-1.5">
          <!-- Add Chapter Button -->
          <button 
            (click)="state.openCreateChapterModal()"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors shadow-sm"
            title="Create New Chapter"
          >
            <span class="text-amber-400 font-bold">+</span>
            <span>Chapter</span>
          </button>
          
          <!-- Add Question Button -->
          <button 
            (click)="state.openCreateModal()"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg text-stone-950 transition-all shadow"
            [style.backgroundColor]="theme.getThemeConfig().accentColor"
            title="Add New Question"
          >
            <span class="font-bold">+</span>
            <span>Q&A</span>
          </button>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="p-3 border-b border-stone-800 bg-stone-950/40 space-y-2">
        <div class="relative">
          <input 
            type="text"
            [ngModel]="state.searchQuery()"
            (ngModelChange)="state.setSearch($event)"
            placeholder="Search questions or keywords..."
            class="w-full bg-stone-800/80 text-stone-200 placeholder-stone-400 text-xs rounded-md pl-8 pr-3 py-2 border border-stone-700/60 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <svg class="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <div class="flex gap-2">
          <select 
            [ngModel]="state.selectedDifficulty()"
            (ngModelChange)="state.setDifficulty($event)"
            class="w-full bg-stone-800 text-stone-300 text-xs rounded-md px-2 py-1.5 border border-stone-700 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      <!-- Chapters Section -->
      <div class="flex-1 overflow-y-auto p-3 space-y-4">
        
        <!-- Chapters Header & Quick Add -->
        <div>
          <div class="flex items-center justify-between px-1 mb-1.5">
            <span class="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Chapters ({{ state.chapters().length }})</span>
            <button
              (click)="state.openCreateChapterModal()"
              class="text-[10px] text-amber-400 hover:text-amber-300 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>+ Add</span>
            </button>
          </div>

          <!-- All Chapters Button -->
          <button
            (click)="state.selectChapter(null)"
            class="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between mb-1"
            [ngClass]="state.selectedChapterId() === null ? 'bg-amber-950/60 text-amber-300 border border-amber-600/50' : 'text-stone-300 hover:bg-stone-800/60'"
          >
            <span class="flex items-center gap-2">
              <span class="text-sm">📚</span>
              <span>All Chapters</span>
            </span>
            <span class="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full font-mono">
              {{ getTotalQaCount() }}
            </span>
          </button>

          <!-- Individual Chapters with Edit Actions -->
          <div *ngFor="let chapter of state.chapters(); let ci = index" class="group relative rounded-lg overflow-hidden mb-1">
            <button
              (click)="state.selectChapter(chapter.id)"
              class="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between"
              [ngClass]="state.selectedChapterId() === chapter.id ? 'bg-amber-950/60 text-amber-300 border border-amber-600/50' : 'text-stone-300 hover:bg-stone-800/60'"
            >
              <div class="flex items-center gap-2 truncate pr-14">
                <span class="font-mono text-[11px] font-bold shrink-0" [style.color]="theme.getThemeConfig().accentColor">
                  Ch.{{ ci + 1 }}
                </span>
                <span class="truncate font-serif">{{ chapter.title }}</span>
              </div>
              
              <!-- Badge count (hidden when hovering for actions) -->
              <span class="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full font-mono shrink-0 group-hover:hidden">
                {{ chapter.qa_count || 0 }}
              </span>
            </button>

            <!-- Hover Quick Action Buttons for Chapter -->
            <div class="hidden group-hover:flex items-center gap-1 absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-stone-900/90 px-1 py-0.5 rounded border border-stone-700 shadow">
              <button
                (click)="onEditChapter(chapter, $event)"
                class="p-1 text-stone-400 hover:text-amber-300 rounded transition-colors"
                title="Edit Chapter"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                (click)="onDeleteChapter(chapter, $event)"
                class="p-1 text-stone-400 hover:text-red-400 rounded transition-colors"
                title="Delete Chapter"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Section: Active Questions List -->
        <div class="pt-2 border-t border-stone-800">
          <div class="px-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Questions ({{ state.qaList().length }})
          </div>

          <div class="space-y-1">
            <div *ngIf="state.qaList().length === 0" class="p-3 text-xs text-stone-400 italic text-center">
              No questions found
            </div>

            <button
              *ngFor="let item of state.qaList(); let i = index"
              (click)="state.goToIndex(i)"
              class="w-full text-left px-2.5 py-2.5 rounded-md text-xs transition-colors flex items-start gap-2 group"
              [ngClass]="state.currentIndex() === i ? 'bg-amber-600/20 text-amber-200 border-l-2 border-amber-500' : 'text-stone-300 hover:bg-stone-800/60 hover:text-stone-100'"
            >
              <span class="font-mono text-[10px] opacity-70 group-hover:opacity-100 mt-0.5 shrink-0" [style.color]="theme.getThemeConfig().accentColor">
                #{{ i + 1 }}
              </span>
              <div class="flex-1 truncate">
                <p class="truncate font-medium">{{ item.question }}</p>
                <div class="flex items-center gap-1.5 mt-0.5 text-[10px] text-stone-400">
                  <span 
                    class="px-1 py-0.2 rounded"
                    [ngClass]="{
                      'bg-emerald-950 text-emerald-300': item.difficulty === 'Beginner',
                      'bg-blue-950 text-blue-300': item.difficulty === 'Intermediate',
                      'bg-purple-950 text-purple-300': item.difficulty === 'Advanced'
                    }"
                  >
                    {{ item.difficulty }}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="p-3 border-t border-stone-800 bg-stone-950/60 text-[11px] text-stone-400 flex items-center justify-between">
        <span>📖 Digital Book v1.0</span>
        <span class="font-mono font-bold" [style.color]="theme.getThemeConfig().accentColor">{{ state.currentPageNumber() }} / {{ state.totalItems() }}</span>
      </div>
    </aside>
  `
})
export class TableOfContentsComponent {
  state = inject(BookStateService);
  theme = inject(ThemeService);

  getTotalQaCount(): number {
    return this.state.chapters().reduce((sum, ch) => sum + (ch.qa_count || 0), 0);
  }

  onEditChapter(chapter: Chapter, event: Event): void {
    event.stopPropagation();
    this.state.openEditChapterModal(chapter);
  }

  onDeleteChapter(chapter: Chapter, event: Event): void {
    event.stopPropagation();
    this.state.openDeleteChapterModal(chapter);
  }
}
