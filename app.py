# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import hashlib
from datetime import datetime, timedelta
import os

# ---------- CONFIG ----------
DB_FILE = "study_assist.db"
app = Flask(__name__)
CORS(app)

# ---------- DB Helpers ----------
def get_conn():
    conn = sqlite3.connect(DB_FILE, detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES)
    conn.row_factory = sqlite3.Row
    return conn

def row_to_dict(row):
    if row is None:
        return None
    return {k: row[k] for k in row.keys()}

def rows_to_list(rows):
    return [row_to_dict(r) for r in rows]

# ---------- Password helper ----------
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# ---------- DB Schema + Seed ----------
def create_tables():
    conn = get_conn()
    c = conn.cursor()

    c.executescript("""
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        topics TEXT DEFAULT '[]',
        difficulty TEXT DEFAULT 'beginner',
        wellness_goals TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT NOT NULL,
        difficulty_level TEXT NOT NULL,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT NOT NULL,
        rating REAL DEFAULT 4.0
    );

    CREATE TABLE IF NOT EXISTS study_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        topic TEXT,
        struggle_area TEXT,
        duration INTEGER,
        mood INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wellness_tips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        tip TEXT NOT NULL,
        benefit TEXT
    );

    CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        schedule_json TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)
    conn.commit()
    conn.close()

def seed_dummy_data():
    conn = get_conn()
    c = conn.cursor()

    # Insert a default user (password: "password123")
    try:
        c.execute("""
            INSERT INTO users (name, email, password, topics, difficulty, wellness_goals)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ("Rohith Zacharias", "rohit@example.com", hash_password("password123"),
              json.dumps(["Anatomy","Physiology"]), "beginner", json.dumps(["sleep","hydration"])))
    except sqlite3.IntegrityError:
        pass

    # Resources - use INSERT OR IGNORE pattern by checking existence via url
    resources = [
        ("Anatomy","Beginner","Article","https://example.com/nervous","Nervous system overview, illustrations",4.7),
        ("Anatomy","Beginner","Video","https://youtu.be/example","Nervous System — Basics (video)",4.6),
        ("Anatomy","Intermediate","Flashcards","https://example.com/flashcards","Nervous system flashcards",4.4),
        ("Physiology","Beginner","Video","https://youtu.be/example2","Respiratory physiology basics",4.5),
        ("Time Management","Beginner","Article","https://www.mindtools.com","Time management techniques",4.3),
        ("Stress Management","Intermediate","Article","https://www.helpguide.org","Stress reduction tips",4.6),
    ]
    for r in resources:
        # check if url exists
        c.execute("SELECT id FROM resources WHERE url=?", (r[3],))
        if c.fetchone() is None:
            c.execute("INSERT INTO resources (topic,difficulty_level,type,url,description,rating) VALUES (?,?,?,?,?,?)", r)

    # Wellness tips
    tips = [
        ("stress", "Take a short walk and breathe deeply", "Reduces anxiety and refreshes mind"),
        ("focus", "Use Pomodoro technique: 25 min study + 5 min break", "Improves attention and retention"),
        ("physical", "Stretch your arms and neck every hour", "Prevents fatigue and improves posture"),
        ("hydration", "Drink a glass of water during short breaks", "Maintains cognitive function"),
    ]
    for t in tips:
        c.execute("SELECT id FROM wellness_tips WHERE tip=?", (t[1],))
        if c.fetchone() is None:
            c.execute("INSERT INTO wellness_tips (category, tip, benefit) VALUES (?,?,?)", t)

    conn.commit()
    conn.close()

# ---------- API Endpoints ----------

@app.route("/api/init_db", methods=["GET"])
def api_init_db():
    """Recreate DB and seed with dummy data. Use this during testing to reset DB."""
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    create_tables()
    seed_dummy_data()
    return jsonify({"status":"ok","message":"DB created and seeded."})

@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json() or {}
    required = ["name","email","password"]
    if not all(k in data for k in required):
        return jsonify({"error":"Missing fields (name,email,password required)"}), 400
    name = data["name"]
    email = data["email"]
    pw = data["password"]
    topics = data.get("topics", [])
    difficulty = data.get("difficulty", "beginner")
    wellness_goals = data.get("wellness_goals", [])

    conn = get_conn()
    c = conn.cursor()
    try:
        c.execute("""
            INSERT INTO users (name,email,password,topics,difficulty,wellness_goals)
            VALUES (?,?,?,?,?,?)
        """, (name, email, hash_password(pw), json.dumps(topics), difficulty, json.dumps(wellness_goals)))
        conn.commit()
        user_id = c.lastrowid
        conn.close()
        return jsonify({"message":"User registered","user_id":user_id})
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error":"Email already exists"}), 409

