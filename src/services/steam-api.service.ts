import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom, map, Observable } from 'rxjs';
import { NewsInterface } from 'src/interfaces/news.interface';
import { OwnedGamesInterface } from 'src/interfaces/owned-games.interface';
import { PlayerInterface } from 'src/interfaces/player.interface';

@Injectable()
export class SteamApiService {

  private readonly apiKey = process.env.API_KEY; 
  private readonly baseUrl = 'https://api.steampowered.com';
  private readonly steamId = '76561199208731819';


  constructor(
    private readonly httpService: HttpService
  ) {}

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

  async getPlayerSummary(steamId: number): Promise<PlayerInterface> {

    const endpoint = `${this.baseUrl}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId}&format=json`;

    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const player = res.data.response.players[0];

        return {
          playerName: player.personaname,
          avatarUrl: player.avatarfull,
          countryCode: player.loccountrycode,
          stateCode: player.locstatecode,
          cityId: player.loccityid,
          timeCreated: new Date(player.timecreated * 1000).toISOString(),
          lastLogOff: new Date(player.lastlogoff * 1000).toISOString(),
          playerUrl: player.profileurl
        } as PlayerInterface;
      }
    )
  );
    return firstValueFrom(observable);
  }
}
