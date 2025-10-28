import { IsOptional, IsString, MaxLength } from "class-validator";

export class SendConnectionDto {
    @IsString()
    @MaxLength(200)
    @IsOptional()
    message: string;
}