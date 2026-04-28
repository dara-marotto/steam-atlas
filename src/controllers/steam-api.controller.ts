import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SteamApiService } from '../services/steam-api.service';
import { PlayerEntity } from 'src/entities/player.entity';
import { CreatePlayerDto } from 'src/dtos/create-player.dto';
import { GameEntity } from 'src/entities/game.entity';

@Controller('steam')
export class AppController {
  constructor(private readonly appService: SteamApiService) {}

  @Post('create-player')
  async createPlayer(
    @Body() dto: CreatePlayerDto,

  ): Promise<{ message: string, player: PlayerEntity }> {
    
    const player = await this.appService.addPlayerToDatabase(dto);

    return { message: 'Player created successfully', player };
  }

  @Get('news/:appId/:count/:maxLenght')
  async getPlayerSummary(
    @Param('appId') appId: number,
    @Param('count') count: number,
    @Param('maxLenght') maxLenght: number
  ) {
    
    return await this.appService.getNewsForApp(appId, count, maxLenght);
  }

  @Get('store/:appId')
  async getAppDetails(
    @Param('appId') appId: string
  ) {
    return await this.appService.getAppDetails(appId);
  }

  @Get('owned-games/:steamId')
  async getOwnedGames(@Param('steamId') steamId: number) {
    return await this.appService.getOwnedGames(steamId); 
  }

  @Get('player-summary/:steamId')
  async getPlayerSummaryById(
    @Param('steamId') steamId: string
  ) {
    return await this.appService.getPlayerSummary(steamId);
  }

  @Get('player-achievements/:steamId/:appId')
  async getPlayerAchievements(
    @Param('steamId') steamId: string,
    @Param('appId') appId: string
  ) {
      return await this.appService.getPlayerAchievements(steamId, appId);
  }

}
