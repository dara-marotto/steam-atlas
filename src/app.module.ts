import { Module } from '@nestjs/common';
import { AppController } from './controllers/steam-api.controller';
import { SteamApiService } from './services/steam-api.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmConfigModule } from './database/typeorm.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerEntity } from './entities/player.entity';
import { GameEntity } from './entities/game.entity';

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
  controllers: [AppController],
  providers: [SteamApiService],
})
export class AppModule {}
