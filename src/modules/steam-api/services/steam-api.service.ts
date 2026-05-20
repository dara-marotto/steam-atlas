import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom, map } from 'rxjs';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { GameDetailsInterface } from 'src/modules/show-game/interfaces/game-details.interface';
import { NewsInterface } from 'src/modules/steam-api/interfaces/news.interface';
import { OwnedGamesInterface } from 'src/modules/steam-api/interfaces/owned-games.interface';
import { PlayerInterface } from 'src/modules/steam-api/interfaces/player.interface';
import { Repository } from 'typeorm';

@Injectable()
export class SteamApiService {

  private readonly apiKey = process.env.API_KEY; 
  private readonly baseUrl = 'https://api.steampowered.com';
  private readonly baseUrlStore = 'https://store.steampowered.com/api/appdetails?appids=';



  constructor(
    private readonly httpService: HttpService
  ) {}

  async getNewsForApp(
    appId: string,
    count: number,
    maxLenght: number
  ): Promise<NewsInterface[]> {

    const endpoint = `${this.baseUrl}/ISteamNews/GetNewsForApp/v002/?appid=${appId}&count=${count}&maxlength=${maxLenght}&format=json`;

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

  async getFriendsIds(
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

  // async getAppDetails(appId: string) {
    // const endpoint = `${this.baseUrlStore}${appId}`;
// 
    // const achievements = await this.getGlobalAchievementsForApp(appId);
// 
    // const observable = this.httpService.get(endpoint).pipe(
      // map((res) => {
        // const data = res.data[appId].data;
        // const game: AppDetailsInterface = {
          // type: data.type,
          // name: data.name,
          // steam_appid: data.steam_appid,
          // required_age: data.required_age,
          // controller_support: data.controller_support,
          // is_free: data.is_free,
          // short_description: data.short_description,
          // supported_languages: data.supported_languages
          // .split(',')
          // .map((lang: string) => lang
          // .replace(/<[^>]*>/g, '')
          // .replace(/\*/g, '')
          // .trim()),
          // developer: data.developer,
          // publisher: data.publisher,
          // price_overview: {
            // currency: data.price_overview?.currency,
            // discount_percent: data.price_overview?.discount_percent,
            // initial: data.price_overview?.initial,
            // final: data.price_overview?.final
          // },
          // metacritic: {
            // score: data.metacritic?.score,
            // url: data.metacritic?.url
          // },
          // genres: [
            // ...(data.genres ? data.genres.map((genre) => genre.description) : [])
          // ], 
          // categories: [
            // ...(data.categories ? data.categories.map((category) => category.description) : [])
          // ],
          // release_date: {
            // coming_soon: data.release_date?.coming_soon,
            // date: data.release_date?.date
          // },
          // screenshots: [
            // ...(data.screenshots ? data.screenshots.slice(0, 5).map((screenshot) => ({
              // path: screenshot.path_full
            // })) : [])
          // ],
          // movies: [
            // ...(data.movies ? data.movies.slice(0, 5).map((movie) => ({
              // name: movie.name,
              // thumbnail: movie.thumbnail,
              // webm: movie.hls_h264
            // })) : [])
          // ],
          // achievements: achievements
        // } 
        // return game;
      // })
    // )
    // return await firstValueFrom(observable);
  // }
  
  async getOwnedGames(
    steamId: string
  ) {
    
    const endpoint = `${this.baseUrl}/IPlayerService/GetOwnedGames/v0001/?key=${this.apiKey}&steamid=${steamId}&include_appinfo=1&format=json`;

    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const items = res.data.response.games ?? [];

        return items.map((item: any) => ({
          appId: item.appid.toString(),
          gameName: item.name,
          playtime: item.playtime_forever ? item.playtime_forever : null,
          playtimeTwoWeeks: item.playtime_2weeks ? item.playtime_2weeks : null,
          lastPlayedDate: item.rtime_last_played ? item.rtime_last_played : null,
          imgIconUrl: item.img_icon_url ? item.img_icon_url : null,
          imgLogoUrl: item.img_logo_url ? item.img_logo_url : null,
        })) ;
      })
    );

    return await firstValueFrom(observable);
  }

  async getPlayerSummary(
    steamId: string
  ) {

    const endpoint = `${this.baseUrl}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId}&format=json`;

    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const player = res.data.response.players[0];

        return {
          steamId: player.steamid, 
          playerName: player.personaname,
          realName: player.realname,
          avatarUrl: player.avatarfull,
          userStatus: player.peronatate ?? null,
          lastLogOff: player.lastlogoff ?? null,
          timeCreated: player.timecreated ?? null,
          location: {
            countryCode: player.loccountrycode ?? null,
            stateCode: player.locstatecode ?? null,
            cityCode: player.FFloccityid ?? null
          }
        };
      }
    )
  );
    return await firstValueFrom(observable);
  }

  async getPlayerAchievements(
    steamId: string, 
    appId: string
  ) {  
    const endpoint = `${this.baseUrl}/ISteamUserStats/GetPlayerAchievements/v0001/?key=${this.apiKey}&steamid=${steamId}&appid=${appId}&format=json&l=en`;    
    const percentages = await this.getGlobalAchievementsPercentagesForApp(appId);

    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const data = res.data.playerstats.achievements;

        percentages.forEach(el => {
          const achievement = data.find((ach: any) => ach.apiname === el.apiName);
          if(achievement) achievement.percent = el.percent;
        })

        const gameName = res.data.playerstats.gameName;
        const achievements = data.map((achievement) => ({
          gameName: gameName,
          apiName: achievement.apiname,
          name: achievement.name,
          description: achievement.description,
          achieved: achievement.achieved ? achievement.achieved: null,
          percent: achievement.percent ? achievement.percent : null
        }))
        return { achievements }
      })
    );
    return await firstValueFrom(observable);
  }

  async getGlobalAchievementsForApp(
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
          percent: achievements.percent 
        }));
        return achievements;
      })
    );
    return await firstValueFrom(observable);  
  }

  async getGlobalAchievementsPercentagesForApp(appId: string) {
    const endpoint = `${this.baseUrl}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appId}&format=json`;

    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const data = res.data.achievementpercentages.achievements;

        const achievements = data.map((achievement) => ({
          apiName: achievement.name,
          percent: achievement.percent
        }))
        return achievements;
      })
    )
    return await firstValueFrom(observable);
  }
}
