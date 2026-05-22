import { Controller, Get, Param } from "@nestjs/common";
import { RecentlyPlayedService } from "../recently-played/recently-played.sevice";

@Controller('recently-played')
export class RecentlyPlayedController {

  constructor(
    private readonly rpService: RecentlyPlayedService
  ) {}

  @Get(':steamId')
  async getRecentlyPlayedGames(
    @Param('steamId') steamId: string) {
    return await this.rpService.getRecentlyPlayedGames(steamId);
  }

}