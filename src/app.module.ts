import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmConfigModule } from './database/typeorm.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ShowGameController } from './modules/show-game/show-game.controller';
import { ShowGameService } from './modules/show-game/show-game.service';
import { SteamApiHelper } from './helpers/steam-api.helper';
import { RecentlyPlayedService } from './modules/recently-played/recently-played.sevice';
import { RecentlyPlayedController } from './modules/recently-played/recently-played.controller';
import { PlayerSummaryController } from './modules/player-summary/player-summary.controller';
import { PlayerSummaryService } from './modules/player-summary/player-summary.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { UserController } from './modules/user/user.controller';
import { UserService } from './modules/user/user.service';
import { UserModule } from './modules/user/user.module';
import { PlayerSummaryModule } from './modules/player-summary/player-summary.module';
import { AuthModule } from './modules/auth/auth.module';
import jwtConfig from './config/jwt.config';
import { RecentlyPlayedModule } from './modules/recently-played/recently-played.module';
import { CompareGamesModule } from './modules/compare-games/compare-games.module';
import { CompareGamesController } from './modules/compare-games/compare-games.controller';
import { CompareGamesService } from './modules/compare-games/compare-games.service';
import { PlayerEntity } from './entities/player.entity';
import { LocationService } from './external-services/location/location.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PlayerSummaryModule,
    RecentlyPlayedModule,
    CompareGamesModule,
    HttpModule, 
    TypeOrmModule.forFeature([
      UserEntity,
      PlayerEntity
    ]),
    TypeOrmConfigModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, jwtConfig],
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      ttl: Number(process.env.REDIS_TTL)
    }),

  ],
  controllers: [
    ShowGameController, 
    RecentlyPlayedController, 
    PlayerSummaryController,
    CompareGamesController,
    UserController
  ],
  providers: [
    ShowGameService, 
    SteamApiHelper, 
    RecentlyPlayedService, 
    PlayerSummaryService,
    CompareGamesService,
    UserService,
    LocationService
  ],

})
export class AppModule {}
