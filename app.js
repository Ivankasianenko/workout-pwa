const programs = {
  upper: [
    { name: "Жим", sets: [[95, 7], [95, 7], [90, 10]] },
    { name: "Тяга блока узкая рукоятка", sets: [[75, 9], [75, 9], [70, 12]] },
    { name: "Бабочка", sets: [[85, 9], [85, 9], [80, 12]] },
    { name: "Тяга горизонтальная", sets: [[90, 9], [90, 9], [85, 12]] },
    { name: "Бицепс в блоке", sets: [[77.5, 9], [77.5, 9], [77.5, 9], [72.5, 12]] },
    { name: "Трицепс", sets: [[95, 9], [95, 9], [95, 9], [90, 12]] },
    { name: "Плечи махи гантелями", sets: [[16, 11], [16, 11], [16, 11], [14, 15]] }
  ],
  lower: [
    { name: "Присед", sets: [[80, 8], [80, 8], [75, 10]] },
    { name: "Разгибание ног", sets: [[75, 11], [75, 11], [75, 11], [70, 15]] },
    { name: "Сгибание ног", sets: [[75, 11], [75, 11], [75, 11], [75, 11], [70, 15]] },
    { name: "Икры", sets: [[140, 16], [140, 16], [140, 16], [130, 20]] },
    { name: "Сведения", sets: [[75, 11], [75, 11], [75, 11], [70, 15]] }
  ]
};

let currentDay = "upper";
let timerInterval = null;
let timerSeconds = 90;

const exerciseList = document.getElementById("exerciseList");
const historyList = document.getElementById("historyList");
const timerDisplay = document.getElementById("timerDisplay");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

function renderExercises() {
  exerciseList.innerHTML = "";

  programs[currentDay].forEach((exercise) => {
    const div = document.createElement("div");
    div.className = "exercise";

    const setsHtml = exercise.sets
      .map(([weight, reps]) => `<li>${weight} кг × ${reps}</li>`)
      .join("");

    div.innerHTML = `
      <h3>${exercise.name}</h3>
      <ul>${setsHtml}</ul>
      <button onclick="saveExercise('${exercise.name.replaceAll("'", "\\'")}')">
        Выполнено
      </button>
    `;

    exerciseList.appendChild(div);
  });
}

function saveExercise(name) {
  const history = getHistory();

  history.unshift({
    date: new Date().toLocaleString("ru-RU"),
    day: currentDay === "upper" ? "Верх" : "Низ",
    exercise: name
  });

  localStorage.setItem("workoutHistory", JSON.stringify(history));
  renderHistory();
}

function getHistory() {
  return JSON.parse(localStorage.getItem("workoutHistory") || "[]");
}

function renderHistory() {
  const history = getHistory();

  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.innerHTML = `<p class="empty">Истории пока нет</p>`;
    return;
  }

  history.forEach((item) => {
    const div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
      <strong>${item.day}</strong>
      <p>${item.exercise}</p>
      <small>${item.date}</small>
    `;

    historyList.appendChild(div);
  });
}

function clearHistory() {
  localStorage.removeItem("workoutHistory");
  renderHistory();
}

function startTimer(seconds) {
  stopTimer();

  timerSeconds = seconds;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timerSeconds--;

    updateTimerDisplay();

    if (timerSeconds <= 0) {
      stopTimer();
      alert("Отдых закончен");
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  timerDisplay.textContent =
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0");
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((btn) => {
      btn.classList.remove("active");
    });

    tab.classList.add("active");
    currentDay = tab.dataset.day;
    renderExercises();
  });
});

clearHistoryBtn.addEventListener("click", clearHistory);

renderExercises();
renderHistory();
updateTimerDisplay();
