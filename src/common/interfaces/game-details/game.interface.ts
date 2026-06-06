import { AchievementsInterface } from "../game-details/achievements.interface";
import { MoviesInterface } from "./movies.interface";
import { NewsInterface } from "./news.interface";
import { OwnedGamesInterface } from "./owned-games.interface";
import { PriceOverviewInterface } from "./price-overview.interface";

export class GameInterface {
    type?: string;
    name?: string;
    steam_appid?: string;
    required_age?: string;
    controller_support?: boolean;
    is_free?: boolean;
    short_description?: string; 
    supported_languages?: string;
    developer?: string;
    publisher?: string;
    price_overview?: PriceOverviewInterface;
    metacritic?: {
        score: string;
        url: string;
    };
    genres?: {
        description: string;
    }[];
    categories?: {
        description: string;
    }[];
    release_date?: {
        coming_soon: boolean;
        date: string;
    };
    screenshots?: {
        id: string;
        path_full: string;
    }[];
    movies?: MoviesInterface[];
    friendsWhoOwnTheGame?: OwnedGamesInterface[] | string;
    news?: NewsInterface[];
    achievements?: AchievementsInterface[];
}