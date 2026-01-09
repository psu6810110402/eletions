import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, type Relation } from 'typeorm';
import type { User } from '../users/user.entity';
import type { Election } from '../elections/election.entity';
import type { Candidate } from '../candidates/candidate.entity';

@Entity('votes')
@Unique(['userId', 'electionId'])
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('User', 'votes')
  user: Relation<User>;

  @Column()
  userId: number;

  @ManyToOne('Election', 'votes')
  election: Relation<Election>;

  @Column()
  electionId: number;

  @ManyToOne('Candidate', 'votes', { nullable: true })
  candidate: Relation<Candidate>;

  @Column({ nullable: true })
  candidateId: number;

  @Column({ default: false })
  isVoteNo: boolean;
}
