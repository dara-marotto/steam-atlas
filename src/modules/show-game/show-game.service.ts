import { Inject, Injectable, Logger } from "@nestjs/common";
import { GameInterface } from "../../common/interfaces/game-details/game.interface";
import { OwnedGamesInterface } from "../../common/interfaces/game-details/owned-games.interface";
import { SteamApiHelper } from "../../helpers/steam-api.helper";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { UserService } from "../user/user.service";

@Injectable()
export class ShowGameService {

  private readonly logger = new Logger(ShowGameService.name);

  constructor(
    @Inject()
    private readonly userService: UserService,
    @Inject()
    private readonly steamApiHelper: SteamApiHelper,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly CACHE_KEY = 'app_details';

  private async findFriendsWhoOwnTheGame(
    steamId: string | null,
    appId: string
  ): Promise<OwnedGamesInterface[] | string> {

    if(!steamId) return `You don't have a Steam account associated with your profile.`;

    try {
      return await this.steamApiHelper.getFriendsOwnedGames(steamId, appId);
    } catch (err) {
      this.logger.warn(`Could not read the friend list of Steam ID ${steamId}: ${err instanceof Error ? err.message : 'unknown error'}`);
      return 'Your Steam friend list is private or unavailable.';
    }
  }

  async getAppDetails(
    appId: string,
    email: string
  ): Promise<GameInterface> {

    const cacheKey = `${this.CACHE_KEY}:${appId}`;

    const cachedData: GameInterface | undefined = await this.cacheManager.get<GameInterface>(cacheKey);
    if (cachedData) return cachedData;

    const game = await this.steamApiHelper.getAppDetails(appId);
    const reviews = await this.steamApiHelper.getAppReviews(appId);
    const achievements = await this.steamApiHelper.getGlobalAchievementsForApp(appId);
    const recentlyNews = await this.steamApiHelper.getNewsForApp(appId, 5, 300);

    const user = await this.userService.indexOne(email);

    const gameDetails: GameInterface = {
      type: game.type,
      name: game.name,
      steamAppid: game.steamAppid,
      requiredAge: game.requiredAge,
      controllerSupport: game.controllerSupport,
      isFree: game.isFree,
      shortDescription: game.shortDescription,
      supportedLanguages: game.supportedLanguages,
      publisher: game.publisher,
      priceOverview: game.priceOverview,
      metacritic: game.metacritic,
      genres: [
        ...(game.genres ? game.genres : [])
      ],
      categories: [
        ...(game.categories ? game.categories : [])
      ],
      releaseDate: game.releaseDate,
      screenshots: [
        ...(game.screenshots
          ? game.screenshots.slice(0, 5) : [])
      ],
      movies: [
        ...(game.movies
        ? game.movies.slice(0, 5).map((movie) => ({
          name: movie.name,
          thumbnail: movie.thumbnail,
          mp4: movie.mp4
        }))
        : [])
      ],
      friendsWhoOwnTheGame: await this.findFriendsWhoOwnTheGame(user.steam_id, appId),
      reviews: reviews,
      news: recentlyNews,
      achievements: achievements
    }

    await this.cacheManager.set(cacheKey, gameDetails, { ttl: Number(process.env.REDIS_TTL) });
    return gameDetails;
  }
}