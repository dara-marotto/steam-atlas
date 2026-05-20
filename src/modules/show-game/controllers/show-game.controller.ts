import { Controller, Get, Inject, Param } from "@nestjs/common";
import { ShowGameService } from "src/modules/show-game/services/show-game.service";
import { SteamApiService } from "src/modules/steam-api/services/steam-api.service";

@Controller('view-game')
export class ShowGameController {
  constructor(
  
    private readonly showGameService: ShowGameService,
    private readonly saService: SteamApiService
  ) {}

  @Get('store/app-details/:appId')
  async getAppDetails(
    @Param('appId') appId: string
  ) {
    return await this.showGameService.getAppDetails(appId)
  }
}