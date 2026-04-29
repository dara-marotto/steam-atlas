import { Controller, Get, Param } from "@nestjs/common";
import { ShowGameService } from "src/services/show-game.service";

@Controller('show-game')
export class ShowGameController {
  constructor(
    private readonly showGameService: ShowGameService
  ) {}

  @Get('store/:appId')
  async getAppDetails(
    @Param('appId') appId: string
  ) {
    return await this.showGameService.getAppDetails(appId);
  }

  @Get('friends/:steamId')
  async findFriendsWhoOwnGame(
    @Param('steamId') steamId: string
  ) {
    return await this.showGameService.getFriendsOwnedGames();
  }
}