import { HttpService } from "@nestjs/axios";
import { Inject, Injectable, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { firstValueFrom, map } from "rxjs";
import { Duration } from "luxon";
import { SteamApiService } from "./steam-api.service";
import { PLAYER_SUMMARY_MESSAGE } from "src/enums/player-summary-message.enum";
import { PlayerInterface } from "src/interfaces/player.interface";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class PlayerSummaryService {
//https://steamcommunity.com/actions/QueryLocations/ locations
  private readonly apiKey = process.env.API_KEY; 
  private readonly baseUrl = 'https://api.steampowered.com';
  private readonly baseUrlStore = 'https://store.steampowered.com/api/appdetails?appids=';
  
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject()
    private readonly steamApi: SteamApiService
  ) {}

  private readonly CACHE_KEY = 'player_summary';

  private convertMilisecondsToDate(milliseconds: number): string {

    const date = Duration.fromMillis(milliseconds)
    .shiftTo('years', 'months')
    .toObject();

    return `${date.years} years and ${Math.trunc(date.months)} months`;
  }

  async getPlayerRarerAchievements(
    steamId: string, 
    playerGamesId: string[]
  ) {
    const playerRarerAchievements: any[] = [];
    const errorMessages: string[] = [];

    for(const appId of playerGamesId) {

      try {
        const playerAchievements = await this.steamApi.getPlayerAchievements(
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
          errorMessages.push(`The game ${appId} has a private achievements profile.`);
        } else {
          errorMessages.push(`Unexpected error while fetching achievements for game: ${appId}`);
        }
        continue; 
      }
    }

    return { 
      achievements: playerRarerAchievements,
      gamesNotIncludes: errorMessages
    }

  }

  async getPlayerSummary(
    steamId: string
  ): Promise<PlayerInterface | string>  {

    const cacheKey = `${this.CACHE_KEY}:${steamId}`;
    const cachedData: PlayerInterface | undefined = await this.cacheManager.get<PlayerInterface>(cacheKey);
    if (cachedData) return cachedData;

    const ownedGames = await this.steamApi.getOwnedGames(steamId);

    const gamesId = ownedGames.map((game) => game.appId);

    const playtimeGames = ownedGames
      .filter((g) => g.playtime !== null)
      .map((g) => g.playtime)
      .map(Number);

    const totalPlaytime = playtimeGames.reduce((acc, game) => acc + game, 0);
    
    const playerRarerAchievements = await this.getPlayerRarerAchievements(steamId, gamesId);

    try {
      const playerData = await this.steamApi.getPlayerSummary(steamId); 
          
      const playerSummary =  {
        steamId: playerData.steamId,
        playerName: playerData.playerName,
        realName: playerData.realName ?? null,
        avatarUrl: playerData.avatarUrl,
        userStatus: playerData.userStatus,
        lastLogOff: new Date(playerData.lastLogOff * 1000).toISOString(),
        accountAge: this.convertMilisecondsToDate(Date.now() - (playerData.timeCreated * 1000)),
        totalPlaytime: {
          timeInHours: totalPlaytime ? `${Math.trunc(totalPlaytime / 60)} hours` : null,
          note: PLAYER_SUMMARY_MESSAGE.PLAY_TIME_NOTE
        },
        location: {
          countryCode: playerData.location.countryCode ?? null,
          stateCode: playerData.location.stateCode ?? null,
          cityId: playerData.location.cityCode ?? null
        },
        playerRarerAchievements: {
          achievements: playerRarerAchievements.achievements,
          note: PLAYER_SUMMARY_MESSAGE.RARER_ACHIEVEMENTS_NOTE,
          gamesNotIncluded: playerRarerAchievements.gamesNotIncludes
        },
      } as PlayerInterface

      await this.cacheManager.set(cacheKey, playerSummary, { ttl: 3600 });
      return playerSummary;

    } catch (error) { 
      throw new Error(`This player profile is private. ${error}`);
    }
  }
}