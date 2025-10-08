// MedAide AI - Interactive JavaScript Features

// Global Variables
let currentSection = 'dashboard';
let timer = null;
let timerDuration = 25 * 60; // 25 minutes in seconds
let timerRemaining = timerDuration;
let isTimerRunning = false;
let currentMood = null;
let studyStreak = 7;
let totalStudyHours = 24.5;
let loadedWellnessTips = [];

// User Data
let userData = {
    name: '',
    year: '',
    specialty: '',
    marks: {
        cardiology: 0,
        respiratory: 0,
        neurology: 0,
        pharmacology: 0,
        anatomy: 0,
        clinical: 0
    },
    preferences: {
        sessionLength: 25,
        contentType: ['video', 'article', 'quiz'],
        stressLevel: 5
    },
    isOnboarded: false
};

// Onboarding state
let currentOnboardingStep = 1;
const totalOnboardingSteps = 3;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadUserData();
    updateDashboard();
    initializeCharts();
    
    // Make recommendation buttons functional
    setTimeout(() => {
        makeRecommendationButtonsFunctional();
    }, 1000);
});

// Initialize app components
function initializeApp() {
    // Check if user is onboarded
    loadUserData();
    
    if (!userData.isOnboarded) {
        showOnboarding();
    } else {
        hideOnboarding();
        updateUserInterface();
    }
    
    // Set initial timer display
    updateTimerDisplay();
    
    // Initialize progress bars
    animateProgressBars();
    
    // Setup PWA features
    setupPWA();

    // Preload wellness tips for quick access
    loadWellnessTips();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Timer controls
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);

    // Mood tracking
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const mood = this.getAttribute('data-mood');
            logMood(mood);
        });
    });

    // FAB menu
    document.getElementById('mainFab').addEventListener('click', toggleFabMenu);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Window events
    window.addEventListener('beforeunload', saveData);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
}

// Navigation functions
function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    document.getElementById(sectionName).classList.add('active');

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    currentSection = sectionName;

    // Section-specific initialization
    switch(sectionName) {
        case 'study':
            initializeStudySection();
            break;
        case 'wellness':
            initializeWellnessSection();
            break;
        case 'progress':
            initializeProgressSection();
            break;
    }

    // Analytics tracking
    trackSectionView(sectionName);
}

// Dashboard functions
function updateDashboard() {
    updateStats();
    updateRecentActivity();
    updateQuickActions();
}

function updateStats() {
    // Update study hours
    document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = totalStudyHours.toFixed(1);
    
    // Update streak
    document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = `${studyStreak} days`;
    
    // Update focus score (calculated from recent performance)
    const focusScore = calculateFocusScore();
    document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = `${focusScore}%`;
    
    // Update wellness status
    const wellnessStatus = getWellnessStatus();
    document.querySelector('.stat-card:nth-child(4) .stat-number').textContent = wellnessStatus;
}

function calculateFocusScore() {
    // Simulate focus score calculation based on recent activity
    const baseScore = 75;
    const streakBonus = studyStreak * 2;
    const moodBonus = currentMood === 'excellent' ? 10 : currentMood === 'good' ? 5 : 0;
    return Math.min(100, baseScore + streakBonus + moodBonus);
}

function getWellnessStatus() {
    if (currentMood === 'excellent' || currentMood === 'good') return 'Good';
    if (currentMood === 'okay') return 'Fair';
    if (currentMood === 'tired' || currentMood === 'stressed') return 'Needs Attention';
    return 'Unknown';
}

// Study timer functions
function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        timer = setInterval(updateTimer, 1000);
        
        document.getElementById('startTimer').disabled = true;
        document.getElementById('pauseTimer').disabled = false;
        
        // Update UI
        document.getElementById('startTimer').innerHTML = '<i class="fas fa-play"></i> Running';
        
        // Show notification
        showToast('Timer started! Focus time begins now.', 'success');
        
        // Analytics
        trackTimerStart();
    }
}

function pauseTimer() {
    if (isTimerRunning) {
        isTimerRunning = false;
        clearInterval(timer);
        
        document.getElementById('startTimer').disabled = false;
        document.getElementById('pauseTimer').disabled = true;
        
        // Update UI
        document.getElementById('startTimer').innerHTML = '<i class="fas fa-play"></i> Resume';
        
        showToast('Timer paused. Take a moment if needed.', 'warning');
    }
}

function resetTimer() {
    isTimerRunning = false;
    clearInterval(timer);
    timerRemaining = timerDuration;
    
    document.getElementById('startTimer').disabled = false;
    document.getElementById('pauseTimer').disabled = true;
    
    // Update UI
    document.getElementById('startTimer').innerHTML = '<i class="fas fa-play"></i> Start';
    
    updateTimerDisplay();
    showToast('Timer reset. Ready for a fresh start!', 'info');
}

