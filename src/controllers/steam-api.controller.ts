import { Controller, Get, Param, Query } from '@nestjs/common';
import { SteamApiService } from '../services/steam-api.service';

@Controller('steam')
export class AppController {
  constructor(private readonly appService: SteamApiService) {}

  @Get('news/:appId/:count/:maxLenght')
  async getPlayerSummary(
    @Param('appId') appId: number,
    @Param('count') count: number,
    @Param('maxLenght') maxLenght: number
  ) {
    
    return await this.appService.getNewsForApp(appId, count, maxLenght);
  }

  @Get('owned-games/:steamId')
  async getOwnedGames(@Param('steamId') steamId: number) {
    return await this.appService.getOwnedGames(steamId); 
  }

  @Get('player-summary/:steamId')
  async getPlayerSummaryById(
    @Param('steamId') steamId: number
  ) {
    return await this.appService.getPlayerSummary(steamId);
  }
}
