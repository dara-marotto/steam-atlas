import { Inject, Injectable } from "@nestjs/common";
import { GameInterface } from "../../common/interfaces/game-details/game.interface";
import { SteamApiHelper } from "../../helpers/steam-api.helper";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { UserService } from "../user/user.service";

@Injectable()
export class ShowGameService {

  constructor(
    @Inject()
    private readonly userService: UserService,
    @Inject()
    private readonly steamApiHelper: SteamApiHelper,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly CACHE_KEY = 'app_details';

  async getAppDetails(
    appId: string,
    email: string
  ): Promise<GameInterface | undefined> {

    const cacheKey = `${this.CACHE_KEY}:${appId}`;

    const cachedData: GameInterface | undefined = await this.cacheManager.get<GameInterface>(cacheKey);
    if (cachedData) return cachedData; 
    
    try {
      
      const game = await this.steamApiHelper.getAppDetails(appId);

      if(game === undefined) {
        throw new Error(`Game with appId ${appId} not found.`);
      }
      const reviews = await this.steamApiHelper.getAppReviews(appId);
      const achievements = await this.steamApiHelper.getGlobalAchievementsForApp(appId);
      const recentlyNews = await this.steamApiHelper.getNewsForApp(appId, 5, 3);

      
      const user = await this.userService.indexOne(email); 
      const friendsGames = await this.steamApiHelper.getFriendsOwnedGames(user.steam_id, appId);
      
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
        friendsWhoOwnTheGame: user.steam_id ? friendsGames : `You don't have a Steam account associated with your profile.`,
        reviews: reviews,
        news: recentlyNews,
        achievements: achievements
      } 
          
      await this.cacheManager.set(cacheKey, gameDetails, {ttl: process.env.REDIS_TTL});
      return gameDetails;
    } catch (err) {
      console.log('------------------');
      console.log({ response: err });
      console.log('------------------');
    }
  }

}