function updateTimer() {
    timerRemaining--;
    updateTimerDisplay();
    
    if (timerRemaining <= 0) {
        timerComplete();
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerRemaining / 60);
    const seconds = timerRemaining % 60;
    
    document.getElementById('timerMinutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('timerSeconds').textContent = seconds.toString().padStart(2, '0');
    
    // Update progress circle
    const progress = ((timerDuration - timerRemaining) / timerDuration) * 283;
    document.getElementById('timerProgress').style.strokeDashoffset = 283 - progress;
}

function timerComplete() {
    isTimerRunning = false;
    clearInterval(timer);
    
    // Update UI
    document.getElementById('startTimer').disabled = false;
    document.getElementById('pauseTimer').disabled = true;
    document.getElementById('startTimer').innerHTML = '<i class="fas fa-play"></i> Start';
    
    // Show completion notification
    showToast('🎉 Study session complete! Time for a well-deserved break.', 'success');
    
    // Update stats
    totalStudyHours += timerDuration / 3600;
    studyStreak++;
    
    // Trigger break suggestion
    setTimeout(() => {
        suggestBreak();
    }, 2000);
    
    // Analytics
    trackTimerComplete();
}

function setTimer(minutes) {
    timerDuration = minutes * 60;
    timerRemaining = timerDuration;
    updateTimerDisplay();
    
    showToast(`Timer set to ${minutes} minutes`, 'info');
}

// Mood tracking functions
function logMood(mood) {
    currentMood = mood;
    
    // Update UI
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-mood="${mood}"]`).classList.add('selected');
    
    // Save mood data
    saveMoodData(mood);
    
    // Show personalized response
    const responses = {
        excellent: "Fantastic! You're in great spirits today! 🌟",
        good: "Wonderful! Keep up the positive energy! 😊",
        okay: "That's okay! Every day has its ups and downs. 💪",
        tired: "Take it easy! Rest is just as important as study. 😴",
        stressed: "Remember to breathe. You've got this! 💙"
    };
    
    showToast(responses[mood], 'success');
    
    // Update wellness analytics
    updateWellnessAnalytics();
    
    // Analytics
    trackMoodLog(mood);
}

function saveMoodData(mood) {
    const moodData = {
        mood: mood,
        timestamp: new Date().toISOString(),
        day: new Date().toDateString()
    };
    
    let moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    moodHistory.push(moodData);
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    moodHistory = moodHistory.filter(entry => 
        new Date(entry.timestamp) > thirtyDaysAgo
    );
    
    localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
}

// Wellness functions
function suggestBreak() {
    const dynamicTips = (loadedWellnessTips && loadedWellnessTips.length > 0)
        ? loadedWellnessTips.map(t => ({
            title: t.title,
            description: t.description,
            duration: t.duration_minutes,
            category: t.category
        }))
        : [
            { title: "5-Minute Box Breathing", description: "Calm your mind with guided breathing exercises.", duration: 5, category: "Mindfulness" },
            { title: "Desk Stretches", description: "Simple stretches to relieve tension.", duration: 3, category: "Physical" },
            { title: "Hydration Break", description: "Drink water and step away from your desk.", duration: 2, category: "Physical" },
            { title: "Quick Walk", description: "Take a short walk to refresh your mind.", duration: 5, category: "Physical" }
        ];
    
    const randomTip = dynamicTips[Math.floor(Math.random() * dynamicTips.length)];
    
    showBreakSuggestion(randomTip);
}

function showBreakSuggestion(tip) {
    const modal = createBreakModal(tip);
    document.body.appendChild(modal);
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 10000);
}

function createBreakModal(tip) {
    const modal = document.createElement('div');
    modal.className = 'break-modal';
    modal.innerHTML = `
        <div class="break-modal-content">
            <div class="break-modal-header">
                <h3>💡 Break Suggestion</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="break-modal-body">
                <h4>${tip.title}</h4>
                <p>${tip.description}</p>
                <div class="break-meta">
                    <span><i class="fas fa-clock"></i> ${tip.duration} min</span>
                    <span><i class="fas fa-tag"></i> ${tip.category}</span>
                </div>
                <div class="break-actions">
                    <button class="btn-primary" onclick="startBreakActivity('${tip.title}')">Start Now</button>
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Maybe Later</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .break-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease-in-out;
        }
        .break-modal-content {
            background: white;
            border-radius: 1rem;
            padding: 1.5rem;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            animation: slideInUp 0.3s ease-in-out;
        }
        .break-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
        }
        .break-actions {
            display: flex;
            gap: 0.75rem;
            margin-top: 1rem;
        }
        .break-actions button {
            flex: 1;
        }
    `;
    document.head.appendChild(style);
    
    return modal;
}

function startBreakActivity(activityName) {
    showToast(`Starting ${activityName}... Take your time!`, 'success');
    
    // Close modal
    const modal = document.querySelector('.break-modal');
    if (modal) {
        modal.remove();
    }
    
    // Track break activity
    trackBreakActivity(activityName);

    // Track wellness progress
    markWellnessActivityCompleted(activityName);
}

// Quick action functions
function startStudySession() {
    switchSection('study');
    showToast('Ready to start studying? Choose your focus area!', 'info');
}

function takeBreak() {
    suggestBreak();
}

function checkRecommendations() {
    switchSection('study');
    // Scroll to recommendations
    setTimeout(() => {
        document.querySelector('.recommendations-section').scrollIntoView({
            behavior: 'smooth'
        });
    }, 300);
}

function logMood() {
    switchSection('wellness');
    // Scroll to mood tracker
    setTimeout(() => {
        document.querySelector('.mood-tracker').scrollIntoView({
            behavior: 'smooth'
        });
    }, 300);
}

// FAB menu functions
function toggleFabMenu() {
    const fabMenu = document.getElementById('fabMenu');
    fabMenu.classList.toggle('active');
}

function quickStudy() {
    toggleFabMenu();
    startStudySession();
}

function quickBreak() {
    toggleFabMenu();
    takeBreak();
}

function quickMood() {
    toggleFabMenu();
    logMood();
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');
    
    // Set message
    messageEl.textContent = message;
    
    // Set icon and type
    toast.className = `toast ${type}`;
    switch(type) {
        case 'success':
            icon.className = 'toast-icon fas fa-check-circle';
            break;
        case 'error':
            icon.className = 'toast-icon fas fa-exclamation-circle';
            break;
        case 'warning':
            icon.className = 'toast-icon fas fa-exclamation-triangle';
            break;
        default:
            icon.className = 'toast-icon fas fa-info-circle';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Chart initialization
function initializeCharts() {
    initializePerformanceChart();
    initializeTimeChart();
}

function initializePerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Cardiology', 'Respiratory', 'Neurology', 'Pharmacology', 'Anatomy', 'Clinical Skills'],
            datasets: [{
                label: 'Your Performance',
                data: [78, 62, 45, 70, 68, 75],
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(37, 99, 235, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function initializeTimeChart() {
    const ctx = document.getElementById('timeChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Cardiology', 'Respiratory', 'Neurology', 'Pharmacology', 'Other'],
            datasets: [{
                data: [35, 25, 15, 15, 10],
                backgroundColor: [
                    '#2563eb',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// Progress tracking functions
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
}

function updateWellnessAnalytics() {
    // Update mood chart
    const moodChart = document.querySelector('.mood-chart');
    if (moodChart) {
        const bars = moodChart.querySelectorAll('.chart-bar');
        bars.forEach((bar, index) => {
            // Simulate mood data update
            const randomHeight = Math.random() * 100;
            bar.style.height = `${randomHeight}%`;
        });
    }
    
    // Update stress meter
    const stressMeter = document.querySelector('.meter-fill');
    const stressLevel = document.querySelector('.stress-level');
    if (stressMeter && stressLevel) {
        const stressValue = currentMood === 'stressed' ? 80 : 
                          currentMood === 'tired' ? 60 :
                          currentMood === 'okay' ? 40 :
                          currentMood === 'good' ? 25 : 15;
        
        stressMeter.style.width = `${stressValue}%`;
        
        if (stressValue > 70) stressLevel.textContent = 'High';
        else if (stressValue > 40) stressLevel.textContent = 'Moderate';
        else stressLevel.textContent = 'Low';
    }
}

// Wellness tips loading and progress tracking
function loadWellnessTips() {
    // Already loaded
    if (loadedWellnessTips && loadedWellnessTips.length > 0) return;
    
    fetch('wellness_tips.json')
        .then(resp => resp.json())
        .then(data => {
            if (Array.isArray(data)) {
                loadedWellnessTips = data;
                renderWellnessTips();
            }
        })
        .catch(() => {
            // Fail silently; fallback tips are used in suggestBreak
        });
}

function renderWellnessTips() {
    const tipsGrid = document.querySelector('.wellness-tips .tips-grid');
    if (!tipsGrid || !loadedWellnessTips || loadedWellnessTips.length === 0) return;
    
    const iconByCategory = {
        'Mindfulness': 'fas fa-brain',
        'Physical': 'fas fa-dumbbell',
        'Study Technique': 'fas fa-lightbulb'
    };
    
    tipsGrid.innerHTML = loadedWellnessTips.map(tip => `
        <div class="tip-card">
            <div class="tip-icon">
                <i class="${iconByCategory[tip.category] || 'fas fa-heart'}"></i>
            </div>
            <div class="tip-content">
                <h3>${tip.title}</h3>
                <p>${tip.description}</p>
                <div class="tip-meta">
                    <span><i class="fas fa-clock"></i> ${tip.duration_minutes} min</span>
                    <span><i class="fas fa-tag"></i> ${tip.category}</span>
                </div>
                <button class="btn-secondary" onclick="startWellnessActivity('${encodeURIComponent(tip.title)}')">Start</button>
            </div>
        </div>
    `).join('');
}

function startWellnessActivity(encodedTitle) {
    const title = decodeURIComponent(encodedTitle);
    showToast(`Starting ${title}...`, 'success');
    markWellnessActivityCompleted(title);
}

function markWellnessActivityCompleted(title) {
    const entry = {
        title,
        timestamp: new Date().toISOString(),
        day: new Date().toDateString()
    };
    const list = JSON.parse(localStorage.getItem('completedWellnessActivities') || '[]');
    list.push(entry);
    localStorage.setItem('completedWellnessActivities', JSON.stringify(list));
    updateWellnessProgressOverview();
    updateAchievements();
}

function updateWellnessProgressOverview() {
    // Optionally update any counters or charts in Progress section in the future
    // For now, keep it minimal to avoid layout edits
}

// Data persistence functions
function saveData() {
    const userData = {
        currentMood,
        studyStreak,
        totalStudyHours,
        lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('medAideUserData', JSON.stringify(userData));
}

function loadSavedData() {
    const savedData = localStorage.getItem('medAideUserData');
    if (savedData) {
        const userData = JSON.parse(savedData);
        currentMood = userData.currentMood;
        studyStreak = userData.studyStreak || 7;
        totalStudyHours = userData.totalStudyHours || 24.5;
    }
}

function loadUserData() {
    // Simulate loading user data
    setTimeout(() => {
        updateDashboard();
    }, 1000);
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Only handle shortcuts when not in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
        case '1':
            switchSection('dashboard');
            break;
        case '2':
            switchSection('study');
            break;
        case '3':
            switchSection('wellness');
            break;
        case '4':
            switchSection('progress');
            break;
        case ' ':
            e.preventDefault();
            if (isTimerRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
            break;
        case 'Escape':
            toggleFabMenu();
            break;
    }
}

// PWA functions
function setupPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available, notify user
                            showUpdateAvailable();
                        }
                    });
                });
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    }
    
    // Handle install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt();
    });
    
    // Handle successful installation
    window.addEventListener('appinstalled', (evt) => {
        console.log('App was installed successfully');
        showToast('MedAide AI installed successfully!', 'success');
    });
    
    // Check if app is running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        console.log('Running as PWA');
        document.body.classList.add('pwa-mode');
    }
}

function showInstallPrompt() {
    const installBanner = document.createElement('div');
    installBanner.className = 'install-banner';
    installBanner.innerHTML = `
        <div class="install-content">
            <div class="install-icon">
                <i class="fas fa-download"></i>
            </div>
            <div class="install-text">
                <h4>Install MedAide AI</h4>
                <p>Get quick access to your study assistant</p>
            </div>
            <div class="install-actions">
                <button class="btn-primary" onclick="installApp()">Install</button>
                <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Later</button>
            </div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .install-banner {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: white;
            border-radius: 1rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideInUp 0.3s ease-in-out;
        }
        .install-content {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 1rem;
        }
        .install-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .install-text {
            flex: 1;
        }
        .install-text h4 {
            margin: 0 0 0.25rem 0;
            font-size: 0.875rem;
            font-weight: 600;
        }
        .install-text p {
            margin: 0;
            font-size: 0.75rem;
            color: #6b7280;
        }
        .install-actions {
            display: flex;
            gap: 0.5rem;
        }
        .install-actions button {
            padding: 0.5rem 1rem;
            font-size: 0.75rem;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(installBanner);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (installBanner.parentNode) {
            installBanner.remove();
        }
    }, 10000);
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showToast('MedAide AI installed successfully!', 'success');
            }
            deferredPrompt = null;
        });
    }
}

