# 🎓 TRIBAL SAARTHI
### AI-Enabled Scholarship & Fellowship Management System for Scheduled Tribes
**Smart India Hackathon (SIH) &bull; Problem Statement ID: 26239 &bull; Ministry of Tribal Affairs (MoTA)**

---

## 📌 Overview

**TRIBAL SAARTHI** is an end-to-end, AI-powered digital platform engineered to transform the scholarship and fellowship lifecycle for Scheduled Tribe (ST) students across India. 

The platform tackles critical challenges in traditional scholarship administration: document fraud, duplicate claims, arbitrary scrutiny, bureaucratic delays, and non-transparent disbursals. By embedding document intelligence (OCR & anomaly detection), a dynamic rule engine, composite merit ranking, and Aadhaar Payment Bridge (APBS) DBT reconciliation into a single unified portal, Tribal Saarthi ensures that statutory educational benefits reach genuine beneficiaries with speed and transparency.

---

## 🌟 Key Features

### 1. 📝 10-Step Smart Application Wizard
- **Guided Step-by-Step Experience**: Progressively captures personal, socio-demographic, educational, and DBT bank account details.
- **Simulated Document Upload & OCR Preview**: Automatically extracts data from certificates (Caste, Income, Bonafide, Marksheet) and populates fields with real-time confidence scores.
- **Aadhaar e-KYC & Domicile Integration**: Masked identity verification compliant with UIDAI regulations.

### 2. 🔍 Officer Scrutiny & AI-Assisted Verification
- **Dual Queues**: Separates applications into *AI Fast-Track (High Confidence)* and *Manual Scrutiny Required (Discrepancies / Anomalies)*.
- **Side-by-Side Review**: Officers view original document scans alongside extracted values and automated discrepancy flags.
- **Deficiency Management**: Officers can raise targeted deficiency remediation notices directly to students with automated SMS/portal alerts.

### 3. ⚖️ Selection Board Merit Scoring
- **Multi-Factor Composite Score (100 Marks)**:
  - Academic Excellence (40%)
  - Research / Premier Institute Weight (20%)
  - Scheme Priority Alignment (20%)
  - Socio-Economic Vulnerability / PVTG Weight (20%)
- **State & Gender Quotas**: Real-time allocation monitoring and statutory sanction order generation.

### 4. 💳 Direct Benefit Transfer (DBT) via APBS / PFMS
- **Aadhaar Payment Bridge System (APBS)**: Automated batch dispatches directly to Aadhaar-seeded primary bank accounts.
- **Synthetic RBI UTR Generation**: Produces verifiable reference numbers (`RBI2026...`) upon batch execution.
- **Real-Time Notification**: Instant SMS & portal alerts dispatched to beneficiaries upon credit confirmation.

### 5. 🛠️ Dynamic Scheme Rule Engine & Immutable Audit Ledger
- **No-Code Rule Builder**: Administrators can modify scheme parameters (income ceilings, minimum percentages, allowed education levels) on the fly without code deployments.
- **Built-in Sandbox Test Runner**: Test hypothetical student profiles against active rules before publishing.
- **Immutable Audit Trail**: Cryptographic SHA-256 logs recording every sensitive state transition, officer ID, and timestamp.

