import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './services/roles.service';
import { RolesController } from './controller/roles.controller';
import { Role } from './entity/role.entity';
import { RolesSeeder } from './seeder/roles.seeder';
import { RolesTransformer } from './transformers/roles.transformer';
import { RolesValidator } from './validators/roles.validator';
import { RolesRepository } from './repository/roles.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [
    RolesSeeder,
    RolesService,
    RolesTransformer,
    RolesSeeder,
    RolesValidator,
    RolesRepository,
  ],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {}
