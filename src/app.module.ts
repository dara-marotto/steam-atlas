import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmConfigModule } from './database/typeorm.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { GameEntity } from './entities/game.entity';
import { ShowGameController } from './controllers/show-game.controller';
import { ShowGameService } from './services/show-game.service';
import { AppController } from './controllers/steam-api.controller';
import { SteamApiService } from './services/steam-api.service';
import { RecentlyPlayedService } from './services/recently-played.sevice';
import { RecentlyPlayedController } from './controllers/recently-played.controller';
import { PlayerSummaryController } from './controllers/player-summary.controller';
import { PlayerSummaryService } from './services/player-summary.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    HttpModule, 
    TypeOrmModule.forFeature([UserEntity, GameEntity]),
    TypeOrmConfigModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      ttl: Number(process.env.REDIS_TTL)
    })
  ],
  controllers: [
    ShowGameController, 
    AppController, 
    RecentlyPlayedController, 
    PlayerSummaryController
  ],
  providers: [
    ShowGameService, 
    SteamApiService, 
    RecentlyPlayedService, 
    PlayerSummaryService
  ],
})
export class AppModule {}