function showUpdateAvailable() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-banner';
    updateBanner.innerHTML = `
        <div class="update-content">
            <div class="update-icon">
                <i class="fas fa-sync-alt"></i>
            </div>
            <div class="update-text">
                <h4>Update Available</h4>
                <p>New features and improvements are ready!</p>
            </div>
            <div class="update-actions">
                <button class="btn-primary" onclick="updateApp()">Update Now</button>
                <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Later</button>
            </div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .update-banner {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border-radius: 1rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideInUp 0.3s ease-in-out;
        }
        .update-content {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 1rem;
        }
        .update-icon {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            animation: spin 2s linear infinite;
        }
        .update-text {
            flex: 1;
        }
        .update-text h4 {
            margin: 0 0 0.25rem 0;
            font-size: 0.875rem;
            font-weight: 600;
        }
        .update-text p {
            margin: 0;
            font-size: 0.75rem;
            opacity: 0.9;
        }
        .update-actions {
            display: flex;
            gap: 0.5rem;
        }
        .update-actions button {
            padding: 0.5rem 1rem;
            font-size: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .update-actions .btn-primary {
            background: white;
            color: #10b981;
        }
        .update-actions .btn-secondary {
            background: transparent;
            color: white;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(updateBanner);
    
    // Auto-hide after 15 seconds
    setTimeout(() => {
        if (updateBanner.parentNode) {
            updateBanner.remove();
        }
    }, 15000);
}

function updateApp() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
            if (registration && registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
            }
        });
    }
    
    const updateBanner = document.querySelector('.update-banner');
    if (updateBanner) {
        updateBanner.remove();
    }
}

// Online/Offline handling
function handleOnlineStatus() {
    showToast('Connection restored! All features available.', 'success');
}

function handleOfflineStatus() {
    showToast('You\'re offline. Some features may be limited.', 'warning');
}

// Analytics tracking
function trackSectionView(section) {
    console.log(`Section viewed: ${section}`);
    // In a real app, this would send data to analytics service
}

function trackTimerStart() {
    console.log('Timer started');
    // Analytics tracking
}

function trackTimerComplete() {
    console.log('Timer completed');
    // Analytics tracking
}

function trackMoodLog(mood) {
    console.log(`Mood logged: ${mood}`);
    // Analytics tracking
}

function trackBreakActivity(activity) {
    console.log(`Break activity: ${activity}`);
    // Analytics tracking
}

// Section-specific initialization
function initializeStudySection() {
    // Initialize study-specific features
    updateRecommendations();
    animateProgressBars();
}

function initializeWellnessSection() {
    // Initialize wellness-specific features
    updateWellnessAnalytics();
    loadMoodHistory();
    loadWellnessTips();
}

function initializeProgressSection() {
    // Initialize progress-specific features
    updateAchievements();
    updateLearningPath();
    updateWellnessProgressOverview();
}

function updateRecommendations() {
    // Simulate AI recommendations update
    console.log('Updating recommendations...');
}

function loadMoodHistory() {
    const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    console.log('Mood history loaded:', moodHistory);
}

function updateAchievements() {
    // Update achievement badges with wellness completions
    try {
        const wellnessCompletions = JSON.parse(localStorage.getItem('completedWellnessActivities') || '[]');
        const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        const badges = document.querySelectorAll('.achievements .badge');

        // Example: mark "Wellness Warrior" as earned after 5 wellness activities or 5 mood logs
        const wellnessCount = wellnessCompletions.length;
        const moodDays = new Set(moodHistory.map(m => m.day)).size;
        const wellnessEarned = wellnessCount >= 5 || moodDays >= 5;

        badges.forEach(badge => {
            const title = badge.querySelector('h3')?.textContent?.trim();
            if (title === 'Wellness Warrior') {
                if (wellnessEarned) {
                    badge.classList.add('earned');
                    badge.classList.remove('locked');
                }
            }
        });
    } catch (e) {
        console.log('Updating achievements...');
    }
}

function updateLearningPath() {
    // Update learning path progress
    console.log('Updating learning path...');
}

// Utility functions
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getRandomTip() {
    const tips = [
        "Take deep breaths to reduce stress",
        "Stay hydrated throughout your study session",
        "Take regular breaks to maintain focus",
        "Practice active recall for better retention",
        "Use the Pomodoro technique for productivity"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showToast('Something went wrong. Please try again.', 'error');
});

// Performance monitoring
function measurePerformance() {
    if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart);
    }
}

// Initialize performance monitoring
setTimeout(measurePerformance, 1000);

// Onboarding Functions
function showOnboarding() {
    const modal = document.getElementById('onboardingModal');
    if (modal) {
        modal.style.display = 'flex';
        currentOnboardingStep = 1;
        updateOnboardingStep();
    }
}

function hideOnboarding() {
    const modal = document.getElementById('onboardingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function changeStep(direction) {
    const newStep = currentOnboardingStep + direction;
    
    if (newStep >= 1 && newStep <= totalOnboardingSteps) {
        // Validate current step before moving
        if (validateCurrentStep()) {
            currentOnboardingStep = newStep;
            updateOnboardingStep();
        }
    }
}

function updateOnboardingStep() {
    // Hide all steps
    document.querySelectorAll('.onboarding-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    const currentStepElement = document.getElementById(`step${currentOnboardingStep}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    // Update step indicators
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index + 1 === currentOnboardingStep);
    });
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const completeBtn = document.getElementById('completeBtn');
    
    if (prevBtn) prevBtn.disabled = currentOnboardingStep === 1;
    
    if (currentOnboardingStep === totalOnboardingSteps) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (completeBtn) completeBtn.style.display = 'block';
    } else {
        if (nextBtn) nextBtn.style.display = 'block';
        if (completeBtn) completeBtn.style.display = 'none';
    }
}

function validateCurrentStep() {
    switch (currentOnboardingStep) {
        case 1:
            const name = document.getElementById('userName').value.trim();
            const year = document.getElementById('userYear').value;
            const specialty = document.getElementById('userSpecialty').value;
            
            if (!name || !year || !specialty) {
                showToast('Please fill in all required fields', 'error');
                return false;
            }
            return true;
            
        case 2:
            const skipMarks = document.getElementById('skipMarks').checked;
            if (skipMarks) return true;
            
            // Check if at least one mark is entered
            const marks = ['cardiologyMarks', 'respiratoryMarks', 'neurologyMarks', 
                          'pharmacologyMarks', 'anatomyMarks', 'clinicalMarks'];
            const hasMarks = marks.some(id => {
                const value = document.getElementById(id).value;
                return value && parseInt(value) >= 0;
            });
            
            if (!hasMarks) {
                showToast('Please enter at least one subject mark or skip this step', 'error');
                return false;
            }
            return true;
            
        case 3:
            // Step 3 is optional preferences, always valid
            return true;
            
        default:
            return true;
    }
}

