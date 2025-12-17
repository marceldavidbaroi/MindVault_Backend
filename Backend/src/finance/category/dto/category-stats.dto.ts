// src/categories/dto/category-stats.dto.ts
export interface CategoryStatsDto {
  total: number;
  income: {
    total: number;
    system: number;
    user: number;
  };
  expense: {
    total: number;
    system: number;
    user: number;
  };
}
