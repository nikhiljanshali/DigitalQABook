import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Chapter, CreateChapterDto, UpdateChapterDto } from '../models/chapter.model';
import { QaItem, CreateQaDto, UpdateQaDto } from '../models/qa-item.model';

export interface Toast {
  text: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class BookStateService {
  private api = inject(ApiService);

  // Core reactive signals
  readonly chapters = signal<Chapter[]>([]);
  readonly selectedChapterId = signal<number | null>(null);
  readonly qaList = signal<QaItem[]>([]);
  readonly currentIndex = signal<number>(0);
  readonly searchQuery = signal<string>('');
  readonly selectedDifficulty = signal<string>('');
  readonly selectedTag = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly toast = signal<Toast | null>(null);
  readonly isSidebarOpen = signal<boolean>(true);

  // QA Modal states
  readonly isFormModalOpen = signal<boolean>(false);
  readonly editingItem = signal<QaItem | null>(null);
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly deletingItem = signal<QaItem | null>(null);

  // Chapter Modal states
  readonly isChapterModalOpen = signal<boolean>(false);
  readonly editingChapter = signal<Chapter | null>(null);
  readonly isDeleteChapterModalOpen = signal<boolean>(false);
  readonly deletingChapter = signal<Chapter | null>(null);

  // Computed signals
  readonly totalItems = computed(() => this.qaList().length);

  readonly currentQa = computed<QaItem | null>(() => {
    const list = this.qaList();
    const idx = this.currentIndex();
    if (list.length === 0 || idx < 0 || idx >= list.length) {
      return null;
    }
    return list[idx];
  });

  readonly currentPageNumber = computed(() => {
    return this.totalItems() > 0 ? this.currentIndex() + 1 : 0;
  });

  readonly hasPrevious = computed(() => this.currentIndex() > 0);
  readonly hasNext = computed(() => this.currentIndex() < this.qaList().length - 1);

  readonly currentChapter = computed<Chapter | null>(() => {
    const active = this.currentQa();
    if (active) {
      return this.chapters().find(c => c.id === active.chapter_id) ?? null;
    }
    const selectedId = this.selectedChapterId();
    if (selectedId) {
      return this.chapters().find(c => c.id === selectedId) ?? null;
    }
    return null;
  });

  readonly allTags = computed<string[]>(() => {
    const tagSet = new Set<string>();
    for (const item of this.qaList()) {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(t => tagSet.add(t));
      }
    }
    return Array.from(tagSet).sort();
  });

  constructor() {
    this.refreshAll();
  }

  // Refresh both chapters and QA list
  refreshAll(): void {
    this.loadChapters();
    this.loadQaList();
  }

  loadChapters(): void {
    this.api.getChapters().subscribe({
      next: (res) => {
        if (res.success) {
          this.chapters.set(res.data);
        }
      },
      error: (err) => {
        console.error('Failed to load chapters:', err);
        this.error.set('Failed to connect to backend server. Make sure port 3000 is running.');
      }
    });
  }

