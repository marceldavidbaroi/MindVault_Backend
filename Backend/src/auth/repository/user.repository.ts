// user.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  // ---------- CREATE / SAVE ----------
  createUser(data: Partial<User>) {
    return this.repo.create(data);
  }

  saveUser(user: User) {
    return this.repo.save(user);
  }

  // ---------- FIND ----------
  findUserById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findUserByIdWithRelations(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['preferences'],
    });
  }

  findUserByUsername(username: string) {
    return this.repo.findOne({ where: { username } });
  }

  findUserByIdOrUsername(idOrUsername: number | string) {
    const where =
      typeof idOrUsername === 'number'
        ? { id: idOrUsername }
        : { username: idOrUsername };

    return this.repo.findOne({ where }); // return full entity
  }

  findUserByIdOrUsernameWithPassword(idOrUsername: number | string) {
    const where =
      typeof idOrUsername === 'number'
        ? { id: idOrUsername }
        : { username: idOrUsername };

    return this.repo.findOne({
      where,
      select: ['id', 'username', 'email', 'password'], // 👈 ADD PASSWORD HERE
    });
  }
}
