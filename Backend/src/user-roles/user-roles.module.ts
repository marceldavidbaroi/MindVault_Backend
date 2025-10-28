import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRolesService } from './user-roles.service';
import { UserRolesController } from './user-roles.controller';
import { UserRole } from './user-roles.entity';
import { UserRoleSeeder } from './user-roles.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole])],
  controllers: [UserRolesController],
  providers: [UserRoleSeeder, UserRolesService],
  exports: [UserRolesService],
})
export class UserRolesModule {}
