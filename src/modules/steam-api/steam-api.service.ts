import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom, map } from 'rxjs';
import { NewsInterface } from '../../common/interfaces/game-details/news.interface';
import { OwnedGamesInterface } from 'src/common/interfaces/game-details/owned-games.interface';

@Injectable()
export class SteamApiService {

  private readonly apiKey = process.env.API_KEY; 
  private readonly baseUrl = 'https://api.steampowered.com';
  private readonly baseUrlStore = 'https://store.steampowered.com/api/appdetails?appids=';
  private readonly cc = '&cc=us';
  private readonly language = '&l=english';

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
  ): Promise<string[]> {
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

    async getFriendsOwnedGames(
    steamId: string,
    appId: string,
  ): Promise<OwnedGamesInterface[]> {
    const frienstIds = await this.getFriendsIds(steamId);
    const friendsGames: OwnedGamesInterface[] = [];
    for (const id of frienstIds) {
      const endpoint = `${this.baseUrl}/IPlayerService/GetOwnedGames/v0001/?key=${this.apiKey}&steamid=${id}&include_appinfo=true&format=json`;
      try {

        const observable = this.httpService.get(endpoint).pipe(
          map((res) => {
            const data = res.data.response.games ?? [];
            const games: OwnedGamesInterface[] = data.map((g) => ({
              steamId: id,
              appId: g.appid.toString(),
              gameName: g.name,
              playtime: g.playtime_forever ?? null,
              playtimeTwoWeeks: g.playtime_2weeks ?? null,
              lastPlayedDate: g.lastLogOff,
              imgIconUrl: g.img_icon_url,
              imgLogoUrl: g.img_logo_url 
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
    const res = friendsGames.filter((g) => g.appId === appId);
    return res;
    
  }

  async getAppDetails(
    appId: string
  ) {
    try {
      const endpoint = `${this.baseUrlStore}${appId}${this.cc}${this.language}`;
      const observable = this.httpService.get(endpoint).pipe(
        map((res) => {
          const data = res.data[appId].data;
          const gameDetails = {
            type: data.type,
            name: data.name,
            steam_appid: data.steam_appid,
            required_age: data.required_age,
            controller_support: data.controller_support,
            is_free: data.is_free,
            short_description: data.short_description,
            supported_languages: data.supported_languages
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<[^>]*>/g, '')
            .replace(/\*/g, '') 
            .split(',')
            .map(language => language.trim()),
            developer: data.developer,
            publisher: data.publisher,
            price_overview: data.price_overview,
            metacritic: data.metacritic,
            genres: data.genres,
            categories: data.categories,
            release_date: data.release_date,
            screenshots: data.screenshots,
            movies: data.movies
           } 
          return gameDetails;
          }
        )
      );
      return await firstValueFrom(observable);
      
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        throw new NotFoundException(`Game with appId ${appId} not found.`);
      } else {
        throw new Error(`Failed to fetch game details: ${err.message}`);
      }
    }
  }
  
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
          achieved: achievement.achieved ? achievement.achieved : null,
          unlockTime: achievement.unlocktime ? achievement.unlocktime : null,
          percent: achievement.percent ? achievement.percent : null
        }))
        return achievements;
      })
    );
    return await firstValueFrom(observable);
  }

  async getRecentlyPlayedGames(steamId: string) {

    const endpoint = `${this.baseUrl}/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${this.apiKey}&steamid=${steamId}&format=json`;

    const observable = this.httpService.get(endpoint).pipe(
      map((res) => {
        const data = res.data.response.games ?? [];
        return data.map((g) => ({
          gameId: g.appid,
          gameName: g.name,
          playedTimeTwoWeeks: g.playtime_2weeks ?? 0,
        }))
      })
    )
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
