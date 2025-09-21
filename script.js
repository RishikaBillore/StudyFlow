// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthState();
        this.bindAuthEvents();
    }

    bindAuthEvents() {
        // Form switches
        document.getElementById('showSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupForm();
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // Form submissions
        document.getElementById('loginFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signupFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    showSignupForm() {
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('signupForm').classList.add('active');
        this.clearMessages();
    }

    showLoginForm() {
        document.getElementById('signupForm').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
        this.clearMessages();
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid email address.');
            return;
        }

        if (!password) {
            this.showError('Please enter your password.');
            return;
        }

        this.clearMessages();
        
        // Simulate authentication (in real app, this would be an API call)
        const users = JSON.parse(localStorage.getItem('studyflow_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            this.saveAuthState();
            this.showSuccess('Login successful! Welcome back, ' + user.name + '!');
            setTimeout(() => {
                this.showMainApp();
            }, 1000);
        } else {
            this.showError('Invalid email or password. Please try again.');
        }
    }

    async handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!name || name.length < 2) {
            this.showError('Please enter your full name (at least 2 characters).');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match.');
            return;
        }

        this.clearMessages();

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('studyflow_users') || '[]');
        if (users.find(u => u.email === email)) {
            this.showError('An account with this email already exists.');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password, // In real app, this would be hashed
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('studyflow_users', JSON.stringify(users));

        this.currentUser = newUser;
        this.saveAuthState();
        this.showSuccess('Account created successfully! Welcome to StudyFlow, ' + name + '!');
        setTimeout(() => {
            this.showMainApp();
        }, 1000);
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            this.currentUser = null;
            localStorage.removeItem('studyflow_currentUser');
            this.showAuthScreen();
            this.showSuccess('You have been logged out successfully.');
        }
    }

    checkAuthState() {
        const savedUser = localStorage.getItem('studyflow_currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
        } else {
            this.showAuthScreen();
        }
    }

    saveAuthState() {
        if (this.currentUser) {
            localStorage.setItem('studyflow_currentUser', JSON.stringify(this.currentUser));
        }
    }

    showMainApp() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.querySelector('.fab').style.display = 'flex';
        
        if (this.currentUser) {
            document.getElementById('userWelcome').textContent = `Welcome back, ${this.currentUser.name}!`;
        }
        
        // Destroy existing StudyPlanner instance if it exists
        if (window.studyPlanner) {
            // Clean up existing charts
            if (window.studyPlanner.charts) {
                Object.keys(window.studyPlanner.charts).forEach(chartKey => {
                    if (window.studyPlanner.charts[chartKey]) {
                        window.studyPlanner.charts[chartKey].destroy();
                    }
                });
            }
            
            // Clear any running timers
            if (window.studyPlanner.pomodoroTimer) {
                clearInterval(window.studyPlanner.pomodoroTimer);
            }
        }
        
        // Create new StudyPlanner instance for the current user
        window.studyPlanner = new StudyPlanner();
    }

    showAuthScreen() {
        document.getElementById('authContainer').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        document.querySelector('.fab').style.display = 'none';
        
        // Destroy StudyPlanner instance when logging out
        if (window.studyPlanner) {
            // Clean up charts
            if (window.studyPlanner.charts) {
                Object.keys(window.studyPlanner.charts).forEach(chartKey => {
                    if (window.studyPlanner.charts[chartKey]) {
                        window.studyPlanner.charts[chartKey].destroy();
                    }
                });
            }
            
            // Clear timers
            if (window.studyPlanner.pomodoroTimer) {
                clearInterval(window.studyPlanner.pomodoroTimer);
            }
            
            // Reset page title
            document.title = 'StudyFlow - Smart Study Planner';
            
            window.studyPlanner = null;
        }
        
        this.clearForms();
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showError(message) {
        this.clearMessages();
        const activeForm = document.querySelector('.auth-form.active');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        activeForm.insertBefore(errorDiv, activeForm.querySelector('form'));
    }

    showSuccess(message) {
        this.clearMessages();
        const activeForm = document.querySelector('.auth-form.active');
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        activeForm.insertBefore(successDiv, activeForm.querySelector('form'));
    }

    clearMessages() {
        document.querySelectorAll('.error-message, .success-message').forEach(msg => {
            msg.remove();
        });
    }

    clearForms() {
        document.getElementById('loginFormElement').reset();
        document.getElementById('signupFormElement').reset();
        this.clearMessages();
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// StudyFlow Application - Complete JavaScript Implementation with Authentication
class StudyPlanner {
    constructor() {
        // Only initialize if user is authenticated
        if (!window.authManager || !window.authManager.getCurrentUser()) {
            console.log('User not authenticated, skipping StudyPlanner initialization');
            return;
        }
        
        this.currentUser = window.authManager.getCurrentUser();
        this.charts = {};
        this.pomodoroTimer = null;
        this.pomodoroState = {
            isRunning: false,
            isPaused: false,
            timeLeft: 25 * 60, // 25 minutes in seconds
            isBreak: false,
            workDuration: 25,
            breakDuration: 5
        };
        
        // Clear any existing UI state before loading new user data
        this.clearUIState();
        
        // Load user-specific data
        this.tasks = this.loadTasks();
        this.timeline = this.loadTimeline();
        this.settings = this.loadSettings();
        
        this.init();
    }

    // Clear UI state when switching users
    clearUIState() {
        // Clear task list
        const taskList = document.getElementById('taskList');
        if (taskList) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <h3>Loading your tasks...</h3>
                </div>
            `;
        }
        
        // Clear timeline
        const timeline = document.getElementById('timeline');
        if (timeline) {
            timeline.innerHTML = `
                <div class="timeline-empty">
                    <p>Loading your activity...</p>
                </div>
            `;
        }
        
        // Clear stats
        ['totalTasks', 'completedTasks', 'pendingTasks', 'studyStreak'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = '0';
        });
        
        // Clear progress
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        if (progressFill) progressFill.style.width = '0%';
        if (progressPercent) progressPercent.textContent = '0%';
        
        // Reset form
        const form = document.getElementById('taskForm');
        if (form) form.reset();
        
        // Reset filters
        const filterTasks = document.getElementById('filterTasks');
        const sortTasks = document.getElementById('sortTasks');
        if (filterTasks) filterTasks.value = 'all';
        if (sortTasks) sortTasks.value = 'dueDate';
        
        // Close any open modals
        this.closeTaskModal();
        this.closePomodoroModal();
    }

    // Get user-specific storage key
    getUserStorageKey(key) {
        const userId = this.currentUser ? this.currentUser.id : 'guest';
        return `studyPlanner_${userId}_${key}`;
    }

    init() {
        console.log(`Initializing StudyPlanner for user: ${this.currentUser.name} (ID: ${this.currentUser.id})`);
        console.log(`Loading data with keys:`, {
            tasks: this.getUserStorageKey('tasks'),
            timeline: this.getUserStorageKey('timeline'),
            settings: this.getUserStorageKey('settings')
        });
        
        this.initializeTheme();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
        this.renderTimeline();
        this.initializeCharts();
        this.setDefaultDate();
        this.checkNotificationPermission();
        this.scheduleReminders();
        this.updateStudyStreak();
        
        console.log(`StudyPlanner initialized with ${this.tasks.length} tasks and ${this.timeline.length} timeline items`);
    }

    // Theme Management (User-Specific)
    initializeTheme() {
        const savedTheme = this.loadUserSetting('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.saveUserSetting('theme', newTheme);
        this.updateThemeIcon(newTheme);
        
        // Reinitialize charts with new theme
        setTimeout(() => {
            this.initializeCharts();
        }, 100);
    }

    updateThemeIcon(theme) {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // User-specific setting methods
    loadUserSetting(key) {
        try {
            const userKey = this.getUserStorageKey('settings');
            const settings = JSON.parse(localStorage.getItem(userKey) || '{}');
            return settings[key];
        } catch (e) {
            console.error('Error loading user setting:', e);
            return null;
        }
    }

    saveUserSetting(key, value) {
        try {
            const userKey = this.getUserStorageKey('settings');
            const settings = JSON.parse(localStorage.getItem(userKey) || '{}');
            settings[key] = value;
            localStorage.setItem(userKey, JSON.stringify(settings));
        } catch (e) {
            console.error('Error saving user setting:', e);
        }
    }

    // Event Binding
    bindEvents() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Theme toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Notification toggle
        document.getElementById('notificationToggle').addEventListener('click', () => {
            this.toggleNotifications();
        });

        // Filter and sort
        const filterTasks = document.getElementById('filterTasks');
        const sortTasks = document.getElementById('sortTasks');
        
        if (filterTasks) {
            filterTasks.addEventListener('change', () => {
                this.renderTasks();
            });
        }

        if (sortTasks) {
            sortTasks.addEventListener('change', () => {
                this.renderTasks();
            });
        }

        // Modal events
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeTaskModal();
            }
        });

        document.getElementById('pomodoroModal').addEventListener('click', (e) => {
            if (e.target.id === 'pomodoroModal') {
                this.closePomodoroModal();
            }
        });

        // Notification banner events
        const enableNotificationsBtn = document.getElementById('enableNotifications');
        const dismissBannerBtn = document.getElementById('dismissBanner');
        
        if (enableNotificationsBtn) {
            enableNotificationsBtn.addEventListener('click', () => {
                this.requestNotificationPermission();
            });
        }

        if (dismissBannerBtn) {
            dismissBannerBtn.addEventListener('click', () => {
                this.hideNotificationBanner();
            });
        }

        // Pomodoro timer events
        this.bindPomodoroEvents();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTaskModal();
                this.closePomodoroModal();
            }
        });
    }

    bindPomodoroEvents() {
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        const resetBtn = document.getElementById('resetTimer');
        const workDurationInput = document.getElementById('workDuration');
        const breakDurationInput = document.getElementById('breakDuration');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startPomodoroTimer());
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pausePomodoroTimer());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetPomodoroTimer());
        }

        if (workDurationInput) {
            workDurationInput.addEventListener('change', (e) => {
                this.pomodoroState.workDuration = parseInt(e.target.value);
                if (!this.pomodoroState.isBreak && !this.pomodoroState.isRunning) {
                    this.pomodoroState.timeLeft = this.pomodoroState.workDuration * 60;
                    this.updatePomodoroDisplay();
                }
            });
        }

        if (breakDurationInput) {
            breakDurationInput.addEventListener('change', (e) => {
                this.pomodoroState.breakDuration = parseInt(e.target.value);
                if (this.pomodoroState.isBreak && !this.pomodoroState.isRunning) {
                    this.pomodoroState.timeLeft = this.pomodoroState.breakDuration * 60;
                    this.updatePomodoroDisplay();
                }
            });
        }
    }

    // Task Management
    setDefaultDate() {
        const now = new Date();
        now.setHours(now.getHours() + 1); // Default to 1 hour from now
        now.setMinutes(0, 0, 0); // Round to nearest hour
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        document.getElementById('dueDate').value = localDateTime;
    }

    addTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const subject = document.getElementById('taskSubject').value;
        const dueDate = document.getElementById('dueDate').value;
        const estimatedTime = parseFloat(document.getElementById('estimatedTime').value);
        const reminderTime = parseInt(document.getElementById('reminderTime').value);

        if (!title || !dueDate) {
            this.showToast('Error', 'Please fill in all required fields', 'error');
            return;
        }

        const task = {
            id: Date.now().toString(),
            title,
            description,
            priority,
            subject,
            dueDate,
            estimatedTime,
            reminderTime,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.push(task);
        this.addToTimeline(`Created task: ${title}`, 'create');
        this.saveTasks();
        this.saveTimeline();
        this.renderTasks();
        this.updateStats();
        this.renderTimeline();
        this.updateCharts();
        this.clearForm();
        this.showToast('Success', 'Task added successfully!', 'success');
        this.scheduleReminder(task);
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            
            const action = task.completed ? 'completed' : 'reopened';
            this.addToTimeline(`${action.charAt(0).toUpperCase() + action.slice(1)} task: ${task.title}`, action === 'completed' ? 'complete' : 'create');
            
            this.saveTasks();
            this.saveTimeline();
            this.renderTasks();
            this.updateStats();
            this.renderTimeline();
            this.updateCharts();
            this.updateStudyStreak();
            
            this.showToast('Success', `Task ${action}!`, 'success');
            
            if (task.completed) {
                this.showCompletionCelebration();
            }
        }
    }

    deleteTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task && confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.addToTimeline(`Deleted task: ${task.title}`, 'delete');
            this.saveTasks();
            this.saveTimeline();
            this.renderTasks();
            this.updateStats();
            this.renderTimeline();
            this.updateCharts();
            this.showToast('Success', 'Task deleted!', 'success');
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskSubject').value = task.subject;
            document.getElementById('dueDate').value = task.dueDate;
            document.getElementById('estimatedTime').value = task.estimatedTime;
            document.getElementById('reminderTime').value = task.reminderTime;
            
            this.deleteTask(id);
            document.getElementById('taskTitle').focus();
        }
    }

    // Rendering Methods
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const filterEl = document.getElementById('filterTasks');
        const sortEl = document.getElementById('sortTasks');
        
        const filter = filterEl ? filterEl.value : 'all';
        const sort = sortEl ? sortEl.value : 'dueDate';
        
        let filteredTasks = this.tasks;
        
        // Apply filters
        switch (filter) {
            case 'pending':
                filteredTasks = this.tasks.filter(t => !t.completed);
                break;
            case 'completed':
                filteredTasks = this.tasks.filter(t => t.completed);
                break;
            case 'overdue':
                filteredTasks = this.tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date());
                break;
        }
        
        // Apply sorting
        switch (sort) {
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'created':
                filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default: // dueDate
                filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        }
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <h3>${filter === 'all' ? 'No tasks yet!' : `No ${filter} tasks`}</h3>
                    <p>${filter === 'all' ? 'Add your first study goal to get started on your academic journey.' : `You don't have any ${filter} tasks at the moment.`}</p>
                </div>
            `;
            return;
        }

        taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
    }

    createTaskHTML(task) {
        const isOverdue = !task.completed && new Date(task.dueDate) < new Date();
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const timeDiff = dueDate - now;

        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" 
                 onclick="studyPlanner.showTaskDetails('${task.id}')">
                <div class="task-header">
                    <span class="task-title">${task.title}</span>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
                
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                
                <div class="task-meta">
                    <div class="task-info">
                        <div class="task-info-item">
                            <svg class="icon" viewBox="0 0 24 24">
                                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                            </svg>
                            <span ${isOverdue ? 'class="overdue-indicator"' : ''}>
                                ${isOverdue ? 'Overdue' : this.formatTimeLeft(timeDiff)}
                            </span>
                        </div>
                        
                        <div class="task-info-item">
                            <svg class="icon" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span>${task.estimatedTime}h</span>
                        </div>
                        
                        <div class="task-subject">${task.subject}</div>
                    </div>
                    
                    <div class="task-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-small ${task.completed ? 'btn-secondary' : 'btn-primary'}" 
                                onclick="studyPlanner.toggleTask('${task.id}')" 
                                title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                            ${task.completed ? '↻' : '✓'}
                        </button>
                        ${!task.completed ? `
                            <button class="btn btn-small btn-warning" 
                                    onclick="studyPlanner.startPomodoro('${task.id}')" 
                                    title="Start Pomodoro">
                                ⏲️
                            </button>
                        ` : ''}
                        <button class="btn btn-small" 
                                onclick="studyPlanner.editTask('${task.id}')" 
                                title="Edit task">
                            ✎
                        </button>
                        <button class="btn btn-small btn-danger" 
                                onclick="studyPlanner.deleteTask('${task.id}')" 
                                title="Delete task">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showTaskDetails(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const modal = document.getElementById('taskModal');
        const modalBody = document.getElementById('modalBody');
        
        const isOverdue = !task.completed && new Date(task.dueDate) < new Date();
        
        modalBody.innerHTML = `
            <div class="task-details">
                <div class="task-detail-header">
                    <h3>${task.title}</h3>
                    <span class="task-priority priority-${task.priority}">${task.priority} Priority</span>
                </div>
                
                ${task.description ? `
                    <div class="task-detail-section">
                        <h4>Description</h4>
                        <p>${task.description}</p>
                    </div>
                ` : ''}
                
                <div class="task-detail-grid">
                    <div class="task-detail-item">
                        <label>Subject</label>
                        <span class="task-subject">${task.subject}</span>
                    </div>
                    
                    <div class="task-detail-item">
                        <label>Due Date</label>
                        <span ${isOverdue ? 'class="overdue-indicator"' : ''}>
                            ${this.formatDate(task.dueDate)}
                        </span>
                    </div>
                    
                    <div class="task-detail-item">
                        <label>Estimated Time</label>
                        <span>${task.estimatedTime} hours</span>
                    </div>
                    
                    <div class="task-detail-item">
                        <label>Status</label>
                        <span class="${task.completed ? 'text-success' : (isOverdue ? 'overdue-indicator' : 'text-warning')}">
                            ${task.completed ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending')}
                        </span>
                    </div>
                    
                    <div class="task-detail-item">
                        <label>Created</label>
                        <span>${this.formatDate(task.createdAt, true)}</span>
                    </div>
                    
                    ${task.completedAt ? `
                        <div class="task-detail-item">
                            <label>Completed</label>
                            <span>${this.formatDate(task.completedAt, true)}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="task-detail-actions">
                    <button class="btn ${task.completed ? 'btn-secondary' : 'btn-primary'}" 
                            onclick="studyPlanner.toggleTask('${task.id}'); studyPlanner.closeTaskModal();">
                        ${task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                    </button>
                    ${!task.completed ? `
                        <button class="btn btn-warning" onclick="studyPlanner.startPomodoro('${task.id}'); studyPlanner.closeTaskModal();">
                            Start Pomodoro Timer
                        </button>
                    ` : ''}
                    <button class="btn" onclick="studyPlanner.editTask('${task.id}'); studyPlanner.closeTaskModal();">
                        Edit Task
                    </button>
                    <button class="btn btn-danger" onclick="studyPlanner.deleteTask('${task.id}'); studyPlanner.closeTaskModal();">
                        Delete Task
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    }

    closeTaskModal() {
        document.getElementById('taskModal').style.display = 'none';
    }

    formatTimeLeft(timeDiff) {
        if (timeDiff < 0) return 'Overdue';
        
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            return `${days}d ${hours}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    // Statistics and Analytics
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const progress = total > 0 ? (completed / total) * 100 : 0;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('progressPercent').textContent = `${Math.round(progress)}%`;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('studyStreak').textContent = this.calculateStudyStreak();
    }

    calculateStudyStreak() {
        const completedTasks = this.tasks.filter(t => t.completed && t.completedAt)
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        
        if (completedTasks.length === 0) return 0;
        
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        for (let task of completedTasks) {
            const taskDate = new Date(task.completedAt);
            taskDate.setHours(0, 0, 0, 0);
            
            const daysDiff = (currentDate - taskDate) / (1000 * 60 * 60 * 24);
            
            if (daysDiff === streak) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (daysDiff > streak) {
                break;
            }
        }
        
        return streak;
    }

    updateStudyStreak() {
        const streakElement = document.getElementById('studyStreak');
        if (streakElement) {
            streakElement.textContent = this.calculateStudyStreak();
        }
    }

    // Data Management with User-Specific Storage
    loadTasks() {
        try {
            const key = this.getUserStorageKey('tasks');
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            console.error('Error loading tasks:', e);
            return [];
        }
    }

    saveTasks() {
        try {
            const key = this.getUserStorageKey('tasks');
            localStorage.setItem(key, JSON.stringify(this.tasks));
        } catch (e) {
            console.error('Error saving tasks:', e);
            this.showToast('Error', 'Failed to save tasks. Please check your browser storage.', 'error');
        }
    }

    loadTimeline() {
        try {
            const key = this.getUserStorageKey('timeline');
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            console.error('Error loading timeline:', e);
            return [];
        }
    }

    saveTimeline() {
        try {
            const key = this.getUserStorageKey('timeline');
            localStorage.setItem(key, JSON.stringify(this.timeline));
        } catch (e) {
            console.error('Error saving timeline:', e);
        }
    }

    loadSettings() {
        try {
            const key = this.getUserStorageKey('settings');
            return JSON.parse(localStorage.getItem(key) || '{}');
        } catch (e) {
            console.error('Error loading settings:', e);
            return {};
        }
    }

    saveSettings() {
        try {
            const key = this.getUserStorageKey('settings');
            localStorage.setItem(key, JSON.stringify(this.settings));
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    }

    // Clear All Data Method (User-Specific) - CORRECTED VERSION
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This will permanently delete all tasks, timeline, and settings. This action cannot be undone!')) {
            if (confirm('FINAL WARNING: This will delete EVERYTHING! All your tasks, progress, and data will be permanently lost. Click OK to DELETE ALL DATA or Cancel to keep everything.')) {
                try {
                    // Clear user-specific localStorage items
                    const userId = this.currentUser ? this.currentUser.id : 'guest';
                    const keysToRemove = [
                        `studyPlanner_${userId}_tasks`,
                        `studyPlanner_${userId}_timeline`,
                        `studyPlanner_${userId}_settings`
                    ];
                    
                    keysToRemove.forEach(key => {
                        localStorage.removeItem(key);
                    });
                    
                    // Reset application state
                    this.tasks = [];
                    this.timeline = [];
                    this.settings = {};
                    
                    // Stop any running timers
                    if (this.pomodoroTimer) {
                        clearInterval(this.pomodoroTimer);
                        this.pomodoroTimer = null;
                    }
                    
                    // Reset pomodoro state
                    this.pomodoroState = {
                        isRunning: false,
                        isPaused: false,
                        timeLeft: 25 * 60,
                        isBreak: false,
                        workDuration: 25,
                        breakDuration: 5
                    };
                    
                    // Close any open modals
                    this.closeTaskModal();
                    this.closePomodoroModal();
                    
                    // Reset page title
                    document.title = 'StudyFlow - Smart Study Planner';
                    
                    // Clear all charts
                    Object.keys(this.charts).forEach(chartKey => {
                        if (this.charts[chartKey]) {
                            this.charts[chartKey].destroy();
                        }
                    });
                    this.charts = {};
                    
                    // Reset forms and filters
                    const form = document.getElementById('taskForm');
                    if (form) form.reset();
                    
                    const filterTasks = document.getElementById('filterTasks');
                    const sortTasks = document.getElementById('sortTasks');
                    if (filterTasks) filterTasks.value = 'all';
                    if (sortTasks) sortTasks.value = 'dueDate';
                    
                    // Re-render everything
                    this.renderTasks();
                    this.updateStats();
                    this.renderTimeline();
                    this.initializeCharts();
                    this.setDefaultDate();
                    
                    this.showToast('Complete Reset!', 'All data has been permanently deleted. You now have a fresh start!', 'success');
                    
                } catch (error) {
                    console.error('Error clearing data:', error);
                    this.showToast('Error', 'There was an error clearing some data. Please try refreshing the page manually.', 'error');
                }
            } else {
                this.showToast('Cancelled', 'Data clearing cancelled. All your information is safe!', 'info');
            }
        } else {
            this.showToast('Cancelled', 'Data clearing cancelled. Nothing was deleted.', 'info');
        }
    }

    // Charts and Analytics
    initializeCharts() {
        this.initializePriorityChart();
        this.initializeSubjectChart();
        this.initializeActivityChart();
    }

    initializePriorityChart() {
        const ctx = document.getElementById('priorityChart');
        if (!ctx) return;

        const priorityData = {
            high: this.tasks.filter(t => t.priority === 'high').length,
            medium: this.tasks.filter(t => t.priority === 'medium').length,
            low: this.tasks.filter(t => t.priority === 'low').length
        };

        if (this.charts.priority) {
            this.charts.priority.destroy();
        }

        this.charts.priority = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['High Priority', 'Medium Priority', 'Low Priority'],
                datasets: [{
                    data: [priorityData.high, priorityData.medium, priorityData.low],
                    backgroundColor: ['#f56565', '#ed8936', '#48bb78'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 11 },
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                        }
                    }
                }
            }
        });
    }

    initializeSubjectChart() {
        const ctx = document.getElementById('subjectChart');
        if (!ctx) return;

        const subjects = {};
        this.tasks.forEach(task => {
            subjects[task.subject] = subjects[task.subject] || { total: 0, completed: 0 };
            subjects[task.subject].total++;
            if (task.completed) subjects[task.subject].completed++;
        });

        if (this.charts.subject) {
            this.charts.subject.destroy();
        }

        const labels = Object.keys(subjects);
        const completedData = labels.map(subject => subjects[subject].completed);
        const pendingData = labels.map(subject => subjects[subject].total - subjects[subject].completed);

        this.charts.subject = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
                datasets: [{
                    label: 'Completed',
                    data: completedData,
                    backgroundColor: '#48bb78'
                }, {
                    label: 'Pending',
                    data: pendingData,
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true }
                }
            }
        });
    }

    initializeActivityChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;

        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last7Days.push({
                date: date,
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                completed: 0
            });
        }

        this.tasks.filter(t => t.completed && t.completedAt).forEach(task => {
            const taskDate = new Date(task.completedAt);
            const dayIndex = last7Days.findIndex(day => 
                day.date.toDateString() === taskDate.toDateString()
            );
            if (dayIndex !== -1) {
                last7Days[dayIndex].completed++;
            }
        });

        if (this.charts.activity) {
            this.charts.activity.destroy();
        }

        this.charts.activity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(day => day.label),
                datasets: [{
                    label: 'Tasks Completed',
                    data: last7Days.map(day => day.completed),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    updateCharts() {
        setTimeout(() => {
            this.initializeCharts();
        }, 100);
    }

    // Timeline Management
    addToTimeline(message, type) {
        const timelineItem = {
            id: Date.now().toString(),
            message,
            type,
            timestamp: new Date().toISOString()
        };
        
        this.timeline.unshift(timelineItem);
        this.timeline = this.timeline.slice(0, 20);
    }

    renderTimeline() {
        const timelineEl = document.getElementById('timeline');
        
        if (this.timeline.length === 0) {
            timelineEl.innerHTML = `
                <div class="timeline-empty">
                    <p>Your activity will appear here as you complete tasks and reach milestones.</p>
                </div>
            `;
            return;
        }

        timelineEl.innerHTML = this.timeline.map(item => `
            <div class="timeline-item ${item.type}">
                <div class="timeline-content">
                    <div class="timeline-message">${item.message}</div>
                    <div class="timeline-time">${this.formatDate(item.timestamp, true)}</div>
                </div>
            </div>
        `).join('');
    }

    // Pomodoro Timer
    startPomodoro(taskId = null) {
        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                this.currentPomodoroTask = task;
                this.showToast('Pomodoro Started', `Working on: ${task.title}`, 'success');
            }
        }
        this.showPomodoroModal();
    }

    showPomodoroModal() {
        const modal = document.getElementById('pomodoroModal');
        modal.style.display = 'flex';
        this.updatePomodoroDisplay();
    }

    closePomodoroModal() {
        document.getElementById('pomodoroModal').style.display = 'none';
        if (this.pomodoroTimer) {
            this.pausePomodoroTimer();
        }
    }

    startPomodoroTimer() {
        if (this.pomodoroState.isRunning) return;

        this.pomodoroState.isRunning = true;
        this.pomodoroState.isPaused = false;

        this.pomodoroTimer = setInterval(() => {
            this.pomodoroState.timeLeft--;
            this.updatePomodoroDisplay();

            if (this.pomodoroState.timeLeft <= 0) {
                this.pomodoroComplete();
            }
        }, 1000);

        this.updatePomodoroButtons();
    }

    pausePomodoroTimer() {
        if (!this.pomodoroState.isRunning) return;

        this.pomodoroState.isRunning = false;
        this.pomodoroState.isPaused = true;

        if (this.pomodoroTimer) {
            clearInterval(this.pomodoroTimer);
            this.pomodoroTimer = null;
        }

        this.updatePomodoroButtons();
    }

    resetPomodoroTimer() {
        this.pomodoroState.isRunning = false;
        this.pomodoroState.isPaused = false;
        this.pomodoroState.timeLeft = this.pomodoroState.isBreak ? 
            this.pomodoroState.breakDuration * 60 : 
            this.pomodoroState.workDuration * 60;

        if (this.pomodoroTimer) {
            clearInterval(this.pomodoroTimer);
            this.pomodoroTimer = null;
        }

        this.updatePomodoroDisplay();
        this.updatePomodoroButtons();
    }

    pomodoroComplete() {
        this.pomodoroState.isRunning = false;
        this.pomodoroState.isPaused = false;

        if (this.pomodoroTimer) {
            clearInterval(this.pomodoroTimer);
            this.pomodoroTimer = null;
        }

        if (this.pomodoroState.isBreak) {
            this.pomodoroState.isBreak = false;
            this.pomodoroState.timeLeft = this.pomodoroState.workDuration * 60;
            this.showToast('Break Complete!', 'Time to get back to work!', 'success');
        } else {
            this.pomodoroState.isBreak = true;
            this.pomodoroState.timeLeft = this.pomodoroState.breakDuration * 60;
            this.showToast('Work Session Complete!', 'Time for a well-deserved break!', 'success');
            
            if (this.currentPomodoroTask) {
                this.addToTimeline(`Completed Pomodoro session for: ${this.currentPomodoroTask.title}`, 'complete');
                this.saveTimeline();
                this.renderTimeline();
            }
        }

        this.updatePomodoroDisplay();
        this.updatePomodoroButtons();
    }

    updatePomodoroDisplay() {
        const minutes = Math.floor(this.pomodoroState.timeLeft / 60);
        const seconds = this.pomodoroState.timeLeft % 60;

        const timerMinutes = document.getElementById('timerMinutes');
        const timerSeconds = document.getElementById('timerSeconds');

        if (timerMinutes) timerMinutes.textContent = minutes.toString().padStart(2, '0');
        if (timerSeconds) timerSeconds.textContent = seconds.toString().padStart(2, '0');

        if (this.pomodoroState.isRunning) {
            document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - StudyFlow`;
        } else {
            document.title = 'StudyFlow - Smart Study Planner';
        }
    }

    updatePomodoroButtons() {
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');

        if (startBtn) {
            startBtn.textContent = this.pomodoroState.isPaused ? 'Resume' : 'Start';
            startBtn.disabled = this.pomodoroState.isRunning;
        }

        if (pauseBtn) {
            pauseBtn.disabled = !this.pomodoroState.isRunning;
        }
    }

    // Notifications (User-Specific)
    checkNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            // Check if user has dismissed banner before
            const dismissed = this.loadUserSetting('notificationBannerDismissed');
            if (!dismissed) {
                this.showNotificationBanner();
            }
        }
    }

    showNotificationBanner() {
        const banner = document.getElementById('notificationBanner');
        if (banner) {
            banner.style.display = 'flex';
        }
    }

    hideNotificationBanner() {
        const banner = document.getElementById('notificationBanner');
        if (banner) {
            banner.style.display = 'none';
        }
        // Save dismissal state per user
        this.saveUserSetting('notificationBannerDismissed', true);
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.showToast('Success', 'Notifications enabled!', 'success');
                this.hideNotificationBanner();
            } else {
                this.showToast('Info', 'Notifications not enabled.', 'warning');
            }
        }
    }

    toggleNotifications() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.showToast('Info', 'Notifications are currently enabled.', 'success');
            } else {
                this.requestNotificationPermission();
            }
        }
    }

    scheduleReminder(task) {
        if (task.reminderTime === 0) return;

        const dueDate = new Date(task.dueDate);
        const reminderTime = new Date(dueDate.getTime() - task.reminderTime * 60 * 1000);
        const now = new Date();

        if (reminderTime > now) {
            const timeToReminder = reminderTime.getTime() - now.getTime();
            
            setTimeout(() => {
                if (!this.tasks.find(t => t.id === task.id)?.completed) {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Task Reminder', {
                            body: `"${task.title}" is due in ${task.reminderTime} minutes!`
                        });
                    }
                    this.showToast('Reminder', `"${task.title}" is due soon!`, 'warning');
                }
            }, timeToReminder);
        }
    }

    scheduleReminders() {
        this.tasks.filter(t => !t.completed && t.reminderTime > 0).forEach(task => {
            this.scheduleReminder(task);
        });
    }

    // Utility Methods
    formatDate(dateString, includeTime = false) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (includeTime && diffDays < 1) {
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            
            if (diffHours < 1) {
                return diffMinutes < 1 ? 'Just now' : `${diffMinutes} minutes ago`;
            }
            return `${diffHours} hours ago`;
        }

        const options = { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
            ...(includeTime && { hour: '2-digit', minute: '2-digit' })
        };
        
        return date.toLocaleDateString('en-US', options);
    }

    clearForm() {
        document.getElementById('taskForm').reset();
        this.setDefaultDate();
    }

    showCompletionCelebration() {
        const celebration = document.createElement('div');
        celebration.innerHTML = '🎉';
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            z-index: 1002;
            animation: celebrationBounce 1s ease-out forwards;
            pointer-events: none;
        `;
        
        if (!document.querySelector('#celebration-style')) {
            const style = document.createElement('style');
            style.id = 'celebration-style';
            style.textContent = `
                @keyframes celebrationBounce {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
                    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
        }, 1000);
    }

    showToast(title, message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }
}

// Global functions for HTML onclick handlers
function clearAllData() {
    if (window.studyPlanner) {
        window.studyPlanner.clearAllData();
    }
}

function closeTaskModal() {
    if (window.studyPlanner) {
        window.studyPlanner.closeTaskModal();
    }
}

function closePomodoroModal() {
    if (window.studyPlanner) {
        window.studyPlanner.closePomodoroModal();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize authentication first
    window.authManager = new AuthManager();
    
    // StudyPlanner will be initialized by AuthManager after successful login
});

// Handle page visibility changes for timers
document.addEventListener('visibilitychange', () => {
    if (window.studyPlanner && window.studyPlanner.pomodoroState.isRunning) {
        if (!document.hidden) {
            window.studyPlanner.updatePomodoroDisplay();
        }
    }
});

// Add keyboard shortcuts (only when authenticated)
document.addEventListener('keydown', (e) => {
    // Only allow shortcuts when main app is visible
    if (document.getElementById('mainApp').style.display === 'none') return;
    
    // Ctrl/Cmd + Enter to add task quickly
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const taskTitle = document.getElementById('taskTitle');
        if (taskTitle && taskTitle.value.trim()) {
            document.getElementById('taskForm').dispatchEvent(new Event('submit'));
        }
    }
    
    // Ctrl/Cmd + K to focus on task title (quick add)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const taskTitle = document.getElementById('taskTitle');
        if (taskTitle) {
            taskTitle.focus();
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closeTaskModal();
        closePomodoroModal();
    }

});
