import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'player'})
export class PlayerEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'steam_id '})
  steamId: string;

  @Column({ name: 'player_name' })
  playerName: string;

  @Column({ name: 'real_name', nullable: true })
  realName: string;

  @Column({ name: 'user_status' })
  userStatus: string;

  @Column({ name: 'last-log-off' })
  lastLogOff: string;

  @Column({ name: 'account_age' })
  accountAge: string;

  @Column({ name: 'total_playtime', nullable: true })
  totalPlaytime: string;

}