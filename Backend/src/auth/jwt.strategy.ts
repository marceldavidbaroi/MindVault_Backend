import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 🔹 Read JWT from accessToken cookie
        (req: Request) => req?.cookies?.accessToken,
      ]),
      ignoreExpiration: false, // token must be valid
      secretOrKey: process.env.JWT_SECRET || 'topSecret51',
    });
  }

  async validate(payload: { username: string; sub: number }) {
    const { username } = payload;

    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new UnauthorizedException();
    }

    // This will be attached to req.user
    return user;
  }
}
