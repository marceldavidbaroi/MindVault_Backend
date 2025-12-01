import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PasskeyService } from '../services/passkey.service';
import { GetUser } from '../get-user.decorator';
import { User } from '../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import type { ApiResponse as ApiResponseType } from 'src/common/types/api-response.type';
import { GetPasskeyDto } from '../dto/get-passkey.dto';
import { ResetPasswordWithPasskeyDto } from '../dto/reset-password-passkey.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@ApiTags('Auth Passkey Management')
@Controller('auth/passkey')
export class PasskeyController {
  constructor(private readonly passkeyService: PasskeyService) {}

  // ------------------- GET CURRENT PASSKEY -------------------
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Fetch current passkey' })
  @ApiBody({
    type: GetPasskeyDto,
    description: 'User must provide current password to fetch passkey',
  })
  @ApiResponse({
    status: 200,
    description: 'Passkey fetched successfully',
    schema: {
      example: {
        success: true,
        message: 'Passkey fetched successfully',
        data: {
          passkey: 'abcdef123456',
          expiresAt: '2025-11-03T15:30:00.000Z',
        },
      },
    },
  })
  async getPasskey(
    @GetUser() user: User,
    @Body() dto: GetPasskeyDto,
  ): Promise<ApiResponseType<{ passkey?: string; expiresAt?: Date }>> {
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
  @Patch('/reset')
  @ApiOperation({ summary: 'Reset password using passkey' })
  @ApiBody({
    type: ResetPasswordWithPasskeyDto,
    description: 'Provide username, valid passkey and new password to reset',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset and new passkey generated successfully',
    schema: {
      example: {
        success: true,
        message: 'Password reset successfully',
        data: { newPasskey: 'xyz987654321' },
      },
    },
  })
  async resetPasswordWithPasskey(
    @Body() dto: ResetPasswordWithPasskeyDto,
  ): Promise<ApiResponseType<{ newPasskey: string }>> {
    const result = await this.passkeyService.resetPasswordWithPasskey(
      dto.username,
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
  @ApiBearerAuth()
  @Patch('/change')
  @ApiOperation({ summary: 'Change password using old password' })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Provide old password and new password for change request',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      example: {
        success: true,
        message: 'Password changed successfully',
        data: null,
      },
    },
  })
  async changePassword(
    @GetUser() user: User,
    @Body() dto: ChangePasswordDto,
  ): Promise<ApiResponseType<null>> {
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
