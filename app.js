
const workouts = {
  upper: [
    "Жим лёжа",
    "Тяга верхнего блока",
    "Жим гантелей сидя",
    "Тяга гантели",
    "Бицепс",
    "Трицепс"
  ],
  lower: [
    "Присед",
    "Жим ногами",
    "Румынская тяга",
    "Выпады",
    "Икры",
    "Пресс"
  ]
};

let currentDay = "upper";
let timerInterval = null;
let timeLeft = 90;

const exerciseList = document.getElementById("exerciseList");
const historyList = document.getElementById("historyList");
const timerDisplay = document.getElementById("timerDisplay");

function renderExercises() {
  exerciseList.innerHTML = "";

  workouts[currentDay].forEach((name, index) => {
    const id = `${currentDay}-${index}`;

    const div = document.createElement("div");
    div.className = "exercise";

    div.innerHTML = `
      <div class="exercise-title">${name}</div>

      <div class="inputs">
        <input id="weight-${id}" type="number" placeholder="Вес" />
        <input id="reps-${id}" type="number" placeholder="Повт." />
        <input id="sets-${id}" type="number" placeholder="Подх." />
      </div>

      <button class="save-btn" onclick="saveExercise('${name}', '${id}')">
        Сохранить
      </button>
    `;

    exerciseList.appendChild(div);
  });
}

function saveExercise(name, id) {
  const weight = document.getElementById(`weight-${id}`).value;
  const reps = document.getElementById(`reps-${id}`).value;
  const sets = document.getElementById(`sets-${id}`).value;

  if (!weight && !reps && !sets) {
    alert("Введи вес, повторы или подходы");
    return;
  }

  const history = getHistory();

  history.unshift({
    date: new Date().toLocaleString("ru-RU"),
    day: currentDay === "upper" ? "Верх" : "Низ",
    name,
    weight: weight || "-",
    reps: reps || "-",
    sets: sets || "-"
  });

  localStorage.setItem("workoutHistory", JSON.stringify(history));

  document.getElementById(`weight-${id}`).value = "";
  document.getElementById(`reps-${id}`).value = "";
  document.getElementById(`sets-${id}`).value = "";

  renderHistory();
}

function getHistory() {
  return JSON.parse(localStorage.getItem("workoutHistory") || "[]");
}

function renderHistory() {
  const history = getHistory();

  if (history.length === 0) {
    historyList.innerHTML = `<div class="empty">История пока пустая</div>`;
    return;
  }

  historyList.innerHTML = history.map(item => `
    <div class="history-item">
      <strong>${item.name}</strong><br>
      ${item.day} · ${item.date}<br>
      Вес: ${item.weight} кг · Повторы: ${item.reps} · Подходы: ${item.sets}
    </div>
  `).join("");
}

function startTimer(seconds) {
  stopTimer();
  timeLeft = seconds;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
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
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  timerDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    currentDay = button.dataset.day;
    renderExercises();
  });
});

document.getElementById("clearHistoryBtn").addEventListener("click", () => {
  if (confirm("Очистить всю историю тренировок?")) {
    localStorage.removeItem("workoutHistory");
    renderHistory();
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

renderExercises();
renderHistory();
updateTimerDisplay();
