import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { PasskeyService } from '../services/passkey.service';
import { GetUser } from '../get-user.decorator';
import { User } from '../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import type { ApiResponse } from 'src/common/types/api-response.type';
import { ResetPasswordWithPasskeyDto } from '../dto/reset-password-passkey.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Controller('auth/passkey')
@UseGuards(AuthGuard('jwt'))
export class PasskeyController {
  constructor(private readonly passkeyService: PasskeyService) {}

  // ------------------- GET CURRENT PASSKEY -------------------
  @Get()
  async getPasskey(
    @GetUser() user: User,
  ): Promise<ApiResponse<{ passkey?: string; expiresAt?: Date }>> {
    const passkeyData = await this.passkeyService.getPasskey(user);
    return {
      success: true,
      message: 'Passkey fetched successfully',
      data: passkeyData,
    };
  }

  // ------------------- RESET PASSWORD USING PASSKEY -------------------
  @Patch('/reset')
  async resetPasswordWithPasskey(
    @GetUser() user: User,
    @Body() dto: ResetPasswordWithPasskeyDto,
  ): Promise<ApiResponse<{ newPasskey: string }>> {
    const result = await this.passkeyService.resetPasswordWithPasskey(
      user,
      dto.passkey,
      dto.newPassword,
    );
    return {
      success: true,
      message: result.message,
      data: { newPasskey: result.newPasskey },
    };
  }

  // ------------------- CHANGE PASSWORD WITH OLD PASSWORD -------------------
  @Patch('/change')
  async changePassword(
    @GetUser() user: User,
    @Body() dto: ChangePasswordDto,
  ): Promise<ApiResponse<null>> {
    const result = await this.passkeyService.changePassword(
      user,
      dto.oldPassword,
      dto.newPassword,
    );
    return {
      success: true,
      message: result.message,
      data: null,
    };
  }
}
