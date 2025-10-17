import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModuleSeeder } from './modules.seeder';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleEntity } from './modules.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity])], // <-- make repository injectable
  providers: [ModulesService, ModuleSeeder],
})
export class ModulesModule {}
