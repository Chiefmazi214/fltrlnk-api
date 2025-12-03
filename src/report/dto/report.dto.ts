import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class ReportUserInput {
  @ApiProperty({ description: 'ID of the user to report' })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @ApiProperty({ description: 'Message of the report' })
  @IsNotEmpty()
  @IsString()
  message: string;
}
