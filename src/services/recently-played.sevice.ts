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

  private async getPlayerAchievements(
    steamId: string,
    appId: string
  ) {

    const endpoint = `${this.baseUrl}/ISteamUserStats/GetPlayerAchievements/v0001/?key=${this.apiKey}&steamid=${steamId}&appid=${appId}&format=json&l=en`;    
    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const data = res.data.playerstats.achievements ?? [];
        return data.map((a) => ({
          gameName: res.data.playerstats.gameName,
          name: a.name,
          description: a.description,
          unlockedTime: a.achieved ? a.unlocktime : null
        }))
      })
    )
    return await firstValueFrom(observable);
  }

  async getRecentlyPlayedGames(steamId: string) {

    const endpoint = `${this.baseUrl}/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${this.apiKey}&steamid=${steamId}&format=json`;

    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const data = res.data.response.games ?? [];
        return data.map((g) => ({
          gameId: g.appid,
          gameName: g.name,
          playedTimeTwoWeeks: g.playtime_2weeks ?? 0,
        }))
      })
    )
    const recentGames = await firstValueFrom(observable);
    const totalPlaytimeInTwoWeeks = recentGames.reduce((acc, game) => acc + game.playedTimeTwoWeeks, 0);
    const gamesCount = recentGames.length - 1;
    const playerAchievements: any[] = [];

    for (const game of recentGames) {
      const achievements = await this.getPlayerAchievements(steamId, game.gameId);
      playerAchievements.push(...achievements);
    }

    const filteredPlayerAchievements = playerAchievements
    .filter((a) => a.unlockedTime > Math.trunc((Date.now() / 1000)) - (14 * 24 * 60 * 60))
    .map((a) => ({
      gameName: a.gameName,
      name: a.name,
      description: a.description,
      unlockedTime: new Date(a.unlockedTime * 1000).toISOString()
    }))
    const achievementsCount = filteredPlayerAchievements.length - 1;


    return {
      totalPlaytimeInTwoWeeks: `${totalPlaytimeInTwoWeeks} minutes`,
      gamesCount: gamesCount ? gamesCount : 'No recently played games',
      achievementsCount: achievementsCount ? achievementsCount : 'No recent achievements',
      recentGames: recentGames.map((g) => ({
        gameId: g.gameId,
        gameName: g.gameName,
        playedTimeTwoWeeks: `${g.playedTimeTwoWeeks} minutes`
      })),
      recentAchievements: filteredPlayerAchievements
    }
  }
}
