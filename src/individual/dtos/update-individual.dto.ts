import { IsString, IsOptional, IsBoolean } from "class-validator";

export class UpdateIndividualDto {
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