@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json() or {}
    if not all(k in data for k in ["email","password"]):
        return jsonify({"error":"Missing fields (email,password)"}), 400
    email = data["email"]
    pw = data["password"]
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT id,name FROM users WHERE email=? AND password=?", (email, hash_password(pw)))
    row = c.fetchone()
    conn.close()
    if row:
        return jsonify({"user_id": row["id"], "name": row["name"], "message":"Login successful"})
    else:
        return jsonify({"error":"Invalid credentials"}), 401

@app.route("/api/resources", methods=["GET"])
def api_resources():
    """Return resources (optionally filter by topic)."""
    topic = request.args.get("topic")
    conn = get_conn()
    c = conn.cursor()
    if topic:
        c.execute("SELECT * FROM resources WHERE topic = ? ORDER BY rating DESC", (topic,))
    else:
        c.execute("SELECT * FROM resources ORDER BY rating DESC")
    rows = c.fetchall()
    conn.close()
    return jsonify({"count": len(rows), "resources": rows_to_list(rows)})

@app.route("/api/log-study", methods=["POST"])
def api_log_study():
    data = request.get_json() or {}
    req = ["user_id","topic","struggle_area","duration","mood"]
    if not all(k in data for k in req):
        return jsonify({"error":"Missing fields (user_id,topic,struggle_area,duration,mood)"}),400
    user_id = data["user_id"]
    topic = data["topic"]
    struggle_area = data["struggle_area"]
    duration = int(data["duration"])
    mood = int(data["mood"])
    if not (1 <= mood <= 5):
        return jsonify({"error":"Mood must be 1-5"}), 400
    conn = get_conn()
    c = conn.cursor()
    c.execute("""
        INSERT INTO study_logs (user_id,topic,struggle_area,duration,mood)
        VALUES (?,?,?, ?, ?)
    """, (user_id, topic, struggle_area, duration, mood))
    conn.commit()
    conn.close()
    return jsonify({"message":"Study session logged"})

