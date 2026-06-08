import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { PlayerSummaryModule } from "../player-summary/player-summary.module";
import { HttpModule } from "@nestjs/axios";
import { SteamApiService } from "../steam-api/steam-api.service";
import { PlayerEntity } from "./entities/player.entity";

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
  providers: [UserService, SteamApiService, PlayerSummaryModule],
  exports: [UserService]
})
export class UserModule {}