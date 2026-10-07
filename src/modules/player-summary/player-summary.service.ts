import { HttpException, Inject, Injectable } from "@nestjs/common";
import { Duration } from "luxon";
import { SteamApiHelper } from "../../helpers/steam-api.helper";
import { PLAYER_SUMMARY_MESSAGE } from "../../common/enums/player-summary-message.enum";
import { PlayerInterface } from "../../common/interfaces/player.interface";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { InjectRepository } from "@nestjs/typeorm";
import { PlayerEntity } from "../../entities/player.entity";
import { Repository } from "typeorm";
import { LocationService } from "../../external-services/location/location.service";
import { PlayerRarerAchievementsInterface } from "src/common/interfaces/player-rarer-achievements.interface";
import { LOCATION_SEPARATOR } from "../../common/constants/location.constant";

@Injectable()
export class PlayerSummaryService {
  
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject()
    private readonly steamApiHelper: SteamApiHelper,
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

  private parseStoredLocation(
    storedLocation: string | null
  ): { country: string | null; state: string | null; city: string | null } {

    const [country, state, city] = (storedLocation ?? '').split(LOCATION_SEPARATOR);
    const asName = (part?: string) => part && part !== 'null' ? part : null;

    return {
      country: asName(country),
      state: asName(state),
      city: asName(city)
    };
  }

  async getPlayerRarerAchievements(
    steamId: string, 
    playerGamesId: string[]
  ) {
    const playerRarerAchievements: any[] = [];
    const errorMessages: string[] = [];

    for(const appId of playerGamesId) {

      try {
        const playerAchievements = await this.steamApiHelper.getPlayerAchievements(
          steamId, 
          appId
        );

        const rarerAchievements = playerAchievements.filter(
          (a) => 
            +a.percent < 5 &&
            a.achieved === 1
          );

        playerRarerAchievements.push(...rarerAchievements);
        
      } catch (error) {
        errorMessages.push(
          error instanceof HttpException
            ? error.message
            : `Unexpected error while fetching achievements for game: ${appId}`
        );
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
  ): Promise<PlayerInterface> {

    const cacheKey = `${this.CACHE_KEY}:${steamId}`;
    const cachedData: PlayerInterface | null = await this.cacheManager.get<PlayerInterface>(cacheKey);
    // if (cachedData) return cachedData;

    const ownedGames = await this.steamApiHelper.getOwnedGames(steamId);

    const gamesId = ownedGames.map((game) => game.appId);

    const playtimeGames = ownedGames
    .filter((g) => g.playtime !== null)
    .map((g) => +g.playtime);

    const totalPlaytime = playtimeGames.reduce((acc, game) => acc + game, 0);

    const playerRarerAchievements: PlayerRarerAchievementsInterface = await this.getPlayerRarerAchievements(steamId, gamesId);

    const playerInDb = await this.playerRepository.findOne({
      where: { steamId }
    });

    let playerInSteamDb: any;

    if(!playerInDb) playerInSteamDb = await this.steamApiHelper.getPlayerSummary(steamId);

    const playerSummary: PlayerInterface =  {
      steamId: playerInDb ? playerInDb.steamId : playerInSteamDb.steamId,
      playerName: playerInDb ? playerInDb.playerName : playerInSteamDb.playerName,
      realName: playerInDb ? playerInDb.realName : playerInSteamDb.realName ?? undefined,
      userStatus: playerInDb ? playerInDb.userStatus : playerInSteamDb.userStatus ?? undefined,
      avatarUrl: playerInDb ? playerInDb.avatarUrl : playerInSteamDb.avatarUrl ?? undefined,
      lastLogOff: playerInDb ? new Date(playerInDb.lastLogOff).toISOString() : new Date(playerInSteamDb.lastLogOff * 1000).toISOString(),
      accountAge: playerInDb ? playerInDb.accountAge : this.convertMilisecondsToDate(Date.now() - (playerInSteamDb.timeCreated * 1000)),
      totalPlaytime: {
        timeInHours: playerInDb?.totalPlaytime
        ? playerInDb.totalPlaytime
        : totalPlaytime
          ? `${Math.trunc(totalPlaytime / 60)} hours`
          : undefined,
        note: PLAYER_SUMMARY_MESSAGE.PLAY_TIME_NOTE
      },
      location: playerInDb
      ? this.parseStoredLocation(playerInDb.location)
      :
      this.locationService.getFullLocation(
        playerInSteamDb.location.countryCode,
        playerInSteamDb.location.stateCode,
        playerInSteamDb.location.cityCode
      ),
      playerRarerAchievements: {
        achievements: playerRarerAchievements.achievements,
        note: PLAYER_SUMMARY_MESSAGE.RARER_ACHIEVEMENTS_NOTE,
        gamesNotIncluded: playerRarerAchievements.gamesNotIncluded
      }
    };

    // await this.cacheManager.set(cacheKey, playerSummary, {ttl: process.env.REDIS_TTL});
    return playerSummary;
  }
}