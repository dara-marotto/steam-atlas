import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { RecentlyPlayedController } from "./recently-played.controller";
import { RecentlyPlayedService } from "./recently-played.sevice";
import { SteamApiHelper } from "../../helpers/steam-api.helper";

@Module({
  imports: [
    HttpModule
  ],
  controllers: [
    RecentlyPlayedController
  ],
  providers: [
    SteamApiHelper,
    RecentlyPlayedService
  ],
  exports: [
    RecentlyPlayedService
  ]
})
export class RecentlyPlayedModule {}