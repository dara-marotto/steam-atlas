import { Body, Controller } from '@nestjs/common';
import { SteamApiService } from '../services/steam-api.service';

@Controller('steam')
export class SteamApiController {
  constructor(private readonly appService: SteamApiService) {}

}
