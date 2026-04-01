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

// Separate subject lists for JSS and SSS
const JSS_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Basic Science",
  "Basic Technology",
  "Civic Education",
  "Social Studies",
  "CRS",
  "Cultural and Creative Art",
  "Business Studies",
  "Computer Science",
  "Hausa",
  "Home Economics",
  "Physical and Health Education",
  "Agricultural Science",
  "Literature-in-English",
];

const SSS_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Civic Education",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "Accounting",
  "Economics",
  "Commerce",
  "Marketing",
  "Agricultural Science",
  "Creative Art",
  "Computer Science",
  "CRS",
  "Government",
  "Literature-in-English",
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

function normalizeName(name) {
  return name ? name.toLowerCase().trim().replace(/\s+/g, " ") : "";
}

function normalizeSubject(subject) {
  return subject ? subject.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
}

function getSubjectFilename(subjectName, className = "") {
  let name = subjectName.trim();
  if (className) name += ` - ${className.trim()}`;
  return name.replace(/[^a-zA-Z0-9 -]/g, "") + ".json";
}

// Calculates how many edits (typos, swaps, missing letters) it takes to turn string 'a' into string 'b'
function getSimilarityScore(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      let cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j - 1] + cost, // substitution
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j] + 1, // deletion
      );
      // Catch transposed letters (e.g., "jhon" vs "john")
      if (
        i > 1 &&
        j > 1 &&
        b.charAt(i - 1) === a.charAt(j - 2) &&
        b.charAt(i - 2) === a.charAt(j - 1)
      ) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLength = Math.max(a.length, b.length);
  return (maxLength - distance) / maxLength; // Returns a percentage (0.0 to 1.0)
}

// The main fuzzy matching engine
function isNameMatch(inputName, jsonName) {
  if (!inputName || !jsonName) return false;

  const inputTokens = normalizeName(inputName).split(" ");
  let jsonTokens = normalizeName(jsonName).split(" ");

  let matchedPairs = 0;
  const matchThreshold = 0.7; // 70% similarity required per word

  // Check each word the user typed against the words in the JSON file
  for (const iToken of inputTokens) {
    let bestScore = 0;
    let bestIndex = -1;

    for (let j = 0; j < jsonTokens.length; j++) {
      const score = getSimilarityScore(iToken, jsonTokens[j]);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = j;
      }
    }

    // If we found a 70%+ match, count it and remove it from the available JSON words so we don't double-count
    if (bestScore >= matchThreshold && bestIndex !== -1) {
      matchedPairs++;
      jsonTokens.splice(bestIndex, 1);
    }
  }

  // If both inputs have at least 2 words (e.g., First & Last name), we only require 2 words to match.
  // If someone only provided 1 word, we require 1 match.
  const requiredMatches = inputTokens.length === 1 ? 1 : 2;

  return matchedPairs >= requiredMatches;
}

// Dynamic Class Title
function updateClassTitle() {
  const classInput = document
    .getElementById("bio-class")
    .value.trim()
    .toUpperCase();
  const titleEl = document.getElementById("class-title");
  if (!titleEl) return;
  titleEl.textContent = classInput.startsWith("JSS")
    ? "JUNIOR SECONDARY SCHOOL"
    : "SENIOR SECONDARY SCHOOL";
}

// --- AUTHENTICATION & LOGOUT ---
loginBtn.addEventListener("click", () => {
  const uid = document.getElementById("school-id").value;
  const pin = document.getElementById("teacher-pin").value;
  if (pin === "admin" && uid === "Admin") {
    loginScreen.classList.add("hidden");
    dashboardScreen.classList.remove("hidden");
    initReportTab();
    loadCalculatorData();
    loadStickyBioData();
    updateClassTitle();
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
const calcSectionSelect = document.getElementById("calc-section");

document
  .getElementById("add-student-row")
  .addEventListener("click", () => addStudentRow());

function addStudentRow(data = {}) {
  const row = document.createElement("div");
  row.className = "student-row";

  const isJSS = calcSectionSelect && calcSectionSelect.value === "JSS";

  row.innerHTML = `
    <input type="text" class="calc-name" placeholder="Name" value="${data.name || ""}">
    <input type="number" class="calc-a1" placeholder="${isJSS ? "10" : "5"}" value="${data.a1 || ""}" max="${isJSS ? "10" : "5"}">
    <input type="number" class="calc-a2" placeholder="${isJSS ? "10" : "5"}" value="${data.a2 || ""}" max="${isJSS ? "10" : "5"}">
    <input type="number" class="calc-t1" placeholder="${isJSS ? "20" : "10"}" value="${data.t1 || ""}" max="${isJSS ? "20" : "10"}">
    <input type="number" class="calc-t2" placeholder="${isJSS ? "20" : "10"}" value="${data.t2 || ""}" max="${isJSS ? "20" : "10"}">
    <input type="number" class="calc-ex" placeholder="${isJSS ? "40" : "70"}" value="${data.ex || ""}" max="${isJSS ? "40" : "70"}">
    <input type="number" class="calc-total" placeholder="100" value="${data.score || ""}" readonly tabindex="-1">
    <button class="danger-btn remove-row"><i class="ph ph-x"></i></button>
  `;

  const inputs = row.querySelectorAll('input[type="number"]:not(.calc-total)');
  const totalBox = row.querySelector(".calc-total");

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      let sum = 0;
      inputs.forEach((inp) => (sum += parseFloat(inp.value) || 0));
      totalBox.value = sum > 0 ? sum : "";
    });
  });

  row
    .querySelector(".remove-row")
    .addEventListener("click", () => row.remove());
  studentInputsContainer.appendChild(row);
}

