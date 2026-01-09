import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './modules/users/user.entity';
import { Election, ElectionStatus } from './modules/elections/election.entity';
import { Candidate } from './modules/candidates/candidate.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Election)
    private electionsRepository: Repository<Election>,
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    console.log('Seed: Starting database initialization...');

    // 1. Create Admin
    const adminExists = await this.usersRepository.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = this.usersRepository.create({
        username: 'admin',
        password: hashedPassword,
        role: UserRole.ADMIN,
        userType: 'Staff',
      });
      await this.usersRepository.save(admin);
      console.log('Seed: Admin created.');
    } else {
      console.log('Seed: Admin already exists.');
    }

    // 2. Create 20 Students
    const studentCount = await this.usersRepository.count({ where: { role: UserRole.VOTER } });
    if (studentCount === 0) {
      const studentPassword = await bcrypt.hash('student123', 10);
      const students = [];
      for (let i = 1; i <= 20; i++) {
        students.push(
          this.usersRepository.create({
            username: `std${i.toString().padStart(3, '0')}`,
            password: studentPassword,
            role: UserRole.VOTER,
            userType: 'Student',
          }),
        );
      }
      await this.usersRepository.save(students);
      console.log('Seed: 20 Students created.');
    } else {
      console.log(`Seed: Students already exist (${studentCount} found).`);
    }

    // 3. Create Sample Election
    const electionExists = await this.electionsRepository.findOne({ where: { title: 'เลือกตั้งประธานนักเรียน 2026' } });
    if (!electionExists) {
      const election = this.electionsRepository.create({
        title: 'เลือกตั้งประธานนักเรียน 2026',
        status: ElectionStatus.ONGOING,
      });
      const savedElection = await this.electionsRepository.save(election);

      // 4. Create Sample Candidates (only if election was just created)
      const candidates = [
        this.candidatesRepository.create({ name: 'นายดาวเหนือใจหล่อ', electionId: savedElection.id }),
        this.candidatesRepository.create({ name: 'นางสาวแก้มใสใจดี', electionId: savedElection.id }),
      ];
      await this.candidatesRepository.save(candidates);
      console.log('Seed: Election and Candidates created.');
    } else {
      console.log('Seed: Election already exists.');
    }

    console.log('Seed: Initialization check complete.');
    
    // Diagnostic logs
    const finalUserCount = await this.usersRepository.count();
    const finalElectionCount = await this.electionsRepository.count();
    const finalCandidateCount = await this.candidatesRepository.count();
    console.log(`DIAGNOSTIC: Users=${finalUserCount}, Elections=${finalElectionCount}, Candidates=${finalCandidateCount}`);
    
    if (finalElectionCount > 0) {
       const elections = await this.electionsRepository.find();
       console.log('First Election Status:', elections[0].status);
    }
  }
}
