import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  type Relation,
} from 'typeorm';
import type { Candidate } from '../candidates/candidate.entity';
import type { Vote } from '../votes/vote.entity';
import type { User } from '../users/user.entity';

export enum ElectionStatus {
  DRAFT = 'DRAFT',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

@Entity('elections')
export class Election {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: ElectionStatus,
    default: ElectionStatus.DRAFT,
  })
  status: ElectionStatus;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @OneToMany('Candidate', 'election')
  candidates: Relation<Candidate>[];

  @OneToMany('Vote', 'election')
  votes: Relation<Vote>[];

  @ManyToMany('User', 'eligibleElections')
  @JoinTable({
    name: 'election_eligible_voters',
    joinColumn: { name: 'electionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  eligibleVoters: Relation<User>[];
}
