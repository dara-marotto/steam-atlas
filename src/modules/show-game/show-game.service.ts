import { Inject, Injectable } from "@nestjs/common";
import { GameInterface } from "../../common/interfaces/game.interface";
import { SteamApiService } from "../steam-api/steam-api.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class ShowGameService {

  constructor(
    @Inject()
    private readonly steamApi: SteamApiService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly CACHE_KEY = 'app_details';

  async getAppDetails(
    appId: string
  ): Promise<GameInterface | undefined> {

    const cacheKey = `${this.CACHE_KEY}:${appId}`;

    const cachedData: GameInterface | undefined = await this.cacheManager.get<GameInterface>(cacheKey);
    if (cachedData) return cachedData; 
    
    try {
      
      const game = await this.steamApi.getAppDetails(appId);
      const achievements = await this.steamApi.getGlobalAchievementsForApp(appId);
      const recentlyNews = await this.steamApi.getNewsForApp(appId, 5, 3);
      const friendsGames = await this.steamApi.getFriendsOwnedGames('76561199208731819', appId);  ///posteriormente vira como payload da request
      
      const gameDetails: GameInterface = {
        // type: game.type, 
        name: game.name,
        steam_appid: game.steam_appid,
        required_age: game.required_age,
        controller_support: game.controller_support,
        is_free: game.is_free,
        short_description: game.short_description,
        supported_languages: game.supported_languages,
        developer: game.developer,
        publisher: game.publisher,
        price_overview: {
          currency: game.price_overview?.currency,
          discountPercent: game.price_overview?.discount_percent,
          initialPrice: game.price_overview?.initial,
          finalPrice: game.price_overview?.final
        },
        metacritic: {
          score: game.metacritic?.score,
          url: game.metacritic?.url
        },
        genres: [
          ...(game.genres ? game.genres.map((genre) => genre.description) : [])
        ], 
        categories: [
          ...(game.categories ? game.categories.map((category) => category.description) : [])
        ],
        release_date: {
          coming_soon: game.release_date?.coming_soon,
          date: game.release_date?.date
        },
        screenshots: [
          ...(game.screenshots ? game.screenshots.slice(0, 5).map((screenshot) => ({
            path: screenshot.path_full
          })) : [])
        ],
        movies: [
          ...(game.movies ? game.movies.slice(0, 5).map((movie) => ({
            name: movie.name,
            thumbnail: movie.thumbnail,
            webm: movie.hls_h264
          })) : [])
        ],
        friendsWhoOwnTheGame: friendsGames,
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