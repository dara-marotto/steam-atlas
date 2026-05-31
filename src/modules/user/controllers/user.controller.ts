import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { CreateProfileDTO } from "../../../common/dtos/create-profile.dto";
import { EditProfileDTO } from "src/common/dtos/edit-profile.dto";
import { AuthGuard } from "src/modules/auth/guards/auth.guard";

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

  @UseGuards(AuthGuard)
  @Put(':id')
  async editProfile(
    @Param('email') id: string,
    @Body() dto: EditProfileDTO
  ) {
    return await this.userService.editProfile(id, dto);
  }

  @Get(':steamId/:email')
  async linkSteamAccount(
    @Param('steamId') steamId: string,
    @Param('email') email: string
  ) {
    await this.userService.linkSteamAccount(steamId, email);
  }
}