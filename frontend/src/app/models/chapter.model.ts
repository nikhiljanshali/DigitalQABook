export interface Chapter {
  id: number;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
  qa_count?: number;
}

export interface CreateChapterDto {
  title: string;
  description?: string;
  order_index?: number;
}

export interface UpdateChapterDto {
  title?: string;
  description?: string;
  order_index?: number;
}
