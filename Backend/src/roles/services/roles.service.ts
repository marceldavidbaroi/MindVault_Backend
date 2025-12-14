import { Injectable } from '@nestjs/common';
import { RolesRepository } from '../repository/roles.repository';
import { RolesValidator } from '../validators/roles.validator';
import { RolesTransformer } from '../transformers/roles.transformer';
import { ApiResponse } from 'src/common/types/api-response.type';
import { Role } from '../entity/role.entity';
import { RoleResponseDto } from '../dto/role-response.dto';

@Injectable()
export class RolesService {
  constructor(
    private readonly repository: RolesRepository,
    private readonly validator: RolesValidator,
    private readonly transformer: RolesTransformer,
  ) {}

  async findAll(): Promise<ApiResponse<RoleResponseDto[]>> {
    const roles = await this.repository.findAll();

    return {
      success: true,
      message: 'Roles fetched successfully',
      data: this.transformer.transformMany(roles),
    };
  }

  async findOne(id: number): Promise<ApiResponse<RoleResponseDto>> {
    const role = await this.validator.ensureExists(id);

    return {
      success: true,
      message: 'Role fetched successfully',
      data: this.transformer.transform(role),
    };
  }
}
