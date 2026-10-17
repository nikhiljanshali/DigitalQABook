export interface QaItem {
  id: number;
  chapter_id: number;
  chapter_title?: string;
  question: string;
  answer: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateQaDto {
  chapter_id: number;
  question: string;
  answer: string;
  difficulty: string;
  tags: string[];
  order_index?: number;
}

export interface UpdateQaDto {
  chapter_id?: number;
  question?: string;
  answer?: string;
  difficulty?: string;
  tags?: string[];
  order_index?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}