// Update existing rows when section changes
if (calcSectionSelect) {
  calcSectionSelect.addEventListener("change", () => {
    const rows = document.querySelectorAll(".student-row");
    rows.forEach((row) => row.remove());
    loadCalculatorData(); // re-populate with correct maxes
  });
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
  const subjectName = document.getElementById("subject-name").value.trim();
  const rows = document.querySelectorAll(".student-row");
  let students = [];
  let totalScore = 0;

  rows.forEach((row) => {
    const rawName = row.querySelector(".calc-name").value.trim();
    const name = formatName(rawName);
    const a1 = parseFloat(row.querySelector(".calc-a1").value) || 0;
    const a2 = parseFloat(row.querySelector(".calc-a2").value) || 0;
    const t1 = parseFloat(row.querySelector(".calc-t1").value) || 0;
    const t2 = parseFloat(row.querySelector(".calc-t2").value) || 0;
    const ex = parseFloat(row.querySelector(".calc-ex").value) || 0;
    const score = parseFloat(row.querySelector(".calc-total").value) || 0;

    if (name && score > 0) {
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
    data.students.forEach((s) => addStudentRow(s));
    renderRankings(data);
  } else {
    addStudentRow();
  }
}

// ====================== CLEAR SUBJECT DATA ======================
document.getElementById("clear-subject-data").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear this subject's data?")) {
    localStorage.removeItem("scoreSort_SubjectData");
    document.getElementById("subject-name").value = "";
    studentInputsContainer.innerHTML = "";
    document.getElementById("calculator-results").classList.add("hidden");
    addStudentRow();
    alert("Subject data cleared successfully.");
  }
});

// ====================== EXPORT SUBJECT SHEET ======================
document.getElementById("export-subject-btn").addEventListener("click", () => {
  const subjectName = document.getElementById("subject-name").value.trim();
  if (!subjectName) {
    alert("Please enter a Subject Name before exporting.");
    return;
  }

  const rows = document.querySelectorAll(".student-row");
  let students = [];
  let totalScore = 0;

  rows.forEach((row) => {
    const rawName = row.querySelector(".calc-name").value.trim();
    const name = formatName(rawName);
    const a1 = parseFloat(row.querySelector(".calc-a1").value) || 0;
    const a2 = parseFloat(row.querySelector(".calc-a2").value) || 0;
    const t1 = parseFloat(row.querySelector(".calc-t1").value) || 0;
    const t2 = parseFloat(row.querySelector(".calc-t2").value) || 0;
    const ex = parseFloat(row.querySelector(".calc-ex").value) || 0;
    const score = parseFloat(row.querySelector(".calc-total").value) || 0;

    if (name && score > 0) {
      students.push({ name, a1, a2, t1, t2, ex, score });
      totalScore += score;
    }
  });

  if (students.length === 0) {
    alert("No valid student scores to export.");
    return;
  }

  const classAverage = (totalScore / students.length).toFixed(1);
  const className = document.getElementById("bio-class").value.trim();

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

  const exportData = {
    subjectName: subjectName,
    className: className,
    classAverage: classAverage,
    exportedBy: "Subject Teacher",
    exportDate: new Date().toISOString(),
    students: students.map((s) => ({
      name: s.name,
      a1: s.a1,
      a2: s.a2,
      t1: s.t1,
      t2: s.t2,
      ex: s.ex,
      score: s.score,
      position: s.position,
    })),
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = getSubjectFilename(subjectName, className);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  localStorage.setItem(
    `subjectSheet_${normalizeName(subjectName)}`,
    JSON.stringify(exportData),
  );

  alert(
    `✅ ${subjectName} sheet exported successfully!\n\nFilename: ${a.download}`,
  );
});

// ====================== IMPORT SUBJECT SHEETS (Fuzzy Matching) ======================
const importInput = document.getElementById("import-subject-files");
const importBtn = document.getElementById("import-subject-btn");
const importStatus = document.getElementById("import-status");

importBtn.addEventListener("click", () => {
  const files = importInput.files;
  if (files.length === 0) {
    alert("Please select at least one JSON file to import.");
    return;
  }

  const rawStudentName = document.getElementById("bio-name").value.trim();
  if (!rawStudentName) {
    alert(
      "Please enter the Student Name in the Bio Data section first, then import.",
    );
    return;
  }

  let importedCount = 0;
  const mergedStudents = new Map();

  Array.from(files).forEach((file) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);

        if (!data.subjectName || !Array.isArray(data.students)) {
          console.warn("Invalid subject sheet skipped:", file.name);
          return;
        }

        const normSubject = normalizeSubject(data.subjectName);

        data.students.forEach((student) => {
          // Implementing the new fuzzy match logic here
          if (isNameMatch(rawStudentName, student.name)) {
            mergedStudents.set(normSubject, {
              ...student,
              subject: data.subjectName,
              classAvg: data.classAverage || "-",
              position: student.position || "",
            });
          }
        });

        importedCount++;
        importStatus.classList.remove("hidden");
        importStatus.textContent = `Processing... ${importedCount}/${files.length} files imported`;

        if (importedCount === files.length) {
          fillReportTableFromImports(mergedStudents);
        }
      } catch (err) {
        console.error("Error parsing file:", file.name, err);
        alert(
          `Failed to read ${file.name}. Please make sure it's a valid exported subject sheet.`,
        );
      }
    };

    reader.readAsText(file);
  });
});

