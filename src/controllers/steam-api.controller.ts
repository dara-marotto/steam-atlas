import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SteamApiService } from '../services/steam-api.service';

@Controller('steam')
export class AppController {
  constructor(private readonly appService: SteamApiService) {}

}
