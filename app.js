const STORAGE_KEY = "workout-pwa-data-v2";

const defaultData = {
  selectedWorkout: "upper",
  currentMonth: new Date().toISOString(),
  schedule: [
    { weekday: 1, type: "upper" }, // Пн
    { weekday: 3, type: "lower" }, // Ср
    { weekday: 5, type: "upper" }, // Пт
    { weekday: 0, type: "lower" }  // Вс
  ],
  history: [],
  plans: {
    upper: [
      { name: "Жим", min: 6, max: 10, step: 2.5, success: 0, sets: [[95, 7], [95, 7], [90, 10]] },
      { name: "Тяга блока узкая рукоятка", min: 8, max: 12, step: 5, success: 0, sets: [[75, 9], [75, 9], [70, 12]] },
      { name: "Бабочка", min: 8, max: 12, step: 5, success: 0, sets: [[85, 9], [85, 9], [80, 12]] },
      { name: "Тяга горизонтальная", min: 8, max: 12, step: 5, success: 0, sets: [[90, 9], [90, 9], [85, 12]] },
      { name: "Бицепс в блоке", min: 8, max: 12, step: 2.5, success: 0, sets: [[77.5, 9], [77.5, 9], [77.5, 9], [72.5, 12]] },
      { name: "Трицепс", min: 8, max: 12, step: 5, success: 0, sets: [[95, 9], [95, 9], [95, 9], [90, 12]] },
      { name: "Плечи махи гантелями", min: 10, max: 15, step: 2, success: 0, sets: [[16, 11], [16, 11], [16, 11], [14, 15]] }
    ],
    lower: [
      { name: "Присед", min: 8, max: 12, step: 2.5, success: 0, sets: [[80, 8], [80, 8], [75, 10]] },
      { name: "Разгибание ног", min: 10, max: 15, step: 5, success: 0, sets: [[75, 11], [75, 11], [75, 11], [70, 15]] },
      { name: "Сгибание ног", min: 10, max: 15, step: 5, success: 0, sets: [[75, 11], [75, 11], [75, 11], [75, 11], [70, 15]] },
      { name: "Икры", min: 15, max: 20, step: 5, success: 0, sets: [[140, 16], [140, 16], [140, 16], [130, 20]] },
      { name: "Сведения", min: 10, max: 15, step: 5, success: 0, sets: [[75, 11], [75, 11], [75, 11], [70, 15]] }
    ]
  }
};

let data = loadData();
let workoutState = null;

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : structuredClone(defaultData);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.screen === id);
  });

  renderAll();
}

function formatDate(date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function workoutLabel(type) {
  return type === "upper" ? "Верх" : "Низ";
}

function renderToday() {
  document.getElementById("todayDate").textContent = formatDate(new Date());

  document.getElementById("chooseUpper").classList.toggle("active", data.selectedWorkout === "upper");
  document.getElementById("chooseLower").classList.toggle("active", data.selectedWorkout === "lower");
}

function renderPlan(type = data.selectedWorkout) {
  const list = document.getElementById("planList");
  list.innerHTML = "";

  data.plans[type].forEach(ex => {
    const div = document.createElement("div");
    div.className = "exercise-card";

    div.innerHTML = `
      <div class="exercise-title">${ex.name}</div>
      <div class="exercise-info">
        Объем: ${ex.min}–${ex.max}<br>
        Шаг веса: ${ex.step} кг<br>
        Успешно подряд: ${ex.success}/2
      </div>
      <div class="sets">
        ${ex.sets.map(s => `<div>${s[0]} кг × ${s[1]}</div>`).join("")}
      </div>
    `;

    list.appendChild(div);
  });
}

function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  if (!data.history.length) {
    list.innerHTML = `<div class="empty">Истории пока нет</div>`;
    return;
  }

  data.history.slice().reverse().forEach(session => {
    const div = document.createElement("div");
    div.className = "exercise-card";

    div.innerHTML = `
      <div class="exercise-title">${session.date} — ${workoutLabel(session.type)}</div>
      ${session.records.map(r => `
        <div class="exercise-info">
          <b>${r.name}</b> ${r.success ? "✅" : "❌"}<br>
          ${r.done.map(s => `${s[0]} кг × ${s[1]}`).join("<br>")}
        </div>
      `).join("<hr>")}
    `;

    list.appendChild(div);
  });
}

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  const date = new Date(data.currentMonth);
  const year = date.getFullYear();
  const month = date.getMonth();

  document.getElementById("monthTitle").textContent =
    date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;

  for (let i = 0; i < offset; i++) {
    grid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const type = workoutForDate(d);
    const done = data.history.find(h => h.dateKey === dateKey(d));

    const btn = document.createElement("button");
    btn.className = "calendar-day";
    btn.textContent = day;

    if (type) btn.classList.add(type);
    if (isToday(d)) btn.classList.add("today");
    if (done) btn.classList.add("done");

    btn.onclick = () => openDayDetail(d);

    grid.appendChild(btn);
  }
}

