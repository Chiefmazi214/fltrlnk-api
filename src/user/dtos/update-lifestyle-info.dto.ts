import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class UpdateLifestyleInfoDto {
    @ApiProperty({
        description: 'Array of lifestyle info IDs that user selected',
        type: [String],
        example: ['64f123456789abcdef123456', '64f123456789abcdef123457'],
        required: true,
        isArray: true,
        minItems: 1
    })
    @IsArray()
    @ArrayMinSize(1, { message: 'At least one lifestyle info must be selected' })
    @IsString({ each: true })
    lifestyleInfoIds: string[];
} 