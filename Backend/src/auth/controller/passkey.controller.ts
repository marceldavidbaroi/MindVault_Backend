import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PasskeyService } from '../services/passkey.service';
import { GetUser } from '../get-user.decorator';
import { User } from '../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import type { ApiResponse } from 'src/common/types/api-response.type';
import { ResetPasswordWithPasskeyDto } from '../dto/reset-password-passkey.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { GetPasskeyDto } from '../dto/get-passkey.dto';

@Controller('auth/passkey')
export class PasskeyController {
  constructor(private readonly passkeyService: PasskeyService) {}

  // ------------------- GET CURRENT PASSKEY -------------------
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async getPasskey(
    @GetUser() user: User,
    @Body() dto: GetPasskeyDto,
  ): Promise<ApiResponse<{ passkey?: string; expiresAt?: Date }>> {
    const passkeyData = await this.passkeyService.getPasskey(
      user,
      dto.password,
    );
    return {
      success: true,
      message: 'Passkey fetched successfully',
      data: passkeyData,
    };
  }

  // ------------------- RESET PASSWORD USING PASSKEY -------------------
  // No AuthGuard here
  @Patch('/reset')
  async resetPasswordWithPasskey(
    @Body() dto: ResetPasswordWithPasskeyDto,
  ): Promise<ApiResponse<{ newPasskey: string }>> {
    const result = await this.passkeyService.resetPasswordWithPasskey(
      dto.username, // No user from JWT
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
  @UseGuards(AuthGuard('jwt'))
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
