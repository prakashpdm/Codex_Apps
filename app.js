const form = document.querySelector("#task-form");
const taskList = document.querySelector("#task-list");
const summary = document.querySelector("#summary");
const showCompleteToggle = document.querySelector("#show-complete");

const TASKS_KEY = "reminder_tasks";

const defaultTasks = [
  {
    id: crypto.randomUUID(),
    title: "Pay utility bill",
    notes: "Schedule autopay for next month.",
    dueAt: getISOFromNow(3),
    completed: false,
  },
  {
    id: crypto.randomUUID(),
    title: "Client check-in",
    notes: "Send agenda ahead of the call.",
    dueAt: getISOFromNow(28),
    completed: false,
  },
];

function getISOFromNow(hoursFromNow) {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  return date.toISOString();
}

function loadTasks() {
  const stored = localStorage.getItem(TASKS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(TASKS_KEY, JSON.stringify(defaultTasks));
  return defaultTasks;
}

function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function formatDue(dueAt) {
  const date = new Date(dueAt);
  return date.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getBadge(task) {
  if (task.completed) {
    return { label: "Complete", className: "badge-complete" };
  }
  const diff = new Date(task.dueAt) - new Date();
  if (diff < 0) {
    return { label: "Overdue", className: "badge-overdue" };
  }
  if (diff < 1000 * 60 * 60 * 24) {
    return { label: "Due soon", className: "badge-soon" };
  }
  return { label: "On track", className: "badge-ok" };
}

function getSummary(tasks) {
  const upcoming = tasks.filter((task) => !task.completed).length;
  const overdue = tasks.filter(
    (task) => !task.completed && new Date(task.dueAt) < new Date()
  ).length;
  return {
    upcoming,
    overdue,
  };
}

function renderSummary(tasks) {
  const { upcoming, overdue } = getSummary(tasks);
  summary.innerHTML = `
    <div>
      <h3>Upcoming reminders</h3>
      <p>${upcoming}</p>
    </div>
    <div>
      <h3>Overdue</h3>
      <p>${overdue}</p>
    </div>
  `;
}

function renderTasks(tasks) {
  const showComplete = showCompleteToggle.checked;
  const filtered = tasks.filter(
    (task) => showComplete || !task.completed
  );

  taskList.innerHTML = "";

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No reminders yet. Add one to get started.";
    taskList.append(empty);
    return;
  }

  const template = document.querySelector("#task-template");
  filtered
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
    .forEach((task) => {
      const clone = template.content.cloneNode(true);
      const button = clone.querySelector(".task");
      const title = clone.querySelector(".task-title");
      const notes = clone.querySelector(".task-notes");
      const time = clone.querySelector(".task-time");
      const badge = clone.querySelector(".task-badge");

      title.textContent = task.title;
      notes.textContent = task.notes || "No notes added.";
      time.textContent = formatDue(task.dueAt);
      const badgeInfo = getBadge(task);
      badge.textContent = badgeInfo.label;
      badge.classList.add(badgeInfo.className);

      if (task.completed) {
        button.classList.add("completed");
      }

      button.addEventListener("click", () => {
        task.completed = !task.completed;
        saveTasks(tasks);
        render();
      });

      taskList.appendChild(clone);
    });
}

function handleSubmit(event) {
  event.preventDefault();
  const title = document.querySelector("#task-title").value.trim();
  const date = document.querySelector("#task-date").value;
  const time = document.querySelector("#task-time").value;
  const notes = document.querySelector("#task-notes").value.trim();

  if (!title || !date || !time) {
    return;
  }

  const dueAt = new Date(`${date}T${time}`).toISOString();
  const tasks = loadTasks();
  tasks.push({
    id: crypto.randomUUID(),
    title,
    notes,
    dueAt,
    completed: false,
  });
  saveTasks(tasks);
  form.reset();
  render();
}

function render() {
  const tasks = loadTasks();
  renderSummary(tasks);
  renderTasks(tasks);
}

form.addEventListener("submit", handleSubmit);
showCompleteToggle.addEventListener("change", render);

render();
setInterval(render, 60 * 1000);
