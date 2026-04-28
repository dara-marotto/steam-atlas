export class AppDetailsInterface {
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
    price_overview?: {
        currency: string;
        discount_percent: string;
        initial: string;
        final: string;
    };
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
    movies?: {
        name: string;
        thumbnail: string;
        hls_h264: string; 
    }[];
    achievements?: {
        apiName: string;
        name: string;
        desription: string;
        hidden: boolean;
        percent: string;
    };
}