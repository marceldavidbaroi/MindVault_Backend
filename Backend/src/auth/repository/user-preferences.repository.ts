// userPreferences.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPreferences } from '../entity/userPreferences.entity';

@Injectable()
export class UserPreferencesRepository {
  constructor(
    @InjectRepository(UserPreferences)
    private readonly repo: Repository<UserPreferences>,
  ) {}

  createPreferences(data: Partial<UserPreferences>) {
    return this.repo.create(data);
  }

  savePreferences(pref: UserPreferences) {
    return this.repo.save(pref);
  }

  findPreferencesByUserId(userId: number) {
    return this.repo.findOne({ where: { user: { id: userId } } });
  }
}
