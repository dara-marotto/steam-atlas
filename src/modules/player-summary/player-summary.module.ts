import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PlayerSummaryController } from "./controllers/player-summary.controller";
import { PlayerSummaryService } from "./services/player-summary.service";
import { SteamApiService } from "src/modules/steam-api/services/steam-api.service";

@Module({
  imports: [
    HttpModule
  ],
  controllers: [
    PlayerSummaryController
  ],
  providers: [
    PlayerSummaryService, SteamApiService
  ],
  exports: [
    PlayerSummaryService
  ]
})
export class PlayerSummaryModule {}