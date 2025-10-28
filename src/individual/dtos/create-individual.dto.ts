import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateIndividualDto {
    @IsString()
    @IsOptional()
    biography: string;

    @IsBoolean()
    @IsOptional()
    mapDiscovery: boolean;

    @IsBoolean()
    @IsOptional()
    fltrlScreen: boolean;
}