import { Controller, Get, Param } from "@nestjs/common";
import { CompareGamesService } from "./compare-games.service";

@Controller('compare-games')
export class CompareGamesController {
  constructor(
    private readonly service: CompareGamesService
  ) {}

  @Get(':appId1/:appId2')
  async compareGames(
    @Param('appId1') appId1: string,
    @Param('appId2') appId2: string
  ) {
    return this.service.compareGames(appId1, appId2);
  }
}