@app.route("/api/recommend", methods=["POST"])
def api_recommend():
    """
    Main recommender endpoint.
    Input JSON: { user_id, current_topic, struggle_area (optional) }
    Output: learning_path: [resources], wellness_tip
    """
    data = request.get_json() or {}
    if not all(k in data for k in ["user_id","current_topic"]):
        return jsonify({"error":"Missing fields (user_id,current_topic)"}), 400
    user_id = data["user_id"]
    topic = data["current_topic"]
    struggle_area = data.get("struggle_area", None)

    conn = get_conn()
    c = conn.cursor()
    # get user difficulty to potentially tune resource selection
    c.execute("SELECT difficulty FROM users WHERE id=?", (user_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return jsonify({"error":"User not found"}), 404
    user_difficulty = row["difficulty"]

    # Simple retrieval: get top-rated resources matching topic
    c.execute("""
        SELECT id, topic, difficulty_level, type, url, description, rating
        FROM resources WHERE topic=? ORDER BY rating DESC, difficulty_level ASC LIMIT 6
    """, (topic,))
    resources = c.fetchall()
    if not resources:
        conn.close()
        return jsonify({"error":"No resources found for topic"}), 404

    # simple rule-based ranking: prefer matching difficulty (approx)
    preferred = []
    fallback = []
    for r in resources:
        diff = (r["difficulty_level"] or "").lower()
        if user_difficulty and user_difficulty.lower() in diff:
            preferred.append(r)
        else:
            fallback.append(r)
    ordered = preferred + fallback
    learning_path = rows_to_list(ordered)[:4]  # return up to 4 items

    # Wellness tip selection based on recent mood
    c.execute("SELECT mood FROM study_logs WHERE user_id=? ORDER BY timestamp DESC LIMIT 3", (user_id,))
    moods = c.fetchall()
    avg_mood = 3
    if moods:
        avg_mood = sum(m["mood"] for m in moods) / len(moods)

    if avg_mood < 3:
        category = "stress"
    elif avg_mood < 4:
        category = "focus"
    else:
        category = "physical"

    c.execute("SELECT tip, benefit FROM wellness_tips WHERE category=? ORDER BY RANDOM() LIMIT 1", (category,))
    tip_row = c.fetchone()
    wellness_tip = {"tip": tip_row["tip"], "benefit": tip_row["benefit"]} if tip_row else {"tip":"Take a short break","benefit":"Reset"}

    conn.close()
    return jsonify({"learning_path": learning_path, "wellness_tip": wellness_tip})

@app.route("/api/recommendations", methods=["GET"])
def api_recommendations_get():
    """
    Lightweight endpoint to fetch recommended resources given user & topic,
    uses the same logic as 'recommend' but without wellness tip.
    GET params: user_id (optional), topic (required)
    """
    topic = request.args.get("topic")
    user_id = int(request.args.get("user_id", 1))
    if not topic:
        return jsonify({"error":"topic param required"}), 400

    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT * FROM resources WHERE topic=? ORDER BY rating DESC", (topic,))
    resources = c.fetchall()
    conn.close()
    return jsonify({"user_id": user_id, "topic": topic, "recommendations": rows_to_list(resources)[:6]})

@app.route("/api/schedule-break", methods=["POST"])
def api_schedule_break():
    """
    Input JSON: { user_id, study_duration (minutes) }
    Returns a schedule array of {study_minutes, break_minutes, tip}
    """
    data = request.get_json() or {}
    if not all(k in data for k in ["user_id","study_duration"]):
        return jsonify({"error":"Missing fields (user_id,study_duration)"}), 400
    user_id = data["user_id"]
    study_duration = int(data["study_duration"])
    conn = get_conn()
    c = conn.cursor()
    # get latest mood
    c.execute("SELECT mood FROM study_logs WHERE user_id=? ORDER BY timestamp DESC LIMIT 1", (user_id,))
    row = c.fetchone()
    mood = row["mood"] if row else 3
    break_minutes = 10 if mood < 3 else 5

    schedule = []
    remaining = study_duration
    study_block = 25
    # start timestamp now
    start = datetime.utcnow()
    while remaining > 0:
        this_study = min(study_block, remaining)
        end_study = start + timedelta(minutes=this_study)
        remaining -= this_study
        # if there's remaining time, schedule a break
        if remaining > 0:
            schedule.append({
                "study_minutes": this_study,
                "start": start.isoformat() + "Z",
                "end": end_study.isoformat() + "Z",
                "break_minutes": break_minutes,
                "tip": "Stand up and stretch or take a short walk"
            })
            # advance start after break
            start = end_study + timedelta(minutes=break_minutes)
        else:
            # final study block no break appended
            schedule.append({
                "study_minutes": this_study,
                "start": start.isoformat() + "Z",
                "end": end_study.isoformat() + "Z",
                "break_minutes": 0,
                "tip": "Session complete — take a longer break"
            })
    # Save schedule JSON
    c.execute("INSERT INTO schedules (user_id, schedule_json) VALUES (?,?)", (user_id, json.dumps(schedule)))
    conn.commit()
    conn.close()
    return jsonify({"user_id": user_id, "schedule": schedule})

@app.route("/api/wellness", methods=["GET"])
def api_wellness():
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT id,category,tip,benefit FROM wellness_tips")
    rows = c.fetchall()
    conn.close()
    return jsonify({"count":len(rows), "tips": rows_to_list(rows)})

@app.route("/api/wellness-score/<int:user_id>", methods=["GET"])
def api_wellness_score(user_id):
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT mood FROM study_logs WHERE user_id=?", (user_id,))
    moods = c.fetchall()
    conn.close()
    if not moods:
        return jsonify({"score":0,"sessions":0})
    avg = sum(m["mood"] for m in moods) / len(moods)
    # Convert mood (1-5) to a 0-100-ish score
    score = round(avg * 20, 2)
    return jsonify({"score": score, "sessions": len(moods)})

@app.route("/api/schedules/<int:user_id>", methods=["GET"])
def api_get_schedules(user_id):
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT id, created_at, schedule_json FROM schedules WHERE user_id=? ORDER BY created_at DESC", (user_id,))
    rows = c.fetchall()
    conn.close()
    # parse schedule_json to objects
    schedules = []
    for r in rows:
        schedules.append({
            "id": r["id"],
            "created_at": r["created_at"],
            "schedule": json.loads(r["schedule_json"])
        })
    return jsonify({"user_id": user_id, "schedules": schedules})

# ---------- Run server ----------
if __name__ == "__main__":
    # If DB doesn't exist, create and seed it
    if not os.path.exists(DB_FILE):
        create_tables()
        seed_dummy_data()
    # If DB exists but missing tables, ensure schema
    else:
        create_tables()
    app.run(host="0.0.0.0", port=5000, debug=True)