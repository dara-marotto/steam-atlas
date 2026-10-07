import { Inject, Injectable } from "@nestjs/common";
import { SteamApiHelper } from "../../helpers/steam-api.helper";

@Injectable()
export class CompareGamesService {
  constructor(
    @Inject()
    private readonly steamApiHelper: SteamApiHelper,

  ) {}

  async compareGames(
    appId1: string, 
    appId2: string
  ) {

    const gameDetails1 = await this.steamApiHelper.getAppDetails(appId1);
    const gameDetails2 = await this.steamApiHelper.getAppDetails(appId2);

    return {
      game1: {
        name: gameDetails1.name,
        required_age: gameDetails1.requiredAge,
        controller_support: gameDetails1.controllerSupport,
        supported_languages: gameDetails1.supportedLanguages,
        price_overview: gameDetails1.priceOverview,
        metacritic: gameDetails1.metacritic,
        external_reviews: gameDetails1.externalReviews,
        genres: gameDetails1.genres,
        user_reviews: await this.steamApiHelper.getAppReviews(appId1)
      },
      game2: {
        name: gameDetails2.name,
        required_age: gameDetails2.requiredAge,
        controller_support: gameDetails2.controllerSupport,
        supported_languages: gameDetails2.supportedLanguages,
        price_overview: gameDetails2.priceOverview,
        metacritic: gameDetails2.metacritic,
        external_reviews: gameDetails2.externalReviews,
        genres: gameDetails2.genres,
        user_reviews: await this.steamApiHelper.getAppReviews(appId2)
      }
    };
  }
}