# MedAide AI - API Examples & Integration Guide

## System Overview
**AI-Powered Study Assistant** that provides personalized learning resource recommendations, intelligent study scheduling, and wellness-integrated break management for healthcare students.

## Core API Endpoints

### 1. POST /api/recommend - Get Personalized Resource Recommendations

**Request:**
```json
{
  "student_id": "S001",
  "subject": "Cardiac Anatomy",
  "current_score": 45,
  "preferred_difficulty": "Beginner",
  "preferred_content_types": ["Video", "Quiz"]
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "resource_id": 1,
      "title": "Understanding Heart Structure for Healthcare Students",
      "type": "Video",
      "difficulty": "Beginner", 
      "duration_minutes": 12,
      "url": "https://example.com/cardiology/cardiac-anatomy",
      "reasoning": "Your cardiac anatomy score (45%) indicates you need foundational review. This video covers essential heart structure concepts.",
      "priority": "HIGH",
      "tags": ["Cardiology", "Anatomy", "Heart"]
    }
  ],
  "study_plan": {
    "estimated_improvement": "15-20% score increase",
    "recommended_session_length": 25,
    "follow_up_resources": 2
  }
}
```

### 2. POST /api/schedule - Create Personalized Study Schedule

**Request:**
```json
{
  "student_id": "S001", 
  "session_length": 60,
  "subjects": ["Cardiac Anatomy", "ECG Interpretation"],
  "break_preferences": {
    "short_break": 5,
    "long_break": 15,
    "wellness_focus": "Mindfulness"
  }
}
```

**Response:**
```json
{
  "study_schedule": {
    "total_duration": 60,
    "blocks": [
      {
        "type": "Study",
        "subject": "Cardiac Anatomy", 
        "duration": 25,
        "resource": "Understanding Heart Structure Video",
        "focus_areas": ["Heart chambers", "Blood flow patterns"]
      },
      {
        "type": "Break",
        "duration": 5,
        "activity": {
          "title": "5-Minute Deep Breathing",
          "category": "Mindfulness",
          "description": "Practice box breathing to reduce stress and improve focus"
        }
      },
      {
        "type": "Study", 
        "subject": "ECG Interpretation",
        "duration": 25,
        "resource": "ECG Basics Article",
        "focus_areas": ["Normal rhythms", "Common abnormalities"]
      },
      {
        "type": "Break",
        "duration": 5,
        "activity": {
          "title": "Desk Stretches", 
          "category": "Physical",
          "description": "Simple stretches to relieve neck, shoulder tension"
        }
      }
    ],
    "session_id": "session_001"
  }
}
```

### 3. GET /api/wellness-tips - Retrieve Wellness Activities

**Request:** `GET /api/wellness-tips?category=Physical&duration=5`

**Response:**
```json
{
  "wellness_tips": [
    {
      "id": 2,
      "title": "Desk Stretches",
      "category": "Physical", 
      "duration_minutes": 3,
      "description": "Simple stretches to relieve neck, shoulder, and back tension from studying",
      "instructions": [
        "Neck rolls: 5 times each direction",
        "Shoulder shrugs: Hold 5 seconds, repeat 5 times", 
        "Spinal twist: 30 seconds each side"
      ],
      "tags": ["physical health", "stretching", "posture"]
    },
    {
      "id": 7,
      "title": "Eye Rest Exercise",
      "category": "Physical",
      "duration_minutes": 2, 
      "description": "Follow the 20-20-20 rule to reduce eye strain",
      "tags": ["eye health", "screen time", "vision"]
    }
  ]
}
```

### 4. GET /api/student/performance - Student Performance Analytics

**Request:** `GET /api/student/performance/{student_id}`

**Response:**
```json
{
  "student_profile": {
    "student_id": "S001",
    "name": "Alex Chen",
    "overall_progress": {
      "average_score": 54.7,
      "improvement_trend": "+12% last month",
      "total_study_sessions": 23,
      "preferred_study_time": "45 minutes"
    },
    "subject_breakdown": {
      "Cardiac Anatomy": {
        "current_score": 45,
        "trend": "needs_attention", 
        "recommended_resources": 3,
        "last_studied": "2025-10-06"
      },
      "ECG Interpretation": {
        "current_score": 52,
        "trend": "improving",
        "recommended_resources": 2, 
        "last_studied": "2025-10-07"
      },
      "Dosage Calculations": {
        "current_score": 74,
        "trend": "strong",
        "recommended_resources": 0,
        "last_studied": "2025-10-05"
      }
    },
    "wellness_stats": {
      "break_compliance": "85%",
      "preferred_wellness_categories": ["Mindfulness", "Physical"],
      "stress_level": "Moderate"
    }
  }
}
```

