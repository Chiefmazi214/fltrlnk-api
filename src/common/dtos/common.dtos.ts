import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CommonParams {
  @ApiProperty({ description: 'The ID of the entity' })
  @IsMongoId()
  @IsNotEmpty()
  id: string;
}
