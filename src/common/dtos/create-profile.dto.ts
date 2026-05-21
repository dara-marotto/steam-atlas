import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class CreateProfileDTO {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  steamId: string;
}