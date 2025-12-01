import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

export class GetBusinessesWithPaginationQueryInput extends PaginationDto {
  @ApiPropertyOptional({ description: 'The search query', example: 'Company Name' })
  @IsString()
  @IsOptional()
  searchQuery?: string;

  @ApiPropertyOptional({
    description: 'The business category',
    example: 'food&beverage'
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'The business state (US state code)',
    example: 'NY'
  })
  @IsString()
  @IsOptional()
  state?: string;
}
