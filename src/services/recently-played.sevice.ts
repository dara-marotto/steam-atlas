import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom, map } from "rxjs";

@Injectable()
export class RecentlyPlayedService {

  private readonly apiKey = process.env.API_KEY; 
  private readonly baseUrl = 'https://api.steampowered.com';
  private readonly baseUrlStore = 'https://store.steampowered.com/api/appdetails?appids=';

    constructor(
      private readonly httpService: HttpService
    ) {}

  async getOwnedGames(steamId: string) {

    const endpoint = `${this.baseUrl}/IPlayerService/GetOwnedGames/v0001/?key=${this.apiKey}&steamid=${steamId}&include_appinfo=1&format=json`;
    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const data = res.data.response.games;
        return data.map((g) => ({
          gameId: g.appid,
          gameName: g.name,
          playedTimeTwoWeeks: g.playedtime_2weeks,
        }))
      })
    ) 

    return await firstValueFrom(observable);
  }

  async getRecentlyPlayedGames(steamId: string) {

    const ownedGames = await this.getOwnedGames(steamId); 
    const recentGames = ownedGames.filter(game => game.playedTimeTwoWeeks > 0); 

    return recentGames
  }
}