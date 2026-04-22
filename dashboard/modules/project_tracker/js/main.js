const projects = [
  { id: 1, name: "Zoho Business Setup", status: "In progress", assignees: ["Admin"] },
  { id: 2, name: "Control Panels Build", status: "Not started", assignees: ["Admin"] },
  { id: 3, name: "Tender Tracker Auditing", status: "On hold", assignees: ["Admin"] },
  { id: 4, name: "n8n Automation & Sync", status: "In progress", assignees: ["Admin"] },
  { id: 5, name: "Bitwarden Access Control", status: "Not started", assignees: ["Admin"] },
  { id: 6, name: "Engineering Hub Setup", status: "Completed", assignees: ["Admin"] }
];

const tasks = [
  { id: 1, name: "Zoho - Division Tags ON", date: "High Priority", project: "Zoho Business Setup", assignee: "Admin", done: false },
  { id: 2, name: "Zoho - FIFO lock", date: "High Priority", project: "Zoho Business Setup", assignee: "Admin", done: false },
  { id: 3, name: "Zoho - Opening Balances", date: "High Priority", project: "Zoho Business Setup", assignee: "Admin", done: false },
  { id: 4, name: "Tender Tracker - Field Audit", date: "Priority 4", project: "Tender Tracker Auditing", assignee: "Admin", done: false },
  { id: 5, name: "Build Missing Control Panels", date: "Priority 5", project: "Control Panels Build", assignee: "Admin", done: false },
  { id: 6, name: "n8n - Zoho-Notion sync", date: "Priority 6", project: "n8n Automation & Sync", assignee: "Admin", done: false },
  { id: 7, name: "WhatsApp - Auto reminders", date: "Priority 7", project: "n8n Automation & Sync", assignee: "Admin", done: false },
  { id: 8, name: "Google Drive - Naming standard", date: "Priority 8", project: "Zoho Business Setup", assignee: "Admin", done: false },
  { id: 9, name: "Add 280+ platforms from Bitwarden", date: "Critical", project: "Bitwarden Access Control", assignee: "Admin", done: false },
  { id: 10, name: "Setup n8n VPS automation", date: "Operations", project: "n8n Automation & Sync", assignee: "Admin", done: false }
];

// Map user names to predetermined CSS classes for distinct colors
const getAvatarClass = (name) => {
  const map = {
    "Patricia": "avatar-1",
    "David": "avatar-2",
    "Mary": "avatar-3"
  };
  return map[name] || "avatar-1";
};

// Returns a class representing project status
const getStatusClass = (status) => {
  const map = {
    "In progress": "in-progress",
    "On hold": "on-hold",
    "Cancelled": "cancelled",
    "Not started": "not-started"
  };
  return map[status] || "not-started";
};

const projectsContainer = document.getElementById('projects-container');
const tasksContainer = document.getElementById('tasks-container');
const totalProjectsEl = document.getElementById('total-projects');
const inProgressEl = document.getElementById('in-progress-projects');
const tasksCompletedEl = document.getElementById('tasks-completed');

let activeProjectFilter = null;
let searchTerm = "";

function init() {
  renderProjects();
  renderTasks();
  updateStats();
}

function renderProjects() {
  projectsContainer.innerHTML = '';
  projects.forEach((project) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    // Create avatar circles
    const assigneesHtml = project.assignees.map(a => 
      `<div class="assignee-avatar ${getAvatarClass(a)}" title="${a}">${a.charAt(0)}</div>`
    ).join('');

    card.innerHTML = `
      <div class="project-header">
        <h3 class="project-title">${project.name}</h3>
        <span class="badge ${getStatusClass(project.status)}">${project.status}</span>
      </div>
      <div class="project-assignees">
        ${assigneesHtml}
      </div>
    `;
    card.onclick = () => {
      activeProjectFilter = project.name;
      renderTasks();
      // Highlight the selected project
      document.querySelectorAll('.project-card').forEach(c => c.style.borderColor = 'rgba(255,255,255,0.08)');
      card.style.borderColor = 'var(--accent-blue)';
    };
    projectsContainer.appendChild(card);
  });
}

