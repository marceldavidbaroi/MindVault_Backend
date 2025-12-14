import { Injectable } from '@nestjs/common';
import { Role } from '../entity/role.entity';
import { RoleResponseDto } from '../dto/role-response.dto';

@Injectable()
export class RolesTransformer {
  transform(role: Role): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
    };
  }

  transformMany(roles: Role[]): RoleResponseDto[] {
    return roles.map((role) => this.transform(role));
  }
}
