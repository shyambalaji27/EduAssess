# EduAssess – Online Examination & Assessment Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://eduassess-jo01.onrender.com)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shyambalaji27/EduAssess)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> 🌐 **Live Application URL:** **[https://eduassess-jo01.onrender.com](https://eduassess-jo01.onrender.com)**

---

## 📌 Executive Summary

**EduAssess** is a modern, responsive, client-side **Online Examination and Assessment System** engineered using pure frontend web standards: **HTML5, CSS3, and Vanilla JavaScript**, backed by persistent browser **LocalStorage**.

Built without backend frameworks, servers, or external databases, EduAssess runs entirely client-side while delivering the performance, security separation, proctored interfaces, and analytical depth of enterprise assessment software.

---

## ✨ Key Features & Capabilities

### 🛡️ 1. Administrator Command Center
- **Interactive Overview Dashboard**: Dynamic statistics calculating total students, question bank volume, scheduled & completed examinations, and real-time cohort averages.
- **Visual Analytics Powered by Chart.js**:
  - Subject-wise student performance distribution (Bar Chart).
  - Pass vs. Fail ratio breakdown (Doughnut Chart).
- **Student Directory Management**:
  - Register, edit, search, filter by department/year, and delete student accounts.
  - Inspect individual student assessment history with score breakdowns.
- **Comprehensive Question Bank (200 Questions / 50 per Topic)**:
  - Supports **Multiple Choice Questions (MCQ)**, **True / False**, and **Multiple Select Questions (MSQ)**.
  - Filterable by Subject, Topic, Difficulty (*Easy*, *Medium*, *Hard*), and Marks.
  - Detailed answer keys and educational explanations for self-study.
- **PDF Question Bank Uploader**:
  - Administrators can upload complete `.pdf` question banks, course readers, and syllabus notes.
  - Stored persistently in LocalStorage using the HTML5 `FileReader` API.
- **Exam Management & Scheduling**:
  - Interactive question checklist with live total marks auto-calculation.
  - Customizable time duration, passing thresholds, attempt limits, and availability date/time windows.
  - Status lifecycle: *Draft*, *Scheduled*, *Active*, and *Completed*.
- **Master Examination Reports & Exports**:
  - Comprehensive results ledger with filters by exam, subject, and outcome.
  - **Export to CSV**: In-browser generation of spreadsheet reports.
  - **Answer Sheet Inspector**: Deep inspection modal showing candidate choices vs. correct answers.
- **System Backup & Recovery**:
  - Export system snapshots as JSON files.
  - Restore previous configurations and reset demo data in 1 click.

---

### 🎓 2. Student Examination & Study Portal
- **Open Entry & Flexible Registration**:
  - **Instant Sign-In**: Enter with any existing Student ID or join with **any custom Name & ID** on the fly.
  - **Student Self-Registration**: Direct registration form with custom Name, Student ID, Department, and Password.
  - Pre-seeded test accounts: `STU001` (Alice), `STU002` (Bob), and `STU003` (Charlie).
- **Personalized Candidate Dashboard**:
  - Displays assigned available exams, schedule windows, attempts remaining, and individual average scores.
- **Student Question Bank & PDF Learning Center**:
  - **200 Practice Questions**: Search and study 50 questions per topic with interactive **"💡 Toggle Answer & Explanation"** buttons.
  - **PDF Resource Hub**: In-browser PDF previewer and direct one-click PDF downloads.
- **Proctored Examination Room**:
  - **Continuous Countdown Timer**: Displays `HH:MM:SS` with automatic visual alerts (pulsating red warning under 5 minutes).
  - **5-State Question Palette Grid**:
    - ⚪ **Not Visited** (`#E2E8F0`)
    - 🔴 **Not Answered** (`#EF4444`)
    - 🟢 **Answered** (`#22C55E`)
    - 🟣 **Marked for Review** (`#A855F7`)
    - 🔵 **Answered & Marked for Review** (`#6366F1` with star indicator)
  - Options selector with single-choice radio buttons and multiple-choice checkboxes.
  - "Clear Response" and "Mark for Review" toggles.
  - **Refresh Resilience**: Real-time LocalStorage synchronization preserves candidate answers and timer state across accidental reloads.
  - **Auto-Submission**: Automatically finalizes and submits answers when the timer reaches `00:00:00`.
- **Instant Automatic Evaluation**:
  - Scoring engine accurately evaluates Single Choice, True/False, and strict set-matching for Multiple-Select questions.
  - Formulas: $\text{Percentage} = \left(\frac{\text{Obtained Marks}}{\text{Total Marks}}\right) \times 100$.
- **Individual Student Result Dashboard**:
  - **Strict Privacy**: Students can view only their own scores and attempts.
  - Visual scorecard with large score meter, outcome badge, and timing statistics.
  - Question-by-question review showing candidate answers, correct answers, and explanations.
  - Printable reports with clean print stylesheets (`window.print()`).

---

## 📚 Seeded Question Bank & Featured Subjects

EduAssess is pre-seeded with **200 comprehensive technical questions (50 per subject)**:

