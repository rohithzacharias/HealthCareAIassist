# MedAide AI - Rule-Based Recommendation System Examples

## Example API Calls & Responses

### 1. GET /api/recommend/{user_id}/{subject}

**Request:** `GET /api/recommend/1/Nervous%20System`

**Rule Logic:**
- User ID 1 (Alex Johnson) 
- Nervous System → Neuroanatomy: 58 (< 60 threshold)
- Nervous System → Neuron Function: 34 (< 55 threshold)

**Response:**
```json
{
  "user_id": 1,
  "subject": "Nervous System", 
  "recommendations": [
    {
      "resource_id": 7,
      "priority": "HIGH",
      "reasoning": "Your neuron physiology performance suggests practice needed. This quiz targets your weak areas.",
      "subtopic": "Neuron Function",
      "score": 34,
      "threshold": 55,
      "resource": {
        "title": "Action Potential and Synaptic Transmission Quiz",
        "type": "Quiz",
        "difficulty": "Intermediate",
        "url": "https://www.example.com/neuro/neuron-function-quiz",
        "length_minutes": 20
      }
    },
    {
      "resource_id": 6,
      "priority": "MEDIUM",
      "reasoning": "Your neuroanatomy score is below 60%. This overview will help clarify brain structure concepts.",
      "subtopic": "Neuroanatomy",
      "score": 58,
      "threshold": 60,
      "resource": {
        "title": "Central Nervous System Overview",
        "type": "Video",
        "difficulty": "Beginner", 
        "url": "https://www.example.com/neuro/neuroanatomy-basics",
        "length_minutes": 22
      }
    }
  ],
  "total_recommendations": 2,
  "timestamp": "2025-10-06T15:30:00Z"
}
```

### 2. POST /api/schedule/generate

**Request Body:**
```json
{
  "user_id": 1,
  "session_type": "pomodoro",
  "total_study_minutes": 90,
  "selected_resources": [6, 7]
}
```

**Response:**
```json
{
  "schedule_id": "sched_001",
  "user_id": 1,
  "timeline": [
    {
      "block_id": 1,
      "type": "study",
      "duration_minutes": 25,
      "resource_id": 7,
      "activity": "Action Potential Quiz",
      "start_time": "15:30",
      "end_time": "15:55"
    },
    {
      "block_id": 2,
      "type": "break",
      "duration_minutes": 5,
      "wellness_tip_id": 4,
      "activity": "1-Min Mindful Check-in",
      "start_time": "15:55",
      "end_time": "16:00"
    },
    {
      "block_id": 3,
      "type": "study", 
      "duration_minutes": 25,
      "resource_id": 6,
      "activity": "Central Nervous System Video",
      "start_time": "16:00",
      "end_time": "16:25"
    },
    {
      "block_id": 4,
      "type": "break",
      "duration_minutes": 5,
      "wellness_tip_id": 2,
      "activity": "2-Min Desk Stretch",
      "start_time": "16:25", 
      "end_time": "16:30"
    },
    {
      "block_id": 5,
      "type": "study",
      "duration_minutes": 25,
      "resource_id": 7,
      "activity": "Review Quiz Results",
      "start_time": "16:30",
      "end_time": "16:55"
    },
    {
      "block_id": 6,
      "type": "long_break",
      "duration_minutes": 15,
      "wellness_tip_id": 5,
      "activity": "Walk Break - 10 Minutes + Reflection",
      "start_time": "16:55",
      "end_time": "17:10"
    }
  ],
  "total_blocks": 6,
  "study_blocks": 3,
  "break_blocks": 3,
  "created_at": "2025-10-06T15:30:00Z"
}
```

### 3. GET /api/wellness/tips/break/{duration}

**Request:** `GET /api/wellness/tips/break/5`

**Response:**
```json
{
  "requested_duration": 5,
  "recommended_tips": [
    {
      "id": 1,
      "title": "5-Min Box Breathing",
      "category": "Mindfulness", 
      "duration_minutes": 5,
      "description": "Inhale 4s, hold 4s, exhale 4s, hold 4s — repeat for grounding.",
      "instructions": [
        "Find comfortable seated position",
        "Place one hand on chest, one on stomach", 
        "Inhale through nose for 4 counts",
        "Hold breath for 4 counts",
        "Exhale through mouth for 4 counts",
        "Hold empty for 4 counts",
        "Repeat cycle 5-8 times"
      ]
    },
    {
      "id": 4, 
      "title": "1-Min Mindful Check-in",
      "category": "Mindfulness",
      "duration_minutes": 1,
      "description": "Quick self-rating of mood/stress on a 1-10 scale and one breath to reset.",
      "instructions": [
        "Rate current stress level (1-10)",
        "Rate current energy level (1-10)",
        "Take one deep breath",
        "Set intention for next study block"
      ]
    }
  ]
}
```

### 4. Rule-Based Logic Examples

```python
# Pseudo-code for recommendation engine
def get_recommendations(user_id, subject):
    user_data = get_user_performance(user_id)
    resources = get_resources_by_subject(subject)
    recommendations = []
    
    for subtopic, score in user_data[subject].items():
        matching_resources = filter_resources_by_subtopic(resources, subtopic)
        
        for resource in matching_resources:
            if score < resource.recommendation_threshold:
                priority = "HIGH" if score < 50 else "MEDIUM" 
                reasoning = resource.reasoning_template
                
                recommendations.append({
                    "resource": resource,
                    "priority": priority,
                    "reasoning": reasoning,
                    "score": score,
                    "threshold": resource.recommendation_threshold
                })
    
    return sort_by_priority(recommendations)
```

## Demo Script for Presentation

### Postman Demo Flow:
1. **Show student data:** `GET /api/students/1` → Display Alex's low scores
2. **Get recommendations:** `GET /api/recommend/1/Nervous%20System` → Show rule logic
3. **Generate schedule:** `POST /api/schedule/generate` → Show study timeline
4. **Get wellness tip:** `GET /api/wellness/tips/break/5` → Show break activities

### Expected Demo Output:
- **Rule trigger:** "Score 34 < 55 threshold → recommend Quiz"  
- **Reasoning shown:** "Your neuron physiology performance suggests practice needed"
- **Schedule generated:** 3 study blocks + 3 wellness breaks
- **Total demo time:** 2-3 minutes maximum