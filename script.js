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
let currentUserId = 1; // Default user ID for demo

// User Data
let userData = {
    id: 1,
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

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Onboarding state
let currentOnboardingStep = 1;
const totalOnboardingSteps = 3;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Force clear any existing data to ensure fresh user input
    clearAllData();
    
    initializeApp();
    setupEventListeners();
    loadUserData();
    updateDashboard();
    initializeCharts();
});

// Function to clear all stored data
function clearAllData() {
    localStorage.removeItem('medAideUserData');
    localStorage.removeItem('moodHistory');
    
    // Reset user data to empty state
    userData = {
        id: 1,
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
}

// API Helper Functions
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        // Fallback to local data for demo purposes
        return null;
    }
}

async function loadResources(topic = null) {
    const endpoint = topic ? `/resources?topic=${topic}` : '/resources';
    return await apiRequest(endpoint);
}

async function getRecommendations(topic) {
    return await apiRequest('/recommendations', 'GET', null, { topic });
}

async function logStudySession(topic, struggleArea, duration, mood) {
    return await apiRequest('/log-study', 'POST', {
        user_id: currentUserId,
        topic: topic,
        struggle_area: struggleArea,
        duration: duration,
        mood: mood
    });
}

async function getWellnessTips() {
    return await apiRequest('/wellness');
}

async function getWellnessScore() {
    return await apiRequest(`/wellness-score/${currentUserId}`);
}

