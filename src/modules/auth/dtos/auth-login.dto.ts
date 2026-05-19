import { IsEmail, IsNotEmpty } from "class-validator";

export class AuthLoginDTO {
  
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}