function renderTasks() {
  tasksContainer.innerHTML = '';
  const filteredTasks = tasks.filter(task => {
    const matchesProject = !activeProjectFilter || task.project === activeProjectFilter;
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProject && matchesSearch;
  });

  filteredTasks.forEach((task) => {
    const originalIndex = tasks.findIndex(t => t.id === task.id);
    const item = document.createElement('div');
    item.className = 'task-item';
    
    item.innerHTML = `
      <div class="task-header">
        <div class="checkbox ${task.done ? 'done' : ''}" onclick="toggleTask(${originalIndex})"></div>
        <div class="task-details">
          <div class="task-name ${task.done ? 'done' : ''}">${task.name}</div>
          <div class="task-meta">
            <span title="Due Date"><i class="ri-calendar-line"></i> ${task.date}</span>
            <span title="Project"><i class="ri-folder-2-line"></i> ${task.project}</span>
            <span title="Assignee"><i class="ri-user-line"></i> ${task.assignee}</span>
          </div>
        </div>
      </div>
    `;
    tasksContainer.appendChild(item);
  });

  if (filteredTasks.length === 0) {
    tasksContainer.innerHTML = '<div style="padding: 20px; color: var(--text-muted); text-align: center;">No matching tasks found.</div>';
  }
}

// Global scope so onclick works from inline HTML above
window.toggleTask = function(index) {
  tasks[index].done = !tasks[index].done;
  renderTasks();
  updateStats();
};

function updateStats() {
  totalProjectsEl.innerText = projects.length;
  inProgressEl.innerText = projects.filter(p => p.status === 'In progress').length;
  tasksCompletedEl.innerText = tasks.filter(t => t.done).length;
}

// Add generic click handlers for buttons
function setupInteractions() {
  // Sidebar items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('.nav-item.active').classList.remove('active');
      item.classList.add('active');
      
      const isDashboard = item.innerText.includes('Dashboard');
      const isProjects = item.innerText.includes('Projects');
      const isTasks = item.innerText.includes('Tasks');

      const projectSection = document.querySelector('.projects-section');
      const taskSection = document.querySelector('.tasks-section');

      if (isDashboard) {
        projectSection.style.display = 'block';
        taskSection.style.display = 'block';
        document.querySelector('.dashboard-grid').style.gridTemplateColumns = '1.5fr 1fr';
        // Reset filters
        activeProjectFilter = null;
        searchTerm = "";
        document.querySelector('.search-bar input').value = "";
        document.querySelectorAll('.project-card').forEach(c => c.style.borderColor = 'rgba(255,255,255,0.08)');
        renderTasks();
      } else if (isProjects) {
        projectSection.style.display = 'block';
        taskSection.style.display = 'none';
        document.querySelector('.dashboard-grid').style.gridTemplateColumns = '1fr';
      } else if (isTasks) {
        projectSection.style.display = 'none';
        taskSection.style.display = 'block';
        document.querySelector('.dashboard-grid').style.gridTemplateColumns = '1fr';
      }
    });
  });

  // Action buttons
  const newProjectBtn = document.querySelector('.btn-primary');
  if (newProjectBtn) {
    newProjectBtn.addEventListener('click', () => {
      alert('Feature Coming Soon: New Project Creation Bridge for Notion.');
    });
  }

  const notificationBtn = document.querySelector('.icon-btn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      alert('No new notifications from Shetue OS.');
    });
  }

  const viewAllBtn = document.querySelector('.btn-text');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      activeProjectFilter = null;
      renderTasks();
      document.querySelectorAll('.project-card').forEach(c => c.style.borderColor = 'rgba(255,255,255,0.08)');
      alert('Showing all tasks across all projects.');
    });
  }

  // Search filter
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      renderTasks();
    });
  }
}

// Startup
document.addEventListener('DOMContentLoaded', () => {
  init();
  setupInteractions();
});
