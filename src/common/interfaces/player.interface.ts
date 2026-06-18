import { PLAYER_SUMMARY_MESSAGE } from "../enums/player-summary-message.enum";
import { AchievementsInterface } from "./game-details/achievements.interface";

export interface PlayerInterface {
  steamId: string;
  playerName: string;
  realName: string | undefined;
  avatarUrl: string;
  userStatus: string;
  lastLogOff: string,
  accountAge: string;
  totalPlaytime: {
    timeInHours: string | undefined,
    note: PLAYER_SUMMARY_MESSAGE
  };
  location: {
    country: string | null;
    state: string | null;
    city: string | null;    
  };
  playerRarerAchievements: {
    achievements: AchievementsInterface[],
    note: PLAYER_SUMMARY_MESSAGE,
    gamesNotIncluded: string[]
  }
}