import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmConfigModule } from './database/typeorm.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerEntity } from './entities/player.entity';
import { GameEntity } from './entities/game.entity';
import { ShowGameController } from './controllers/show-game.controller';
import { ShowGameService } from './services/show-game.service';
import { AppController } from './controllers/steam-api.controller';
import { SteamApiService } from './services/steam-api.service';
import { RecentlyPlayedService } from './services/recently-played.sevice';
import { RecentlyPlayedController } from './controllers/recently-played.controller';

@Module({
  imports: [
    HttpModule, 
    TypeOrmModule.forFeature([PlayerEntity, GameEntity]),
    TypeOrmConfigModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    })
  ],
  controllers: [ShowGameController, AppController, RecentlyPlayedController],
  providers: [ShowGameService, SteamApiService, RecentlyPlayedService],
})
export class AppModule {}
