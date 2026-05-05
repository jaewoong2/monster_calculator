#!/usr/bin/env python3
"""Fetch YouTube transcript and save a raw output file for the cron fallback path."""
from pathlib import Path
import sys
import datetime

sys.path.insert(0, '/Users/woongs/.local/share/fnm/node-versions/v24.14.0/installation/lib/node_modules/openclaw')

from youtube_transcript_api import YouTubeTranscriptApi

REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = REPO_ROOT / 'docs' / 'english-automation'
OUTPUT_DIR = DATA_DIR / 'output'
SCHEDULE_FILE = DATA_DIR / 'daily_schedule.csv'
PROGRESS_FILE = DATA_DIR / 'study_progress.csv'
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Get today's date
today = datetime.date.today().strftime('%Y-%m-%d')

# Read schedule to find today's row
found = False
video_id = None
start_sec = 0
end_sec = 0
day = None
episode = None
segment_label = None

with open(SCHEDULE_FILE) as f:
    for line in f:
        if today in line:
            parts = line.strip().split(',')
            if len(parts) >= 7:
                day = parts[0]
                episode = parts[2]
                video_id = parts[3]
                start_sec = int(parts[4])
                end_sec = int(parts[5])
                segment_label = parts[6]
                found = True
            break

if not found:
    print(f"No schedule for today ({today})")
    sys.exit(0)

# Check if already completed
already_done = False
with open(PROGRESS_FILE) as f:
    for line in f:
        if today in line and 'completed' in line:
            already_done = True
            break

if already_done:
    print(f"Already completed for {today}")
    sys.exit(0)

print(f"Fetching transcript for {video_id} ({start_sec}-{end_sec}s)...")

try:
    transcript = YouTubeTranscriptApi().fetch(video_id, languages=['en'])
    entries = [(e.start, e.text) for e in transcript if e.start >= start_sec and e.start < end_sec]

    if not entries:
        print("No transcript entries found in time range")
        sys.exit(1)

    print(f"Found {len(entries)} transcript entries")

    script_lines = []
    for start, text in entries:
        mins = int(start // 60)
        secs = int(start % 60)
        time_str = f"{mins:02d}:{secs:02d}"
        script_lines.append(f"[{time_str}] {text}")

    script_text = '\n'.join(script_lines)

    sentences = []
    seen = set()
    for _, text in entries:
        cleaned = text.strip()
        if len(cleaned) < 20:
            continue
        if cleaned in seen:
            continue
        seen.add(cleaned)
        sentences.append(cleaned)

    part_num = (start_sec // 600) + 1
    output_file = OUTPUT_DIR / f"day{day.zfill(2)}_ep{episode}_part{part_num}.md"

    with open(output_file, 'w') as f:
        f.write(f"# RAW Day {day} — Hey Tablo EP.{episode} {segment_label}\n\n")
        f.write(f"> date: {today}\n")
        f.write(f"> video: https://youtube.com/watch?v={video_id}\n")
        f.write(f"> range: {start_sec//60}:{start_sec%60:02d} ~ {end_sec//60}:{end_sec%60:02d}\n\n")
        f.write("---\n\n")
        f.write("## RAW ENGLISH TRANSCRIPT\n\n")
        f.write(script_text)
        f.write("\n\n---\n\n")
        f.write("## RAW KEY SENTENCES\n\n")
        for i, sent in enumerate(sentences[:20], 1):
            f.write(f"{i}. \"{sent}\"\n")
        f.write("\n\n---\n\n")
        f.write("## NOTE\n\n")
        f.write("This is a raw extraction file. The cron agent will rewrite this into the final bilingual study format.\n")

    print(f"Done! Saved raw output to {output_file}")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
