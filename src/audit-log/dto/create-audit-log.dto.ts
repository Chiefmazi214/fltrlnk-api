import { IsOptional, IsString, IsObject } from 'class-validator';

export class AuditMetadataDto {
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsObject()
  additionalInfo?: Record<string, any>;
}
