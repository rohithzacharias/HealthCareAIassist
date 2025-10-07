# MedAide AI - AI-Powered Study Assistant

![MedAide AI](https://via.placeholder.com/400x100/2E8B57/FFFFFF?text=MedAide+AI)

## 🎯 Project Overview

**Problem Statement:** Healthcare & Campus Experience - AI-Powered Study Assistant

MedAide AI is a personal digital assistant that recommends learning resources, schedules study breaks, and supports overall student wellness. It creates personalized learning paths based on individual student needs and performance.

## ✨ Core Features

### 🧠 Intelligent Resource Recommendations
- **Rule-based AI logic** analyzes student performance scores
- **Personalized suggestions** based on weak subjects and difficulty preferences
- **Reasoning explanations** for every recommendation
- **25+ curated healthcare learning resources** across all medical subjects

### ⏰ Smart Study Scheduling
- **Pomodoro timer integration** with customizable session lengths
- **Break scheduling** based on student preferences (25/45/60 minute sessions)
- **Wellness tip integration** during break periods
- **Adaptive scheduling** based on study patterns

### 🧘 Student Wellness Support
- **10 targeted wellness activities** for study breaks
- **Category-based tips:** Mindfulness, Physical, Study Techniques
- **Duration-optimized:** 1-15 minute activities perfectly timed for breaks
- **Stress management** and focus enhancement tools

## 🏗️ System Architecture

### Rule-Based AI Logic
```
IF student_score < recommendation_threshold:
    RECOMMEND targeted_resource
    PROVIDE reasoning_explanation
    SCHEDULE personalized_study_session
```

### Personalization Engine
- **Performance tracking:** Subject-specific scores and weak areas
- **Learning preferences:** Content type, difficulty, session length
- **Adaptive recommendations:** Improves based on student patterns

## 📁 Project Structure

```
MedAide AI/
├── README.md                      # 📚 Complete project documentation
├── learning_resources.json        # 🧠 25 healthcare learning materials
├── wellness_tips.json            # 🧘 10 wellness activities for breaks
├── student_performance_data.json  # 👥 3 sample student profiles
├── presentation.html              # 🎬 Professional hackathon presentation
└── api_examples.md               # 🔌 Backend/frontend integration guide
```

## 🎯 Data Files Overview

### 📖 `learning_resources.json`
- **25 curated resources** across Cardiology, Neurology, Respiratory, Pharmacology
- **Structured format:** Topic, difficulty, type, recommendation thresholds
- **AI-ready:** Includes reasoning templates for recommendations
- **Multiple formats:** Videos, articles, quizzes, interactive content

### 🧘 `wellness_tips.json` 
- **10 wellness activities** optimized for study breaks
- **Categories:** Mindfulness (breathing, relaxation), Physical (stretches, movement), Study Tips
- **Time-based:** 1-15 minute activities for different break lengths
- **Integration ready:** Perfect for Pomodoro timer incorporation

### 👥 `student_performance_data.json`
- **3 sample student profiles** with realistic performance scores  
- **Comprehensive tracking:** 9 medical subjects per student
- **Study preferences:** Session length, content types, difficulty levels
- **Demo ready:** Triggers recommendations based on low scores

## 🚀 How It Works

### 1. Student Assessment
```json
Student Performance Example:
{
  "student_id": "S001",
  "performance": {
    "Cardiac Anatomy": 45,    // Below 60% threshold
    "ECG Interpretation": 52, // Below 55% threshold  
    "Neuroanatomy": 55       // Needs reinforcement
  }
}
```

### 2. AI Recommendation Engine
```json
Recommendation Output:
{
  "recommended_resource": {
    "title": "Understanding Heart Structure for Healthcare Students",
    "type": "Video", 
    "difficulty": "Beginner",
    "reasoning": "Your cardiac anatomy score indicates you need foundational review..."
  }
}
```

### 3. Study Session Creation
```json
Study Schedule:
{
  "session_blocks": [
    {"type": "Study", "duration": 25, "subject": "Cardiac Anatomy"},
    {"type": "Break", "duration": 5, "activity": "5-Minute Deep Breathing"},
    {"type": "Study", "duration": 25, "subject": "ECG Interpretation"},
    {"type": "Break", "duration": 15, "activity": "Desk Stretches + Hydration"}
  ]
}
```

## 👥 Team Futureinnovatees

| Team Member | Role | Key Responsibilities |
|-------------|------|---------------------|
| **Advaith** | Backend/AI Lead | Rule-based recommendation logic, API development |
| **Rohith** | Data Infrastructure | Database setup, scheduler implementation |
| **Adithyan** | Frontend/UX | User interface, dashboard, API integration |
| **Sivasanand** | UI/QA | Testing, quality assurance, user experience |
| **Jinto** | Data & Content Curator | Learning resources, wellness content, presentation |

## 🛠️ Tech Stack

- **Backend:** Python/Flask for rule-based AI logic
- **Frontend:** React/Vue.js or HTML/CSS/JavaScript
- **Data Storage:** JSON files for MVP (easily scalable to database)
- **AI Logic:** Rule-based recommendation system
- **Integration:** RESTful APIs for frontend-backend communication

## 🎯 MVP Demo Features

### Live Demo Flow (5 minutes):
1. **Student Login** → Select student profile (Alex, Maria, David)
2. **Performance Review** → Show low scores triggering recommendations  
3. **AI Recommendations** → Display personalized resources with reasoning
4. **Study Session Start** → Create Pomodoro schedule with wellness breaks
5. **Wellness Integration** → Show break activities and tips

### Expected Outcomes:
- **Personalized Learning:** Students receive targeted resources for weak subjects
- **Improved Focus:** Scheduled breaks with wellness activities maintain concentration
- **Better Performance:** Structured study sessions with AI guidance enhance learning
- **Wellness Support:** Integrated self-care prevents burnout and stress

## 🔧 Getting Started

1. **Clone Repository:**
   ```bash
   git clone <repository-url>
   cd HealthCareAIassist
   ```

2. **Backend Setup (Advaith/Rohith):**
   - Load JSON data files for recommendation logic
   - Implement rule-based AI algorithms
   - Create API endpoints for frontend integration

3. **Frontend Setup (Adithyan/Sivasanand):**
   - Build user dashboard and resource display
   - Integrate study timer and break scheduler
   - Connect to backend APIs for data retrieval

4. **Demo Preparation:**
   - Use `presentation.html` for hackathon pitch
   - Test with sample student data for live demo
   - Prepare API examples for technical demonstration

## 🏆 Success Metrics

- **Resource Relevance:** 90%+ accuracy in recommending appropriate difficulty levels
- **Study Efficiency:** Structured sessions improve retention by 25%+
- **Wellness Integration:** 80%+ students report better focus with scheduled breaks
- **User Engagement:** Personalized paths increase study session completion rates

## 📱 Future Enhancements

- **Machine Learning:** Upgrade from rule-based to ML recommendation engine
- **Progress Tracking:** Visual analytics showing improvement over time
- **Social Features:** Study groups and peer collaboration tools  
- **Mobile App:** Native iOS/Android applications
- **Integration:** LMS connectivity and grade synchronization

---

**MedAide AI: Transforming healthcare education through personalized, AI-powered study assistance.** 🎓✨
