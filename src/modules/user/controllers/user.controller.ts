import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { CreateProfileDTO } from "../../../common/dtos/create-profile.dto";

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
}