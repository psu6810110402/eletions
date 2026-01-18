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
  // Start Automate When You Start Browser
  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    console.log('Seed: Starting database initialization...');

    // 1. Create Admin
    const adminExists = await this.usersRepository.findOne({
      where: { username: 'admin' },
    });
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
    const studentCount = await this.usersRepository.count({
      where: { role: UserRole.VOTER },
    });
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
    let election = await this.electionsRepository.findOne({
      where: { title: 'เลือกตั้งประธานนักเรียน 2026' },
    });
    if (!election) {
      election = this.electionsRepository.create({
        title: 'เลือกตั้งประธานนักเรียน 2026',
        status: ElectionStatus.ONGOING,
      });
      election = await this.electionsRepository.save(election);
      console.log('Seed: Election created.');
    } else {
      console.log('Seed: Election already exists.');
    }

    // 4. Create or Update Sample Candidates
    const candidatesData = [
      {
        name: 'นายดาวเหนือใจหล่อ',
        image:
          'https://api.dicebear.com/7.x/personas/svg?seed=daonue&backgroundColor=b6e3f4',
        policy:
          '🎓 เพิ่มทุนการศึกษา 50 ทุน | 📚 ปรับปรุงห้องสมุดให้ทันสมัย | 🏃 จัดกิจกรรมกีฬาสัมพันธ์ทุกเดือน',
      },
      {
        name: 'นางสาวแก้มใสใจดี',
        image:
          'https://api.dicebear.com/7.x/personas/svg?seed=kaemsai&backgroundColor=ffd5dc',
        policy:
          '🌱 โครงการโรงเรียนสีเขียว | 🍱 อาหารกลางวันฟรีสำหรับทุกคน | 🎨 เพิ่มชมรมศิลปะและดนตรี',
      },
      {
        name: 'นายฟ้าใสหัวใจเกินร้อย',
        image:
          'https://api.dicebear.com/7.x/personas/svg?seed=fasai&backgroundColor=c0aede',
        policy:
          '💻 Wi-Fi ฟรีทั่วโรงเรียน | 🎮 เพิ่ม E-Sports Club | 📱 แอปติดตามการเรียนสำหรับทุกคน',
      },
      {
        name: 'นางสาวหมิวมิ้นท์สดใส',
        image:
          'https://api.dicebear.com/7.x/personas/svg?seed=mewmint&backgroundColor=d1d4f9',
        policy:
          '🎪 เทศกาลวัฒนธรรมประจำปี | 🌍 โครงการแลกเปลี่ยนนักเรียนต่างประเทศ | 🧘 ห้องพักผ่อนสำหรับนักเรียน',
      },
    ];

    for (const data of candidatesData) {
      let candidate = await this.candidatesRepository.findOne({
        where: { name: data.name, electionId: election.id },
      });

      if (candidate) {
        // Update existing candidate with image and policy
        candidate.image = data.image;
        candidate.policy = data.policy;
        await this.candidatesRepository.save(candidate);
        console.log(`Seed: Updated candidate "${data.name}".`);
      } else {
        // Create new candidate
        candidate = this.candidatesRepository.create({
          ...data,
          electionId: election.id,
        });
        await this.candidatesRepository.save(candidate);
        console.log(`Seed: Created candidate "${data.name}".`);
      }
    }

    console.log('Seed: Initialization check complete.');

    // Diagnostic logs
    const finalUserCount = await this.usersRepository.count();
    const finalElectionCount = await this.electionsRepository.count();
    const finalCandidateCount = await this.candidatesRepository.count();
    console.log(
      `DIAGNOSTIC: Users=${finalUserCount}, Elections=${finalElectionCount}, Candidates=${finalCandidateCount}`,
    );

    if (finalElectionCount > 0) {
      const elections = await this.electionsRepository.find();
      console.log('First Election Status:', elections[0].status);
    }
  }
}
