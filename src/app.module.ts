import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmConfigModule } from './database/typeorm.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ShowGameController } from './controllers/show-game.controller';
import { ShowGameService } from './services/show-game.service';
import { AppController } from './controllers/steam-api.controller';
import { SteamApiService } from './services/steam-api.service';
import { RecentlyPlayedService } from './services/recently-played.sevice';
import { RecentlyPlayedController } from './controllers/recently-played.controller';
import { PlayerSummaryController } from './modules/player-summary/controllers/player-summary.controller';
import { PlayerSummaryService } from './modules/player-summary/services/player-summary.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { UserController } from './modules/user/controllers/user.controller';
import { UserService } from './modules/user/services/user.service';
import { UserModule } from './modules/user/user.module';
import { PlayerSummaryModule } from './modules/player-summary/player-summary.module';

@Module({
  imports: [
    UserModule,
    PlayerSummaryModule,
    HttpModule, 
    TypeOrmModule.forFeature([UserEntity]),
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
  ],
  providers: [
    ShowGameService, 
    SteamApiService, 
    RecentlyPlayedService, 
    PlayerSummaryService,
  ],
  exports: [
    PlayerSummaryService
  ]
})
export class AppModule {}
