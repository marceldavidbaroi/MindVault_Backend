import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SigninDto {
  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'MyP@ssw0rd123',
  })
  @IsString()
  password: string; // no regex
}
