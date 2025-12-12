import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Services
import { AuthService } from './services/auth.service';
import { ForgotPasswordService } from './services/forgot-password.service';
import { PasskeyService } from './services/passkey.service';
import { ProfileService } from './services/profile.service';
import { SecurityQuestionService } from './services/security-question.service';

// Controllers
import { AuthController } from './controller/auth.controller';
import { ForgotPasswordController } from './controller/forgot-password.controller';
import { PasskeyController } from './controller/passkey.controller';
import { ProfileController } from './controller/profile.controller';
import { SecurityQuestionController } from './controller/security-question.controller';

// Entities
import { User } from './entity/user.entity';
import { UserPreferences } from './entity/userPreferences.entity';
import { UserSession } from './entity/userSessions.entity';
import { PasswordResetLog } from './entity/passwordResetLog.entity';
import { UserSecurityQuestion } from './entity/userSecurityQuestion.entity';

// Repositories
import { UserRepository } from './repository/user.repository';
import { UserPreferencesRepository } from './repository/user-preferences.repository';
import { UserSessionRepository } from './repository/user-session.repository';
import { PasswordResetLogRepository } from './repository/password-reset-log.repository';
import { UserSecurityQuestionRepository } from './repository/user-security-question.repository';

// Validators
import { UserValidator } from './validator/user.validator';
import { AuthValidator } from './validator/auth.validator';
import { ForgotPasswordValidator } from './validator/forgot-password.validator';
import { PasskeyValidator } from './validator/passkey.validator';
import { PasswordValidator } from './validator/password.validator';
import { ProfileValidator } from './validator/profile.validator';
import { SecurityQuestionValidator } from './validator/security-question.validator';

// Transformers
import { AuthTransformer } from './transformers/auth.transformer';
import { ForgotPasswordTransformer } from './transformers/forgot-password.transformer';
import { ProfileTransformer } from './transformers/profile.transformer';
import { SecurityQuestionTransformer } from './transformers/security-question.transformer';

// Other
import { JwtStrategy } from './jwt.strategy';
import { UserAuthValidator } from './validator/user-auth.validator';

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
    // Services
    AuthService,
    ForgotPasswordService,
    PasskeyService,
    ProfileService,
    SecurityQuestionService,

    // Validators
    UserValidator,
    AuthValidator,
    ForgotPasswordValidator,
    PasskeyValidator,
    PasswordValidator,
    ProfileValidator,
    SecurityQuestionValidator,
    UserAuthValidator,

    // Transformers
    AuthTransformer,
    ForgotPasswordTransformer,
    ProfileTransformer,
    SecurityQuestionTransformer,

    // Custom Repositories
    UserRepository,
    UserPreferencesRepository,
    UserSessionRepository,
    PasswordResetLogRepository,
    UserSecurityQuestionRepository,

    // Others
    JwtStrategy,
  ],
  exports: [
    PassportModule,
    JwtStrategy,
    UserValidator,
    AuthValidator,
    AuthTransformer,
  ],
})
export class AuthModule {}
