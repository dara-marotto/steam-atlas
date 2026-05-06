import { HttpService } from "@nestjs/axios";
import { Inject, Injectable, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { firstValueFrom, map } from "rxjs";
import { Duration } from "luxon";
import { SteamApiService } from "./steam-api.service";

@Injectable()
export class PlayerSummaryService {
//https://steamcommunity.com/actions/QueryLocations/ locations
  private readonly apiKey = process.env.API_KEY; 
  private readonly baseUrl = 'https://api.steampowered.com';
  private readonly baseUrlStore = 'https://store.steampowered.com/api/appdetails?appids=';
  
  constructor(
    private readonly httpService: HttpService,
    @Inject()
    private readonly steamApiService: SteamApiService
  ) {}

  private convertMilisecondsToDate(milliseconds: number): string {

    const date = Duration.fromMillis(milliseconds)
    .shiftTo('years', 'months')
    .toObject();

    return `${date.years} years and ${Math.trunc(date.months)} months`;
  }

  private async getOwnedGames(steamId: string) {

    const endpoint = `${this.baseUrl}/IPlayerService/GetOwnedGames/v0001/?key=${this.apiKey}&steamid=${steamId}&format=json`;
    
    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const data = res.data.response.games ?? [];
        return data.map((g) => ({
          appId: g.appid,
          playtime: g.playtime_forever ?? 0,
        }))
      })
    )
    return await firstValueFrom(observable);  
  }

  async getPlayerRarerAchievements(steamId: string, playerGamesId: string[]) {
    const playerRarerAchievements: any[] = [];

    playerGamesId.forEach(async (appId) => {
      const playerAchievements = await this.steamApiService.getPlayerAchievements(steamId, appId); 
      const rarerAchievements = playerAchievements.achievements.filter((a) => a.percent <= 10 && a.achieved !== null); 
      playerRarerAchievements.push(...rarerAchievements);

    });
    return { achievements: playerRarerAchievements };

  }

  async getPlayerSummary(steamId: string) {

    const ownedGames = await this.getOwnedGames(steamId);

    const gamesId = ownedGames.map((game) => game.appId);

    const playerRarerAchievements = await this.getPlayerRarerAchievements(steamId, gamesId);

    console.log('------------------');
    console.log({ response: playerRarerAchievements });
    console.log('------------------');

    const endpoint = `${this.baseUrl}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId}&format=json`;

    
    const totalPlaytime = ownedGames.reduce((acc, game) => acc + game.playtime, 0);

    try {
      const observable = this.httpService.get(endpoint).pipe(
        map((res) => {
          const data = res.data.response.players[0];
          
          return {
            steamId: data.steamid,
            playerName: data.personaname,
            realName: data.realname ?? null,
            avatarUrl: data.avatarfull,
            userStatus: data.peronatate,
            lastLogOff: new Date(data.lastlogoff * 1000).toISOString(),
            accountAge: this.convertMilisecondsToDate(Date.now() - (data.timecreated * 1000)),
            totalPlaytime: {
              timeInMinutes:`${totalPlaytime / 60} hours`,
              note: 'This is the total time played in games on your account. This calculation does not include Steam Family Sharing games.'
            },
            location: {
              countryCode: data.loccountrycode ?? null,
              stateCode: data.locstatecode ?? null,
              cityId: data.loccityid ?? null
            }
          }
        })
      )
      return await firstValueFrom(observable);
      
    } catch (error) { 
      throw new ServiceUnavailableException('This player profile is private.');
    }
  }
}