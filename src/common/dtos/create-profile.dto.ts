import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateProfileDTO {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  steamId: string;
}