import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';

import * as dotenv from 'dotenv';
import { RolesModule } from './roles/roles.module';
dotenv.config();

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AuthModule, RolesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
