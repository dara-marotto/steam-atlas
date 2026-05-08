import { PLAYER_SUMMARY_MESSAGE } from "src/player-summary-message.enum";

export interface PlayerInterface {
  steamId: string;
  playerName: string;
  realName: string | null;
  avatarUrl: string;
  userStatus: string;
  lastLogOff: string,
  accountAge: string;
  totalPlaytime: {
    timeInHours: string | null,
    note: PLAYER_SUMMARY_MESSAGE
  };
  location: {
    countryCode: string | null;
    stateCode: string | null;
    cityId: string | null;    
  };
  playerRarerAchievements: {
    achievements: Object[],
    note: PLAYER_SUMMARY_MESSAGE,
    gamesNotIncluded: Object[]
  }
}