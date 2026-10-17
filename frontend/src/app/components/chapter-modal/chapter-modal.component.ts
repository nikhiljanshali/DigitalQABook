import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookStateService } from '../../services/book-state.service';
import { ThemeService } from '../../services/theme.service';
import { CreateChapterDto, UpdateChapterDto } from '../../models/chapter.model';

@Component({
  selector: 'app-chapter-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div 
      *ngIf="state.isChapterModalOpen()"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div 
        class="bg-stone-900 border border-stone-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-stone-100"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">{{ isEditing ? '✏️' : '📚' }}</span>
            <h3 class="font-serif font-bold text-amber-100 text-lg">
              {{ isEditing ? 'Edit Chapter Details' : 'Add New Chapter' }}
            </h3>
          </div>
          <button 
            (click)="state.closeChapterModal()"
            class="text-stone-400 hover:text-stone-200 transition-colors p-1.5 rounded-lg hover:bg-stone-800"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <form (ngSubmit)="onSubmit()" class="p-6 space-y-4 text-sm">
          
          <!-- Chapter Title -->
          <div>
            <label class="block text-xs font-semibold text-stone-300 mb-1">
              Chapter Title <span class="text-amber-500">*</span>
            </label>
            <input 
              type="text"
              [(ngModel)]="formData.title"
              name="title"
              required
              placeholder="e.g. Cloud Architecture & Microservices"
              class="w-full bg-stone-800 text-stone-100 rounded-lg px-3 py-2 border border-stone-700 focus:outline-none focus:border-amber-500 text-sm font-serif placeholder-stone-500"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-semibold text-stone-300 mb-1">
              Description / Overview <span class="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea 
              [(ngModel)]="formData.description"
              name="description"
              rows="3"
              placeholder="Brief summary of what this chapter covers..."
              class="w-full bg-stone-800 text-stone-100 rounded-lg p-3 border border-stone-700 focus:outline-none focus:border-amber-500 text-sm font-serif placeholder-stone-500 leading-relaxed"
            ></textarea>
          </div>

          <!-- Order Index -->
          <div>
            <label class="block text-xs font-semibold text-stone-300 mb-1">Order Sequence</label>
            <input 
              type="number"
              [(ngModel)]="formData.order_index"
              name="order_index"
              min="1"
              class="w-full bg-stone-800 text-stone-100 rounded-lg px-3 py-2 border border-stone-700 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button 
              type="button"
              (click)="state.closeChapterModal()"
              class="px-4 py-2 rounded-lg text-xs font-semibold text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              [disabled]="!isValid() || state.isLoading()"
              class="px-5 py-2.5 rounded-lg text-xs font-bold text-stone-950 transition-all shadow-md flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              [style.backgroundColor]="theme.getThemeConfig().accentColor"
            >
              <span>{{ isEditing ? 'Save Chapter' : 'Create Chapter' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ChapterModalComponent {
  state = inject(BookStateService);
  theme = inject(ThemeService);

  isEditing = false;
  formData = {
    title: '',
    description: '',
    order_index: 1,
  };

  constructor() {
    effect(() => {
      const ch = this.state.editingChapter();
      if (ch) {
        this.isEditing = true;
        this.formData = {
          title: ch.title,
          description: ch.description || '',
          order_index: ch.order_index,
        };
      } else {
        this.isEditing = false;
        this.formData = {
          title: '',
          description: '',
          order_index: this.state.chapters().length + 1,
        };
      }
    });
  }

  isValid(): boolean {
    return !!this.formData.title.trim();
  }

  onSubmit(): void {
    if (!this.isValid()) return;

    if (this.isEditing && this.state.editingChapter()) {
      const dto: UpdateChapterDto = {
        title: this.formData.title.trim(),
        description: this.formData.description.trim(),
        order_index: this.formData.order_index,
      };
      this.state.saveChapter(dto, this.state.editingChapter()!.id);
    } else {
      const dto: CreateChapterDto = {
        title: this.formData.title.trim(),
        description: this.formData.description.trim(),
        order_index: this.formData.order_index,
      };
      this.state.saveChapter(dto);
    }
  }
}
