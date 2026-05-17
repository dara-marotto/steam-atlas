import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'player' })
export class UserEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name' })
  name: string; 

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'password' })
  password: string;

}