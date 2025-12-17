// src/categories/transformers/category.transformer.ts
import { Category } from '../entity/categories.entity';

export class CategoryTransformer {
  static toResponse(category: Category) {
    return {
      id: category.id,
      name: category.name,
      displayName: category.displayName,
      type: category.type,
      scope: category.scope,
    };
  }

  static toResponseList(categories: Category[]) {
    return categories.map(this.toResponse);
  }
}
