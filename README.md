# Organization E-Voting System

ระบบเลือกตั้งออนไลน์สำหรับองค์กร

## โครงสร้างโปรเจกต์ (Structure)

- `backend/`: ระบบหลังบ้าน (NestJS API)
- `frontend/`: ระบบหน้าบ้าน (Vite + React + TS)

## วิธีการรันโปรเจกต์ (How to run)

### 1. โคลนโปรเจกต์ (Clone Project)

```bash
git clone https://github.com/psu6810110402/eletions.git
cd eletions
```

### 2. ติดตั้งไลบรารี (Install Dependencies)

```bash
npm run install:all
```

### 3. ตั้งค่า Environment Variables

คัดลอกไฟล์ตัวอย่างเพื่อสร้างไฟล์ `.env` สำหรับใช้งานจริง:

**Backend:**
Copy ไฟล์ `backend/.env.example` ไปเป็น `backend/.env`

```bash
cd backend
cp .env.example .env
cd ..
```

**Frontend:**
Copy ไฟล์ `frontend/.env.example` ไปเป็น `frontend/.env`

```bash
cd frontend
cp .env.example .env
cd ..
```

### 4. เปิดฐานข้อมูล (Start Database)

โปรเจกต์นี้ใช้ PostgreSQL ผ่าน Docker:

```bash
docker-compose up -d
```

### 5. รันโปรเจกต์ (Run Project)

รันทั้ง frontend และ backend พร้อมกัน:

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
