import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({ required: true, description: 'New password for the user' })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({ required: true, description: 'Reset code sent to email or phone' })
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

