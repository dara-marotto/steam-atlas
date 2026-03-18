import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'player' })
export class Player {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_name'})
  playerName: string;
  
  @Column({ name: 'avatar_url' })
  avatarUrl: string;

  @Column({ name: 'country_code' })
  countryCode: string;

  @Column({ name: 'state_code' })
  stateCode: string;

  @Column({ name: 'city_id' })
  cityId: number;

  @Column({ name: 'time_created' })
  timeCreated: string;

  @Column({ name: 'last_logoff' })
  lastLogOff: string;

  @Column({ name: 'player_url' })
  playerUrl: string;

}