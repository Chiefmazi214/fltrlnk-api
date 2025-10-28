import { IsEmail, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class ForgetPasswordDto {
    @ApiProperty({ required: false, description: 'User email address to send reset code' })
    @IsString()
    @IsOptional()
    @IsEmail()
    email: string;
    
    @ApiProperty({ required: false, description: 'User phone number to send reset code' })
    @IsString()
    @IsOptional()
    @IsPhoneNumber()
    phone: string;
}
