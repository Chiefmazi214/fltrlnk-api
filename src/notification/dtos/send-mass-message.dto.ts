import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MessageType {
    IN_APP = 'in-app',
    EMAIL = 'email',
}

export class SendMassMessageDto {
    @ApiProperty({ enum: MessageType })
    @IsEnum(MessageType)
    type: MessageType;

    @ApiProperty()
    @IsString()
    message: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    filters?: {
        state?: string;
        category?: string;
        tier?: string;
        status?: string;
    };
}
