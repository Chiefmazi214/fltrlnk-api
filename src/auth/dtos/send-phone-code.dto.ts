import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class SendPhoneCodeDto {
    @ApiProperty({ required: true, description: 'User phone number to send verification code' })
    @IsString()
    @IsNotEmpty()
    @IsPhoneNumber()
    phone: string;
}