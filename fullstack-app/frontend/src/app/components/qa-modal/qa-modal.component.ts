import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookStateService } from '../../services/book-state.service';
import { CreateQaDto, UpdateQaDto } from '../../models/qa-item.model';
import { RichTextEditorComponent } from '../rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'app-qa-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  template: `
    <div 
      *ngIf="state.isFormModalOpen()"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div 
        class="bg-stone-900 border border-stone-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">{{ isEditing ? '✍️' : '✨' }}</span>
            <h3 class="font-serif font-bold text-amber-100 text-lg">
              {{ isEditing ? 'Edit Question & Answer' : 'Add New Question & Answer' }}
            </h3>
          </div>
          <button 
            (click)="state.closeFormModal()"
            class="text-stone-400 hover:text-stone-200 transition-colors p-1 rounded-lg hover:bg-stone-800"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <form (ngSubmit)="onSubmit()" class="flex-1 overflow-y-auto p-6 space-y-4 text-stone-200 text-sm">
          
          <!-- Chapter Selector -->
          <div>
            <label class="block text-xs font-semibold text-stone-300 mb-1">
              Chapter <span class="text-amber-500">*</span>
            </label>
            <select 
              [(ngModel)]="formData.chapter_id" 
              name="chapter_id"
              required
              class="w-full bg-stone-800 text-stone-100 rounded-lg px-3 py-2 border border-stone-700 focus:outline-none focus:border-amber-500 text-sm"
            >
              <option [ngValue]="null" disabled>Select a Chapter</option>
              <option *ngFor="let ch of state.chapters()" [ngValue]="ch.id">
                Ch.{{ ch.order_index }}: {{ ch.title }}
              </option>
            </select>
          </div>

          <!-- Question Input -->
          <div>
            <label class="block text-xs font-semibold text-stone-300 mb-1">
              Question <span class="text-amber-500">*</span>
            </label>
            <textarea 
              [(ngModel)]="formData.question" 
              name="question"
              required
              rows="3"
              placeholder="e.g., What are Angular Signals and how do they differ from RxJS Observables?"
              class="w-full bg-stone-800 text-stone-100 rounded-lg p-3 border border-stone-700 focus:outline-none focus:border-amber-500 text-sm font-serif placeholder-stone-500"
            ></textarea>
          </div>

          <!-- Answer Input with Microsoft Word-like Rich Textarea -->
          <div>
            <label class="block text-xs font-semibold text-stone-300 mb-1 flex items-center justify-between">
              <span>Answer & Detailed Explanation <span class="text-amber-500">*</span></span>
              <span class="text-[11px] text-amber-400 font-normal">Supports Bold, Italic, Images, Bullets, Lists</span>
            </label>
            <app-rich-text-editor
              [(ngModel)]="formData.answer"
              name="answer"
              placeholder="Provide a comprehensive answer, insert images, format bullet points, bold key terms..."
            ></app-rich-text-editor>
          </div>

          <!-- Difficulty & Order Row -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-stone-300 mb-1">Difficulty</label>
              <select 
                [(ngModel)]="formData.difficulty" 
                name="difficulty"
                class="w-full bg-stone-800 text-stone-100 rounded-lg px-3 py-2 border border-stone-700 focus:outline-none focus:border-amber-500 text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-stone-300 mb-1">Order Index</label>
              <input 
                type="number"
                [(ngModel)]="formData.order_index"
                name="order_index"
                min="1"
                class="w-full bg-stone-800 text-stone-100 rounded-lg px-3 py-2 border border-stone-700 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          <!-- Tags Input -->
          <div>
            <label class="block text-xs font-semibold text-stone-300 mb-1">
              Tags <span class="text-stone-400 font-normal">(Comma separated)</span>
            </label>
            <input 
              type="text"
              [(ngModel)]="tagsString"
              name="tags"
              placeholder="e.g. Angular, Signals, Frontend, State"
              class="w-full bg-stone-800 text-stone-100 rounded-lg px-3 py-2 border border-stone-700 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <!-- Form Actions Footer -->
          <div class="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button 
              type="button"
              (click)="state.closeFormModal()"
              class="px-4 py-2 rounded-lg text-xs font-semibold text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              [disabled]="!isValid() || state.isLoading()"
              class="px-5 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 transition-colors shadow-md flex items-center gap-1.5"
            >
              <span>{{ isEditing ? 'Save Changes' : 'Add to Book' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class QaModalComponent {
  state = inject(BookStateService);

  isEditing = false;
  tagsString = '';

  formData: {
    chapter_id: number | null;
    question: string;
    answer: string;
    difficulty: string;
    order_index: number;
  } = {
    chapter_id: null,
    question: '',
    answer: '',
    difficulty: 'Intermediate',
    order_index: 1,
  };

  constructor() {
    effect(() => {
      const item = this.state.editingItem();
      if (item) {
        this.isEditing = true;
        this.formData = {
          chapter_id: item.chapter_id,
          question: item.question,
          answer: item.answer,
          difficulty: item.difficulty,
          order_index: item.order_index,
        };
        this.tagsString = (item.tags || []).join(', ');
      } else {
        this.isEditing = false;
        // Default chapter to currently selected or first chapter
        const defaultChapterId = this.state.selectedChapterId() || (this.state.chapters()[0]?.id ?? null);
        this.formData = {
          chapter_id: defaultChapterId,
          question: '',
          answer: '',
          difficulty: 'Intermediate',
          order_index: (this.state.totalItems() + 1),
        };
        this.tagsString = '';
      }
    });
  }

  isValid(): boolean {
    return !!(
      this.formData.chapter_id &&
      this.formData.question.trim() &&
      this.formData.answer.trim()
    );
  }

  onSubmit(): void {
    if (!this.isValid()) return;

    const tags = this.tagsString
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (this.isEditing && this.state.editingItem()) {
      const dto: UpdateQaDto = {
        chapter_id: this.formData.chapter_id!,
        question: this.formData.question.trim(),
        answer: this.formData.answer.trim(),
        difficulty: this.formData.difficulty,
        tags,
        order_index: this.formData.order_index,
      };
      this.state.saveQa(dto, this.state.editingItem()!.id);
    } else {
      const dto: CreateQaDto = {
        chapter_id: this.formData.chapter_id!,
        question: this.formData.question.trim(),
        answer: this.formData.answer.trim(),
        difficulty: this.formData.difficulty,
        tags,
        order_index: this.formData.order_index,
      };
      this.state.saveQa(dto);
    }
  }
}
