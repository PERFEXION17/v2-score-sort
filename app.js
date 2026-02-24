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
  const uid = document.getElementById('school-id').value
  const pin = document.getElementById("teacher-pin").value;
  if (pin === "Heaven" && uid === 'JTIHS') {
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
    // Swap screens back
    dashboardScreen.classList.add("hidden");
    loginScreen.classList.remove("hidden");

    // Clear auth inputs
    document.getElementById("teacher-pin").value = "";
    document.getElementById("school-id").value = "";

    // Reset dashboard view
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
const studentInputsContainer = document.getElementById("student-inputs-container");

document.getElementById("add-student-row").addEventListener("click", () => {
  addStudentRow();
});

// Updated to handle the full breakdown and auto-sum
function addStudentRow(data = {}) {
  const row = document.createElement("div");
  row.className = "student-row";
  
  // Inject the 7 inputs
  row.innerHTML = `
        <input type="text" class="calc-name" placeholder="Name" value="${data.name || ''}">
        <input type="number" class="calc-a1" placeholder="5" value="${data.a1 || ''}" max="5">
        <input type="number" class="calc-a2" placeholder="5" value="${data.a2 || ''}" max="5">
        <input type="number" class="calc-t1" placeholder="10" value="${data.t1 || ''}" max="10">
        <input type="number" class="calc-t2" placeholder="10" value="${data.t2 || ''}" max="10">
        <input type="number" class="calc-ex" placeholder="70" value="${data.ex || ''}" max="70">
        <input type="number" class="calc-total" placeholder="100" value="${data.score || ''}" readonly tabindex="-1">
        <button class="danger-btn remove-row">X</button>
    `;

  // The Auto-Summing Logic
  const inputs = row.querySelectorAll('input[type="number"]:not(.calc-total)');
  const totalBox = row.querySelector('.calc-total');

  inputs.forEach(input => {
    input.addEventListener('input', () => {
      let sum = 0;
      inputs.forEach(inp => {
        sum += parseFloat(inp.value) || 0;
      });
      totalBox.value = sum > 0 ? sum : ''; // Only show total if > 0
    });
  });

  row.querySelector(".remove-row").addEventListener("click", () => row.remove());
  studentInputsContainer.appendChild(row);
}

// Ordinal Suffix Helper (Keep this from your original code)
function getOrdinalSuffix(n) {
  const j = n % 10, k = n % 100;
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
    
    // Scrape all the individual values
    const a1 = parseFloat(row.querySelector(".calc-a1").value) || "";
    const a2 = parseFloat(row.querySelector(".calc-a2").value) || "";
    const t1 = parseFloat(row.querySelector(".calc-t1").value) || "";
    const t2 = parseFloat(row.querySelector(".calc-t2").value) || "";
    const ex = parseFloat(row.querySelector(".calc-ex").value) || "";
    const score = parseFloat(row.querySelector(".calc-total").value) || 0;

    if (name && score > 0) {
      // Save the entire breakdown into the array
      students.push({ name, a1, a2, t1, t2, ex, score });
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

  // Save the new complex data to LocalStorage
  const dataToSave = { subjectName, classAverage, students };
  localStorage.setItem("scoreSort_SubjectData", JSON.stringify(dataToSave));

  renderRankings(dataToSave);
});

// Render rankings stays exactly the same
function renderRankings(data) {
  document.getElementById("display-subject-name").innerText = data.subjectName || "N/A";
  document.getElementById("display-class-average").innerText = data.classAverage;
  const tbody = document.getElementById("ranking-table-body");
  tbody.innerHTML = "";
  data.students.forEach((s) => {
    tbody.innerHTML += `<tr><td>${s.name}</td><td>${s.score}</td><td>${s.position}</td></tr>`;
  });
  document.getElementById("calculator-results").classList.remove("hidden");
}

// Load now passes the whole object to addStudentRow
function loadCalculatorData() {
  const saved = localStorage.getItem("scoreSort_SubjectData");
  if (saved) {
    const data = JSON.parse(saved);
    document.getElementById("subject-name").value = data.subjectName || "";
    data.students.forEach((s) => addStudentRow(s)); // Pass the whole object!
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
  // Prevent duplicating the table rows if the user logs out and logs back in
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

  // Inject Behavior Dropdowns into the Dashboard
  const behaviorInputContainer = document.getElementById("behavior-inputs");
  if (behaviorInputContainer && behaviorInputContainer.children.length === 0) {
    BEHAVIORS.forEach((b, index) => {
      behaviorInputContainer.innerHTML += `
        <div class="behavior-input-group">
            <label>${b}</label>
            <select id="beh-${index}">
                <option value=""></option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
            </select>
        </div>
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
  // Validation Check
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
    "fees-paid",
    "fees-owed",
    "term-ending",
    "next-term",
    "absent",
  ];

  bioIds.forEach((id) => {
    const el = document.getElementById(`bio-${id}`);
    if (!el) return; // safeguard if an input is missing in HTML

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

  // Populate Behavior Table with Checkmarks (✓)
  const behaviorBody = document.getElementById("behavior-body");
  behaviorBody.innerHTML = "";

  BEHAVIORS.forEach((param, index) => {
    // Read the dropdown value from the dashboard
    const behSelect = document.getElementById(`beh-${index}`);
    const val = behSelect ? behSelect.value : "";

    // Inject a checkmark into the correct column
    behaviorBody.innerHTML += `
      <tr>
        <td>${param}</td>
        <td>${val === "A" ? "✓" : ""}</td>
        <td>${val === "B" ? "✓" : ""}</td>
        <td>${val === "C" ? "✓" : ""}</td>
        <td>${val === "D" ? "✓" : ""}</td>
        <td>${val === "E" ? "✓" : ""}</td>
      </tr>
    `;
  });

  // Switch Screens
  dashboardScreen.classList.add("hidden");
  reportCardScreen.classList.remove("hidden");
});

// --- TAB 2: STICKY DATA & CLEAR LOGIC ---
const stickyFields = [
  "bio-term",
  "bio-class",
  "bio-term-ending",
  "bio-next-term",
];

// Auto-save sticky fields to localStorage
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
      // Clear unique bio-data
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

      // Clear grades
      document.querySelectorAll(".report-input-cell").forEach((input) => {
        input.value = "";
      });

      // Clear Behavior Dropdowns
      BEHAVIORS.forEach((b, index) => {
        const behSelect = document.getElementById(`beh-${index}`);
        if (behSelect) behSelect.value = "";
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
