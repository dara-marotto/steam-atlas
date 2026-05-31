import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ShowGameService } from "./show-game.service";
import { AuthGuard } from "../auth/guards/auth.guard";

@Controller('view-game')
export class ShowGameController {
  constructor(
  
    private readonly showGameService: ShowGameService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('app-details/:appId')
  async getAppDetails(
    @Param('appId') appId: string
  ) {
    return await this.showGameService.getAppDetails(appId)
  }
}