  loadQaList(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.getQaList({
      chapterId: this.selectedChapterId(),
      search: this.searchQuery(),
      difficulty: this.selectedDifficulty(),
      tag: this.selectedTag(),
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.qaList.set(res.data);
          // Keep current index in bounds
          if (this.currentIndex() >= res.data.length) {
            this.currentIndex.set(Math.max(0, res.data.length - 1));
          }
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err?.error?.message || 'Error loading Q&A items.');
      }
    });
  }

  // Chapter selection
  selectChapter(chapterId: number | null): void {
    this.selectedChapterId.set(chapterId);
    this.currentIndex.set(0);
    this.loadQaList();
  }

  // Search filter
  setSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentIndex.set(0);
    this.loadQaList();
  }

  // Difficulty filter
  setDifficulty(diff: string): void {
    this.selectedDifficulty.set(diff);
    this.currentIndex.set(0);
    this.loadQaList();
  }

  // Tag filter
  setTag(tag: string): void {
    this.selectedTag.set(tag);
    this.currentIndex.set(0);
    this.loadQaList();
  }

  // Navigation
  nextPage(): void {
    if (this.hasNext()) {
      this.currentIndex.update(i => i + 1);
    }
  }

  prevPage(): void {
    if (this.hasPrevious()) {
      this.currentIndex.update(i => i - 1);
    }
  }

  goToIndex(index: number): void {
    if (index >= 0 && index < this.qaList().length) {
      this.currentIndex.set(index);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  // QA Modal actions
  openCreateModal(): void {
    this.editingItem.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(item: QaItem): void {
    this.editingItem.set(item);
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
    this.editingItem.set(null);
  }

  openDeleteModal(item: QaItem): void {
    this.deletingItem.set(item);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.deletingItem.set(null);
  }

  // Chapter Modal actions
  openCreateChapterModal(): void {
    this.editingChapter.set(null);
    this.isChapterModalOpen.set(true);
  }

  openEditChapterModal(chapter: Chapter): void {
    this.editingChapter.set(chapter);
    this.isChapterModalOpen.set(true);
  }

  closeChapterModal(): void {
    this.isChapterModalOpen.set(false);
    this.editingChapter.set(null);
  }

  openDeleteChapterModal(chapter: Chapter): void {
    this.deletingChapter.set(chapter);
    this.isDeleteChapterModalOpen.set(true);
  }

  closeDeleteChapterModal(): void {
    this.isDeleteChapterModalOpen.set(false);
    this.deletingChapter.set(null);
  }

  // Chapter CRUD
  saveChapter(dto: CreateChapterDto | UpdateChapterDto, id?: number): void {
    this.isLoading.set(true);

    if (id) {
      this.api.updateChapter(id, dto).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.closeChapterModal();
          this.showToast(`Chapter "${res.data.title}" updated successfully!`, 'success');
          this.refreshAll();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.showToast(err?.error?.message || 'Failed to update chapter.', 'error');
        }
      });
    } else {
      this.api.createChapter(dto as CreateChapterDto).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.closeChapterModal();
          this.showToast(`Chapter "${res.data.title}" created successfully!`, 'success');
          this.refreshAll();
          // Select newly created chapter
          this.selectChapter(res.data.id);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.showToast(err?.error?.message || 'Failed to create chapter.', 'error');
        }
      });
    }
  }

  confirmDeleteChapter(): void {
    const ch = this.deletingChapter();
    if (!ch) return;

    this.isLoading.set(true);
    this.api.deleteChapter(ch.id).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.closeDeleteChapterModal();
        this.showToast(`Chapter "${ch.title}" deleted.`, 'info');
        if (this.selectedChapterId() === ch.id) {
          this.selectedChapterId.set(null);
        }
        this.refreshAll();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.showToast(err?.error?.message || 'Failed to delete chapter.', 'error');
      }
    });
  }

  // QA CRUD operations
  saveQa(dto: CreateQaDto | UpdateQaDto, id?: number): void {
    this.isLoading.set(true);

    if (id) {
      this.api.updateQa(id, dto).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.closeFormModal();
          this.showToast('Question & Answer updated successfully!', 'success');
          this.refreshAll();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.showToast(err?.error?.message || 'Failed to update Q&A.', 'error');
        }
      });
    } else {
      this.api.createQa(dto as CreateQaDto).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.closeFormModal();
          this.showToast('New Q&A pair added to the book!', 'success');
          this.refreshAll();
          setTimeout(() => {
            const index = this.qaList().findIndex(q => q.id === res.data.id);
            if (index !== -1) {
              this.currentIndex.set(index);
            }
          }, 300);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.showToast(err?.error?.message || 'Failed to create Q&A.', 'error');
        }
      });
    }
  }

  confirmDelete(): void {
    const item = this.deletingItem();
    if (!item) return;

    this.isLoading.set(true);
    this.api.deleteQa(item.id).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.closeDeleteModal();
        this.showToast('Q&A item deleted from book.', 'info');
        this.refreshAll();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.showToast(err?.error?.message || 'Failed to delete Q&A.', 'error');
      }
    });
  }

  showToast(text: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.toast.set({ text, type });
    setTimeout(() => {
      if (this.toast()?.text === text) {
        this.toast.set(null);
      }
    }, 4000);
  }
}
