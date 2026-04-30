import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom, map } from "rxjs";
import { AppDetailsInterface } from "src/interfaces/app-details.interface";
import { NewsInterface } from "src/interfaces/news.interface";

@Injectable()
export class ShowGameService {
  private readonly apiKey = process.env.API_KEY;
  private readonly baseUrl = 'https://api.steampowered.com';
  private readonly baseUrlStore = 'https://store.steampowered.com/api/appdetails?appids=';

  constructor(
    private readonly httpService: HttpService
      
  ) {}

  private async getNewsForApp(
    appId: string,
    count: number
  ): Promise<NewsInterface[]> {

    const endpoint = `${this.baseUrl}/ISteamNews/GetNewsForApp/v002/?appid=${appId}&count=${count}&format=json`;

    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const items = res.data.appnews.newsitems;

        return items.map((item: any) => ({
          title: item.title,
          url: encodeURI(item.url),
          author: item.author,
          date: new Date(item.date * 1000).toISOString(),
          feedlabel: item.feedlabel,
          gameId: item.appid
        })) as NewsInterface[];
      })
    );
    return await firstValueFrom(observable); 
  }

  private async getGlobalAchievementsPercentagesForApp(appId: string) {

    const endpoint = `${this.baseUrl}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appId}&format=json`;
    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const data = res.data?.achievementpercentages?.achievements ?? [];
        const achievements = data.map((achievement) => ({
          apiName: achievement.name,
          percent: achievement.percent
        }))
        return achievements;
      })
    )

    return await firstValueFrom(observable);
  }

  private async getGlobalAchievementsForApp(
    appId: string
  ) {
    const endpoint= `${this.baseUrl}/ISteamUserStats/GetSchemaForGame/v2/?key=${this.apiKey}&appid=${appId}`;
    const percentages = await this.getGlobalAchievementsPercentagesForApp(appId);
    
    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {

        const data = res.data.game.availableGameStats.achievements;

        percentages.forEach(el => {
          const achievement = data.find((ach: any) => ach.name === el.apiName);
          if(achievement) achievement.percent = el.percent;
          
        });

        const achievements = data.map((achievements) => ({
          apiName: achievements.name,
          name: achievements.displayName,
          description: achievements.description,
          hidden: achievements.hidden,
          percent: achievements.percent ? `${achievements.percent}% of players have unlocked this achievement` : 'Percentage data not available'
        }));
        return achievements;
      })
    );
    return await firstValueFrom(observable);  
  }

  async getFriendsOwnedGames(
    steamId: string
  ) {
    const frienstIds = await this.friendsIds(steamId);
    const friendsGames: any[] = [];
    for (const id of frienstIds) {
      const endpoint = `${this.baseUrl}/IPlayerService/GetOwnedGames/v0001/?key=${this.apiKey}&steamid=${id}&include_appinfo=true&format=json`;
      try {

        const observable = this.httpService.get(endpoint).pipe(
          map((res) => {
            const data = res.data.response.games ?? [];
            const games = data.map((g) => ({
              steamId: id,
              appId: g.appid.toString(),
              name: g.name,
              playtime_forever: g.playtime_forever
            }));
            
            return games;
          })
        )
        const games = await firstValueFrom(observable);
        friendsGames.push(...games);
        
      } catch (err: any) {
        if (err.response?.status === 403) continue;
        throw err;
      }
    }
    const res = friendsGames.filter((g) => g.appId === '2344520');
    return res;
    
  }

  async friendsIds(
    steamId: string
  ) {
    const endpoint = `${this.baseUrl}/ISteamUser/GetFriendList/v1/?key=${this.apiKey}&steamid=${steamId}&relationship=friend`;

    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const data = res.data.friendslist?.friends ?? [];
        const friendsId = data.map((f) => f.steamid);

        return friendsId;
      })
    )
    return firstValueFrom(observable)
  }
  
  async getAppDetails(appId: string) {
    const endpoint = `${this.baseUrlStore}${appId}`;

    const achievements = await this.getGlobalAchievementsForApp(appId);
    const recentlyNews = await this.getNewsForApp(appId, 5);
    const friendsGames = await this.getFriendsOwnedGames('76561199208731819'); 


    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const data = res.data[appId].data;
        const game: AppDetailsInterface = {
          type: data.type,
          name: data.name,
          steam_appid: data.steam_appid,
          required_age: data.required_age,
          controller_support: data.controller_support,
          is_free: data.is_free,
          short_description: data.short_description,
          supported_languages: data.supported_languages
          .split(',')
          .map((lang: string) => lang
          .replace(/<[^>]*>/g, '')
          .replace(/\*/g, '')
          .trim()),
          developer: data.developer,
          publisher: data.publisher,
          price_overview: {
            currency: data.price_overview?.currency,
            discount_percent: data.price_overview?.discount_percent,
            initial: data.price_overview?.initial,
            final: data.price_overview?.final
          },
          metacritic: {
            score: data.metacritic?.score,
            url: data.metacritic?.url
          },
          genres: [
            ...(data.genres ? data.genres.map((genre) => genre.description) : [])
          ], 
          categories: [
            ...(data.categories ? data.categories.map((category) => category.description) : [])
          ],
          release_date: {
            coming_soon: data.release_date?.coming_soon,
            date: data.release_date?.date
          },
          screenshots: [
            ...(data.screenshots ? data.screenshots.slice(0, 5).map((screenshot) => ({
              path: screenshot.path_full
            })) : [])
          ],
          movies: [
            ...(data.movies ? data.movies.slice(0, 5).map((movie) => ({
              name: movie.name,
              thumbnail: movie.thumbnail,
              webm: movie.hls_h264
            })) : [])
          ],
          friendsWhoOwnTheGame: friendsGames,
          news: recentlyNews,
          achievements: achievements
        } 
        return game;
      })
    )
    return await firstValueFrom(observable);
  }

}