function fillReportTableFromImports(mergedStudents) {
  const rows = document.querySelectorAll(".report-subject-row");

  mergedStudents.forEach((studentData) => {
    rows.forEach((row) => {
      const subjectCell = row.getAttribute("data-subject");
      if (
        !subjectCell ||
        normalizeSubject(subjectCell) !== normalizeSubject(studentData.subject)
      )
        return;

      row.querySelector(".ass1").value = studentData.a1 || "";
      row.querySelector(".ass2").value = studentData.a2 || "";
      row.querySelector(".test1").value = studentData.t1 || "";
      row.querySelector(".test2").value = studentData.t2 || "";
      row.querySelector(".exam").value = studentData.ex || "";
      row.querySelector(".class-avg").value = studentData.classAvg || "";

      const posInput =
        row.querySelector(".subj-pos") ||
        row.querySelector('input[type="text"]') ||
        row.cells[7]?.querySelector("input");

      if (posInput) posInput.value = studentData.position || "";
    });
  });

  importStatus.innerHTML = `✅ Successfully merged <strong>${mergedStudents.size}</strong> student records from the imported sheet(s)!`;

  setTimeout(() => importStatus.classList.add("hidden"), 6500);

  alert(
    `Import successful!\n\n${mergedStudents.size} student records have been merged across all subjects.`,
  );
}

// --- TAB 2: REPORT GENERATOR ---
function initReportTab() {
  const tbody = document.getElementById("subjects-input-body");
  const sectionSelect = document.getElementById("report-section");

  function populateSubjects() {
    tbody.innerHTML = ""; // clear existing rows
    const subjects =
      sectionSelect.value === "JSS" ? JSS_SUBJECTS : SSS_SUBJECTS;

    subjects.forEach((sub) => {
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

  // Populate on load
  populateSubjects();

  // Re-populate when section changes
  if (sectionSelect) {
    sectionSelect.addEventListener("change", populateSubjects);
  }

  // Behavior ratings (unchanged)
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

  const bioClassSelect = document.getElementById("bio-class");
  if (bioClassSelect)
    bioClassSelect.addEventListener("change", updateClassTitle);
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
    if (!el) return;
    let val = el.value;
    if (id === "name") val = formatName(val);
    const outEl = document.getElementById(`out-${id}`);
    if (outEl) outEl.innerText = val || "";
  });

  updateClassTitle();

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

  const behaviorBody = document.getElementById("behavior-body");
  behaviorBody.innerHTML = "";

  BEHAVIORS.forEach((param, index) => {
    const behSelect = document.getElementById(`beh-${index}`);
    const val = behSelect ? behSelect.value : "";
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
      if (el && data[id]) el.value = data[id];
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

      document
        .querySelectorAll(".report-input-cell")
        .forEach((input) => (input.value = ""));

      BEHAVIORS.forEach((_, index) => {
        const behSelect = document.getElementById(`beh-${index}`);
        if (behSelect) behSelect.value = "";
      });
    }
  });
}

// --- PRINT CONTROLS ---
document
  .getElementById("print-report")
  .addEventListener("click", () => window.print());

document.getElementById("back-to-dashboard").addEventListener("click", () => {
  reportCardScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
});

// ====================== PWA INSTALL PROMPT ======================
let deferredPrompt = null;
const installBanner = document.getElementById("install-banner");

// Show banner when browser is ready to install
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBanner.classList.remove("hidden");
  console.log("Install prompt ready - banner shown");
});

// Handle Install button
document.getElementById("install-btn").addEventListener("click", () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted PWA install");
    } else {
      console.log("User dismissed PWA install");
    }
    deferredPrompt = null;
    installBanner.classList.add("hidden");
  });
});

// Handle "Not Now" button
document.getElementById("dismiss-install").addEventListener("click", () => {
  installBanner.classList.add("hidden");
  // Optional: remember dismissal for this session
  console.log("Install banner dismissed by user");
});

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => {
        console.log("Service Worker registered successfully", reg.scope);
      })
      .catch((err) => {
        console.log("Service Worker registration failed:", err);
      });
  });
}
