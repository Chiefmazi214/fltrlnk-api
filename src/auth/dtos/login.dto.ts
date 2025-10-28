import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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

    @ApiProperty({ required: true, description: 'User password' })
    @IsString()
    @IsNotEmpty()
    password: string;
}