### 5. POST /api/session/start - Begin Study Session

**Request:**
```json
{
  "student_id": "S001",
  "resource_id": 1,
  "session_type": "focused_study",
  "estimated_duration": 25
}
```

**Response:**
```json
{
  "session": {
    "session_id": "sess_001", 
    "status": "active",
    "resource": {
      "title": "Understanding Heart Structure for Healthcare Students",
      "type": "Video",
      "url": "https://example.com/cardiology/cardiac-anatomy"
    },
    "timer": {
      "total_duration": 25,
      "remaining_time": 1500,
      "next_break": "5-minute wellness break in 25 minutes"
    },
    "progress_tracking": {
      "completion_percentage": 0,
      "focus_checkpoints": [5, 15, 20]
    }
  }
}
```

## Rule-Based AI Logic Examples

### Recommendation Algorithm
```python
def generate_recommendation(student_performance, subject):
    score = student_performance[subject]
    
    # Get matching resources for subject
    resources = get_resources_by_subject(subject)
    
    for resource in resources:
        if score < resource['recommendation_threshold']:
            return {
                'resource': resource,
                'reasoning': resource['reasoning_template'],
                'priority': calculate_priority(score, resource['threshold']),
                'expected_improvement': estimate_improvement(score, resource)
            }
```

### Study Schedule Generation
```python
def create_study_schedule(session_length, student_preferences):
    blocks = []
    remaining_time = session_length
    
    # Calculate study/break ratios based on preferences
    study_block = student_preferences['preferred_session_length'] 
    short_break = 5
    
    while remaining_time > study_block:
        # Add study block
        blocks.append({
            'type': 'Study',
            'duration': study_block,
            'subject': get_priority_subject(student_performance)
        })
        remaining_time -= study_block
        
        # Add break block with wellness tip
        if remaining_time >= short_break:
            wellness_tip = get_wellness_tip(student_preferences)
            blocks.append({
                'type': 'Break', 
                'duration': short_break,
                'activity': wellness_tip
            })
            remaining_time -= short_break
    
    return blocks
```

## Demo Flow for Hackathon

### Live Demo Script (3-4 minutes):

**1. Student Profile Selection (30 seconds)**
```bash
curl -X GET /api/student/performance/S001
# Show Alex's low Cardiac Anatomy score (45%)
```

**2. AI Recommendation Generation (45 seconds)**
```bash
curl -X POST /api/recommend \
  -d '{"student_id":"S001", "subject":"Cardiac Anatomy", "current_score":45}'
# Demonstrate reasoning: "Your score indicates foundational review needed"
```

**3. Personalized Study Schedule (60 seconds)**
```bash
curl -X POST /api/schedule \
  -d '{"student_id":"S001", "session_length":60, "subjects":["Cardiac Anatomy"]}'
# Show Pomodoro blocks with wellness breaks integrated
```

**4. Wellness Integration Demo (45 seconds)**
```bash 
curl -X GET /api/wellness-tips?category=Mindfulness&duration=5
# Display "5-Minute Deep Breathing" activity during break
```

### Expected Demo Outcomes:
- **Personalized AI:** Show how low scores trigger specific recommendations
- **Smart Scheduling:** Demonstrate Pomodoro + wellness integration  
- **Student Wellness:** Highlight break activities preventing study burnout
- **Real-time Adaptation:** Show how system learns student preferences

## Integration Notes for Team

### Backend Implementation (Advaith/Rohith):
```python
# Load JSON data structures
learning_resources = json.load('learning_resources.json')
student_data = json.load('student_performance_data.json') 
wellness_tips = json.load('wellness_tips.json')

# Core recommendation logic
def recommend_resources(student_id, subject):
    student = get_student(student_id)
    score = student['performance'][subject]
    
    # Filter resources by subject and score threshold
    candidates = [r for r in learning_resources 
                 if r['topic'] == subject and score < r['recommendation_threshold']]
    
    return sorted(candidates, key=lambda x: x['recommendation_threshold'])[:3]
```

### Frontend Integration (Adithyan/Sivasanand):
```javascript
// Fetch and display recommendations
async function getRecommendations(studentId, subject) {
    const response = await fetch('/api/recommend', {
        method: 'POST',
        body: JSON.stringify({student_id: studentId, subject: subject})
    });
    
    const data = await response.json();
    displayRecommendations(data.recommendations);
}

// Start study session with timer
function startStudySession(schedule) {
    schedule.blocks.forEach(block => {
        if (block.type === 'Study') {
            startTimer(block.duration, block.subject);
        } else {
            showWellnessActivity(block.activity);
        }
    });
}
```

---

**Integration Ready:** These API examples provide complete request/response formats for seamless frontend-backend integration in your MedAide AI system! 🚀