function workoutForDate(date) {
  const weekday = date.getDay();
  const rule = data.schedule.find(r => r.weekday === weekday);
  return rule ? rule.type : null;
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function isToday(date) {
  return dateKey(date) === dateKey(new Date());
}

function openDayDetail(date) {
  const type = workoutForDate(date);
  const done = data.history.find(h => h.dateKey === dateKey(date));

  document.getElementById("dayDetailTitle").textContent = formatDate(date);

  const box = document.getElementById("dayDetailContent");

  if (done) {
    box.innerHTML = `
      <div class="exercise-card">
        <div class="exercise-title">Сделано: ${workoutLabel(done.type)}</div>
        ${done.records.map(r => `
          <div class="exercise-info">
            <b>${r.name}</b> ${r.success ? "✅" : "❌"}<br>
            ${r.done.map(s => `${s[0]} кг × ${s[1]}`).join("<br>")}
          </div>
        `).join("<hr>")}
      </div>
    `;
  } else if (type) {
    box.innerHTML = `
      <div class="exercise-card">
        <div class="exercise-title">План: ${workoutLabel(type)}</div>
        ${data.plans[type].map(ex => `
          <div class="exercise-info">
            <b>${ex.name}</b><br>
            ${ex.sets.map(s => `${s[0]} кг × ${s[1]}`).join("<br>")}
          </div>
        `).join("<hr>")}
      </div>
    `;
  } else {
    box.innerHTML = `<div class="empty">Тренировки нет</div>`;
  }

  showScreen("dayDetailScreen");
}

function startWorkout() {
  workoutState = {
    type: data.selectedWorkout,
    index: 0,
    records: []
  };

  showScreen("workoutScreen");
  renderWorkoutExercise();
}

function renderWorkoutExercise() {
  const plan = data.plans[workoutState.type];
  const ex = plan[workoutState.index];

  document.getElementById("workoutCounter").textContent =
    `${workoutState.index + 1} / ${plan.length}`;

  const box = document.getElementById("workoutExercise");

  box.innerHTML = `
    <div class="exercise-title">${ex.name}</div>
    <div class="exercise-info">
      Объем: ${ex.min}–${ex.max}<br>
      Успешно подряд: ${ex.success}/2
    </div>

    <div class="input-sets">
      ${ex.sets.map((s, i) => `
        <div class="set-row">
          <input type="number" step="0.5" value="${s[0]}" id="w${i}">
          <span>кг</span>
          <input type="number" value="${s[1]}" id="r${i}">
          <span>повт</span>
        </div>
      `).join("")}
    </div>

    <button class="start-btn" onclick="saveWorkoutExercise()">Сохранить упражнение</button>
  `;
}

function saveWorkoutExercise() {
  const plan = data.plans[workoutState.type];
  const ex = plan[workoutState.index];

  const done = ex.sets.map((_, i) => [
    Number(document.getElementById(`w${i}`).value),
    Number(document.getElementById(`r${i}`).value)
  ]);

  const success = done.length === ex.sets.length &&
    done.every((s, i) => s[0] >= ex.sets[i][0] && s[1] >= ex.sets[i][1]);

  workoutState.records.push({
    name: ex.name,
    planned: ex.sets,
    done,
    success
  });

  workoutState.index++;

  if (workoutState.index >= plan.length) {
    finishWorkout();
  } else {
    renderWorkoutExercise();
  }
}

function finishWorkout() {
  workoutState.records.forEach(record => {
    const ex = data.plans[workoutState.type].find(e => e.name === record.name);

    if (record.success) {
      ex.success++;
    } else {
      ex.success = 0;
    }

    if (ex.success >= 2) {
      const allTop = ex.sets.every(s => s[1] >= ex.max);

      ex.sets = ex.sets.map(s => {
        if (allTop) return [s[0] + ex.step, ex.min];
        if (s[1] < ex.max) return [s[0], s[1] + 1];
        return s;
      });

      ex.success = 0;
    }
  });

  data.history.push({
    date: new Date().toLocaleDateString("ru-RU"),
    dateKey: dateKey(new Date()),
    type: workoutState.type,
    records: workoutState.records
  });

  saveData();
  workoutState = null;
  showScreen("historyScreen");
}

function renderSchedule() {
  const box = document.getElementById("scheduleList");

  const dayNames = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

  box.innerHTML = data.schedule.map((r, i) => `
    <div class="exercise-card">
      <select onchange="data.schedule[${i}].weekday = Number(this.value); saveData(); renderAll();">
        ${dayNames.map((d, idx) => `<option value="${idx}" ${idx === r.weekday ? "selected" : ""}>${d}</option>`).join("")}
      </select>

      <select onchange="data.schedule[${i}].type = this.value; saveData(); renderAll();">
        <option value="upper" ${r.type === "upper" ? "selected" : ""}>Верх</option>
        <option value="lower" ${r.type === "lower" ? "selected" : ""}>Низ</option>
      </select>
    </div>
  `).join("");
}

function renderAll() {
  renderToday();
  renderPlan();
  renderHistory();
  renderCalendar();
  renderSchedule();
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.onclick = () => showScreen(btn.dataset.screen);
});

