# Score Sort | Digital Report Card

**Offline-First Termly Report Card Generator**

---

## 📋 Overview

**Score Sort** is a clean, fast, and fully **offline** Progressive Web App (PWA) designed for teachers to calculate student scores, generate class rankings, and produce professional termly report cards.

It includes two powerful modules:
- **Subject Calculator** – For subject teachers to compute totals and rankings.
- **Report Generator** – For class teachers to compile full report cards by importing subject data from multiple teachers.

The app works completely offline once installed, making it ideal for schools with limited or unreliable internet.

---

## ✨ Key Features

### Subject Calculator
- Supports both **Junior Secondary (JSS)** and **Senior Secondary (SSS)** scoring systems.
- Automatic total calculation as you type.
- Instant class ranking with ordinal positions (1st, 2nd, 3rd…).
- Displays class average.
- Export subject results as **JSON** files for easy sharing with class teachers.

### Report Generator
- Preloaded subject lists for JSS and SSS.
- **Smart Import System** with **fuzzy name matching** – automatically matches student names even with spelling variations or typos.
- Bio-data section with "sticky" fields (Term, Class, Term Ending, Next Term) that persist between sessions.
- Behavior and Activities rating (A–E scale).
- Automatic grade & remark generation using standard WAEC-style grading.
- Clean, print-optimized report card layout designed to fit neatly on A4 paper.

### General Features
- Fully **offline-capable** Progressive Web App (PWA).
- Installable on phones, tablets, and computers.
- Local storage for saving calculator data and sticky fields.
- Simple teacher login.
- Mobile-friendly responsive design.
- Professional print output with strict A4 formatting.

---

## 🛠️ Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- Progressive Web App (PWA) with Manifest and Service Worker
- LocalStorage for data persistence
- Advanced fuzzy matching algorithm for student name recognition

---

## 📁 Project Structure
/
├── index.html                 # Main entry point
├── styles.css                 # All styling and print styles
├── app.js                     # Core application logic
├── manifest.json              # PWA configuration
├── service-worker.js          # Offline caching logic
├── README.md                  # This documentation
└── icons/
├── icon-192.png
└── icon-512.png


---

## 🚀 How to Use

### 1. Login
- **School ID**: `Admin`
- **Teacher PIN**: `admin`

### 2. Subject Calculator Tab
1. Select **JSS** or **SSS** section.
2. Enter the **Subject Name**.
3. Add student rows and input scores (A1, A2, T1, T2, Exam).
4. Click **Calculate Rankings** to view sorted results.
5. Click **Export Subject Sheet** to save the subject data as a JSON file.

### 3. Report Generator Tab
1. Fill in the student’s **Bio Data**.
2. Select the appropriate **Section** (JSS or SSS) to load subjects.
3. Import multiple subject JSON files exported by subject teachers.
4. Click **Fill In Report Card** – scores will be automatically filled using fuzzy name matching.
5. Complete any missing fields and rate student behavior.
6. Click **Generate Report Card**.
7. Preview and click **Print Report** for a clean A4 printout.

**Tip**: Use **Clear Form (Keep Sticky Data)** to reset student-specific data while preserving Term and Class information.

---

## 📊 Scoring Systems

| Component       | JSS Maximum | SSS Maximum |
|-----------------|-------------|-------------|
| Assignment 1    | 10          | 5           |
| Assignment 2    | 10          | 5           |
| Test 1          | 20          | 10          |
| Test 2          | 20          | 10          |
| Examination     | 40          | 70          |
| **Total**       | **100**     | **100**     |

---

## 🎓 Grading Scale

| Score Range | Grade | Remark      |
|-------------|-------|-------------|
| 75–100      | A1    | EXCELLENT   |
| 70–74       | B2    | VERY GOOD   |
| 65–69       | B3    | GOOD        |
| 60–64       | C4    | CREDIT      |
| 55–59       | C5    | CREDIT      |
| 50–54       | C6    | CREDIT      |
| 45–49       | D7    | PASS        |
| 40–44       | E8    | PASS        |
| 0–39        | F9    | FAIL        |

---

## 🔍 Smart Import Features

- Supports importing multiple JSON files at once.
- **Fuzzy matching** intelligently handles spelling mistakes, swapped letters, and partial names.
- Automatically populates scores, class average, and subject position.

---

## 📱 PWA Features

- Installable on any device (Add to Home Screen).
- Works 100% offline.
- Fast loading and smooth performance.
- Automatic update handling via service worker.

---

## 🧹 Data Persistence

- Subject calculator data is automatically saved.
- Sticky bio fields (Term, Class, Term Ending, Next Term) persist across sessions.
- All other data is cleared when switching students or using the clear button.

---

## 🔐 Default Login Credentials

- **School ID**: `Admin`
- **Teacher PIN**: `admin`

You can change these credentials by editing the login logic in `app.js`.

---

## 🖨️ Printing Tips

- For best results, use **Google Chrome**.
- Always use the **Print Report** button in the report card view.
- The layout is carefully optimized to fit on a single A4 page.

---

## 🛠️ Customization Guide

### Changing School Information
Update the school name, address, and logo directly in `index.html` (in the report card section).

### Adding or Removing Subjects
Edit the `JSS_SUBJECTS` and `SSS_SUBJECTS` arrays in `app.js`.

### Modifying Login Credentials
Update the condition inside the login button event listener in `app.js`.

### Updating Icons / Manifest
Replace the icons in the `icons/` folder and update `manifest.json` accordingly.

---

## 📄 License

**This software is a proprietary blueprint/template.**

It is publicly available on my GitHub repository **solely for portfolio purposes** to demonstrate my frontend development and web application skills.

- **Commercial Use**: Not permitted without explicit permission.
- **Customization**: I provide paid customization services for schools and clients who want a tailored version of this application (with their school name, logo, subjects, grading system, etc.).
- **Redistribution**: You may not redistribute or resell this codebase.

If you're interested in a customized version for your school or institution, feel free to reach out.

---

**Score Sort** – Making academic reporting faster, smarter, and paperless.

---

**Ready to use!**