function completeOnboarding() {
    if (!validateCurrentStep()) return;
    
    // Collect all user data
    collectUserData();
    
    // Save user data
    saveUserData();
    
    // Hide onboarding
    hideOnboarding();
    
    // Update interface
    updateUserInterface();
    
    // Show welcome message
    showToast(`Welcome to MedAide AI, ${userData.name}! Let's start your healthcare journey!`, 'success');
    
    // Analytics
    trackOnboardingComplete();
}

function collectUserData() {
    // Step 1: Basic Info
    userData.name = document.getElementById('userName').value.trim();
    userData.year = document.getElementById('userYear').value;
    userData.specialty = document.getElementById('userSpecialty').value;
    
    // Step 2: Marks
    const skipMarks = document.getElementById('skipMarks').checked;
    if (!skipMarks) {
        userData.marks.cardiology = parseInt(document.getElementById('cardiologyMarks').value) || 0;
        userData.marks.respiratory = parseInt(document.getElementById('respiratoryMarks').value) || 0;
        userData.marks.neurology = parseInt(document.getElementById('neurologyMarks').value) || 0;
        userData.marks.pharmacology = parseInt(document.getElementById('pharmacologyMarks').value) || 0;
        userData.marks.anatomy = parseInt(document.getElementById('anatomyMarks').value) || 0;
        userData.marks.clinical = parseInt(document.getElementById('clinicalMarks').value) || 0;
    }
    
    // Step 3: Preferences
    const sessionLength = document.querySelector('input[name="sessionLength"]:checked');
    if (sessionLength) {
        userData.preferences.sessionLength = parseInt(sessionLength.value) || 25;
    }
    
    const contentTypes = document.querySelectorAll('input[name="contentType"]:checked');
    userData.preferences.contentType = Array.from(contentTypes).map(cb => cb.value);
    
    const stressLevel = document.getElementById('stressLevel').value;
    userData.preferences.stressLevel = parseInt(stressLevel) || 5;
    
    // Mark as onboarded
    userData.isOnboarded = true;
}

function updateUserInterface() {
    // Update navigation
    document.getElementById('navUserName').textContent = userData.name;
    document.getElementById('profileName').textContent = userData.name;
    document.getElementById('profileYear').textContent = `${userData.year} • ${userData.specialty}`;
    
    // Update welcome message
    document.getElementById('userDisplayName').textContent = userData.name;
    
    // Update profile avatars with initials
    const initials = userData.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const avatarUrl = `https://via.placeholder.com/40x40/2563eb/ffffff?text=${initials}`;
    document.getElementById('profileAvatar').src = avatarUrl;
    document.getElementById('profileAvatarLarge').src = avatarUrl.replace('40x40', '60x60');
    
    // Update subject performance based on marks
    updateSubjectPerformance();
    
    // Update recommendations based on marks
    updateRecommendations();
    
    // Set default timer based on preferences
    timerDuration = userData.preferences.sessionLength * 60;
    timerRemaining = timerDuration;
    updateTimerDisplay();
}

function updateSubjectPerformance() {
    const subjects = [
        { id: 'cardiology', name: 'Cardiology', score: userData.marks.cardiology },
        { id: 'respiratory', name: 'Respiratory', score: userData.marks.respiratory },
        { id: 'neurology', name: 'Neurology', score: userData.marks.neurology }
    ];
    
    subjects.forEach(subject => {
        const scoreElement = document.getElementById(`${subject.id}Score`);
        const progressElement = document.getElementById(`${subject.id}Progress`);
        const topicsElement = document.getElementById(`${subject.id}Topics`);
        
        if (scoreElement && progressElement && topicsElement) {
            const score = subject.score;
            const scoreClass = score >= 70 ? 'good' : score >= 50 ? 'needs-work' : 'critical';
            
            scoreElement.textContent = `${score}%`;
            scoreElement.className = `subject-score ${scoreClass}`;
            
            progressElement.style.width = `${score}%`;
            
            // Generate topic tags based on score
            const topics = generateTopicTags(subject.name, score);
            topicsElement.innerHTML = topics.map(topic => 
                `<span class="topic-tag ${topic.class}">${topic.text}</span>`
            ).join('');
        }
    });
}

function generateTopicTags(subject, score) {
    const topics = {
        'Cardiology': [
            { name: 'ECG Basics', threshold: 60 },
            { name: 'Heart Murmurs', threshold: 70 },
            { name: 'Cardiac Anatomy', threshold: 50 }
        ],
        'Respiratory': [
            { name: 'Lung Anatomy', threshold: 60 },
            { name: 'Breathing Mechanics', threshold: 70 },
            { name: 'Gas Exchange', threshold: 50 }
        ],
        'Neurology': [
            { name: 'Neuroanatomy', threshold: 60 },
            { name: 'Neuron Function', threshold: 70 },
            { name: 'Synaptic Transmission', threshold: 50 }
        ]
    };
    
    const subjectTopics = topics[subject] || [];
    return subjectTopics.map(topic => ({
        text: score >= topic.threshold ? `${topic.name} ✓` : topic.name,
        class: score >= topic.threshold ? 'good' : score >= topic.threshold - 20 ? 'needs-work' : 'critical'
    }));
}

function updateRecommendations() {
    // Find subjects with low scores
    const lowScoreSubjects = Object.entries(userData.marks)
        .filter(([subject, score]) => score < 60 && score > 0)
        .sort((a, b) => a[1] - b[1]); // Sort by lowest score first
    
    // Update recommendation cards based on low scores
    const recommendationCards = document.querySelectorAll('.recommendation-card');
    
    lowScoreSubjects.forEach(([subject, score], index) => {
        if (index < recommendationCards.length) {
            const card = recommendationCards[index];
            const title = card.querySelector('h3');
            const description = card.querySelector('p');
            const meta = card.querySelector('.recommendation-meta');
            
            if (title && description && meta) {
                const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
                title.textContent = `${subjectName} Fundamentals`;
                description.textContent = `Your ${subjectName.toLowerCase()} score (${score}%) indicates you need foundational review. This resource covers essential concepts.`;
                
                // Update meta based on content type preference
                const preferredType = userData.preferences.contentType[0] || 'video';
                const typeIcon = preferredType === 'video' ? 'fas fa-video' : 
                               preferredType === 'article' ? 'fas fa-file-alt' : 'fas fa-quiz';
                const typeText = preferredType.charAt(0).toUpperCase() + preferredType.slice(1);
                
                meta.innerHTML = `
                    <span><i class="${typeIcon}"></i> ${typeText}</span>
                    <span><i class="fas fa-clock"></i> ${userData.preferences.sessionLength} min</span>
                    <span><i class="fas fa-heart"></i> ${subjectName}</span>
                `;
            }
        }
    });
}

// Profile Management Functions
function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function editProfile() {
    // Reset onboarding to allow editing
    userData.isOnboarded = false;
    currentOnboardingStep = 1;
    
    // Pre-fill form with current data
    document.getElementById('userName').value = userData.name;
    document.getElementById('userYear').value = userData.year;
    document.getElementById('userSpecialty').value = userData.specialty;
    
    document.getElementById('cardiologyMarks').value = userData.marks.cardiology;
    document.getElementById('respiratoryMarks').value = userData.marks.respiratory;
    document.getElementById('neurologyMarks').value = userData.marks.neurology;
    document.getElementById('pharmacologyMarks').value = userData.marks.pharmacology;
    document.getElementById('anatomyMarks').value = userData.marks.anatomy;
    document.getElementById('clinicalMarks').value = userData.marks.clinical;
    
    // Show onboarding modal
    showOnboarding();
    
    // Close profile dropdown
    toggleProfileMenu();
}

function viewSettings() {
    showToast('Settings feature coming soon!', 'info');
    toggleProfileMenu();
}

