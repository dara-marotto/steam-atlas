import { Inject, Injectable } from "@nestjs/common";
import { Duration } from "luxon";
import { SteamApiService } from "../steam-api/steam-api.service";
import { PLAYER_SUMMARY_MESSAGE } from "../../common/enums/player-summary-message.enum";
import { PlayerInterface } from "../../common/interfaces/player.interface";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { InjectRepository } from "@nestjs/typeorm";
import { PlayerEntity } from "../user/entities/player.entity";
import { Repository } from "typeorm";
import { LocationService } from "../user/location/location.service";
import { PlayerRarerAchievementsInterface } from "src/common/interfaces/player-rarer-achievements.interface";

@Injectable()
export class PlayerSummaryService {
  
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject()
    private readonly steamApi: SteamApiService,
    @InjectRepository(PlayerEntity)
    private readonly playerRepository: Repository<PlayerEntity>,
    @Inject()
    private readonly locationService: LocationService
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
      note: PLAYER_SUMMARY_MESSAGE.RARER_ACHIEVEMENTS_NOTE,
      gamesNotIncluded: errorMessages
    }

  }

  async getPlayerSummary(
    steamId: string
  ): Promise<PlayerInterface | null>  {

    const cacheKey = `${this.CACHE_KEY}:${steamId}`;
    const cachedData: PlayerInterface | null = await this.cacheManager.get<PlayerInterface>(cacheKey);
    if (cachedData) return cachedData;

    const ownedGames = await this.steamApi.getOwnedGames(steamId);

    const gamesId = ownedGames.map((game) => game.appId);

    const playtimeGames = ownedGames
      .filter((g) => g.playtime !== null)
      .map((g) => g.playtime)
      .map(Number);

    const totalPlaytime = playtimeGames.reduce((acc, game) => acc + game, 0);
    
    const playerRarerAchievements: PlayerRarerAchievementsInterface = await this.getPlayerRarerAchievements(steamId, gamesId);

    try {
      let playerSummary: PlayerInterface;

      const playerInDb = await this.playerRepository.findOne({
        where: { steamId }
      });

      if(playerInDb) {
        playerSummary =  {
          steamId: playerInDb.steamId,
          playerName: playerInDb.playerName,
          realName: playerInDb.realName ?? undefined,
          avatarUrl: '', // fix later
          userStatus: playerInDb.userStatus ?? undefined,
          lastLogOff: new Date(playerInDb.lastLogOff).toISOString(),
          accountAge: playerInDb.accountAge,
          totalPlaytime: {
            timeInHours: playerInDb.totalPlaytime ?? undefined,
            note: PLAYER_SUMMARY_MESSAGE.PLAY_TIME_NOTE
          },
          location: this.locationService.getFullLocation(
            playerInDb.location.split('-')[0],
            playerInDb.location.split('-')[1],
            playerInDb.location.split('-')[2]
          ),
          playerRarerAchievements: {
            achievements: playerRarerAchievements.achievements,
            note: playerRarerAchievements.note,
            gamesNotIncluded: playerRarerAchievements.gamesNotIncluded
          }
        } as PlayerInterface

      } else {
        const playerData = await this.steamApi.getPlayerSummary(steamId); 
        playerSummary =  {
          steamId: playerData.steamId,
          playerName: playerData.playerName,
          realName: playerData.realName ?? undefined,
          avatarUrl: playerData.avatarUrl,
          userStatus: playerData.userStatus ?? undefined,
          lastLogOff: new Date(playerData.lastLogOff * 1000).toISOString(),
          accountAge: this.convertMilisecondsToDate(Date.now() - (playerData.timeCreated * 1000)),
          totalPlaytime: {
            timeInHours: totalPlaytime ? `${Math.trunc(totalPlaytime / 60)} hours` : undefined,
            note: PLAYER_SUMMARY_MESSAGE.PLAY_TIME_NOTE
          },
          location: {
            country: playerData.location.countryCode ?? null,
            state: playerData.location.stateCode ?? null,
            city: playerData.location.cityCode.toString() ?? null
          },
          playerRarerAchievements: {
            achievements: playerRarerAchievements.achievements,
            note: playerRarerAchievements.note,
            gamesNotIncluded: playerRarerAchievements.gamesNotIncluded
          },
        } as PlayerInterface
      }
      // await this.cacheManager.set(cacheKey, playerSummary, {ttl: process.env.REDIS_TTL});
      return playerSummary;

    } catch (error) { 
      return null
    }
  }
}