# Organization E-Voting System

ระบบเลือกตั้งออนไลน์สำหรับองค์กร (Organization E-Voting System) เป็นเว็บแอปพลิเคชันแบบ Full Stack ที่พัฒนาขึ้นเพื่อให้องค์กรสามารถจัดการกระบวนการเลือกตั้งได้อย่างมีประสิทธิภาพ โปร่งใส และตรวจสอบได้

## 🚀 Features

### สำหรับผู้ดูแลระบบ (Admin)

- สร้าง แก้ไข และลบการเลือกตั้ง
- จัดการผู้สมัครรับเลือกตั้ง
- กำหนดผู้มีสิทธิ์ลงคะแนน
- ดูผลคะแนนและส่งออกเป็นไฟล์ CSV

### สำหรับผู้ลงคะแนน (Voter)

- ลงคะแนนเสียงให้ผู้สมัคร
- เลือก "ไม่ประสงค์ลงคะแนน" (Vote No)
- ดูผลคะแนนหลังลงคะแนนแล้ว

### ระบบความปลอดภัย

- การยืนยันตัวตนด้วย JWT (JSON Web Token)
- เข้ารหัสรหัสผ่านด้วย bcrypt
- ป้องกันการลงคะแนนซ้ำ
- แยกสิทธิ์ Admin/Voter ทั้งหน้าบ้านและหลังบ้าน

## 🛠️ Tech Stack

| ส่วน               | เทคโนโลยี                 |
| ------------------ | ------------------------- |
| **Frontend**       | React + TypeScript + Vite |
| **Backend**        | NestJS + TypeORM          |
| **Database**       | PostgreSQL (Docker)       |
| **Authentication** | JWT + Passport            |

## 📁 โครงสร้างโปรเจกต์

```
eletions/
├── backend/          # NestJS API Server
│   └── src/
│       └── modules/
│           ├── auth/        # Authentication & Authorization
│           ├── users/       # User Management
│           ├── elections/   # Election Management
│           ├── candidates/  # Candidate Management
│           ├── votes/       # Voting System
│           └── stats/       # Statistics & Export
├── frontend/         # React + Vite Client
│   └── src/
│       ├── pages/       # Page Components
│       ├── components/  # Reusable Components
│       ├── contexts/    # React Context (Auth)
│       └── types/       # TypeScript Interfaces
└── docker-compose.yml
```

## 🚀 วิธีการรันโปรเจกต์

### 1. Clone โปรเจกต์

```bash
git clone https://github.com/psu6810110402/eletions.git
cd eletions
```

### 2. ติดตั้ง Dependencies

```bash
npm run install:all
```

### 3. ตั้งค่า Environment Variables

**Backend:**

```bash
cp backend/.env.example backend/.env
```

**Frontend:**

```bash
cp frontend/.env.example frontend/.env
```

### 4. เปิดฐานข้อมูล (Docker)

```bash
docker-compose up -d
```

### 5. รันโปรเจกต์

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

## 👤 บัญชีทดสอบ

| Role  | Username | Password   |
| ----- | -------- | ---------- |
| Admin | admin    | admin123   |
| Voter | std001   | student123 |

## 📊 Database Schema

ระบบประกอบด้วย 4 ตารางหลัก:

- **users** - ข้อมูลผู้ใช้งาน
- **elections** - ข้อมูลการเลือกตั้ง
- **candidates** - ข้อมูลผู้สมัคร
- **votes** - ข้อมูลการลงคะแนน

พร้อมความสัมพันธ์:

- One-to-Many: Elections → Candidates, Elections → Votes
- Many-to-Many: Users ↔ Elections (Eligible Voters)

## 📝 License

This project is for educational purposes.

---

**จัดทำโดย:** นายอภิชาติ จะหย่อ (6810110402)

**รายวิชา:** 240-124 Web Designer and Developer Module
