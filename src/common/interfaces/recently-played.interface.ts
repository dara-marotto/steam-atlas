export interface RecentlyPlayedInterface {

  totalPlaytimeInTwoWeeks: string;
  gamesCount: number | string;
  achievementsCount: number | string;
  recentGames: {
    gameId: number;
    gameName: string;
    playedTimeTwoWeeks: string;
  }[];
  recentAchievements: {
    gameName: string;
    name: string;
    description: string;
    unlockTime: string;
  }[] | string;
}