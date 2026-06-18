import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PlayerSummaryController } from "./player-summary.controller";
import { PlayerSummaryService } from "./player-summary.service";
import { SteamApiService } from "../steam-api/steam-api.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlayerEntity } from "../user/entities/player.entity";
import { LocationService } from "../user/location/location.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlayerEntity
    ]),
    HttpModule,
  ],
  controllers: [
    PlayerSummaryController
  ],
  providers: [
    PlayerSummaryService, SteamApiService, LocationService
  ],
  exports: [
    PlayerSummaryService
  ]
})
export class PlayerSummaryModule {}