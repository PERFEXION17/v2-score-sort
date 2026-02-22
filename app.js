// DOM Elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const loginScreen = document.getElementById("login-screen");
const dashboardScreen = document.getElementById("dashboard-screen");
const reportCardScreen = document.getElementById("report-card-screen");

// Tabs
const tabBtnCalc = document.getElementById("tab-btn-calculator");
const tabBtnReport = document.getElementById("tab-btn-report");
const tabCalc = document.getElementById("tab-calculator");
const tabReport = document.getElementById("tab-report");

// Constants
const SUBJECTS = [
  "Mathematics",
  "English",
  "Civic Education",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "Accounting",
  "Economics",
  "Commerce",
  "Agriculture",
  "Creative Art",
  "Computer",
  "CRS",
  "Government",
];

const BEHAVIORS = [
  "NEATNESS",
  "RELATIONSHIP WITH OTHERS",
  "ATTITUDE TO SCHOOL",
  "GENERAL HEALTH",
  "ATTENTIVENESS",
  "EMOTIONAL STABILITY",
  "LEAD/ORGANISE ABILITY",
  "HONESTY",
  "OBEDIENCE",
  "POLITENESS",
];

// --- UTILITY FUNCTIONS ---
function formatName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// --- AUTHENTICATION & LOGOUT ---
loginBtn.addEventListener("click", () => {
  const pin = document.getElementById("teacher-pin").value;
  if (pin === "ADMIN2026") {
    loginScreen.classList.add("hidden");
    dashboardScreen.classList.remove("hidden");
    initReportTab();
    loadCalculatorData();
    loadStickyBioData();
  } else {
    alert("Invalid Access Code");
  }
});

logoutBtn.addEventListener("click", () => {
  if (
    confirm(
      "Are you sure you want to log out? Any unsaved report card data will be lost.",
    )
  ) {
    dashboardScreen.classList.add("hidden");
    loginScreen.classList.remove("hidden");
    document.getElementById("teacher-pin").value = "";
    document.getElementById("school-id").value = "";
    tabCalc.classList.remove("hidden");
    tabReport.classList.add("hidden");
    tabBtnCalc.classList.add("active");
    tabBtnReport.classList.remove("active");
  }
});

// --- TAB SWITCHING ---
tabBtnCalc.addEventListener("click", () => {
  tabCalc.classList.remove("hidden");
  tabReport.classList.add("hidden");
  tabBtnCalc.classList.add("active");
  tabBtnReport.classList.remove("active");
});
tabBtnReport.addEventListener("click", () => {
  tabReport.classList.remove("hidden");
  tabCalc.classList.add("hidden");
  tabBtnReport.classList.add("active");
  tabBtnCalc.classList.remove("active");
});

// --- TAB 1: SUBJECT CALCULATOR ---
const studentInputsContainer = document.getElementById(
  "student-inputs-container",
);

document.getElementById("add-student-row").addEventListener("click", () => {
  addStudentRow();
});

function addStudentRow(name = "", score = "") {
  const row = document.createElement("div");
  row.className = "student-row";
  row.innerHTML = `
        <input type="text" class="calc-name" placeholder="Student Name" value="${name}">
        <input type="number" class="calc-score" placeholder="Score (1-100)" value="${score}" min="1" max="100">
        <button class="danger-btn remove-row">X</button>
    `;
  row
    .querySelector(".remove-row")
    .addEventListener("click", () => row.remove());
  studentInputsContainer.appendChild(row);
}

function getOrdinalSuffix(n) {
  const j = n % 10,
    k = n % 100;
  if (j == 1 && k != 11) return n + "st";
  if (j == 2 && k != 12) return n + "nd";
  if (j == 3 && k != 13) return n + "rd";
  return n + "th";
}

