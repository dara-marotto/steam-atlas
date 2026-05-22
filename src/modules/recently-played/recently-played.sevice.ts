import { Inject, Injectable } from "@nestjs/common";
import { RecentlyPlayedInterface } from "../../common/interfaces/recently-played.interface";
import { SteamApiService } from "../steam-api/services/steam-api.service";

@Injectable()
export class RecentlyPlayedService {

  constructor(
    @Inject()
    private readonly steamApi: SteamApiService
  ) {}

  async getRecentlyPlayedGames(
    steamId: string
  ): Promise<RecentlyPlayedInterface> {

    const recentGames = await this.steamApi.getRecentlyPlayedGames(steamId);
    const totalPlaytimeInTwoWeeks = recentGames.reduce((acc, game) => acc + game.playedTimeTwoWeeks, 0);
    const gamesCount = recentGames.length - 1;
    const playerAchievements: any[] = [];

    for (const game of recentGames) {
      const achievements = await this.steamApi.getPlayerAchievements(steamId, game.gameId);
      playerAchievements.push(...achievements);
    }

    const filteredPlayerAchievements = playerAchievements
    .filter((a) => a.unlockedTime > Math.trunc((Date.now() / 1000)) - (14 * 24 * 60 * 60))
    .map((a) => ({
      gameName: a.gameName,
      name: a.name,
      description: a.description,
      unlockedTime: new Date(a.unlockedTime * 1000).toISOString()
    }));

    const achievementsCount = filteredPlayerAchievements.length = 0 ? 0 : filteredPlayerAchievements.length;

    return {
      totalPlaytimeInTwoWeeks: `${totalPlaytimeInTwoWeeks} minutes`,
      gamesCount: gamesCount ? gamesCount : 'No recently played games',
      achievementsCount: achievementsCount ? achievementsCount : 'No recent achievements',
      recentGames: recentGames.map((g) => ({
        gameId: g.gameId,
        gameName: g.gameName,
        playedTimeTwoWeeks: `${g.playedTimeTwoWeeks} minutes`
      })),
      recentAchievements: filteredPlayerAchievements 
    }
  }
}
