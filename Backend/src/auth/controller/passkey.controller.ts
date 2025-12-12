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
import { User } from '../entity/user.entity';
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
  })
  async getPasskey(
    @GetUser() user: User,
    @Body() dto: GetPasskeyDto,
  ): Promise<ApiResponseType<{ passkey?: string; expiresAt?: Date }>> {
    return this.passkeyService.getPasskey(user, dto.password);
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
  })
  async resetPasswordWithPasskey(
    @Body() dto: ResetPasswordWithPasskeyDto,
  ): Promise<ApiResponseType<{ newPasskey: string }>> {
    return this.passkeyService.resetPasswordWithPasskey(
      dto.username,
      dto.passkey,
      dto.newPassword,
    );
  }

  // ------------------- CHANGE PASSWORD -------------------
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
  })
  async changePassword(
    @GetUser() user: User,
    @Body() dto: ChangePasswordDto,
  ): Promise<ApiResponseType<null>> {
    return this.passkeyService.changePassword(
      user,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
