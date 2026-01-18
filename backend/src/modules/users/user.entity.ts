import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  type Relation,
} from 'typeorm';
import type { Vote } from '../votes/vote.entity';
import type { Election } from '../elections/election.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  VOTER = 'VOTER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VOTER,
  })
  role: UserRole;

  @Column({ nullable: true })
  userType: string;

  @OneToMany('Vote', 'user')
  votes: Relation<Vote>[];

  @ManyToMany('Election', 'eligibleVoters')
  eligibleElections: Relation<Election>[];
}
