import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PlayerSummaryController } from "./player-summary.controller";
import { PlayerSummaryService } from "./player-summary.service";
import { SteamApiService } from "../steam-api/services/steam-api.service";

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