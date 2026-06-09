import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { PlayerSummaryService } from "./player-summary.service";
import { AuthGuard } from "../auth/auth.guard";

// @UseGuards(AuthGuard)
@Controller('player-summary')
export class PlayerSummaryController {

  constructor(
    private readonly psService: PlayerSummaryService
  ) {}

  @Get(':steamId')
  async getPlayerSummary(
    @Param('steamId') steamId: string
  ) {
    return await this.psService.getPlayerSummary(steamId);
  }
}