# Campus Wellness Analytics - API Examples & Demo

## System Overview
A data analytics platform that collects anonymous wellness survey data and provides actionable insights to improve campus health services through trend analysis and strategic recommendations.

## Example API Calls & Responses

### 1. POST /api/surveys/submit - Anonymous Survey Submission

**Request:**
```json
{
  "survey_responses": {
    "demographic": {
      "year_of_study": "sophomore",
      "program": "healthcare", 
      "age_range": "19-21",
      "residency": "on_campus"
    },
    "responses": {
      "mental_health_stress": 8,
      "mental_health_anxiety": "5-6 days",
      "physical_health_sleep": 2,
      "academic_wellness_balance": 3,
      "social_wellness_connection": "Somewhat disconnected"
    }
  }
}
```

**Response:**
```json
{
  "status": "success",
  "response_id": "resp_011", 
  "message": "Anonymous wellness data submitted successfully",
  "timestamp": "2025-10-07T15:30:00Z"
}
```

### 2. GET /api/analytics/trends - Wellness Trend Analysis

**Request:** `GET /api/analytics/trends?category=mental_health&timeframe=last_30_days`

**Response:**
```json
{
  "category": "mental_health",
  "timeframe": "last_30_days",
  "total_responses": 156,
  "trends": {
    "stress_levels": {
      "average_score": 7.3,
      "trend_direction": "increasing",
      "percentage_high_stress": 73,
      "demographics_most_affected": ["freshmen", "pre_med", "on_campus"]
    },
    "anxiety_frequency": {
      "daily_anxiety": 45,
      "weekly_anxiety": 68,
      "trend_direction": "stable_high",
      "concern_level": "critical"
    }
  },
  "recommendations": [
    {
      "priority": "CRITICAL",
      "action": "Increase counseling staff immediately",
      "budget_impact": 75000,
      "timeline": "2_weeks"
    }
  ]
}
```

### 3. GET /api/insights/prioritized - Campus Health Insights

**Request:** `GET /api/insights/prioritized?priority=critical,high`

**Response:**
```json
{
  "insights": [
    {
      "insight_id": 1,
      "category": "Mental Health Crisis",
      "priority": "CRITICAL",
      "trend_identified": "High Stress & Anxiety Levels",
      "percentage_affected": "73%",
      "primary_demographics": ["Freshmen", "Pre-med students"],
      "recommendation": {
        "immediate_action": "Increase counseling staff availability during peak stress periods",
        "budget_impact": "$75,000 annually",
        "success_metrics": [
          "Reduce average stress levels from 8.2 to 6.0",
          "Increase counseling service usage by 40%"
        ]
      },
      "implementation_timeline": "Immediate (within 2 weeks)"
    },
    {
      "insight_id": 3,
      "category": "Social Isolation", 
      "priority": "HIGH",
      "trend_identified": "Increasing Loneliness & Disconnection",
      "percentage_affected": "45%",
      "recommendation": {
        "immediate_action": "Expand peer mentorship programs and social events",
        "budget_impact": "$60,000 annually",
        "success_metrics": [
          "Reduce 'always lonely' responses from 25% to 10%"
        ]
      }
    }
  ],
  "total_budget_recommended": "$135,000",
  "estimated_roi": "Prevent 3-5 major mental health crises annually"
}
```

### 4. GET /api/analytics/dashboard - Campus Health Dashboard Data

**Request:** `GET /api/analytics/dashboard`

**Response:**
```json
{
  "dashboard_summary": {
    "total_responses": 156,
    "response_rate": "78%",
    "last_updated": "2025-10-07T15:30:00Z",
    "critical_alerts": 3,
    "high_priority_insights": 5
  },
  "wellness_categories": {
    "mental_health": {
      "overall_score": 4.2,
      "trend": "declining",
      "critical_metrics": ["stress_levels", "anxiety_frequency"]
    },
    "physical_health": {
      "overall_score": 5.1, 
      "trend": "stable",
      "areas_of_concern": ["sleep_quality", "exercise_frequency"]
    },
    "social_wellness": {
      "overall_score": 4.8,
      "trend": "declining",
      "critical_metrics": ["loneliness", "social_connection"]
    }
  },
  "budget_recommendations": {
    "total_suggested": "$340,000",
    "critical_allocations": "$150,000",
    "high_priority": "$115,000",
    "medium_priority": "$75,000"
  }
}
```

### 5. POST /api/analytics/custom - Custom Analytics Query

**Request:**
```json
{
  "query_parameters": {
    "categories": ["mental_health", "academic_wellness"],
    "demographics": {
      "year_of_study": ["freshman", "sophomore"],
      "program": ["pre_med", "nursing"]
    },
    "timeframe": "last_60_days",
    "analysis_type": "correlation"
  }
}
```

**Response:**
```json
{
  "query_results": {
    "correlation_found": true,
    "correlation_strength": 0.78,
    "insight": "Strong correlation between academic stress and mental health deterioration in pre-med freshmen",
    "affected_population": "23% of surveyed pre-med freshmen", 
    "recommended_intervention": {
      "target": "Academic Success Center + Counseling Services collaboration",
      "action": "Integrated academic-mental health support program",
      "budget": "$45,000",
      "expected_outcome": "30% reduction in academic-related stress"
    }
  }
}
```

## Demo Flow for Presentation

### Live Demo Script (2-3 minutes):

1. **Show Anonymous Data Collection** (30 seconds)
   - `POST /api/surveys/submit` → Demonstrate privacy protection
   - Show how student data is anonymized immediately

2. **Display Trend Analysis** (45 seconds)  
   - `GET /api/analytics/trends` → "73% high stress, 68% poor sleep"
   - Show visual trend data and demographic breakdowns

3. **Generate Campus Insights** (60 seconds)
   - `GET /api/insights/prioritized` → Critical recommendations with budget
   - Demonstrate ROI calculations and success metrics

4. **Dashboard Overview** (30 seconds)
   - `GET /api/analytics/dashboard` → Complete campus wellness picture
   - Show how administrators would use this data

### Technical Implementation Notes:

```python
# Example analytics logic
def analyze_wellness_trends(category, timeframe):
    responses = get_anonymous_responses(category, timeframe)
    
    # Calculate key metrics
    avg_scores = calculate_averages(responses)
    trend_direction = analyze_trend_direction(responses)
    demographics = identify_affected_groups(responses)
    
    # Generate insights
    if avg_scores['stress'] > 7.0 and trend_direction == 'increasing':
        priority = 'CRITICAL'
        recommendation = generate_crisis_response(demographics)
    
    return {
        'trends': avg_scores,
        'recommendations': recommendation,
        'budget_impact': calculate_budget_needs(recommendation)
    }
```

### Demo Equipment Needed:
- **Postman Collection** with pre-configured API calls
- **Sample Dashboard** showing visual trend data  
- **Backup Screenshots** in case live demo fails
- **Budget Calculator** showing ROI for recommendations

### Expected Demo Outcomes:
- Demonstrate **anonymous data protection**
- Show **real-time trend identification** 
- Prove **actionable insight generation** with measurable ROI
- Highlight **proactive vs reactive** health service approach

**Total Demo Time:** 2-3 minutes maximum
**Key Message:** "Transform invisible wellness data into visible, actionable campus health improvements"