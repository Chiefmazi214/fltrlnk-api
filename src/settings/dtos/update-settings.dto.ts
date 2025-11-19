import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
    @ApiPropertyOptional({ description: 'Name of the site/application' })
    @IsOptional()
    @IsString()
    siteName?: string;

    @ApiPropertyOptional({ description: 'Session timeout in hours' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    sessionTimeout?: number;

    @ApiPropertyOptional({ description: 'Maximum login attempts before lockout' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    maxLoginAttempts?: number;

    @ApiPropertyOptional({ description: 'Require 2FA for all admin users' })
    @IsOptional()
    @IsBoolean()
    require2FAForAllAdmins?: boolean;

    @ApiPropertyOptional({ description: 'Allow registration of new admin accounts' })
    @IsOptional()
    @IsBoolean()
    allowNewAdminRegistration?: boolean;
}
