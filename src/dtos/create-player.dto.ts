import { IsNumber, IsString } from "class-validator";

export class CreatePlayerDto {

    @IsNumber()
    steamId: string;

    @IsString()
    password: string;
}