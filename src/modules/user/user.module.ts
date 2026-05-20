import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { PlayerSummaryService } from "src/modules/player-summary/services/player-summary.service";
import { PlayerSummaryModule } from "../player-summary/player-summary.module";
import { HttpModule } from "@nestjs/axios";
import { SteamApiService } from "src/modules/steam-api/services/steam-api.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity
    ]),
    PlayerSummaryModule,
    HttpModule
  ],
  controllers: [UserController],
  providers: [UserService, PlayerSummaryService, SteamApiService],
  exports: [UserService]
})
export class UserModule {}