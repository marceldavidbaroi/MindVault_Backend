import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { ForgotPasswordService } from './services/forgot-password.service';
import { PasskeyService } from './services/passkey.service';
import { ProfileService } from './services/profile.service';
import { SecurityQuestionService } from './services/security-question.service';

import { AuthController } from './controller/auth.controller';
import { ForgotPasswordController } from './controller/forgot-password.controller';
import { PasskeyController } from './controller/passkey.controller';
import { ProfileController } from './controller/profile.controller';
import { SecurityQuestionController } from './controller/security-question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserPreferences } from './entities/userPreferences.entity';
import { UserSession } from './entities/userSessions.entity';
import { PasswordResetLog } from './entities/passwordResetLog.entity';
import { UserSecurityQuestion } from './entities/userSecurityQuestion.entity';
import { VerifyUserService } from './services/verify-user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserPreferences,
      UserSession,
      PasswordResetLog,
      UserSecurityQuestion,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'topSecret51',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [
    AuthController,
    ForgotPasswordController,
    PasskeyController,
    ProfileController,
    SecurityQuestionController,
  ],
  providers: [
    AuthService,
    ForgotPasswordService,
    PasskeyService,
    ProfileService,
    SecurityQuestionService,
    JwtStrategy,
    VerifyUserService,
  ],
  exports: [PassportModule, JwtStrategy, VerifyUserService],
})
export class AuthModule {}
