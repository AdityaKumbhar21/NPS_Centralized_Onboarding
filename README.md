
<p align="center">
  <img src="https://img.shields.io/badge/NPS-One%20Nation%20One%20Onboarding-1e40af?style=for-the-badge&labelColor=0f172a" alt="NPS Banner" />
</p>

<h1 align="center">🏦 NPS Centralized Digital Onboarding Platform</h1>

<p align="center">
  <strong>A secure, scalable, event-driven onboarding engine for National Pension System subscribers</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis" />
  <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=flat-square&logo=rabbitmq" />
  <img src="https://img.shields.io/badge/AWS_S3-232F3E?style=flat-square&logo=amazonaws" />
  <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens" />
</p>

---

# 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [System Architecture](#-system-architecture)
- [User Journey](#-user-journey)
- [Key Features](#-key-features)
- [Security & Compliance](#-security--compliance)
- [Event-Driven Architecture](#-event-driven-architecture)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Evaluation Criteria Compliance](#-evaluation-criteria-compliance)

---

# 🎯 Problem Statement

National Pension System onboarding today is fragmented across multiple intermediaries:

- Central Recordkeeping Agencies (CRAs)
- Points of Presence (PoPs)
- Pension Fund Managers (PFMs)
- KYC providers

This leads to:

| Challenge | Impact |
|------------|--------|
| Manual document handling | High friction |
| Multiple verification layers | User drop-offs |
| No centralized audit trail | Compliance gaps |
| Disconnected intermediaries | Slow onboarding |
| Limited user visibility | Low trust |

> The goal: Build a seamless, secure, centralized, digital onboarding solution for NPS.

---

# 💡 Our Solution

We built a **Centralized Digital Onboarding Engine for NPS** that integrates:

```

Mobile OTP
↓
Aadhaar OTP Verification
↓
PAN Validation
↓
Video KYC
↓
Profile Completion
↓
PFM Selection
↓
Online Contribution
↓
PRAN Generation
↓
Admin Monitoring & Analytics

```

All within one secure, scalable platform.

---

# 🏗 System Architecture

```

┌───────────────────────────────┐
│        FRONTEND (React)       │
│  Step-based Onboarding Wizard │
│  JWT Authentication           │
│  Video KYC Simulation         │
└───────────────┬───────────────┘
│ REST API
▼
┌────────────────────────────────────────────┐
│                EXPRESS BACKEND             │
│                                            │
│  🔐 Auth Service       → Redis OTP        │
│  🪪 KYC Service        → Aadhaar & PAN    │
│  📹 Video KYC Service  → Session tracking │
│  📁 Document Service   → AWS S3           │
│  💳 Payment Service    → Gateway Ready    │
│  📡 Event Service      → RabbitMQ         │
│  📊 Analytics Service  → Admin Metrics    │
│                                            │
└───────────────┬────────────────────────────┘
▼
PostgreSQL (Prisma ORM)

```

---

# 🚀 User Journey

## 1️⃣ Mobile Authentication
- User enters mobile number
- OTP stored in Redis (5-minute expiry)
- Bcrypt hashed OTP
- JWT access & refresh tokens issued

---

## 2️⃣ Aadhaar Verification
- User enters Aadhaar number
- OTP sent to Aadhaar-linked mobile (Demo: 9999999999)
- Verified → KYC status updated

---

## 3️⃣ PAN Verification
- PAN validated
- Name consistency check
- KYC status progressed

---

## 4️⃣ Video KYC
- Session created in DB
- 5-second face verification simulation
- Status approved
- Event emitted

---

## 5️⃣ Profile Completion
- Father name
- Occupation
- Income
- Nominee details

---

## 6️⃣ PFM Selection
- Compare available PFMs
- Choose allocation (E/C/G/A)
- Save selection

---

## 7️⃣ Payment & Contribution
- Contribution initiated
- Payment webhook verified
- Payment stored

---

## 8️⃣ PRAN Generation
- PRAN generated (CRA integration mock)
- Stored securely
- Event logged

---

# ✨ Key Features

| Feature | Implementation |
|----------|----------------|
| Secure OTP Authentication | Redis + bcrypt |
| Aadhaar OTP Flow | Simulated UIDAI integration |
| PAN Verification | Name consistency validation |
| Video KYC | Session-based tracking |
| Document Upload | AWS S3 signed URLs |
| Payment Integration | Gateway-ready architecture |
| Event Logging | RabbitMQ |
| Admin Analytics | Real-time metrics |
| Enum-Based State Machine | Strict onboarding progression |

---

# 🔐 Security & Compliance

| Mechanism | Implementation |
|------------|----------------|
| JWT Authentication | Access + Refresh tokens |
| OTP Expiry | Redis TTL |
| Rate Limiting | express-rate-limit |
| AES Encryption | Sensitive fields encrypted |
| Encrypted S3 Storage | Secure document paths |
| Enum-based KYC States | Regulatory clarity |
| Webhook Validation | Payment signature verification |
| Audit Logging | Event-based tracking |

---

# 🔁 Event-Driven Architecture

Events emitted during onboarding:

```

USER_REGISTERED
AADHAAR_VERIFIED
PAN_VERIFIED
VIDEO_KYC_COMPLETED
PAYMENT_SUCCESS
PRAN_GENERATED

```

RabbitMQ enables:

- Analytics logging
- Audit trail creation
- Admin dashboard updates
- Future microservice scaling

---

# 🛠 Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Redis
- RabbitMQ
- AWS S3
- JWT
- bcrypt
- express-rate-limit

### Frontend
- React 19
- Tailwind CSS
- Axios
- Framer Motion

---

# 🗄 Database Schema Overview

### Core Models

- User
- Kyc
- UserProfile
- PfmSelection
- Document
- Payment
- VideoKycSession
- AnalyticsEvent
- Consent

### Enums

- OnboardingStep
- KycStatus
- DocumentStatus
- PaymentStatus
- VideoKycStatus

---

# 📡 API Reference

## Auth
- POST `/api/auth/send-otp`
- POST `/api/auth/verify-otp`
- POST `/api/auth/refresh-token`
- POST `/api/auth/logout`

## KYC
- POST `/api/kyc/aadhaar`
- POST `/api/kyc/pan`
- POST `/api/kyc/video/start`
- POST `/api/kyc/video/complete`
- GET `/api/kyc/status`

## User
- POST `/api/user/profile`
- POST `/api/user/address`
- POST `/api/user/nominee`
- GET `/api/user/draft`

## PFM
- GET `/api/pfm/list`
- POST `/api/pfm/select`

## Payment
- POST `/api/payment/initiate`
- POST `/api/payment/webhook`
- POST `/api/payment/generate-pran`

## Admin
- GET `/api/admin/analytics`
- GET `/api/admin/kyc-report`
- GET `/api/admin/dropoffs`

---

# 📁 Project Structure

```

backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middlewares/
│   ├── config/
│   └── utils/
├── prisma/
│   ├── schema.prisma
│   └── seed.js

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── context/

````

---

# 🚀 Getting Started

### Backend Setup

```bash
npm install
npx prisma migrate dev
npm run dev
````

### Start Required Services

```bash
redis-server
rabbitmq-server
```

### Frontend Setup

```bash
npm install
npm run dev
```

---

# 🔐 Environment Variables

```env
DATABASE_URL=
JWT_SECRET=
REFRESH_SECRET=
REDIS_URL=
RABBITMQ_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
STRIPE_SECRET_KEY=
```

---

# ✅ Evaluation Criteria Compliance

| Requirement                   | Status |
| ----------------------------- | ------ |
| End-to-end digital onboarding | ✅      |
| Simplified KYC                | ✅      |
| Aadhaar & PAN integration     | ✅      |
| Video KYC                     | ✅      |
| Secure document storage       | ✅      |
| API-ready architecture        | ✅      |
| Event-driven logging          | ✅      |
| Admin analytics               | ✅      |
| Scalable infrastructure       | ✅      |

---

<p align="center">
  <strong>NPS Centralized Onboarding Platform</strong><br/>
  <em>Secure. Scalable. Compliant.</em>
</p>

<p align="center">
  <sub>Built for NPS Digital Transformation Initiative · 2026</sub>
</p>

