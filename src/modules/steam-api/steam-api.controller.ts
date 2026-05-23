import { Controller } from '@nestjs/common';
import { SteamApiService } from '../steam-api/steam-api.service';

@Controller('steam')
export class SteamApiController {
  constructor(private readonly appService: SteamApiService) {}

}
