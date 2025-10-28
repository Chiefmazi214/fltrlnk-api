import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailCodeDto {
    @ApiProperty({ required: true, description: 'User email address to send verification code' })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;
}