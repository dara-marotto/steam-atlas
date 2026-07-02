import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { CreateProfileDTO } from "../../../common/dtos/create-profile.dto";
import { EditProfileDTO } from "src/common/dtos/edit-profile.dto";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { LocationService } from "../location/location.service";

@Controller('user')
export class UserController {
  constructor(
      private readonly userService: UserService,
  ) {}

  @Post('create-profile')
  async createProfile(
    @Body() dto: CreateProfileDTO
  ) {
    return this.userService.createProfile(dto);
  }

  @Get('index/:email')
  async indexOne(
    @Param('email') email: string
  ) {
    return await this.userService.indexOne(email)
  }

  @Get('index')
  async index() {
    return await this.userService.index();
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

  @UseGuards(AuthGuard)
  @Delete('delete/:email')
  async delete(
    @Param('email') email:string
  ) {
    return await this.userService.deleteProfile(email);
  }
}