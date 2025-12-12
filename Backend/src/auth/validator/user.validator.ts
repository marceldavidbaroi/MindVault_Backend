// user.validator.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../entity/user.entity';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserValidator {
  constructor(private readonly repo: UserRepository) {}

  async ensureUserExists(idOrUsername: number | string): Promise<User> {
    const user = await this.repo.findUserByIdOrUsername(idOrUsername);
    if (!user) {
      throw new NotFoundException(
        typeof idOrUsername === 'number'
          ? `User with ID ${idOrUsername} not found`
          : `User ${idOrUsername} not found`,
      );
    }

    return user;
  }

  async ensureUserExistsForLogin(idOrUsername: number | string): Promise<User> {
    const user =
      await this.repo.findUserByIdOrUsernameWithPassword(idOrUsername);

    if (!user) {
      throw new NotFoundException(
        typeof idOrUsername === 'number'
          ? `User with ID ${idOrUsername} not found`
          : `User ${idOrUsername} not found`,
      );
    }

    return user;
  }

  async ensureUsernameNotTaken(username: string): Promise<void> {
    const user = await this.repo.findUserByUsername(username);

    if (user) {
      throw new BadRequestException(`Username "${username}" is already taken`);
    }
  }
}
