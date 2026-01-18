import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  type Relation,
} from 'typeorm';
import type { Vote } from '../votes/vote.entity';

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
}
