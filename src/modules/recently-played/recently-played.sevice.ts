import { HttpException, Inject, Injectable } from "@nestjs/common";
import { RecentlyPlayedInterface } from "../../common/interfaces/recently-played.interface";
import { SteamApiHelper } from "../../helpers/steam-api.helper";

@Injectable()
export class RecentlyPlayedService {

  constructor(
    @Inject()
    private readonly steamApiHelper: SteamApiHelper
  ) {}

  async getRecentlyPlayedGames(
    steamId: string
  ): Promise<RecentlyPlayedInterface> {

    const recentGames = await this.steamApiHelper.getRecentlyPlayedGames(steamId);
    const totalPlaytimeInTwoWeeks = recentGames.reduce((acc, game) => acc + game.playedTimeTwoWeeks, 0);
    const gamesCount = recentGames.length;

    const playerAchievements: any[] = [];
    const gamesNotIncluded: string[] = [];

    for (const game of recentGames) {
      try {
        const achievements = await this.steamApiHelper.getPlayerAchievements(steamId, game.gameId);
        playerAchievements.push(...achievements);
      } catch (error) {
        gamesNotIncluded.push(
          error instanceof HttpException
            ? error.message
            : `Unexpected error while fetching achievements for game: ${game.gameName}`
        );
      }
    }

    const twoWeeksAgoInSeconds = Math.trunc(Date.now() / 1000) - (14 * 24 * 60 * 60);

    const filteredPlayerAchievements = playerAchievements
    .filter((a) => a.unlockTime > twoWeeksAgoInSeconds)
    .map((a) => ({
      gameName: a.gameName,
      name: a.name,
      description: a.description,
      unlockTime: new Date(a.unlockTime * 1000).toISOString()
    }));

    return {
      totalPlaytimeInTwoWeeks: `${totalPlaytimeInTwoWeeks} minutes`,
      gamesCount: gamesCount ? gamesCount : 'No recently played games',
      achievementsCount: filteredPlayerAchievements.length
        ? filteredPlayerAchievements.length
        : 'No recent achievements',
      recentGames: recentGames.map((g) => ({
        gameId: g.gameId,
        gameName: g.gameName,
        playedTimeTwoWeeks: `${g.playedTimeTwoWeeks} minutes`
      })),
      recentAchievements: filteredPlayerAchievements,
      gamesNotIncluded: gamesNotIncluded
    }
  }
}
