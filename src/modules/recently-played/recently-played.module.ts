import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { RecentlyPlayedController } from "./recently-played.controller";
import { RecentlyPlayedService } from "./recently-played.sevice";
import { SteamApiService } from "../steam-api/steam-api.service";

@Module({
  imports: [
    HttpModule
  ],
  controllers: [
    RecentlyPlayedController
  ],
  providers: [
    SteamApiService,
    RecentlyPlayedService
  ],
  exports: [
    RecentlyPlayedService
  ]
})
export class RecentlyPlayedModule {}