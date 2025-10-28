import { IsArray, IsString, ArrayMinSize } from "class-validator";

export class CheckFollowersDto {
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    userIds: string[];
} 