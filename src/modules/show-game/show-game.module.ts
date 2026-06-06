import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ShowGameController } from "./show-game.controller";
import { ShowGameService } from "./show-game.service";
import { UserService } from "../user/services/user.service";

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
    ShowGameService,
    UserService
  ]
})
export class ShowGameModule {}