import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { ShowGameService } from "./show-game.service";
import { AuthGuard } from "../auth/auth.guard";
import type { RequestWithUser } from "../auth/interfaces/request-with-user.interface";

@UseGuards(AuthGuard)
@Controller('view-game')
export class ShowGameController {
  constructor(
  
    private readonly showGameService: ShowGameService,
  ) {}

  @Get('app-details/:appId')
  async getAppDetails(
    @Req() req: RequestWithUser,
    @Param('appId') appId: string
  ) {

    return await this.showGameService.getAppDetails(appId, req.user.email)
  }
}