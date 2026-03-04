# 📺 Live Queue — Prompt การทำงาน

## 🎯 ภาพรวมโปรเจกต์
ระบบจองคิวไลฟ์รายสัปดาห์ สำหรับจัดการตารางการไลฟ์สดของ MC
สร้างด้วย Next.js + Supabase และ deploy บน Vercel

---

## 🌐 ลิงก์สำคัญ

| ชื่อ | URL |
|------|-----|
| **แอปออนไลน์** | https://live-queue-4kr9kn6i6-niwattiktokads-debugs-projects.vercel.app |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/zgyxopbrqnuuiaxhrabc |
| **GitHub Repository** | https://github.com/niwattiktokads-debug/live-queue |
| **โค้ดบนเครื่อง** | ~/Desktop/live-queue |

---

## 🔑 Username / Password

### Admin
| Username | Password |
|----------|----------|
| `admin` | `admin1234` |

### MC ทั้งหมด
| ชื่อ | Username | Password |
|------|----------|----------|
| คุณนิดยา | `nidya` | `1234` |
| คุณมิ้น | `min` | `1234` |
| คุณการ์ตูน | `cartoon` | `1234` |
| คุณแอน | `ann` | `1234` |
| คุณฟ้าใส | `fahsai` | `1234` |
| คุณฝน | `fon` | `1234` |

---

## 🗄️ โครงสร้างฐานข้อมูล (Supabase)

### Table: `mc_list`
| Column | Type | คำอธิบาย |
|--------|------|----------|
| id | serial PK | รหัส MC |
| name | text | ชื่อ MC |
| size | text | ไซส์เสื้อ (S/M/L/XL/2XL) |
| rate | text | ราคา/ชม |
| time | text | เวลาทำงาน |
| note | text | หมายเหตุ |
| color | text | สี hex |
| username | text unique | username สำหรับ login |
| password | text | password |

### Table: `bookings`
| Column | Type | คำอธิบาย |
|--------|------|----------|
| id | uuid PK | รหัสการจอง |
| slot_key | text unique | key ของ slot (เช่น 2026-03-04_slot2) |
| name | text | ชื่อผู้จอง |
| mc | text | ชื่อ MC ที่เลือก |
| size | text | ไซส์เสื้อ |
| day | text | วัน (จันทร์-อาทิตย์) |
| time_slot | text | ช่วงเวลา |
| date | text | วันที่ (d/m) |
| booked_by | text | ผู้ที่กดจอง |
| created_at | timestamp | เวลาที่จอง |

---

## 📁 โครงสร้างโปรเจกต์

```
live-queue/
├── app/
│   ├── page.tsx        ← หน้าหลักทั้งหมด (Login + UI)
│   ├── layout.tsx      ← Layout
│   └── globals.css     ← CSS
├── lib/
│   └── supabase.ts     ← Supabase client + functions ทั้งหมด
├── .env.local          ← API Keys (ไม่ขึ้น GitHub)
└── package.json
```

---

## ⚙️ ฟีเจอร์ทั้งหมด

### 👤 สำหรับ MC (Login ด้วย username/password ของตัวเอง)
- ดูตารางไลฟ์รายสัปดาห์
- จองคิวไลฟ์ได้สูงสุด 2 ครั้ง/วัน และ 14 ครั้ง/สัปดาห์
- ดูรายชื่อ MC ทั้งหมด
- ดูการจองของตัวเอง + ยกเลิกได้

### 👑 สำหรับ Admin (admin / admin1234)
- ทุกอย่างที่ MC ทำได้
- **จัดการ MC**: เพิ่ม / แก้ไข / ลบ MC (รวมถึง username/password)
- **ดู Login ทั้งหมด**: เห็น username/password ของทุกคน
- **จัดการการจอง**: ดู/ลบการจองของทุกคน + ล้างทั้งหมด
- คลิกสล็อตที่จองแล้วเพื่อดูรายละเอียด/ยกเลิกได้

---

## 🚀 วิธี Deploy อัปเดต

เมื่อแก้ไขโค้ดบนเครื่องแล้ว ให้ทำดังนี้:

1. เปิด **GitHub Desktop**
2. เขียน Summary ในช่อง "Summary (required)"
3. กด **"Commit to main"**
4. กด **"Push origin"**
5. Vercel จะ **auto-deploy อัตโนมัติ** ภายใน 1-2 นาที

---

## 🛠️ วิธีแก้ไขข้อมูลโดยตรง

### แก้ข้อมูล MC / การจอง
ไปที่ → https://supabase.com/dashboard/project/zgyxopbrqnuuiaxhrabc/editor

### แก้ไข Admin Password (ปัจจุบัน)
แก้ในไฟล์ `app/page.tsx` บรรทัด:
```typescript
const ADMIN = { username:"admin", password:"admin1234", ... }
```

---

## 🔧 Tech Stack

| เทคโนโลยี | เวอร์ชัน | การใช้งาน |
|-----------|---------|----------|
| Next.js | 16.x | Framework หลัก |
| TypeScript | - | ภาษาที่ใช้เขียนโค้ด |
| Tailwind CSS | - | Styling |
| Supabase | - | ฐานข้อมูล (PostgreSQL) |
| Vercel | - | Hosting / Deploy |
| GitHub | - | เก็บโค้ด |

---

## 📝 หมายเหตุสำคัญ

- ตารางจะแสดง **สัปดาห์ถัดไปเสมอ** (จันทร์-อาทิตย์)
- `slot_key` = `{วันที่}_slot{index}` เช่น `2026-03-09_slot0`
- Admin password ปัจจุบัน **hardcoded** ในโค้ด (อยู่ระหว่างพัฒนาระบบเปลี่ยนได้ในแอป)
- ไฟล์ `.env.local` **ไม่ขึ้น GitHub** เพื่อความปลอดภัย

---

*อัปเดตล่าสุด: มีนาคม 2026*
