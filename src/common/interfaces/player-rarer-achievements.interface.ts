import { AchievementsInterface } from "./game-details/achievements.interface";

export interface PlayerRarerAchievementsInterface {
  achievements: AchievementsInterface[];
  note: string;
  gamesNotIncluded: string[];
}