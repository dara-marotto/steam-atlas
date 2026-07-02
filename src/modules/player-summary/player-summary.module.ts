import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PlayerSummaryController } from "./player-summary.controller";
import { PlayerSummaryService } from "./player-summary.service";
import { SteamApiHelper } from "../../helpers/steam-api.helper";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlayerEntity } from "../../entities/player.entity";
import { LocationService } from "../../external-services/location/location.service";

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
    PlayerSummaryService, SteamApiHelper, LocationService
  ],
  exports: [
    PlayerSummaryService
  ]
})
export class PlayerSummaryModule {}