function exportData() {
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `medaide-data-${userData.name}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
    toggleProfileMenu();
}

function resetApp() {
    if (confirm('Are you sure you want to reset all your data? This action cannot be undone.')) {
        localStorage.removeItem('medAideUserData');
        localStorage.removeItem('moodHistory');
        
        // Reset user data
        userData = {
            name: '',
            year: '',
            specialty: '',
            marks: {
                cardiology: 0,
                respiratory: 0,
                neurology: 0,
                pharmacology: 0,
                anatomy: 0,
                clinical: 0
            },
            preferences: {
                sessionLength: 25,
                contentType: ['video', 'article', 'quiz'],
                stressLevel: 5
            },
            isOnboarded: false
        };
        
        // Show onboarding
        showOnboarding();
        toggleProfileMenu();
        
        showToast('App reset successfully!', 'success');
    }
}

// Data Management Functions
function saveUserData() {
    localStorage.setItem('medAideUserData', JSON.stringify(userData));
}

function loadUserData() {
    const savedData = localStorage.getItem('medAideUserData');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            userData = { ...userData, ...parsedData };
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
}

// Analytics Functions
function trackOnboardingComplete() {
    console.log('Onboarding completed for:', userData.name);
    // In a real app, this would send data to analytics service
}

// Learning Content System
const learningContent = {
    // YouTube video content based on subjects
    videos: {
        'Cardiology': {
            'Cardiac Anatomy': 'https://www.youtube.com/embed/mdC6fd6tLbI',
            'ECG Basics': 'https://www.youtube.com/embed/pyI4Kz01ZR4',
            'Heart Murmurs': 'https://www.youtube.com/embed/dBwr2GZCmQM'
        },
        'Respiratory': {
            'Lung Anatomy': 'https://www.youtube.com/embed/v_j-LD2YEqg',
            'Breathing Mechanics': 'https://www.youtube.com/embed/dXHkCDohf70',
            'Gas Exchange': 'https://www.youtube.com/embed/6qnSsV2syUE'
        },
        'Neurology': {
            'Neuroanatomy': 'https://www.youtube.com/embed/qPix_X-9t7E',
            'Neuron Function': 'https://www.youtube.com/embed/OZG8M_ldA1M',
            'Synaptic Transmission': 'https://www.youtube.com/embed/WhowH0kb7n0'
        },
        'Pharmacology': {
            'Drug Classifications': 'https://www.youtube.com/embed/LctWbEcvPKw',
            'Dosage Calculations': 'https://www.youtube.com/embed/hnzZKY8SGbE',
            'Medication Safety': 'https://www.youtube.com/embed/MWUM7LIXDeA'
        },
        'Anatomy': {
            'Skeletal System': 'https://www.youtube.com/embed/RW46rQKWa-g',
            'Muscular System': 'https://www.youtube.com/embed/jqy0i1KXUO4',
            'Nervous System': 'https://www.youtube.com/embed/9fxm85Fy4sQ'
        },
        'Clinical': {
            'Vital Signs': 'https://www.youtube.com/embed/DN4E4VunBAo',
            'Patient Communication': 'https://www.youtube.com/embed/UxLBXCjD-yM',
            'Infection Control': 'https://www.youtube.com/embed/0joUKUK8ZBU'
        }
    },

    // Article content
    articles: {
        'Cardiology': {
            'Cardiac Anatomy': {
                title: 'Understanding Heart Structure for Healthcare Students',
                content: `
                    <h2>Introduction to Cardiac Anatomy</h2>
                    <p>The human heart is a remarkable organ that serves as the central pump of the cardiovascular system. Understanding its structure is fundamental for any healthcare student.</p>
                    
                    <h3>Heart Chambers</h3>
                    <p>The heart consists of four chambers:</p>
                    <ul>
                        <li><strong>Right Atrium:</strong> Receives deoxygenated blood from the body</li>
                        <li><strong>Right Ventricle:</strong> Pumps blood to the lungs for oxygenation</li>
                        <li><strong>Left Atrium:</strong> Receives oxygenated blood from the lungs</li>
                        <li><strong>Left Ventricle:</strong> Pumps oxygenated blood to the entire body</li>
                    </ul>
                    
                    <h3>Heart Valves</h3>
                    <p>Four valves ensure unidirectional blood flow:</p>
                    <ul>
                        <li><strong>Tricuspid Valve:</strong> Between right atrium and ventricle</li>
                        <li><strong>Pulmonary Valve:</strong> Between right ventricle and pulmonary artery</li>
                        <li><strong>Mitral Valve:</strong> Between left atrium and ventricle</li>
                        <li><strong>Aortic Valve:</strong> Between left ventricle and aorta</li>
                    </ul>
                    
                    <h3>Blood Flow Pathway</h3>
                    <p>The heart follows a specific pathway:</p>
                    <ol>
                        <li>Deoxygenated blood enters right atrium via vena cava</li>
                        <li>Flows through tricuspid valve to right ventricle</li>
                        <li>Pumped through pulmonary valve to lungs</li>
                        <li>Oxygenated blood returns to left atrium</li>
                        <li>Flows through mitral valve to left ventricle</li>
                        <li>Pumped through aortic valve to systemic circulation</li>
                    </ol>
                    
                    <h3>Clinical Significance</h3>
                    <p>Understanding cardiac anatomy is crucial for:</p>
                    <ul>
                        <li>Interpreting ECGs and imaging studies</li>
                        <li>Understanding heart murmurs and valve disorders</li>
                        <li>Performing cardiac procedures</li>
                        <li>Recognizing congenital heart defects</li>
                    </ul>
                `
            },
            'ECG Basics': {
                title: 'ECG Interpretation Fundamentals',
                content: `
                    <h2>Introduction to Electrocardiography</h2>
                    <p>An electrocardiogram (ECG) is a graphical representation of the heart's electrical activity, essential for diagnosing cardiac conditions.</p>
                    
                    <h3>ECG Components</h3>
                    <ul>
                        <li><strong>P Wave:</strong> Atrial depolarization</li>
                        <li><strong>QRS Complex:</strong> Ventricular depolarization</li>
                        <li><strong>T Wave:</strong> Ventricular repolarization</li>
                        <li><strong>PR Interval:</strong> Atrial to ventricular conduction</li>
                        <li><strong>QT Interval:</strong> Ventricular electrical activity</li>
                    </ul>
                    
                    <h3>Lead Systems</h3>
                    <p>Standard 12-lead ECG provides comprehensive view:</p>
                    <ul>
                        <li><strong>Limb Leads:</strong> I, II, III, aVR, aVL, aVF</li>
                        <li><strong>Chest Leads:</strong> V1-V6</li>
                    </ul>
                    
                    <h3>Normal Values</h3>
                    <ul>
                        <li>Heart Rate: 60-100 bpm</li>
                        <li>PR Interval: 0.12-0.20 seconds</li>
                        <li>QRS Duration: <0.12 seconds</li>
                        <li>QT Interval: 0.36-0.44 seconds</li>
                    </ul>
                `
            }
        },
        'Respiratory': {
            'Lung Anatomy': {
                title: 'Respiratory System Structure and Function',
                content: `
                    <h2>Introduction to Respiratory Anatomy</h2>
                    <p>The respiratory system is responsible for gas exchange, providing oxygen to the body and removing carbon dioxide.</p>
                    
                    <h3>Upper Respiratory Tract</h3>
                    <ul>
                        <li><strong>Nose:</strong> Filters, warms, and humidifies air</li>
                        <li><strong>Pharynx:</strong> Common pathway for air and food</li>
                        <li><strong>Larynx:</strong> Voice production and airway protection</li>
                    </ul>
                    
                    <h3>Lower Respiratory Tract</h3>
                    <ul>
                        <li><strong>Trachea:</strong> Main airway, divides into bronchi</li>
                        <li><strong>Bronchi:</strong> Branch into bronchioles</li>
                        <li><strong>Bronchioles:</strong> Terminal branches leading to alveoli</li>
                        <li><strong>Alveoli:</strong> Site of gas exchange</li>
                    </ul>
                    
                    <h3>Lung Structure</h3>
                    <ul>
                        <li><strong>Right Lung:</strong> 3 lobes (upper, middle, lower)</li>
                        <li><strong>Left Lung:</strong> 2 lobes (upper, lower)</li>
                        <li><strong>Pleura:</strong> Protective membrane covering lungs</li>
                    </ul>
                `
            }
        },
        'Neurology': {
            'Neuroanatomy': {
                title: 'Central Nervous System Overview',
                content: `
                    <h2>Introduction to Neuroanatomy</h2>
                    <p>The nervous system coordinates all body functions through electrical and chemical signals.</p>
                    
                    <h3>Central Nervous System</h3>
                    <ul>
                        <li><strong>Brain:</strong> Control center for all functions</li>
                        <li><strong>Spinal Cord:</strong> Pathway between brain and body</li>
                    </ul>
                    
                    <h3>Brain Regions</h3>
                    <ul>
                        <li><strong>Cerebrum:</strong> Higher cognitive functions</li>
                        <li><strong>Cerebellum:</strong> Coordination and balance</li>
                        <li><strong>Brainstem:</strong> Vital functions (breathing, heart rate)</li>
                    </ul>
                `
            }
        }
    },

    // Quiz content
    quizzes: {
        'Cardiology': {
            'Cardiac Anatomy': [
                {
                    question: "How many chambers does the human heart have?",
                    options: ["2", "3", "4", "5"],
                    correct: 2,
                    explanation: "The human heart has 4 chambers: 2 atria and 2 ventricles."
                },
                {
                    question: "Which valve is located between the left atrium and left ventricle?",
                    options: ["Tricuspid", "Mitral", "Pulmonary", "Aortic"],
                    correct: 1,
                    explanation: "The mitral valve (also called bicuspid valve) is located between the left atrium and left ventricle."
                },
                {
                    question: "What is the function of the right ventricle?",
                    options: ["Pump blood to the body", "Pump blood to the lungs", "Receive blood from the body", "Receive blood from the lungs"],
                    correct: 1,
                    explanation: "The right ventricle pumps deoxygenated blood to the lungs for oxygenation."
                }
            ],
            'ECG Basics': [
                {
                    question: "What does the P wave represent on an ECG?",
                    options: ["Ventricular depolarization", "Atrial depolarization", "Ventricular repolarization", "Atrial repolarization"],
                    correct: 1,
                    explanation: "The P wave represents atrial depolarization (atrial contraction)."
                },
                {
                    question: "What is the normal range for heart rate?",
                    options: ["40-60 bpm", "60-100 bpm", "100-140 bpm", "140-180 bpm"],
                    correct: 1,
                    explanation: "The normal resting heart rate is 60-100 beats per minute."
                }
            ]
        },
        'Respiratory': {
            'Lung Anatomy': [
                {
                    question: "How many lobes does the right lung have?",
                    options: ["2", "3", "4", "5"],
                    correct: 1,
                    explanation: "The right lung has 3 lobes: upper, middle, and lower."
                },
                {
                    question: "Where does gas exchange occur in the lungs?",
                    options: ["Bronchi", "Bronchioles", "Alveoli", "Trachea"],
                    correct: 2,
                    explanation: "Gas exchange occurs in the alveoli, the tiny air sacs at the end of the respiratory tree."
                }
            ]
        },
        'Neurology': {
            'Neuroanatomy': [
                {
                    question: "Which part of the brain is responsible for coordination and balance?",
                    options: ["Cerebrum", "Cerebellum", "Brainstem", "Spinal cord"],
                    correct: 1,
                    explanation: "The cerebellum is responsible for coordination, balance, and fine motor control."
                }
            ]
        }
    }
};

// Learning Functions
function startLearning(contentType, subject, topic) {
    if (!subject || !topic) {
        showToast('Please select a subject and topic first', 'error');
        return;
    }

    switch(contentType) {
        case 'video':
            openVideoModal(subject, topic);
            break;
        case 'article':
            openArticleModal(subject, topic);
            break;
        case 'quiz':
            openQuizModal(subject, topic);
            break;
        default:
            showToast('Invalid content type', 'error');
    }
}

function openVideoModal(subject, topic) {
    const videoUrl = learningContent.videos[subject]?.[topic];
    
    if (!videoUrl) {
        showToast('Video content not available for this topic', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'learning-modal';
    modal.innerHTML = `
        <div class="learning-modal-content video-modal">
            <div class="learning-modal-header">
                <h3>🎥 ${topic} - ${subject}</h3>
                <button class="close-btn" onclick="closeLearningModal()">×</button>
            </div>
            <div class="learning-modal-body">
                <div class="video-container">
                    <iframe 
                        src="${videoUrl}" 
                        frameborder="0" 
                        allowfullscreen
                        title="${topic} Video">
                    </iframe>
                </div>
                <div class="video-controls">
                    <button class="btn-primary" onclick="markAsCompleted('video', '${subject}', '${topic}')">
                        <i class="fas fa-check"></i> Mark as Completed
                    </button>
                    <button class="btn-secondary" onclick="openQuizModal('${subject}', '${topic}')">
                        <i class="fas fa-question-circle"></i> Take Quiz
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addLearningModalStyles();
}

