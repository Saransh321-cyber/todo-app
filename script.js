
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';

    const textSpan = document.createElement('span');
    textSpan.textContent = `${task.text} (Due: ${task.dueDate || 'N/A'} ${task.dueTime || ''})`;
    textSpan.contentEditable = true;
    textSpan.onblur = () => {
      task.text = textSpan.textContent.split(' (Due')[0];
      saveTasks();
    };

    const actions = document.createElement('div');
    actions.className = 'actions';

    const doneBtn = document.createElement('button');
    doneBtn.textContent = '✓';
    doneBtn.onclick = () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑';
    deleteBtn.onclick = () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    };

    actions.append(doneBtn, deleteBtn);
    li.append(textSpan, actions);
    list.appendChild(li);
  });
}

function addTask() {
  const text = document.getElementById('taskInput').value.trim();
  const due = document.getElementById('dueDate').value;
  const time = document.getElementById('dueTime').value;
  if (!text) return;
  const newTask = { text, dueDate: due, dueTime: time, completed: false };
  tasks.push(newTask);
  document.getElementById('taskInput').value = '';
  document.getElementById('dueDate').value = '';
  document.getElementById('dueTime').value = '';
  saveTasks();
  renderTasks();
  scheduleReminder(newTask);
}

function toggleDarkMode() {
  document.body.classList.toggle('dark');
}

function scheduleReminder(task) {
  if (!task.dueDate || !task.dueTime) return;
  const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
  const now = new Date();
  const timeout = dueDateTime - now;
  if (timeout > 0) {
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('⏰ Task Due!', { body: `${task.text} is due now!` });
      }
    }, timeout);
  }
}

function notifyPermission() {
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
}

notifyPermission();
tasks.forEach(task => scheduleReminder(task));
renderTasks();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => console.log('Service Worker Registered'));
}
