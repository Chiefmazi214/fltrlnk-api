import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ColabStatus } from '../chat.types';

export class CreateColabInput {
    @ApiProperty({ description: 'ID of the user to collaborate with' })
    @IsString()
    collaboratorId: string;

    @ApiProperty({ description: 'Message for the collaboration request' })
    @IsString()
    @IsOptional()
    message?: string;
} 

export class UpdateColabInput {
    @ApiProperty({ description: 'Status of the collaboration request', example: 'accepted', enum: [ 'accepted', 'rejected'] })
    @IsNotEmpty()
    @IsEnum(ColabStatus)
    status: ColabStatus;
}