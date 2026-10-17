import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chapter, CreateChapterDto, UpdateChapterDto } from '../models/chapter.model';
import { QaItem, CreateQaDto, UpdateQaDto, ApiResponse } from '../models/qa-item.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/v1';

  // Chapters
  getChapters(): Observable<ApiResponse<Chapter[]>> {
    return this.http.get<ApiResponse<Chapter[]>>(`${this.baseUrl}/chapters`);
  }

  getChapterById(id: number): Observable<ApiResponse<Chapter>> {
    return this.http.get<ApiResponse<Chapter>>(`${this.baseUrl}/chapters/${id}`);
  }

  createChapter(dto: CreateChapterDto): Observable<ApiResponse<Chapter>> {
    return this.http.post<ApiResponse<Chapter>>(`${this.baseUrl}/chapters`, dto);
  }

  updateChapter(id: number, dto: UpdateChapterDto): Observable<ApiResponse<Chapter>> {
    return this.http.put<ApiResponse<Chapter>>(`${this.baseUrl}/chapters/${id}`, dto);
  }

  deleteChapter(id: number): Observable<ApiResponse<Chapter>> {
    return this.http.delete<ApiResponse<Chapter>>(`${this.baseUrl}/chapters/${id}`);
  }

  // Q&A Items
  getQaList(filters?: {
    chapterId?: number | null;
    search?: string;
    difficulty?: string;
    tag?: string;
  }): Observable<ApiResponse<QaItem[]>> {
    let params = new HttpParams();

    if (filters?.chapterId !== undefined && filters?.chapterId !== null) {
      params = params.set('chapterId', filters.chapterId.toString());
    }
    if (filters?.search && filters.search.trim()) {
      params = params.set('search', filters.search.trim());
    }
    if (filters?.difficulty && filters.difficulty.trim()) {
      params = params.set('difficulty', filters.difficulty.trim());
    }
    if (filters?.tag && filters.tag.trim()) {
      params = params.set('tag', filters.tag.trim());
    }

    return this.http.get<ApiResponse<QaItem[]>>(`${this.baseUrl}/qa`, { params });
  }

  getQaById(id: number): Observable<ApiResponse<QaItem>> {
    return this.http.get<ApiResponse<QaItem>>(`${this.baseUrl}/qa/${id}`);
  }

  createQa(dto: CreateQaDto): Observable<ApiResponse<QaItem>> {
    return this.http.post<ApiResponse<QaItem>>(`${this.baseUrl}/qa`, dto);
  }

  updateQa(id: number, dto: UpdateQaDto): Observable<ApiResponse<QaItem>> {
    return this.http.put<ApiResponse<QaItem>>(`${this.baseUrl}/qa/${id}`, dto);
  }

  deleteQa(id: number): Observable<ApiResponse<QaItem>> {
    return this.http.delete<ApiResponse<QaItem>>(`${this.baseUrl}/qa/${id}`);
  }
}
