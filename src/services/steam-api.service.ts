import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom, map } from 'rxjs';
import { CreatePlayerDto } from 'src/dtos/create-player.dto';
import { PlayerEntity } from 'src/entities/player.entity';
import { NewsInterface } from 'src/interfaces/news.interface';
import { OwnedGamesInterface } from 'src/interfaces/owned-games.interface';
import { PlayerInterface } from 'src/interfaces/player.interface';
import { Repository } from 'typeorm';

@Injectable()
export class SteamApiService {

  private readonly apiKey = process.env.API_KEY; 
  private readonly baseUrl = 'https://api.steampowered.com';


  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playerRepository: Repository<PlayerEntity>,
    private readonly httpService: HttpService
  ) {}

  async createPlayer(dto: CreatePlayerDto): Promise<PlayerEntity> {

    const playerSummary = await this.getPlayerSummary(dto.steamId);

    if(!playerSummary) throw new NotFoundException('Player not found in Steam API');

    const player = new PlayerEntity(); 

    Object.assign(player, {
      steamId: dto.steamId,
      playerName: playerSummary.playerName,
      avatarUrl: playerSummary.avatarUrl,
      countryCode: playerSummary.countryCode,
      stateCode: playerSummary.stateCode,
      cityId: playerSummary.cityId,
      timeCreated: playerSummary.timeCreated,
      lastLogOff: playerSummary.lastLogOff,
      playerUrl: playerSummary.playerUrl,
      password: dto.password
    });

    await this.playerRepository.save(player);

    return player;
   }

  async getNewsForApp(
    appId: number,
    count: number,
    maxLenght: number
  ): Promise<NewsInterface[]> {

    const endpoint = `${this.baseUrl}/ISteamNews/GetNewsForApp/v002/?appid=${appId}&count=${count}&maxlength=${maxLenght}&format=json`;

    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const items = res.data.appnews.newsitems;

        return items.map((item: any): NewsInterface => ({
          title: item.title,
          url: encodeURI(item.url),
          author: item.author,
          date: new Date(item.date * 1000).toISOString(),
          feedlabel: item.feedlabel,
          gameId: item.appid
        }));
      })
    );
    return firstValueFrom(observable); 
  }

  async getOwnedGames(steamId: number): Promise<OwnedGamesInterface[]> {
    
    const endpoint = `${this.baseUrl}/IPlayerService/GetOwnedGames/v0001/?key=${this.apiKey}&steamid=${steamId}&include_appinfo=1&format=json`;

    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const items = res.data.response.games;

        return items.map((item: any) => ({
          gameId: item.appid,
          gameName: item.name,
          playedTime: item.playtime_forever ? `${item.playtime_forever} minutes` : 'Never played',
          lastPlayedDate: item.rtime_last_played ? new Date(item.rtime_last_played * 1000).toISOString() : null,
        }))
      })
    );
    return firstValueFrom(observable);
  }

  async getPlayerSummary(steamId: string): Promise<PlayerInterface> {

    const endpoint = `${this.baseUrl}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId}&format=json`;

    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const player = res.data.response.players[0];

        return {
          playerName: player.personaname,
          avatarUrl: player.avatarfull,
          countryCode: player.loccountrycode,
          stateCode: player.locstatecode,
          cityId: player.loccityid.toString(),
          timeCreated: player.timecreated ? player.timecreated : null,
          lastLogOff: player.lastlogoff ? player.lastlogoff : null,
          playerUrl: player.profileurl
        } as PlayerInterface;
      }
    )
  );
    return firstValueFrom(observable);
  }
}