### 6. 🌐 Inclusive Accessibility & Compliance
- **WCAG 2.1 AA Compliant**: Font scaling controls (`A-`, `A`, `A+`), High-Contrast dark mode toggle, and reduced motion options.
- **Trilingual Localization**: Native support for **English (EN)**, **Hindi (HI)**, and **Marathi (MR)**.
- **DPDP Act 2023 Alignment**: Aadhaar Data Vault masking, purpose limitation, and data minimization.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (running locally on port `27017` or MongoDB Atlas connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/tribal-saarthi.git
cd tribal-saarthi
```

### 2. Install Dependencies
Install dependencies across root, server, and client in one command:
```bash
npm run install:all
```
*(Or install separately: `npm install`, `cd server && npm install`, `cd ../client && npm install`)*

### 3. Configure Environment Variables
Verify or create `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/tribal_saarthi
JWT_SECRET=tribal_saarthi_sih_2026_jwt_secret_key_secure
AI_MODE=demo
OCR_MODE=demo
CLIENT_URL=http://localhost:5173
```

### 4. Seed Database (Optional / Recommended)
Pre-populate the database with 67 user accounts, 5 national ST schemes, and 75 lifecycle applications:
```bash
npm run seed
```

### 5. Run the Full-Stack Application
```bash
npm run dev
```
- **Frontend Portal**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## ⚡ SIH Judge Demo Hub (`/demo`)

Visit **[http://localhost:5173/demo](http://localhost:5173/demo)** to test the live evaluation suite. 

You can switch between any of the **6 Pre-Configured Personas** with a single click without typing credentials:

| Persona | Name | Email | Password | Role / Access Area |
|---|---|---|---|---|
| **Applicant Student** | Rahul Kumar | `applicant@demo.com` | `demo123` | Student Dashboard, Apply Wizard, Track Status |
| **Verification Officer** | Dr. Rameshwar Oraon | `verifier@demo.com` | `demo123` | Priority Queues, Side-by-Side OCR Scrutiny |
| **Scrutiny Officer** | Smt. Anandi Soren | `scrutiny@demo.com` | `demo123` | Anomaly Audits, Deficiency Orders |
| **Selection Committee** | Prof. Arjun Munda | `committee@demo.com` | `demo123` | Candidate Scoring, Quotas, Sanction Orders |
| **Finance / DBT Officer** | Shri Sanjeev Kumar | `finance@demo.com` | `demo123` | PFMS / APBS Batch Disbursals, UTR Generation |
| **System Administrator** | MoTA Admin | `admin@demo.com` | `demo123` | Operations Analytics, Rule Engine, Audit Trail |

---

## 📁 Repository Structure

```
tribal-saarthi/
├── client/                     # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/common/  # Header, Footer, ProtectedRoute, CommandPalette
│   │   ├── context/            # AuthContext, AccessibilityContext, NotificationContext
│   │   ├── pages/              # 22 Full-Featured Application Pages
│   │   ├── services/           # Axios API Client with JWT Interceptors
│   │   ├── utils/              # Currency/Date formatters & Trilingual dictionaries
│   │   ├── App.jsx             # Central Route Registry
│   │   ├── main.jsx            # React 18 Root Entrypoint
│   │   └── index.css           # Tailwind CSS & WCAG Accessibility Classes
│   ├── index.html              # HTML5 Shell with Google Fonts & Meta Tags
│   ├── tailwind.config.js      # Custom Theme Colors & GovTech Design Tokens
│   └── vite.config.js          # Vite Server & API Reverse Proxy Configuration
│
├── server/                     # Node.js + Express Backend API
│   ├── config/                 # MongoDB Mongoose Connection
│   ├── controllers/            # 10 Controller Modules handling business logic
│   ├── middleware/             # JWT Authentication & Role Authorization Guards
│   ├── models/                 # 14 Mongoose Data Schemas (Schemes, Users, Applications, etc.)
│   ├── routes/                 # 12 Modular REST API Route Handlers
│   ├── seed/                   # Comprehensive Seed Runner (seedRunner.js)
│   ├── services/               # AI OCR, Eligibility Evaluator & Anomaly Detectors
│   │   └── ai/                 # Rule engine, OCR simulations, and fraud detectors
│   └── server.js               # Express Server Initialization & Middleware Stack
│
├── .gitignore                  # Git Ignore rules for node_modules, builds & .env
├── package.json                # Root Concurrently Scripts
└── README.md                   # Project Documentation
```

---

## 🏛️ Supported MoTA Schemes (Pre-Seeded)

1. **Pre-Matric Scholarship for ST Students (Class 9 & 10)**
2. **Post-Matric Scholarship for Scheduled Tribe Students (PMS-ST)**
3. **National Fellowship for Higher Education of ST Students (NFST - M.Phil / Ph.D)**
4. **National Overseas Scholarship for ST Candidates (NOS)**
5. **Scholarship for Top Class Education for ST Students in Premier Institutes**

---

## 🛡️ Security & Privacy Architecture

- **Aadhaar Data Vault**: Masked UID tokens (`XXXX-XXXX-8921`) to comply with UIDAI guidelines.
- **SHA-256 Hashing**: Cryptographic file checksums to detect document tampering and duplicate submissions.
- **Role-Based Access Control (RBAC)**: Strict JWT-enforced endpoint barriers.
- **DPDP Act 2023 Aligned**: Data minimization, purpose limitation, and consent-driven workflow.

---

## ⚖️ License & Notice

Developed for **Smart India Hackathon (SIH 2026)** under the Ministry of Tribal Affairs (MoTA).  
All candidate names, Aadhaar numbers, and bank account numbers are synthetic demo data.
