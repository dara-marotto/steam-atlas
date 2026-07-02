import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../../entities/user.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { PlayerSummaryModule } from "../player-summary/player-summary.module";
import { HttpModule } from "@nestjs/axios";
import { SteamApiHelper } from "../../helpers/steam-api.helper";
import { PlayerEntity } from "../../entities/player.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      PlayerEntity
    ]),
    PlayerSummaryModule,
    HttpModule
  ],
  controllers: [UserController],
  providers: [UserService, SteamApiHelper, PlayerSummaryModule],
  exports: [UserService]
})
export class UserModule {}