export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T | null; // <-- allow null
  error?: string | string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
