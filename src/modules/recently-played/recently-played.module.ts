import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { RecentlyPlayedController } from "./controllers/recently-played.controller";
import { RecentlyPlayedService } from "./services/recently-played.sevice";

@Module({
  imports: [
    HttpModule
  ],
  controllers: [
    RecentlyPlayedController
  ],
  providers: [
    RecentlyPlayedService
  ],
  exports: [
    RecentlyPlayedService
  ]
})
export class RecentlyPlayedModule {}