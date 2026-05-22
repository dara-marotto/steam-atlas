import { Controller, Get, Inject, Param } from "@nestjs/common";
import { ShowGameService } from "./show-game.service";
import { SteamApiService } from "../steam-api/services/steam-api.service";

@Controller('view-game')
export class ShowGameController {
  constructor(
  
    private readonly showGameService: ShowGameService,
  ) {}

  @Get('app-details/:appId')
  async getAppDetails(
    @Param('appId') appId: string
  ) {
    return await this.showGameService.getAppDetails(appId)
  }
}