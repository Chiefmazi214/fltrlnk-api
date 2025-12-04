import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { BoostType } from "../boost.enum";

export class GiveBoostsDto {
  @IsEnum(BoostType)
  @IsOptional()
  type?: BoostType;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}