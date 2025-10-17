import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT!, 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD?.toString() || '',
  database: process.env.DATABASE_NAME,
  entities: ['dist/**/*.entity.js'], // after build
  migrations: ['dist/migrations/*.js'], // after build
});
