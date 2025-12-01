import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class VerifyUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async verify(userIdOrUsername: number | string): Promise<User> {
    const whereClause =
      typeof userIdOrUsername === 'number'
        ? { id: userIdOrUsername }
        : { username: userIdOrUsername };

    const user = await this.userRepository.findOne({
      where: whereClause,
      select: [
        'id',
        'username',
        'password',
        'passkey',
        'passkeyExpiresAt',
        'refreshToken',
      ],
    });

    if (!user) {
      throw new NotFoundException(
        typeof userIdOrUsername === 'number'
          ? `User with ID ${userIdOrUsername} not found`
          : `User ${userIdOrUsername} not found`,
      );
    }

    return user;
  }
}
