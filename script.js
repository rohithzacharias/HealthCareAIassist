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
    const breakTips = [
        {
            title: "5-Minute Box Breathing",
            description: "Calm your mind with guided breathing exercises.",
            duration: 5,
            category: "Mindfulness"
        },
        {
            title: "Desk Stretches",
            description: "Simple stretches to relieve tension.",
            duration: 3,
            category: "Physical"
        },
        {
            title: "Hydration Break",
            description: "Drink water and step away from your desk.",
            duration: 2,
            category: "Physical"
        },
        {
            title: "Quick Walk",
            description: "Take a short walk to refresh your mind.",
            duration: 5,
            category: "Physical"
        }
    ];
    
    const randomTip = breakTips[Math.floor(Math.random() * breakTips.length)];
    
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
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
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
}

function initializeProgressSection() {
    // Initialize progress-specific features
    updateAchievements();
    updateLearningPath();
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
    // Update achievement badges
    console.log('Updating achievements...');
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
    resetApp
};
