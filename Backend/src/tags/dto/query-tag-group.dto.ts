import { IsOptional, IsString, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class QueryTagGroupDto {
  @ApiPropertyOptional({
    description: 'Search query to filter tag groups by name or display name',
    example: 'urgent',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Include system-defined tag groups in the results',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeSystem?: boolean;

  @ApiPropertyOptional({
    description: 'Fetch only soft-deleted tag groups',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  onlyDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Include soft-deleted tag groups in the results',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Number of results to return per page',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Page number for paginated results',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
}
