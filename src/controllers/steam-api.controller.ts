import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SteamApiService } from '../services/steam-api.service';
import { PlayerEntity } from 'src/entities/player.entity';
import { CreatePlayerDto } from 'src/dtos/create-player.dto';

@Controller('steam')
export class AppController {
  constructor(private readonly appService: SteamApiService) {}

  @Get('store/:appId')
  async getAppDetails(
    @Param('appId') appId: string
  ) {
    return await this.appService.getAppDetails(appId);
  }

}
