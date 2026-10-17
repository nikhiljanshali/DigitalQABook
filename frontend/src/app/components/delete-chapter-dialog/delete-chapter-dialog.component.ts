import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookStateService } from '../../services/book-state.service';

@Component({
  selector: 'app-delete-chapter-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="state.isDeleteChapterModalOpen() && state.deletingChapter() as chapter"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div class="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-stone-100">
        <div class="flex items-center gap-3 text-red-400 mb-4">
          <div class="p-2 bg-red-950/70 border border-red-800/60 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
          <div>
            <h3 class="font-serif font-bold text-lg text-stone-100">Delete Chapter?</h3>
            <p class="text-xs text-stone-400">All questions in this chapter will also be removed.</p>
          </div>
        </div>

        <div class="p-3.5 bg-stone-950/60 rounded-lg border border-stone-800 text-xs text-stone-200 mb-6">
          <span class="font-bold text-amber-400">Ch.{{ chapter.order_index }}:</span>
          <span class="font-serif ml-1.5">{{ chapter.title }}</span>
          <div class="mt-1 text-[11px] text-stone-400" *ngIf="chapter.qa_count">
            Contains {{ chapter.qa_count }} question(s).
          </div>
        </div>

        <div class="flex items-center justify-end gap-3">
          <button 
            type="button"
            (click)="state.closeDeleteChapterModal()"
            class="px-4 py-2 rounded-lg text-xs font-semibold text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            (click)="state.confirmDeleteChapter()"
            [disabled]="state.isLoading()"
            class="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors shadow-md flex items-center gap-1.5"
          >
            <span>Delete Chapter</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class DeleteChapterDialogComponent {
  state = inject(BookStateService);
}