document.getElementById("chooseUpper").onclick = () => {
  data.selectedWorkout = "upper";
  saveData();
  renderToday();
};

document.getElementById("chooseLower").onclick = () => {
  data.selectedWorkout = "lower";
  saveData();
  renderToday();
};

document.getElementById("startWorkoutBtn").onclick = startWorkout;

document.getElementById("cancelWorkoutBtn").onclick = () => {
  workoutState = null;
  showScreen("todayScreen");
};

document.getElementById("prevMonthBtn").onclick = () => {
  const d = new Date(data.currentMonth);
  d.setMonth(d.getMonth() - 1);
  data.currentMonth = d.toISOString();
  saveData();
  renderCalendar();
};

document.getElementById("nextMonthBtn").onclick = () => {
  const d = new Date(data.currentMonth);
  d.setMonth(d.getMonth() + 1);
  data.currentMonth = d.toISOString();
  saveData();
  renderCalendar();
};

document.getElementById("backToCalendarBtn").onclick = () => showScreen("calendarScreen");
document.getElementById("openScheduleBtn").onclick = () => showScreen("scheduleScreen");
document.getElementById("closeScheduleBtn").onclick = () => showScreen("calendarScreen");

document.getElementById("addScheduleBtn").onclick = () => {
  data.schedule.push({ weekday: 1, type: "upper" });
  saveData();
  renderSchedule();
};

document.querySelectorAll(".plan-tab").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".plan-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderPlan(btn.dataset.type);
  };
});

renderAll();
