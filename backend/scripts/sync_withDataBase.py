"""Sync conference data from Supabase to JSON files.
Run: docker compose exec backend python -m scripts.sync_conference
"""
import json
import os
import sys
from datetime import datetime
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from app.knowledge.supabase_client import get_supabase

CONTENT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "content", "conference"
)

MONTREAL = ZoneInfo("America/Montreal")

def format_time(dt_string):
    if not dt_string:
        return ""
    dt = datetime.fromisoformat(dt_string)
    local = dt.astimezone(MONTREAL)
    return local.strftime("%-I:%M %p")

def format_date(dt_string):
    if not dt_string:
        return ""
    dt = datetime.fromisoformat(dt_string)
    local = dt.astimezone(MONTREAL)
    return local.strftime("%B %d, %Y")

def sync_sessions():
    sb = get_supabase()
    sessions = sb.table("conference").select("*").order("date_time").execute().data

    # Separate main event (May 30) from workshops (June 1-5)
    main_sessions = [s for s in sessions if "2026-05-30" in s.get("date_time", "")]
    
    chunks = [
        {
            "text": "Her Career Conference 2026 — Her Future of Work (2nd Edition). Presented by Intelligent Nest and MamaNest. Main event: Saturday, May 30, 2026, 1:30 PM to 5:00 PM at District 3 Innovation Centre, 1250 Rue Guy Suite #600, Montreal, QC H3H 2L3. Workshop series: June 1-5, 2026, online. Registration: https://luma.com/qxt3t6an. Hashtag: #HerFutureOfWork.",
            "source": "conference_sessions",
            "type": "conference"
        }
    ]

    for i, s in enumerate(main_sessions, 1):
        title = s.get("title", "")
        speaker = s.get("speaker", "")
        time = format_time(s.get("date_time", ""))
        date = format_date(s.get("date_time", ""))
        duration = s.get("duration_minutes", "")

        parts = [f"Session {i}: {title}."]
        if speaker:
            parts.append(f"Speaker: {speaker}.")
        parts.append(f"May 30, 2026, {time}. In-person at District3.")
        if duration:
            parts.append(f"{duration} minutes.")
        if s.get("description"):
            parts.append(s["description"])

        chunks.append({
            "text": " ".join(parts),
            "source": "conference_sessions",
            "type": "conference"
        })

    filepath = os.path.join(CONTENT_DIR, "sessions.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump({"chunks": chunks}, f, indent=2, ensure_ascii=False)

    print(f"  ✅ sessions.json — {len(chunks)} chunks (May 30 in-person)")
    return len(chunks)

def sync_workshops():
    sb = get_supabase()
    sessions = sb.table("conference").select("*").order("date_time").execute().data

    # Only workshops (June 1-5)
    workshops = [s for s in sessions if "2026-06" in s.get("date_time", "")]

    chunks = []
    for i, s in enumerate(workshops, 1):
        title = s.get("title", "")
        speaker = s.get("speaker", "")
        time = format_time(s.get("date_time", ""))
        date = format_date(s.get("date_time", ""))

        parts = [f"Workshop {i}: {title}."]
        if speaker:
            parts.append(f"Speaker: {speaker}.")
        parts.append(f"{date}, {time}. Online (virtual). 60 minutes.")
        if s.get("description"):
            parts.append(s["description"])

        chunks.append({
            "text": " ".join(parts),
            "source": "conference_workshops",
            "type": "conference"
        })

    filepath = os.path.join(CONTENT_DIR, "workshops.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump({"chunks": chunks}, f, indent=2, ensure_ascii=False)

    print(f"  ✅ workshops.json — {len(chunks)} chunks (June 1-5 online)")
    return len(chunks)

def sync_speakers():
    sb = get_supabase()
    speakers = sb.table("speakers").select("*").execute().data
    sessions = sb.table("conference").select("*").order("date_time").execute().data
    session_map = {s["id"]: s for s in sessions}

    chunks = []
    for sp in speakers:
        name = sp.get("name", "")
        title = (sp.get("title") or "").strip()
        bio = (sp.get("bio") or "").strip()
        session_id = sp.get("session_id")

        session_info = ""
        if session_id and session_id in session_map:
            sess = session_map[session_id]
            sess_time = format_time(sess.get("date_time", ""))
            sess_date = format_date(sess.get("date_time", ""))
            is_online = "2026-06" in sess.get("date_time", "")
            location = "Online (virtual)" if is_online else "In-person at District3"
            session_info = f"Session: {sess.get('title', '')}. {sess_date}, {sess_time}. {location}"

        parts = [f"{name} — {title}." if title else f"{name}."]
        if session_info:
            parts.append(session_info + ".")
        if bio:
            parts.append(bio)

        chunks.append({
            "text": " ".join(parts),
            "source": "conference_speakers",
            "type": "conference"
        })

    filepath = os.path.join(CONTENT_DIR, "speakers.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump({"chunks": chunks}, f, indent=2, ensure_ascii=False)

    print(f"  ✅ speakers.json — {len(chunks)} chunks")
    return len(chunks)

if __name__ == "__main__":
    print("🦋 Syncing conference data from Supabase...")
    print("=" * 50)
    s = sync_sessions()
    w = sync_workshops()
    p = sync_speakers()
    print("=" * 50)
    print(f"✅ Done! {s + w + p} total chunks generated.")
    print("Now run: python -m scripts.load_knowledge_base")
