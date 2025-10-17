// src/common/types/api-response.type.ts

export interface ApiResponse<T> {
  success: boolean; // true if the operation succeeded
  message: string; // human-readable message
  data?: T; // main payload (can be single object or array)
  error?: string | string[]; // optional error details
  meta?: {
    // optional pagination or metadata
    page?: number;
    limit?: number;
    total?: number;
  };
}
