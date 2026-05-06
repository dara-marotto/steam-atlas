import { Controller, Get, Param } from "@nestjs/common";
import { PlayerSummaryService } from "src/services/player-summary.service";

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