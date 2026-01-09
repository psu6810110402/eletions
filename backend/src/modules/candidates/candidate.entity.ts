import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, type Relation } from 'typeorm';
import type { Election } from '../elections/election.entity';
import type { Vote } from '../votes/vote.entity';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  image: string; // URL or path to image

  @Column({ type: 'text', nullable: true })
  policy: string;

  @ManyToOne('Election', 'candidates')
  election: Relation<Election>;

  @Column()
  electionId: number;

  @OneToMany('Vote', 'candidate')
  votes: Relation<Vote>[];
}