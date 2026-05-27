import { Inject, Injectable } from "@nestjs/common";
import { SteamApiService } from "../steam-api/steam-api.service";

@Injectable()
export class CompareGamesService {
  constructor(
    @Inject()
    private readonly steamApiService: SteamApiService,
  ) {}

  async compareGames(
    appId1: string, 
    appId2: string
  ) {

    const gameDetails1 = await this.steamApiService.getAppDetails(appId1);
    const gameDetails2 = await this.steamApiService.getAppDetails(appId2);
    
    if (!gameDetails1 || !gameDetails2) {
      throw new Error('One or both games not found');
    }
    return {
      game1: {
        name: gameDetails1.name,
        required_age: gameDetails1.required_age,
        controller_support: gameDetails1.controller_support,
        supported_languages: gameDetails1.supported_languages,
        price_overview: gameDetails1.price_overview,
        metacritic: gameDetails1.metacritic,
        genres: gameDetails1.genres,
      },
      game2: {
        name: gameDetails2.name,
        required_age: gameDetails2.required_age,
        controller_support: gameDetails2.controller_support,
        supported_languages: gameDetails2.supported_languages,
        price_overview: gameDetails2.price_overview,
        metacritic: gameDetails2.metacritic,
        genres: gameDetails2.genres,
      }
    };
  }
}