// Initialize app components
function initializeApp() {
    // Check if user is onboarded
    loadUserData();
    
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

async function timerComplete() {
    isTimerRunning = false;
    clearInterval(timer);
    
    // Update UI
    document.getElementById('startTimer').disabled = false;
    document.getElementById('pauseTimer').disabled = true;
    document.getElementById('startTimer').innerHTML = '<i class="fas fa-play"></i> Start';
    
    // Show completion notification
    showToast('🎉 Study session complete! Time for a well-deserved break.', 'success');
    
    // Log study session to backend
    try {
        const studyDuration = timerDuration / 60; // Convert to minutes
        const moodValue = currentMood === 'excellent' ? 5 : 
                         currentMood === 'good' ? 4 :
                         currentMood === 'okay' ? 3 :
                         currentMood === 'tired' ? 2 : 1;
        
        await logStudySession(
            'General Study', // Topic
            'Focus Session', // Struggle area
            studyDuration,   // Duration in minutes
            moodValue        // Mood (1-5)
        );
    } catch (error) {
        console.error('Error logging study session:', error);
    }
    
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
async function logMood(mood) {
    currentMood = mood;
    
    // Update UI
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-mood="${mood}"]`).classList.add('selected');
    
    // Save mood data locally
    saveMoodData(mood);
    
    // Log mood to backend
    try {
        const moodValue = mood === 'excellent' ? 5 : 
                         mood === 'good' ? 4 :
                         mood === 'okay' ? 3 :
                         mood === 'tired' ? 2 : 1;
        
        await logStudySession(
            'Mood Check', // Topic
            'Wellness',   // Struggle area
            0,            // Duration (0 for mood check)
            moodValue     // Mood (1-5)
        );
    } catch (error) {
        console.error('Error logging mood:', error);
    }
    
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

async function loadUserData() {
    try {
        // Always show onboarding for fresh start
        showOnboarding();
        updateDashboard();
    } catch (error) {
        console.error('Error loading user data:', error);
        showOnboarding();
    }
}

async function loadDemoData() {
    try {
        // Load student performance data
        const response = await fetch('./student_performance_data.json');
        const studentData = await response.json();
        
        if (studentData.length > 0) {
            const demoStudent = studentData[0]; // Use first student as demo
            userData.name = demoStudent.name;
            userData.year = '3rd Year';
            userData.specialty = demoStudent.current_subject;
            
            // Map performance data to our marks structure
            const performanceMap = {
                'Cardiac Anatomy': 'cardiology',
                'Respiratory Anatomy': 'respiratory', 
                'Neuroanatomy': 'neurology',
                'Drug Classifications': 'pharmacology',
                'Skeletal System': 'anatomy',
                'Vital Signs Assessment': 'clinical'
            };
            
            Object.entries(demoStudent.performance).forEach(([subject, score]) => {
                const mappedSubject = performanceMap[subject];
                if (mappedSubject) {
                    userData.marks[mappedSubject] = score;
                }
            });
            
            // Set preferences from demo data
            userData.preferences.sessionLength = demoStudent.study_preferences.preferred_session_length;
            userData.preferences.contentType = demoStudent.study_preferences.preferred_content_types.map(type => type.toLowerCase());
            userData.preferences.stressLevel = 5; // Default stress level
        }
    } catch (error) {
        console.error('Error loading demo data:', error);
    }
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

async function initializeWellnessSection() {
    // Initialize wellness-specific features
    updateWellnessAnalytics();
    loadMoodHistory();
    await loadWellnessTips();
}

async function loadWellnessTips() {
    try {
        const response = await fetch('./wellness_tips.json');
        const wellnessData = await response.json();
        
        if (wellnessData && wellnessData.length > 0) {
            updateWellnessTipsCards(wellnessData);
        }
    } catch (error) {
        console.error('Error loading wellness tips:', error);
    }
}

function updateWellnessTipsCards(tips) {
    const tipCards = document.querySelectorAll('.tip-card');
    
    tips.forEach((tip, index) => {
        if (index < tipCards.length) {
            const card = tipCards[index];
            const title = card.querySelector('h3');
            const description = card.querySelector('p');
            const meta = card.querySelector('.tip-meta');
            const button = card.querySelector('.btn-secondary');
            
            if (title && description && meta && button) {
                title.textContent = tip.title;
                description.textContent = tip.description;
                
                meta.innerHTML = `
                    <span><i class="fas fa-clock"></i> ${tip.duration_minutes} min</span>
                    <span><i class="fas fa-tag"></i> ${tip.category}</span>
                `;
                
                button.textContent = 'Start Exercise';
                button.onclick = () => startWellnessActivity(tip);
            }
        }
    });
}

function startWellnessActivity(tip) {
    showToast(`Starting ${tip.title}... Take your time!`, 'success');
    console.log('Starting wellness activity:', tip);
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

async function completeOnboarding() {
    if (!validateCurrentStep()) return;
    
    // Collect all user data
    collectUserData();
    
    // Save user data locally
    saveUserData();
    
    // Register user with backend (optional for demo)
    try {
        await registerUser();
    } catch (error) {
        console.error('Error registering user:', error);
        // Continue with local data if backend fails
    }
    
    // Hide onboarding
    hideOnboarding();
    
    // Update interface
    updateUserInterface();
    
    // Show welcome message
    showToast(`Welcome to MedAide AI, ${userData.name}! Let's start your healthcare journey!`, 'success');
    
    // Analytics
    trackOnboardingComplete();
}

async function registerUser() {
    try {
        const response = await apiRequest('/register', 'POST', {
            name: userData.name,
            email: `${userData.name.toLowerCase().replace(' ', '.')}@example.com`,
            password: 'demo123',
            topics: Object.keys(userData.marks).filter(subject => userData.marks[subject] > 0),
            difficulty: userData.preferences.sessionLength <= 25 ? 'beginner' : 'intermediate',
            wellness_goals: ['stress management', 'focus improvement']
        });
        
        if (response && response.user_id) {
            currentUserId = response.user_id;
            userData.id = response.user_id;
            console.log('User registered with ID:', response.user_id);
        }
    } catch (error) {
        console.error('Registration failed:', error);
        // Use default user ID for demo
        currentUserId = 1;
        userData.id = 1;
    }
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
    document.getElementById('navUserName').textContent = userData.name || 'Student';
    document.getElementById('profileName').textContent = userData.name || 'Student Name';
    document.getElementById('profileYear').textContent = `${userData.year || 'Year'} • ${userData.specialty || 'Specialty'}`;
    
    // Update welcome message
    document.getElementById('userDisplayName').textContent = userData.name || 'Student';
    
    // Update profile avatars with initials
    const name = userData.name || 'Student';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
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

async function updateRecommendations() {
    try {
        // Load learning resources
        const resourcesResponse = await fetch('./learning_resources.json');
        const resourcesData = await resourcesResponse.json();
        
        if (!resourcesData.learning_resources) {
            console.error('No learning resources found');
            return;
        }
        
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
                    // Find matching resource from learning_resources.json
                    const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
                    const matchingResource = resourcesData.learning_resources.find(resource => 
                        resource.topic.toLowerCase().includes(subject.toLowerCase()) ||
                        resource.tags.some(tag => tag.toLowerCase().includes(subject.toLowerCase()))
                    );
                    
                    if (matchingResource) {
                        title.textContent = matchingResource.title;
                        description.textContent = matchingResource.description;
                        
                        // Update meta based on resource type
                        const typeIcon = matchingResource.type === 'Video' ? 'fas fa-video' : 
                                       matchingResource.type === 'Article' ? 'fas fa-file-alt' : 'fas fa-quiz';
                        
                        meta.innerHTML = `
                            <span><i class="${typeIcon}"></i> ${matchingResource.type}</span>
                            <span><i class="fas fa-clock"></i> ${matchingResource.duration_minutes} min</span>
                            <span><i class="fas fa-tag"></i> ${matchingResource.tags[0]}</span>
                        `;
                        
                        // Add click handler based on resource type
                        const button = card.querySelector('.btn-primary');
                        if (button) {
                            if (matchingResource.type === 'Video') {
                                button.textContent = 'Start Learning';
                                button.onclick = () => startLearning(matchingResource);
                            } else if (matchingResource.type === 'Quiz') {
                                button.textContent = 'Take Quiz';
                                button.onclick = () => startQuiz(matchingResource);
                            } else if (matchingResource.type === 'Article') {
                                button.textContent = 'Read Article';
                                button.onclick = () => readArticle(matchingResource);
                            } else {
                                button.onclick = () => openResource(matchingResource);
                            }
                        }
                    } else {
                        // Fallback to generic recommendation
                        title.textContent = `${subjectName} Fundamentals`;
                        description.textContent = `Your ${subjectName.toLowerCase()} score (${score}%) indicates you need foundational review. This resource covers essential concepts.`;
                        
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
            }
        });
        
        // If no low scores, show general recommendations
        if (lowScoreSubjects.length === 0) {
            const generalResources = resourcesData.learning_resources.slice(0, 3);
            const recommendationCards = document.querySelectorAll('.recommendation-card');
            
            generalResources.forEach((resource, index) => {
                if (index < recommendationCards.length) {
                    const card = recommendationCards[index];
                    const title = card.querySelector('h3');
                    const description = card.querySelector('p');
                    const meta = card.querySelector('.recommendation-meta');
                    
                    if (title && description && meta) {
                        title.textContent = resource.title;
                        description.textContent = resource.description;
                        
                        const typeIcon = resource.type === 'Video' ? 'fas fa-video' : 
                                       resource.type === 'Article' ? 'fas fa-file-alt' : 'fas fa-quiz';
                        
                        meta.innerHTML = `
                            <span><i class="${typeIcon}"></i> ${resource.type}</span>
                            <span><i class="fas fa-clock"></i> ${resource.duration_minutes} min</span>
                            <span><i class="fas fa-tag"></i> ${resource.tags[0]}</span>
                        `;
                        
                        const button = card.querySelector('.btn-primary');
                        if (button) {
                            if (resource.type === 'Video') {
                                button.textContent = 'Start Learning';
                                button.onclick = () => startLearning(resource);
                            } else if (resource.type === 'Quiz') {
                                button.textContent = 'Take Quiz';
                                button.onclick = () => startQuiz(resource);
                            } else if (resource.type === 'Article') {
                                button.textContent = 'Read Article';
                                button.onclick = () => readArticle(resource);
                            } else {
                                button.onclick = () => openResource(resource);
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error updating recommendations:', error);
    }
}

// Learning Functions
function startLearning(resource) {
    showToast(`Starting learning session: ${resource.title}`, 'success');
    
    // Create learning modal
    const modal = createLearningModal(resource);
    document.body.appendChild(modal);
    
    // Start timer for learning session
    const duration = resource.duration_minutes || 25;
    setTimer(duration);
    
    // Track learning session
    trackLearningSession(resource, 'video');
}

function startQuiz(resource) {
    showToast(`Starting quiz: ${resource.title}`, 'success');
    
    // Create quiz modal
    const modal = createQuizModal(resource);
    document.body.appendChild(modal);
    
    // Track quiz session
    trackLearningSession(resource, 'quiz');
}

function readArticle(resource) {
    showToast(`Opening article: ${resource.title}`, 'success');
    
    // Create article modal
    const modal = createArticleModal(resource);
    document.body.appendChild(modal);
    
    // Track reading session
    trackLearningSession(resource, 'article');
}

function openResource(resource) {
    // In a real app, this would open the resource URL
    showToast(`Opening ${resource.title}...`, 'info');
    console.log('Opening resource:', resource);
}

// Modal Creation Functions
function createLearningModal(resource) {
    const modal = document.createElement('div');
    modal.className = 'learning-modal';
    modal.innerHTML = `
        <div class="learning-modal-content">
            <div class="learning-modal-header">
                <h3>🎥 ${resource.title}</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="learning-modal-body">
                <div class="video-placeholder">
                    <div class="video-icon">
                        <i class="fas fa-play-circle"></i>
                    </div>
                    <p>Video Player Placeholder</p>
                    <p class="video-info">Duration: ${resource.duration_minutes} minutes</p>
                </div>
                <div class="learning-content">
                    <h4>Description</h4>
                    <p>${resource.description}</p>
                    <div class="learning-meta">
                        <span><i class="fas fa-tag"></i> ${resource.tags.join(', ')}</span>
                        <span><i class="fas fa-clock"></i> ${resource.duration_minutes} min</span>
                        <span><i class="fas fa-signal"></i> ${resource.difficulty}</span>
                    </div>
                </div>
                <div class="learning-actions">
                    <button class="btn-primary" onclick="completeLearning('${resource.title}')">Mark as Complete</button>
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    addModalStyles();
    return modal;
}

function createQuizModal(resource) {
    const quizQuestions = generateQuizQuestions(resource);
    const modal = document.createElement('div');
    modal.className = 'quiz-modal';
    modal.innerHTML = `
        <div class="quiz-modal-content">
            <div class="quiz-modal-header">
                <h3>📝 ${resource.title} - Quiz</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="quiz-modal-body">
                <div class="quiz-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="quizProgress" style="width: 0%"></div>
                    </div>
                    <span id="quizCounter">Question 1 of 5</span>
                </div>
                <div class="quiz-content" id="quizContent">
                    ${generateQuizHTML(quizQuestions, 0)}
                </div>
                <div class="quiz-actions">
                    <button class="btn-primary" id="nextQuestion" onclick="nextQuizQuestion()" style="display: none;">Next Question</button>
                    <button class="btn-primary" id="submitQuiz" onclick="submitQuiz()" style="display: none;">Submit Quiz</button>
                </div>
            </div>
        </div>
    `;
    
    addModalStyles();
    return modal;
}

function createArticleModal(resource) {
    const modal = document.createElement('div');
    modal.className = 'article-modal';
    modal.innerHTML = `
        <div class="article-modal-content">
            <div class="article-modal-header">
                <h3>📖 ${resource.title}</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="article-modal-body">
                <div class="article-content">
                    <div class="article-meta">
                        <span><i class="fas fa-clock"></i> ${resource.duration_minutes} min read</span>
                        <span><i class="fas fa-signal"></i> ${resource.difficulty}</span>
                        <span><i class="fas fa-tag"></i> ${resource.tags.join(', ')}</span>
                    </div>
                    <div class="article-text">
                        <h4>Introduction</h4>
                        <p>${resource.description}</p>
                        
                        <h4>Key Concepts</h4>
                        <p>This article covers essential concepts in ${resource.tags[0]}. You'll learn about fundamental principles, practical applications, and clinical relevance.</p>
                        
                        <h4>Learning Objectives</h4>
                        <ul>
                            <li>Understand the basic principles</li>
                            <li>Identify key components and functions</li>
                            <li>Apply knowledge to clinical scenarios</li>
                            <li>Recognize common patterns and variations</li>
                        </ul>
                        
                        <h4>Detailed Content</h4>
                        <p>This comprehensive article provides in-depth coverage of ${resource.title.toLowerCase()}. The content is structured to build your understanding progressively, starting with foundational concepts and advancing to more complex applications.</p>
                        
                        <p>Key topics covered include:</p>
                        <ul>
                            <li>Anatomical structures and their relationships</li>
                            <li>Physiological processes and mechanisms</li>
                            <li>Clinical correlations and applications</li>
                            <li>Common variations and abnormalities</li>
                        </ul>
                        
                        <h4>Summary</h4>
                        <p>This article has provided a comprehensive overview of ${resource.title.toLowerCase()}. Understanding these concepts is crucial for your healthcare education and future clinical practice.</p>
                    </div>
                </div>
                <div class="article-actions">
                    <button class="btn-primary" onclick="completeReading('${resource.title}')">Mark as Read</button>
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    addModalStyles();
    return modal;
}

// Quiz Functions
let currentQuizData = {
    questions: [],
    currentQuestion: 0,
    answers: [],
    score: 0
};

function generateQuizQuestions(resource) {
    const topic = resource.topic.toLowerCase();
    const questions = [];
    
    // Generate 5 questions based on the topic
    const questionTemplates = {
        'cardiac anatomy': [
            {
                question: "What is the main function of the heart?",
                options: ["Pump blood throughout the body", "Filter toxins", "Produce hormones", "Store nutrients"],
                correct: 0
            },
            {
                question: "How many chambers does the human heart have?",
                options: ["2", "3", "4", "5"],
                correct: 2
            },
            {
                question: "Which valve separates the left atrium from the left ventricle?",
                options: ["Tricuspid", "Mitral", "Pulmonary", "Aortic"],
                correct: 1
            },
            {
                question: "What is the largest artery in the body?",
                options: ["Pulmonary artery", "Aorta", "Carotid artery", "Femoral artery"],
                correct: 1
            },
            {
                question: "Which side of the heart pumps oxygenated blood?",
                options: ["Right side", "Left side", "Both sides", "Neither side"],
                correct: 1
            }
        ],
        'respiratory': [
            {
                question: "What is the primary function of the respiratory system?",
                options: ["Digestion", "Gas exchange", "Circulation", "Excretion"],
                correct: 1
            },
            {
                question: "Where does gas exchange occur in the lungs?",
                options: ["Bronchi", "Alveoli", "Trachea", "Pharynx"],
                correct: 1
            },
            {
                question: "What muscle is primarily responsible for breathing?",
                options: ["Biceps", "Diaphragm", "Quadriceps", "Hamstrings"],
                correct: 1
            },
            {
                question: "How many lobes does the right lung have?",
                options: ["2", "3", "4", "5"],
                correct: 1
            },
            {
                question: "What is the normal respiratory rate for adults?",
                options: ["8-12 breaths/min", "12-20 breaths/min", "20-30 breaths/min", "30-40 breaths/min"],
                correct: 1
            }
        ],
        'neurology': [
            {
                question: "What is the basic unit of the nervous system?",
                options: ["Synapse", "Neuron", "Dendrite", "Axon"],
                correct: 1
            },
            {
                question: "Which part of the brain controls balance and coordination?",
                options: ["Cerebrum", "Cerebellum", "Brainstem", "Hypothalamus"],
                correct: 1
            },
            {
                question: "What is the function of myelin sheath?",
                options: ["Protection", "Speed up nerve impulses", "Store nutrients", "Produce hormones"],
                correct: 1
            },
            {
                question: "Which neurotransmitter is associated with pleasure and reward?",
                options: ["Serotonin", "Dopamine", "Acetylcholine", "GABA"],
                correct: 1
            },
            {
                question: "What is the largest part of the brain?",
                options: ["Cerebellum", "Cerebrum", "Brainstem", "Thalamus"],
                correct: 1
            }
        ]
    };
    
    // Find matching topic or use default
    let selectedQuestions = questionTemplates['cardiac anatomy']; // Default
    for (const [key, questions] of Object.entries(questionTemplates)) {
        if (topic.includes(key) || resource.tags.some(tag => tag.toLowerCase().includes(key))) {
            selectedQuestions = questions;
            break;
        }
    }
    
    return selectedQuestions;
}

function generateQuizHTML(questions, questionIndex) {
    const question = questions[questionIndex];
    return `
        <div class="question-container">
            <h4>Question ${questionIndex + 1}</h4>
            <p class="question-text">${question.question}</p>
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
}

function selectAnswer(answerIndex) {
    currentQuizData.answers[currentQuizData.currentQuestion] = answerIndex;
    const nextBtn = document.getElementById('nextQuestion');
    const submitBtn = document.getElementById('submitQuiz');
    
    if (nextBtn) nextBtn.style.display = 'block';
    if (currentQuizData.currentQuestion === 4) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'block';
    }
}

function nextQuizQuestion() {
    if (currentQuizData.currentQuestion < 4) {
        currentQuizData.currentQuestion++;
        updateQuizDisplay();
    }
}

function updateQuizDisplay() {
    const progress = ((currentQuizData.currentQuestion + 1) / 5) * 100;
    document.getElementById('quizProgress').style.width = `${progress}%`;
    document.getElementById('quizCounter').textContent = `Question ${currentQuizData.currentQuestion + 1} of 5`;
    
    const questions = generateQuizQuestions({ topic: 'cardiac anatomy' }); // Default for now
    document.getElementById('quizContent').innerHTML = generateQuizHTML(questions, currentQuizData.currentQuestion);
    
    const nextBtn = document.getElementById('nextQuestion');
    const submitBtn = document.getElementById('submitQuiz');
    
    if (nextBtn) nextBtn.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'none';
}

function submitQuiz() {
    // Calculate score
    const questions = generateQuizQuestions({ topic: 'cardiac anatomy' }); // Default for now
    let score = 0;
    
    for (let i = 0; i < 5; i++) {
        if (currentQuizData.answers[i] === questions[i].correct) {
            score++;
        }
    }
    
    const percentage = (score / 5) * 100;
    
    // Show results
    const modal = document.querySelector('.quiz-modal');
    if (modal) {
        modal.innerHTML = `
            <div class="quiz-modal-content">
                <div class="quiz-modal-header">
                    <h3>📊 Quiz Results</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="quiz-modal-body">
                    <div class="quiz-results">
                        <div class="score-circle">
                            <span class="score-number">${score}/5</span>
                            <span class="score-percentage">${percentage}%</span>
                        </div>
                        <h4>${percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good job!' : 'Keep studying!'}</h4>
                        <p>You answered ${score} out of 5 questions correctly.</p>
                        <div class="quiz-actions">
                            <button class="btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    showToast(`Quiz completed! Score: ${score}/5 (${percentage}%)`, 'success');
}

// Completion Functions
function completeLearning(title) {
    showToast(`🎉 Learning completed: ${title}`, 'success');
    const modal = document.querySelector('.learning-modal');
    if (modal) modal.remove();
    
    // Update user progress
    updateUserProgress(title, 'video');
}

function completeReading(title) {
    showToast(`📖 Reading completed: ${title}`, 'success');
    const modal = document.querySelector('.article-modal');
    if (modal) modal.remove();
    
    // Update user progress
    updateUserProgress(title, 'article');
}

function updateUserProgress(title, type) {
    console.log(`Progress updated: ${type} - ${title}`);
    // In a real app, this would update the user's progress in the database
}

// Modal Styles
function addModalStyles() {
    if (document.getElementById('modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
        .learning-modal, .quiz-modal, .article-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease-in-out;
        }
        
        .learning-modal-content, .quiz-modal-content, .article-modal-content {
            background: white;
            border-radius: 1rem;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            animation: slideInUp 0.3s ease-in-out;
        }
        
        .learning-modal-header, .quiz-modal-header, .article-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            padding: 0.5rem;
            border-radius: 0.5rem;
        }
        
        .close-btn:hover {
            background-color: #f3f4f6;
        }
        
        .learning-modal-body, .quiz-modal-body, .article-modal-body {
            padding: 1.5rem;
        }
        
        .video-placeholder {
            background: #f3f4f6;
            border-radius: 0.75rem;
            padding: 3rem;
            text-align: center;
            margin-bottom: 1.5rem;
        }
        
        .video-icon {
            font-size: 4rem;
            color: #2563eb;
            margin-bottom: 1rem;
        }
        
        .learning-meta, .article-meta {
            display: flex;
            gap: 1rem;
            margin: 1rem 0;
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .learning-meta span, .article-meta span {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .learning-actions, .quiz-actions, .article-actions {
            display: flex;
            gap: 0.75rem;
            margin-top: 1.5rem;
        }
        
        .quiz-progress {
            margin-bottom: 1.5rem;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background-color: #e5e7eb;
            border-radius: 0.375rem;
            overflow: hidden;
            margin-bottom: 0.5rem;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #2563eb, #1d4ed8);
            border-radius: 0.375rem;
            transition: width 0.3s ease-in-out;
        }
        
        .question-container {
            margin-bottom: 1.5rem;
        }
        
        .question-text {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #1f2937;
        }
        
        .options-container {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .option-label {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            border: 2px solid #e5e7eb;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
        }
        
        .option-label:hover {
            border-color: #2563eb;
            background-color: #eff6ff;
        }
        
        .option-label input[type="radio"]:checked + .option-text {
            color: #2563eb;
            font-weight: 600;
        }
        
        .option-label:has(input[type="radio"]:checked) {
            border-color: #2563eb;
            background-color: #eff6ff;
        }
        
        .quiz-results {
            text-align: center;
            padding: 2rem;
        }
        
        .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            color: white;
        }
        
        .score-number {
            font-size: 2rem;
            font-weight: 700;
        }
        
        .score-percentage {
            font-size: 1rem;
            opacity: 0.9;
        }
        
        .article-text {
            line-height: 1.7;
            color: #374151;
        }
        
        .article-text h4 {
            color: #1f2937;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
        }
        
        .article-text ul {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
        }
        
        .article-text li {
            margin-bottom: 0.5rem;
        }
    `;
    document.head.appendChild(style);
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
            id: 1,
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
