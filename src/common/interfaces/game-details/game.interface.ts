import { AchievementsInterface } from "../game-details/achievements.interface";
import { GameReviewsInterface } from "../game-reviws.interface";
import { MoviesInterface } from "./movies.interface";
import { NewsInterface } from "./news.interface";
import { OwnedGamesInterface } from "./owned-games.interface";
import { PriceOverviewInterface } from "./price-overview.interface";

export class GameInterface {
    type?: string;
    name?: string;
    steamAppid?: string;
    requiredAge?: string;
    controllerSupport?: boolean;
    isFree?: boolean;
    shortDescription?: string;
    supportedLanguages?: string;
    developer?: string;
    publisher?: string;
    priceOverview?: PriceOverviewInterface | string;
    metacritic?: {
        score: string;
        url: string;
    } | {
        message: string;
        link: string;
    };
    externalReviews?: any; //fiz later
    genres?: string[];
    categories?: string[];
    releaseDate?: {
        comingSoon: boolean;
        date: string;
    };
    screenshots?: string[];
    movies?: MoviesInterface[];
    friendsWhoOwnTheGame?: OwnedGamesInterface[] | string;
    reviews: GameReviewsInterface;
    news?: NewsInterface[];
    achievements?: AchievementsInterface[];
}