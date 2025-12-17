import { IsString, IsNotEmpty, IsEnum, ApiProperty } from 'class-validator';

export enum BalanceAction {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
  SET = 'SET',
}

export class UpdateBalanceDto {
  @ApiProperty({ example: 'ADD', enum: BalanceAction })
  @IsEnum(BalanceAction)
  action: BalanceAction;

  @ApiProperty({
    example: '100.00',
    description: 'Amount to add/subtract or set',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;
}
