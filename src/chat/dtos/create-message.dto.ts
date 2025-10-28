import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateMessageDto {
    @ApiProperty({ description: 'ID of the chat room' })
    @IsString()
    chatRoomId: string;

    @ApiProperty({ description: 'Content of the message' })
    @IsString()
    content: string;

    @ApiProperty({ description: 'Array of attachment IDs', required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    attachmentIds?: string[];
} 