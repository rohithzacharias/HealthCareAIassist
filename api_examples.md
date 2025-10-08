# MedAide AI - API Examples for Universal Study Assistant

## Student-Driven Workflow APIs

### 1. POST /api/subject-selection - What Subject Are You Studying?

**Request:**
```json
{
  "student_id": "S001"
}
```

**Response:**
```json
{
  "message": "What subject are you studying today?",
  "available_subjects": [
    "Computer Science", "Mathematics", "Physics", 
    "Chemistry", "Biology", "English Literature", 
    "History", "Psychology", "Study Skills"
  ],
  "student_current_focus": "Computer Science"
}
```

### 2. POST /api/enter-marks - Student Enters Their Own Marks

**Request:**
```json
{
  "student_id": "S001",
  "subject": "Computer Science",
  "mark_entries": [
    {"topic": "Programming Basics", "marks": 38, "total": 100},
    {"topic": "Data Structures", "marks": 35, "total": 100},
    {"topic": "Algorithms", "marks": 42, "total": 100}
  ]
}
```

**Response:**
```json
{
  "marks_saved": true,
  "weak_areas_detected": [
    {"topic": "Data Structures", "percentage": 35, "priority": "Immediate"},
    {"topic": "Programming Basics", "percentage": 38, "priority": "High"},
    {"topic": "Algorithms", "percentage": 42, "priority": "Medium"}
  ],
  "ai_message": "I notice you need help with programming fundamentals. Let me find the right resources for you."
}
```

### 3. POST /api/recommend-by-marks - AI Selects Resources Based on Marks

**Request:**
```json
{
  "student_id": "S001",
  "weak_subjects": [
    {"topic": "Programming Basics", "score": 38},
    {"topic": "Data Structures", "score": 35}
  ]
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "topic": "Programming Basics",
      "resource": "Introduction to Programming Logic and Concepts",
      "type": "Video",
      "duration": 22,
      "reasoning": "Your 38% score shows you need foundational concepts. This video covers variables, loops, and basic logic.",
      "priority": "Start here first",
      "expected_improvement": "Should boost you to 55-60% range"
    },
    {
      "topic": "Data Structures", 
      "resource": "Arrays and Trees Implementation",
      "type": "Interactive",
      "duration": 45,
      "reasoning": "Your 35% score indicates hands-on practice needed with data structures implementation.",
      "priority": "After programming basics",
      "expected_improvement": "Critical foundation topic"
    }
  ]
}
```