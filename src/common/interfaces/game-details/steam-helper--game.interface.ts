import { PriceOverviewInterface } from "./price-overview.interface";

export interface ISteamGameDetails {
  type: string;
  name: string;
  steamAppid: string;
  requiredAge: string;
  controllerSupport: boolean;
  isFree: boolean;
  shortDescription: string;
  supportedLanguages: string;
  developer: string;
  publisher: string;
  priceOverview: PriceOverviewInterface | string;
  metacritic?: {
    score: string;
    url: string;
  } | {
    message: string;
    link: string;
  };
  externalReviews?: any; //fiz later
  genres?: {
    description: string;
  }[];
  categories?: {
    description: string;
  }[];
  releaseDate?: {
    comingSoon: boolean;
    date: string;
  };
  screenshots?: {
    id: string;
    pathFull: string;
  }[];
  movies?: {
    id: number;
    name: string;
    thumbnail: string;
    mp4: string;
  }[];
}