document.getElementById("calculate-rankings").addEventListener("click", () => {
  const subjectName = document.getElementById("subject-name").value;
  const rows = document.querySelectorAll(".student-row");
  let students = [];
  let totalScore = 0;

  rows.forEach((row) => {
    const rawName = row.querySelector(".calc-name").value;
    const name = formatName(rawName);
    const score = parseFloat(row.querySelector(".calc-score").value);

    if (name && !isNaN(score)) {
      students.push({ name, score });
      totalScore += score;
    }
  });

  if (students.length === 0) return alert("Add valid student data.");

  students.sort((a, b) => b.score - a.score);
  let currentRank = 1;
  for (let i = 0; i < students.length; i++) {
    if (i > 0 && students[i].score === students[i - 1].score) {
      students[i].rank = students[i - 1].rank;
    } else {
      currentRank = i + 1;
      students[i].rank = currentRank;
    }
    students[i].position = getOrdinalSuffix(students[i].rank);
  }

  const classAverage = (totalScore / students.length).toFixed(1);

  const dataToSave = { subjectName, classAverage, students };
  localStorage.setItem("scoreSort_SubjectData", JSON.stringify(dataToSave));

  renderRankings(dataToSave);
});

function renderRankings(data) {
  document.getElementById("display-subject-name").innerText =
    data.subjectName || "N/A";
  document.getElementById("display-class-average").innerText =
    data.classAverage;
  const tbody = document.getElementById("ranking-table-body");
  tbody.innerHTML = "";
  data.students.forEach((s) => {
    tbody.innerHTML += `<tr><td>${s.name}</td><td>${s.score}</td><td>${s.position}</td></tr>`;
  });
  document.getElementById("calculator-results").classList.remove("hidden");
}

function loadCalculatorData() {
  const saved = localStorage.getItem("scoreSort_SubjectData");
  if (saved) {
    const data = JSON.parse(saved);
    document.getElementById("subject-name").value = data.subjectName || "";
    data.students.forEach((s) => addStudentRow(s.name, s.score));
    renderRankings(data);
  } else {
    addStudentRow();
  }
}

document.getElementById("clear-subject-data").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear this subject's data?")) {
    localStorage.removeItem("scoreSort_SubjectData");
    document.getElementById("subject-name").value = "";
    studentInputsContainer.innerHTML = "";
    document.getElementById("calculator-results").classList.add("hidden");
    addStudentRow();
  }
});

// --- TAB 2: REPORT GENERATOR ---
function initReportTab() {
  const tbody = document.getElementById("subjects-input-body");
  if (tbody.children.length === 0) {
    SUBJECTS.forEach((sub) => {
      tbody.innerHTML += `
        <tr class="report-subject-row" data-subject="${sub}">
            <td>${sub}</td>
            <td><input type="number" class="ass1 report-input-cell" max="5"></td>
            <td><input type="number" class="ass2 report-input-cell" max="5"></td>
            <td><input type="number" class="test1 report-input-cell" max="10"></td>
            <td><input type="number" class="test2 report-input-cell" max="10"></td>
            <td><input type="number" class="exam report-input-cell" max="70"></td>
            <td><input type="number" class="class-avg report-input-cell"></td>
            <td><input type="text" class="subj-pos report-input-cell"></td>
        </tr>
      `;
    });
  }
}

function getGradeAndRemark(total) {
  if (total >= 75) return { grade: "A1", remark: "EXCELLENT" };
  if (total >= 70) return { grade: "B2", remark: "VERY GOOD" };
  if (total >= 65) return { grade: "B3", remark: "GOOD" };
  if (total >= 60) return { grade: "C4", remark: "CREDIT" };
  if (total >= 55) return { grade: "C5", remark: "CREDIT" };
  if (total >= 50) return { grade: "C6", remark: "CREDIT" };
  if (total >= 45) return { grade: "D7", remark: "PASS" };
  if (total >= 40) return { grade: "E8", remark: "PASS" };
  return { grade: "F9", remark: "FAIL" };
}

