import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './categories.entity';

@Injectable()
export class CategorySeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.categoryRepo.count();

    if (count === 0) {
      const incomeCategories: {
        name: string;
        displayName: string;
        type: 'income';
      }[] = [
        'salary',
        'freelance',
        'business',
        'investment',
        'rental_income',
        'gift',
        'refund',
        'other_income',
      ].map((name) => ({
        name,
        displayName: name
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        type: 'income',
      }));

      const expenseCategories: {
        name: string;
        displayName: string;
        type: 'expense';
      }[] = [
        'food_groceries',
        'food_dining',
        'housing_rent',
        'housing_mortgage',
        'utilities',
        'transportation',
        'health_medical',
        'education',
        'entertainment',
        'shopping',
        'travel',
        'personal_care',
        'insurance',
        'debt_repayment',
        'savings_investments',
        'charity_donation',
        'other_expense',
      ].map((name) => ({
        name,
        displayName: name
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        type: 'expense',
      }));

      await this.categoryRepo.save(
        [...incomeCategories, ...expenseCategories].map((c) => ({
          ...c,
          user: null,
        })),
      );

      console.log('Categories table seeded successfully.');
    }
  }
}
