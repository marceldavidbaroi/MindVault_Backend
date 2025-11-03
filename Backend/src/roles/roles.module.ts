// src/roles/roles.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './role.entity';
import { RolesSeeder } from './roles.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RolesSeeder, RolesService],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {}
