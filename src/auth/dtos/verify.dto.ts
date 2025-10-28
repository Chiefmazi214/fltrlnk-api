import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class VerifyDto {
    @ApiProperty({ required: true, description: 'Verification code sent to email or phone' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ required: false, description: 'User email address' })
    @IsString()
    @IsOptional()
    @IsEmail()
    email: string;

    @ApiProperty({ required: false, description: 'User phone number' })
    @IsString()
    @IsOptional()
    @IsPhoneNumber()
    phone: string;
}