| Subject | Question Count | Core Concepts Covered |
| :--- | :---: | :--- |
| **Computer Networks** | **50 Questions** | OSI Model, TCP/UDP, IPv4 Subnetting & CIDR, OSPF, BGP, DNS, HTTP/HTTPS, ARP, VLANs |
| **Cyber Security** | **50 Questions** | CIA Triad, Asymmetric/Symmetric Cryptography, Hash Functions, MITM, SQLi, XSS, WAF, Zero-Day |
| **Database Management Systems** | **50 Questions** | Relational Algebra, Normalization (1NF–BCNF), B+ Tree Indexing, Transactions, ACID, Isolation Levels |
| **Operating Systems** | **50 Questions** | Kernel Architectures, Process Scheduling, Deadlocks, Paging, Virtual Memory, TLB, Page Replacement |

---

## 🔑 Demo Credentials

| Role | Username / ID | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `Admin@123` | Full Administrative Dashboard & Question Repository |
| **Student 1** | `STU001` | `Student@123` | Alice Smith (Computer Science, 3rd Year) |
| **Student 2** | `STU002` | `Student@123` | Bob Johnson (Information Technology, 2nd Year) |
| **Student 3** | `STU003` | `Student@123` | Charlie Brown (Electrical Engineering, 1st Year) |
| **Custom Student** | *Any ID* (e.g. `AKASH01`) | *Any Password* | Auto-creates profile on first login |

---

## 🏗️ Folder Structure

```text
Online-Examination-System/
│
├── index.html                 # Modern academic SaaS landing page
├── admin-login.html           # Administrator login with demo autofill
├── student-login.html         # Student portal login with instant open entry
├── admin-dashboard.html       # Admin control center, stats & Chart.js graphs
├── student-dashboard.html     # Student dashboard, exam catalog & recent results
├── student-questions.html     # Student practice question bank & PDF hub
├── question-bank.html         # Admin question authoring (200 Qs) & PDF uploader
├── exam-management.html       # Scheduling, attempt limits & live marks calculator
├── exam-instructions.html     # Pre-exam briefing & honor code terms agreement
├── take-exam.html             # Proctored exam room, timer & 5-state question palette
├── student-results.html       # Individual scorecards, question review & explanations
├── admin-results.html         # Master results report, CSV export & answer inspector
├── profile.html               # Student / Admin profile & password settings
├── render.yaml                # Render static site deployment blueprint
├── README.md                  # Comprehensive architectural documentation
│
├── css/
│   ├── style.css              # Design system, CSS variables, dark mode, toast alerts
│   ├── dashboard.css          # Sidebar layout, metric cards, data tables, charts
│   ├── exam.css               # Exam interface, timer warning alerts, question palette
│   └── responsive.css         # Breakpoints (<1024px, <768px, <480px) & print styles
│
└── js/
    ├── questions-data.js      # Dataset of 200 questions (50 per subject)
    ├── storage.js             # Centralized LocalStorage CRUD, seed data & PDF storage
    ├── auth.js                # Session management, route protection & open registration
    ├── admin.js               # Admin analytics, metrics, student management, Chart.js
    ├── student.js             # Student catalog, exam availability & attempt limits
    ├── questions.js           # Question bank CRUD, dynamic options & PDF manager
    ├── exams.js               # Exam scheduler & live marks computation
    ├── timer.js               # Real-time countdown timer with persistence & alerts
    ├── evaluation.js          # Automatic evaluation engine for MCQ, T/F & MSQ
    ├── results.js             # Result analysis, CSV generator & print formatter
    ├── exam-engine.js         # Runtime exam state machine & response synchronizer
    └── app.js                 # Global UI utilities, theme toggle, toast alerts & mobile nav
```

---

## 🛠️ Technology Stack

- **Markup & Semantics**: HTML5 (Accessible forms, semantic layout, iframe PDF viewer)
- **Styling**: CSS3 (Custom CSS properties, Flexbox, Grid, transitions, responsive breakpoints, print media)
- **Logic & State**: Vanilla JavaScript (ES6+, modular architecture, no build tool required)
- **Data Persistence**: Browser `localStorage` (Structured JSON storage, Base64 document encoding)
- **Visualizations**: [Chart.js](https://www.chartjs.org/) (Client-side Canvas charts)
- **Deployment Platform**: [Render](https://render.com) (Static Web Service with Global CDN & SSL)

---

## 🚀 Local Execution

Because EduAssess is 100% serverless, you can run it immediately without installing dependencies:

```bash
# Clone the repository
git clone https://github.com/shyambalaji27/Online-Examination-System.git

# Navigate into the folder
cd Online-Examination-System

# Option A: Simply double-click index.html or open it in any modern browser

# Option B: Run via a lightweight local server
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

---

## 👤 Author

**SHYAMBALAJI S**
- **GitHub**: [@shyambalaji27](https://github.com/shyambalaji27)
- **Repository**: [EduAssess](https://github.com/shyambalaji27/EduAssess)
- **Deployment**: [https://eduassess-jo01.onrender.com](https://eduassess-jo01.onrender.com)
