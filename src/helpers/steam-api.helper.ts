import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { firstValueFrom, map } from 'rxjs';
import { NewsInterface } from '../common/interfaces/game-details/news.interface';
import { OwnedGamesInterface } from 'src/common/interfaces/game-details/owned-games.interface';
import { GameReviewsInterface, ReviewContent, Reviews, ReviewsSummary, ReviewUser } from 'src/common/interfaces/game-reviws.interface';
import { GameInterface } from 'src/common/interfaces/game-details/game.interface';

@Injectable()
export class SteamApiHelper {

  private readonly apiKey = process.env.API_KEY; 
  private readonly baseUrl = 'https://api.steampowered.com';
  private readonly baseUrlStore = 'https://store.steampowered.com/api/appdetails?appids=';
  private readonly baseUrlReviews = 'https://store.steampowered.com/appreviews/';
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
              lastPlayedDate: g.rtime_last_played ?? null,
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
    return friendsGames.filter((g) => g.appId === appId);
  }

  async getAppReviews(
    appId: string
  ): Promise<GameReviewsInterface> {
    const endpoint = `${this.baseUrlReviews}${appId}`;
    const observable = this.httpService.get(endpoint, {
      params: {
        json: 1,
        language: 'english', 
        review_type: 'all',
        purchase_type: 'all',
        num_per_page: '5',
      }
    }).pipe(
      map((res) => {
        const reviewData = res.data.reviews;
        const querySummary = res.data.query_summary;

        const appReviews: GameReviewsInterface = {
          summary: {
            reviewScore: querySummary.review_score,
            reviewScoreDesc: querySummary.review_score_desc,
            totalPositive: querySummary.total_positive,
            totalNegative: querySummary.total_negative,
            totalReviews: querySummary.total_reviews,
          } as ReviewsSummary,
          reviews: reviewData.map((review: any) => ({
            user: {
              authorId: review.author.steamid,
              authorName: review.author.personaname,
              profileUrl: review.author.profile_url,
            } as ReviewUser,
            reviewContent: {
              reviewId: review.recommendationid,
              language: review.language,
              review: review.review
              .replace(/[\x00-\x1F\x7F]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim(),
              timeCreated: new Date(review.timestamp_created * 1000).toISOString(),
              timeUpdated: new Date(review.timestamp_updated * 1000).toISOString(),
              votedUp: review.voted_up,
              votesUp: review.votes_up,
              votesFunny: review.votes_funny,
              commentCount: review.comment_count,
            } as ReviewContent
          })) as Reviews
        };
        return appReviews;
      })
    );
    return await firstValueFrom(observable);
  }

  async getAppDetails(
    appId: string
  ): Promise<Partial<GameInterface> | undefined> {
    try {
      const endpoint = `${this.baseUrlStore}${appId}${this.cc}${this.language}`;
      const observable = this.httpService.get(endpoint).pipe(
        map((res) => {
          const data = res.data[appId].data;

          const gameDetails: Partial<GameInterface> = {
            type: data.type,
            name: data.name,
            steamAppid: data.steam_appid,
            requiredAge: data.required_age,
            controllerSupport: data.controller_support,
            isFree: data.is_free,
            shortDescription: data.short_description,
            supportedLanguages: data.supported_languages ? data.supported_languages
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<[^>]*>/g, '')
            .replace(/\*/g, '') 
            .split(',')
            .map(language => language.trim()) : [],
            developer: data.developer,
            publisher: data.publisher,
            priceOverview: data.price_overview ? {
              currency: data.price_overview?.currency,
              discountPercent: data.price_overview?.discount_percent,
              initialPrice: data.price_overview?.initial,
              finalPrice: data.price_overview?.final,
            } : 'No price information available',
            metacritic: data.metacritic 
            ? {
              score: data.metacritic.score,
              url: data.metacritic.url
            }
            : {
              message: 'No Metacritic score available on Steam page',
              link: `You can find more information about ${data.name} on Metacritic here: https://www.metacritic.com/game/${data.name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[®™©]/g, '')     
                .replace(/\s+/g, '-')         
                .replace(/[^a-zA-Z0-9-]/g, '')   
                .replace(/-+/g, '-')             
                .toLowerCase()}/`
              },
            externalReviews: data.reviews ?? 'No external reviews available on Steam page',
            genres: data.genres,
            categories: data.categories,
            releaseDate: data.release_date,
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
      }

      throw new ServiceUnavailableException(`Failed to fetch game details: ${err.message}`);
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

        if(!player) {
          throw new NotFoundException(`No Steam player found for id ${steamId}.`);
        }

        return {
          steamId: player.steamid, 
          playerName: player.personaname,
          realName: player.realname,
          avatarUrl: player.avatarfull,
          userStatus: player.personastate ?? null,
          lastLogOff: player.lastlogoff ?? null,
          timeCreated: player.timecreated ?? null,
          location: {
            countryCode: player.loccountrycode ?? null,
            stateCode: player.locstatecode ?? null,
            cityCode: player.loccityid ?? null
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
    try {

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

    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        throw new NotFoundException(`Achievements for appId ${appId} not found for Steam ID ${steamId}.`);
      }
      throw new ServiceUnavailableException(`Failed to fetch player achievements: ${err.message}`);
    }
  }

  async getRecentlyPlayedGames(steamId: string) {

    try {
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
    } catch (err: any) {
      throw new ServiceUnavailableException(`Failed to fetch recently played games for Steam ID ${steamId}: ${err.message}`);
    }
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
