import { Injectable, BadRequestException } from '@nestjs/common';
import { User } from '../entity/user.entity';

@Injectable()
export class ProfileValidator {
  validateUpdateData(updateData: Partial<User>) {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new BadRequestException('No data provided for update');
    }
  }
}
