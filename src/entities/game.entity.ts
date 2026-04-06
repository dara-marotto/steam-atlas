import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'game' })
export class GameEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'app_id', unique: true })
  appId: string;

  @Column({ name: 'game_name'})
  gameName: string;
  
  @Column({ name: 'played_time', nullable: true })
  playedTime: string;

  @Column({ name: 'played_time_two_weeks', nullable: true })
  playedTimeTwoWeeks: string;

  @Column({ name: 'last_played_date', nullable: true })
  lastPlayedDate: string;

  @Column({ name: 'img_icon_url', nullable: true })
  imgIconUrl: string;

  @Column({ name: 'img_logo_url', nullable: true })
  img_logo_url: string;
}