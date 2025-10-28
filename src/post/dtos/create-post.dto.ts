import { IsObject, IsString } from "class-validator";
import { PostLocation } from "../models/post.model";

export class CreatePostDto {
    @IsString()
    description: string;
    
    @IsObject()
    location: PostLocation;
    
}