import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'player' })
export class PlayerEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'steam_id', unique: true })
  steamId: string;

  @Column({ name: 'player_name'})
  playerName: string;
  
  @Column({ name: 'avatar_url' })
  avatarUrl: string;

  @Column({ name: 'country_code', nullable: true })
  countryCode: string;

  @Column({ name: 'state_code', nullable: true })
  stateCode: string;

  @Column({ name: 'city_id', nullable: true })
  cityId: string;

  @Column({ name: 'time_created' })
  timeCreated: string;

  @Column({ name: 'last_logoff' })
  lastLogOff: string;

  @Column({ name: 'player_url' })
  playerUrl: string;

  @Column({ name: 'password' })
  password: string;

}