document.getElementById("generate-report-btn").addEventListener("click", () => {
  const rawStudentName = document.getElementById("bio-name").value.trim();
  if (!rawStudentName) {
    alert("Please enter a Student Name before generating the report card.");
    return;
  }

  // Populate Bio Data Map
  const bioIds = [
    "name",
    "sex",
    "term",
    "state",
    "lga",
    "class",
    "no-in-class",
    "position",
    "fees-owed",
    "term-ending",
    "next-term",
    "absent",
  ];

  bioIds.forEach((id) => {
    const el = document.getElementById(`bio-${id}`);
    if (!el) return;

    let val = el.value;
    if (id === "name") {
      val = formatName(val);
    }

    const outEl = document.getElementById(`out-${id}`);
    if (outEl) outEl.innerText = val || "";
  });

  // Populate Grades
  const rows = document.querySelectorAll(".report-subject-row");
  const outTbody = document.getElementById("report-grades-body");
  outTbody.innerHTML = "";

  let grandTotal = 0;
  let subjectCount = 0;

  rows.forEach((row) => {
    const subject = row.getAttribute("data-subject");
    const a1 = parseFloat(row.querySelector(".ass1").value) || 0;
    const a2 = parseFloat(row.querySelector(".ass2").value) || 0;
    const t1 = parseFloat(row.querySelector(".test1").value) || 0;
    const t2 = parseFloat(row.querySelector(".test2").value) || 0;
    const exam = parseFloat(row.querySelector(".exam").value) || 0;
    const classAvg = row.querySelector(".class-avg").value || "-";
    const subjPos = row.querySelector(".subj-pos").value || "-";

    const totalScore = a1 + a2 + t1 + t2 + exam;

    if (totalScore > 0) {
      grandTotal += totalScore;
      subjectCount++;
      const { grade, remark } = getGradeAndRemark(totalScore);

      outTbody.innerHTML += `
        <tr>
            <td>${subject}</td>
            <td>${a1 || "-"}</td><td>${a2 || "-"}</td><td>${t1 || "-"}</td><td>${t2 || "-"}</td><td>${exam || "-"}</td>
            <td><strong>${totalScore}</strong></td>
            <td>${classAvg}</td><td>${subjPos}</td>
            <td><strong>${grade}</strong></td><td>${remark}</td>
        </tr>
      `;
    }
  });

  document.getElementById("out-overall-total").innerText = grandTotal;
  document.getElementById("out-overall-avg").innerText =
    subjectCount > 0 ? (grandTotal / subjectCount).toFixed(1) : 0;

  // Populate Blank Behavior Rows for Hand-Grading
  const behaviorBody = document.getElementById("behavior-body");
  behaviorBody.innerHTML = "";
  BEHAVIORS.forEach((param) => {
    behaviorBody.innerHTML += `<tr><td>${param}</td><td></td><td></td><td></td><td></td><td></td></tr>`;
  });

  dashboardScreen.classList.add("hidden");
  reportCardScreen.classList.remove("hidden");
});

// --- STICKY DATA & CLEAR LOGIC ---
const stickyFields = [
  "bio-term",
  "bio-class",
  "bio-term-ending",
  "bio-next-term",
];

stickyFields.forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", () => {
      const dataToSave = {};
      stickyFields.forEach((fieldId) => {
        dataToSave[fieldId] = document.getElementById(fieldId).value;
      });
      localStorage.setItem("scoreSort_StickyBio", JSON.stringify(dataToSave));
    });
  }
});

function loadStickyBioData() {
  const savedSticky = localStorage.getItem("scoreSort_StickyBio");
  if (savedSticky) {
    const data = JSON.parse(savedSticky);
    stickyFields.forEach((id) => {
      const el = document.getElementById(id);
      if (el && data[id]) {
        el.value = data[id];
      }
    });
  }
}

const clearReportBtn = document.getElementById("clear-report-btn");
if (clearReportBtn) {
  clearReportBtn.addEventListener("click", () => {
    if (
      confirm(
        "Clear this student's data and grades? Your sticky Term and Class fields will be kept.",
      )
    ) {
      const uniqueBioIds = [
        "bio-name",
        "bio-sex",
        "bio-state",
        "bio-lga",
        "bio-no-in-class",
        "bio-position",
        "bio-fees-owed",
        "bio-absent",
      ];
      uniqueBioIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });

      document.querySelectorAll(".report-input-cell").forEach((input) => {
        input.value = "";
      });
    }
  });
}

// --- PRINT CONTROLS ---
document.getElementById("print-report").addEventListener("click", () => {
  window.print();
});

document.getElementById("back-to-dashboard").addEventListener("click", () => {
  reportCardScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
});
