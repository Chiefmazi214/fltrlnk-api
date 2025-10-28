import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class UpdatePasswordDto {
    @IsString()
    @IsNotEmpty()
    @IsStrongPassword()
    oldPassword: string;

    @IsString()
    @IsNotEmpty()
    @IsStrongPassword()
    newPassword: string;
}
