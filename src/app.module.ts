import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmConfigModule } from './database/typeorm.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './modules/user/entities/user.entity';
import { ShowGameController } from './modules/show-game/controllers/show-game.controller';
import { ShowGameService } from './modules/show-game/services/show-game.service';
import { SteamApiController } from './modules/steam-api/controllers/steam-api.controller';
import { SteamApiService } from './modules/steam-api/services/steam-api.service';
import { RecentlyPlayedService } from './modules/recently-played/services/recently-played.sevice';
import { RecentlyPlayedController } from './modules/recently-played/controllers/recently-played.controller';
import { PlayerSummaryController } from './modules/player-summary/controllers/player-summary.controller';
import { PlayerSummaryService } from './modules/player-summary/services/player-summary.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { UserController } from './modules/user/controllers/user.controller';
import { UserService } from './modules/user/services/user.service';
import { UserModule } from './modules/user/user.module';
import { PlayerSummaryModule } from './modules/player-summary/player-summary.module';
import { AuthModule } from './modules/auth/auth.module';
import jwtConfig from './config/jwt.config';
import { RecentlyPlayedModule } from './modules/recently-played/recently-played.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PlayerSummaryModule,
    RecentlyPlayedModule,
    HttpModule, 
    TypeOrmModule.forFeature([UserEntity]),
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
    SteamApiController, 
    RecentlyPlayedController, 
    PlayerSummaryController
  ],
  providers: [
    ShowGameService, 
    SteamApiService, 
    RecentlyPlayedService, 
    PlayerSummaryService,
  ],

})
export class AppModule {}