function openArticleModal(subject, topic) {
    const article = learningContent.articles[subject]?.[topic];
    
    if (!article) {
        showToast('Article content not available for this topic', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'learning-modal';
    modal.innerHTML = `
        <div class="learning-modal-content article-modal">
            <div class="learning-modal-header">
                <h3>📖 ${article.title}</h3>
                <button class="close-btn" onclick="closeLearningModal()">×</button>
            </div>
            <div class="learning-modal-body">
                <div class="article-content">
                    ${article.content}
                </div>
                <div class="article-controls">
                    <button class="btn-primary" onclick="markAsCompleted('article', '${subject}', '${topic}')">
                        <i class="fas fa-check"></i> Mark as Completed
                    </button>
                    <button class="btn-secondary" onclick="openQuizModal('${subject}', '${topic}')">
                        <i class="fas fa-question-circle"></i> Take Quiz
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addLearningModalStyles();
}

function openQuizModal(subject, topic) {
    const quizQuestions = learningContent.quizzes[subject]?.[topic];
    
    if (!quizQuestions || quizQuestions.length === 0) {
        showToast('Quiz not available for this topic', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'learning-modal';
    modal.innerHTML = `
        <div class="learning-modal-content quiz-modal">
            <div class="learning-modal-header">
                <h3>🧠 ${topic} Quiz - ${subject}</h3>
                <button class="close-btn" onclick="closeLearningModal()">×</button>
            </div>
            <div class="learning-modal-body">
                <div class="quiz-container">
                    <div class="quiz-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="quizProgress" style="width: 0%"></div>
                        </div>
                        <span class="progress-text">Question <span id="currentQuestion">1</span> of <span id="totalQuestions">${quizQuestions.length}</span></span>
                    </div>
                    <div class="quiz-content">
                        <div id="quizQuestionContainer">
                            <!-- Quiz questions will be loaded here -->
                        </div>
                    </div>
                    <div class="quiz-controls">
                        <button class="btn-secondary" id="prevQuestion" onclick="previousQuestion()" disabled>Previous</button>
                        <button class="btn-primary" id="nextQuestion" onclick="nextQuestion()">Next Question</button>
                        <button class="btn-success" id="submitQuiz" onclick="submitQuiz()" style="display: none;">Submit Quiz</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addLearningModalStyles();
    
    // Initialize quiz
    initializeQuiz(subject, topic, quizQuestions);
}

let currentQuiz = {
    subject: '',
    topic: '',
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    score: 0
};

function initializeQuiz(subject, topic, questions) {
    currentQuiz = {
        subject: subject,
        topic: topic,
        questions: questions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0
    };
    
    showQuizQuestion();
}

function showQuizQuestion() {
    const question = currentQuiz.questions[currentQuiz.currentQuestionIndex];
    const container = document.getElementById('quizQuestionContainer');
    
    container.innerHTML = `
        <div class="question-card">
            <h4 class="question-text">${question.question}</h4>
            <div class="options-container">
                ${question.options.map((option, index) => `
                    <label class="option-label">
                        <input type="radio" name="quizAnswer" value="${index}" onchange="selectAnswer(${index})">
                        <span class="option-text">${option}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
    
    // Update progress
    const progress = ((currentQuiz.currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
    document.getElementById('quizProgress').style.width = `${progress}%`;
    document.getElementById('currentQuestion').textContent = currentQuiz.currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = currentQuiz.questions.length;
    
    // Update navigation buttons
    document.getElementById('prevQuestion').disabled = currentQuiz.currentQuestionIndex === 0;
    
    if (currentQuiz.currentQuestionIndex === currentQuiz.questions.length - 1) {
        document.getElementById('nextQuestion').style.display = 'none';
        document.getElementById('submitQuiz').style.display = 'inline-block';
    } else {
        document.getElementById('nextQuestion').style.display = 'inline-block';
        document.getElementById('submitQuiz').style.display = 'none';
    }
}

function selectAnswer(answerIndex) {
    currentQuiz.answers[currentQuiz.currentQuestionIndex] = answerIndex;
}

function nextQuestion() {
    if (currentQuiz.currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuiz.currentQuestionIndex++;
        showQuizQuestion();
    }
}

function previousQuestion() {
    if (currentQuiz.currentQuestionIndex > 0) {
        currentQuiz.currentQuestionIndex--;
        showQuizQuestion();
    }
}

function submitQuiz() {
    // Calculate score
    let correctAnswers = 0;
    currentQuiz.questions.forEach((question, index) => {
        if (currentQuiz.answers[index] === question.correct) {
            correctAnswers++;
        }
    });
    
    currentQuiz.score = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
    
    // Show results
    showQuizResults();
}

function showQuizResults() {
    const container = document.getElementById('quizQuestionContainer');
    const correctAnswers = currentQuiz.questions.filter((question, index) => 
        currentQuiz.answers[index] === question.correct
    ).length;
    
    container.innerHTML = `
        <div class="quiz-results">
            <div class="results-header">
                <h3>🎉 Quiz Complete!</h3>
                <div class="score-display">
                    <span class="score-number">${currentQuiz.score}%</span>
                    <span class="score-label">Score</span>
                </div>
            </div>
            
            <div class="results-summary">
                <p>You answered <strong>${correctAnswers}</strong> out of <strong>${currentQuiz.questions.length}</strong> questions correctly.</p>
                <div class="performance-badge ${currentQuiz.score >= 80 ? 'excellent' : currentQuiz.score >= 60 ? 'good' : 'needs-improvement'}">
                    ${currentQuiz.score >= 80 ? 'Excellent!' : currentQuiz.score >= 60 ? 'Good Job!' : 'Keep Studying!'}
                </div>
            </div>
            
            <div class="question-review">
                <h4>Question Review:</h4>
                ${currentQuiz.questions.map((question, index) => {
                    const userAnswer = currentQuiz.answers[index];
                    const isCorrect = userAnswer === question.correct;
                    return `
                        <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
                            <div class="review-question">
                                <strong>Q${index + 1}:</strong> ${question.question}
                            </div>
                            <div class="review-answer">
                                <strong>Your Answer:</strong> ${userAnswer !== undefined ? question.options[userAnswer] : 'Not answered'}
                                ${!isCorrect ? `<br><strong>Correct Answer:</strong> ${question.options[question.correct]}` : ''}
                            </div>
                            <div class="review-explanation">
                                <strong>Explanation:</strong> ${question.explanation}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    // Update controls
    document.getElementById('prevQuestion').style.display = 'none';
    document.getElementById('nextQuestion').style.display = 'none';
    document.getElementById('submitQuiz').style.display = 'none';
    
    // Add retake button
    const controls = document.querySelector('.quiz-controls');
    controls.innerHTML = `
        <button class="btn-primary" onclick="retakeQuiz()">Retake Quiz</button>
        <button class="btn-secondary" onclick="markAsCompleted('quiz', '${currentQuiz.subject}', '${currentQuiz.topic}')">
            <i class="fas fa-check"></i> Mark as Completed
        </button>
    `;
    
    // Track quiz completion
    trackQuizCompletion(currentQuiz.subject, currentQuiz.topic, currentQuiz.score);
}

function retakeQuiz() {
    currentQuiz.currentQuestionIndex = 0;
    currentQuiz.answers = [];
    currentQuiz.score = 0;
    
    // Reset controls
    const controls = document.querySelector('.quiz-controls');
    controls.innerHTML = `
        <button class="btn-secondary" id="prevQuestion" onclick="previousQuestion()" disabled>Previous</button>
        <button class="btn-primary" id="nextQuestion" onclick="nextQuestion()">Next Question</button>
        <button class="btn-success" id="submitQuiz" onclick="submitQuiz()" style="display: none;">Submit Quiz</button>
    `;
    
    showQuizQuestion();
}

function markAsCompleted(contentType, subject, topic) {
    // Save completion data
    const completionData = {
        contentType: contentType,
        subject: subject,
        topic: topic,
        timestamp: new Date().toISOString(),
        score: currentQuiz.score || null
    };
    
    let completedItems = JSON.parse(localStorage.getItem('completedLearningItems') || '[]');
    completedItems.push(completionData);
    localStorage.setItem('completedLearningItems', JSON.stringify(completedItems));
    
    // Show success message
    showToast(`Great job! You completed ${topic} in ${subject}`, 'success');
    
    // Close modal
    closeLearningModal();
    
    // Update progress
    updateLearningProgress();
}

function closeLearningModal() {
    const modal = document.querySelector('.learning-modal');
    if (modal) {
        modal.remove();
    }
}

function addLearningModalStyles() {
    // Check if styles already added
    if (document.getElementById('learningModalStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'learningModalStyles';
    style.textContent = `
        .learning-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            animation: fadeIn 0.3s ease-in-out;
            padding: 1rem;
        }
        
        .learning-modal-content {
            background: white;
            border-radius: 1rem;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            animation: slideInUp 0.3s ease-in-out;
        }
        
        .learning-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .learning-modal-header h3 {
            margin: 0;
            color: #1f2937;
            font-size: 1.25rem;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            padding: 0.5rem;
            border-radius: 0.5rem;
            transition: background-color 0.2s;
        }
        
        .close-btn:hover {
            background-color: #f3f4f6;
        }
        
        .learning-modal-body {
            padding: 1.5rem;
        }
        
        /* Video Modal Styles */
        .video-container {
            position: relative;
            width: 100%;
            height: 0;
            padding-bottom: 56.25%; /* 16:9 aspect ratio */
            margin-bottom: 1rem;
        }
        
        .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 0.5rem;
        }
        
        .video-controls {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
        
        /* Article Modal Styles */
        .article-content {
            line-height: 1.7;
            color: #374151;
        }
        
        .article-content h2 {
            color: #1f2937;
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        
        .article-content h3 {
            color: #374151;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            font-size: 1.25rem;
        }
        
        .article-content ul, .article-content ol {
            margin: 1rem 0;
            padding-left: 2rem;
        }
        
        .article-content li {
            margin-bottom: 0.5rem;
        }
        
        .article-controls {
            margin-top: 2rem;
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
        
        /* Quiz Modal Styles */
        .quiz-progress {
            margin-bottom: 2rem;
        }
        
        .progress-text {
            display: block;
            text-align: center;
            margin-top: 0.5rem;
            color: #6b7280;
            font-size: 0.875rem;
        }
        
        .question-card {
            background: #f9fafb;
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 1.5rem;
        }
        
        .question-text {
            font-size: 1.25rem;
            color: #1f2937;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }
        
        .options-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .option-label {
            display: flex;
            align-items: center;
            padding: 1rem;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .option-label:hover {
            border-color: #2563eb;
            background: #eff6ff;
        }
        
        .option-label input[type="radio"] {
            margin-right: 1rem;
            transform: scale(1.2);
        }
        
        .option-label input[type="radio"]:checked + .option-text {
            color: #2563eb;
            font-weight: 600;
        }
        
        .option-text {
            font-size: 1rem;
            color: #374151;
        }
        
        .quiz-controls {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
        
        /* Quiz Results Styles */
        .quiz-results {
            text-align: center;
        }
        
        .results-header h3 {
            color: #1f2937;
            margin-bottom: 1rem;
        }
        
        .score-display {
            display: inline-block;
            margin-bottom: 2rem;
        }
        
        .score-number {
            display: block;
            font-size: 3rem;
            font-weight: 700;
            color: #2563eb;
            line-height: 1;
        }
        
        .score-label {
            font-size: 1rem;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .performance-badge {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            border-radius: 2rem;
            font-weight: 600;
            margin: 1rem 0;
        }
        
        .performance-badge.excellent {
            background: #dcfce7;
            color: #166534;
        }
        
        .performance-badge.good {
            background: #fef3c7;
            color: #92400e;
        }
        
        .performance-badge.needs-improvement {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .question-review {
            text-align: left;
            margin-top: 2rem;
        }
        
        .question-review h4 {
            color: #1f2937;
            margin-bottom: 1rem;
        }
        
        .review-item {
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            border-left: 4px solid;
        }
        
        .review-item.correct {
            background: #f0fdf4;
            border-left-color: #22c55e;
        }
        
        .review-item.incorrect {
            background: #fef2f2;
            border-left-color: #ef4444;
        }
        
        .review-question {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.5rem;
        }
        
        .review-answer {
            margin-bottom: 0.5rem;
            color: #374151;
        }
        
        .review-explanation {
            font-size: 0.875rem;
            color: #6b7280;
            font-style: italic;
        }
        
        @media (max-width: 768px) {
            .learning-modal-content {
                margin: 0.5rem;
                max-height: 95vh;
            }
            
            .learning-modal-header,
            .learning-modal-body {
                padding: 1rem;
            }
            
            .question-card {
                padding: 1rem;
            }
            
            .video-controls,
            .article-controls,
            .quiz-controls {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);
}

function updateLearningProgress() {
    const completedItems = JSON.parse(localStorage.getItem('completedLearningItems') || '[]');
    
    // Update subject performance based on completed items
    completedItems.forEach(item => {
        if (item.score) {
            // Update subject scores based on quiz performance
            const subjectKey = item.subject.toLowerCase();
            if (userData.marks[subjectKey] !== undefined) {
                // Increase score based on quiz performance
                const scoreIncrease = Math.round(item.score / 10);
                userData.marks[subjectKey] = Math.min(100, userData.marks[subjectKey] + scoreIncrease);
            }
        }
    });
    
    // Save updated user data
    saveUserData();
    
    // Update UI
    updateSubjectPerformance();
    updateRecommendations();
}

function trackQuizCompletion(subject, topic, score) {
    console.log(`Quiz completed: ${topic} in ${subject} with score ${score}%`);
    // In a real app, this would send data to analytics service
}

// Subject Selector Functions
function updateRecommendationsForSubject() {
    const subject = document.getElementById('subjectSelector').value;
    if (subject) {
        showToast(`Selected ${subject} - Click "Get Recommendations" to see personalized content`, 'info');
    }
}

function getRecommendationsForSelectedSubject() {
    const subject = document.getElementById('subjectSelector').value;
    if (!subject) {
        showToast('Please select a subject first', 'error');
        return;
    }
    
    // Update recommendations based on selected subject
    updateRecommendationsForSubject(subject);
    showToast(`Loading personalized recommendations for ${subject}...`, 'success');
}

function updateRecommendationsForSubject(subject) {
    // Get available topics for the subject
    const availableTopics = getAvailableTopics(subject);
    const recommendationsContainer = document.querySelector('.recommendations-grid');
    
    if (availableTopics.length === 0) {
        recommendationsContainer.innerHTML = `
            <div class="no-content">
                <h3>No content available for ${subject}</h3>
                <p>Please select a different subject or contact support.</p>
            </div>
        `;
        return;
    }
    
    // Generate recommendation cards based on available content
    let recommendationsHTML = '';
    availableTopics.forEach((topic, index) => {
        const contentTypes = getContentTypesForTopic(subject, topic);
        
        contentTypes.forEach(contentType => {
            const priority = index === 0 ? 'high' : index === 1 ? 'medium' : 'low';
            const priorityText = index === 0 ? 'HIGH PRIORITY' : index === 1 ? 'MEDIUM PRIORITY' : 'LOW PRIORITY';
            const difficulty = topic.includes('Basics') || topic.includes('Anatomy') ? 'beginner' : 
                             topic.includes('Advanced') ? 'advanced' : 'intermediate';
            
            const icon = contentType === 'video' ? 'fas fa-video' : 
                        contentType === 'quiz' ? 'fas fa-quiz' : 'fas fa-file-alt';
            const duration = contentType === 'video' ? '18 min' : 
                           contentType === 'quiz' ? '15 min' : '25 min';
            const actionText = contentType === 'video' ? 'Start Learning' : 
                             contentType === 'quiz' ? 'Take Quiz' : 'Read Article';
            
            recommendationsHTML += `
                <div class="recommendation-card priority-${priority}">
                    <div class="recommendation-header">
                        <span class="priority-badge ${priority}">${priorityText}</span>
                        <span class="difficulty-badge ${difficulty}">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                    </div>
                    <h3>${topic}</h3>
                    <p>Your ${subject.toLowerCase()} score indicates you need focused study on ${topic.toLowerCase()}. This ${contentType} covers essential concepts.</p>
                    <div class="recommendation-meta">
                        <span><i class="${icon}"></i> ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}</span>
                        <span><i class="fas fa-clock"></i> ${duration}</span>
                        <span><i class="fas fa-heart"></i> ${subject}</span>
                    </div>
                    <button class="btn-primary" onclick="startLearning('${contentType}', '${subject}', '${topic}')">${actionText}</button>
                </div>
            `;
        });
    });
    
    recommendationsContainer.innerHTML = recommendationsHTML;
}

function getAvailableTopics(subject) {
    const topics = {
        'Cardiology': ['Cardiac Anatomy', 'ECG Basics', 'Heart Murmurs'],
        'Respiratory': ['Lung Anatomy', 'Breathing Mechanics', 'Gas Exchange'],
        'Neurology': ['Neuroanatomy', 'Neuron Function', 'Synaptic Transmission'],
        'Pharmacology': ['Drug Classifications', 'Dosage Calculations', 'Medication Safety'],
        'Anatomy': ['Skeletal System', 'Muscular System', 'Nervous System'],
        'Clinical': ['Vital Signs', 'Patient Communication', 'Infection Control']
    };
    
    return topics[subject] || [];
}

function getContentTypesForTopic(subject, topic) {
    // Return available content types for a topic
    const contentTypes = ['video', 'article', 'quiz'];
    return contentTypes.slice(0, Math.floor(Math.random() * 3) + 1); // Random 1-3 content types
}

// Update recommendation cards to make buttons functional
function makeRecommendationButtonsFunctional() {
    document.querySelectorAll('.recommendation-card .btn-primary').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get recommendation data from the card
            const card = this.closest('.recommendation-card');
            const title = card.querySelector('h3').textContent;
            const meta = card.querySelector('.recommendation-meta');
            
            // Determine content type and subject from the card
            let contentType = 'video';
            let subject = 'Cardiology';
            let topic = 'Cardiac Anatomy';
            
            // Extract subject and topic from title or meta
            if (title.includes('Neuron') || title.includes('Neurology')) {
                subject = 'Neurology';
                topic = 'Neuroanatomy';
            } else if (title.includes('Heart') || title.includes('Murmur') || title.includes('Cardiac')) {
                subject = 'Cardiology';
                topic = title.includes('Murmur') ? 'Heart Murmurs' : 'Cardiac Anatomy';
            } else if (title.includes('Respiratory') || title.includes('Breathing')) {
                subject = 'Respiratory';
                topic = 'Lung Anatomy';
            }
            
            // Determine content type from meta
            const typeIcon = meta.querySelector('i');
            if (typeIcon) {
                if (typeIcon.classList.contains('fa-video')) {
                    contentType = 'video';
                } else if (typeIcon.classList.contains('fa-quiz')) {
                    contentType = 'quiz';
                } else if (typeIcon.classList.contains('fa-file-alt')) {
                    contentType = 'article';
                }
            }
            
            // Start learning
            startLearning(contentType, subject, topic);
        });
    });
}

// Export functions for global access
window.MedAideAI = {
    switchSection,
    startTimer,
    pauseTimer,
    resetTimer,
    logMood,
    showToast,
    installApp,
    changeStep,
    completeOnboarding,
    toggleProfileMenu,
    editProfile,
    viewSettings,
    exportData,
    resetApp,
    startLearning,
    openVideoModal,
    openArticleModal,
    openQuizModal,
    closeLearningModal,
    makeRecommendationButtonsFunctional,
    updateRecommendationsForSubject,
    getRecommendationsForSelectedSubject,
    getAvailableTopics,
    getContentTypesForTopic,
    showUpdateAvailable,
    updateApp
};
