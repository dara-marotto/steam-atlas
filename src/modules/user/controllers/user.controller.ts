import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { CreateProfileDTO } from "../../../common/dtos/create-profile.dto";
import { EditProfileDTO } from "src/common/dtos/edit-profile.dto";
import { AuthGuard } from "src/modules/auth/auth.guard";

@Controller('user')
export class UserController {
  constructor(
      private readonly userService: UserService
  ) {}

  @Post('create-profile')
  async createProfile(
    @Body() dto: CreateProfileDTO
  ) {
    return this.userService.createProfile(dto);
  }

  @Get('index/:email')
  async index(
    @Param('email') email: string
  ) {
    return await this.userService.indexUser(email)
  }

  @UseGuards(AuthGuard)
  @Put('update/:id')
  async editProfile(
    @Param('email') id: string,
    @Body() dto: EditProfileDTO
  ) {
    return await this.userService.editProfile(id, dto);
  }

  @Put(':steamId/:email')
  async linkSteamAccount(
    @Param('steamId') steamId: string,
    @Param('email') email: string
  ) {
    return await this.userService.linkSteamAccount(steamId, email);
  }
}