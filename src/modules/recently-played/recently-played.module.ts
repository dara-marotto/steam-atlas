import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { RecentlyPlayedController } from "./controllers/recently-played.controller";
import { RecentlyPlayedService } from "./services/recently-played.sevice";
import { SteamApiService } from "../steam-api/services/steam-api.service";

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