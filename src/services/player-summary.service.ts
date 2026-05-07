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

    for(const appId of playerGamesId) {

      try {
        const playerAchievements = await this.steamApiService.getPlayerAchievements(
          steamId, 
          appId
        );

        if(!playerAchievements?.achievements) continue;

        const rarerAchievements = playerAchievements.achievements.filter(
          (a) => 
            +a.percent <= 5 &&
           a.achieved === 1
          );
        
        playerRarerAchievements.push(...rarerAchievements);
        
      } catch (error: any) {
        const status = error.response?.status;

        if(status === 403) {
          console.log(`The game ${appId} has a private achievements profile.`);
        } else {
          console.log('Unexpected error while fetching achievements for game:', appId);
        }
        continue; 
      }
    }

    return { 
      achievements: playerRarerAchievements 
    }

  }

  async getPlayerSummary(steamId: string) {

    const ownedGames = await this.getOwnedGames(steamId);

    const gamesId = ownedGames.map((game) => game.appId);

    const playerRarerAchievements = await this.getPlayerRarerAchievements(steamId, gamesId);

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
              timeInMinutes: totalPlaytime ? `${Math.trunc(totalPlaytime / 60)} hours` : null,
              note: 'This is the total time played in games on your account. This calculation does not include Steam Family Sharing games.'
            },
            location: {
              countryCode: data.loccountrycode ?? null,
              stateCode: data.locstatecode ?? null,
              cityId: data.loccityid ?? null
            },
            playerRarerAchievements: {
              playerRarerAchievements,
              note: 'Some of your achievements may not be included in this list because they have private achievements profiles. This means that the game developers have chosen to hide the achievements data for their games, making it inaccessible to third-party applications like this one.'
            },
          }
        })
      )
      return await firstValueFrom(observable);
      
    } catch (error) { 
      throw new ServiceUnavailableException('This player profile is private.');
    }
  }
}