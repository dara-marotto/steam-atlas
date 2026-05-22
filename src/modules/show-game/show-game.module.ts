import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ShowGameController } from "./show-game.controller";
import { ShowGameService } from "./show-game.service";

@Module({
  imports: [
    HttpModule
  ],
  controllers: [
    ShowGameController
  ],
  providers: [
    ShowGameService
  ],
  exports: [
    ShowGameService
  ]
})
export class ShowGameModule {}