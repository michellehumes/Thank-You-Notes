#!/usr/bin/env python3
"""
Oura API sync for Fertility Agent.
Fetches today's readiness, sleep, and temperature data.
Saves to /data/fertility/ log files.
"""

import json
import os
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
import urllib.request
import urllib.error

# --- Config ---
BASE_DIR = Path(__file__).parent.parent.parent
DATA_DIR = BASE_DIR / "data" / "fertility"
CONFIG_PATH = Path(__file__).parent / "config.json"
OURA_BASE = "https://api.ouraring.com/v2"

def load_token():
    with open(CONFIG_PATH) as f:
        return json.load(f)["oura_api"]["token"]

def fetch(endpoint, params, token):
    query = "&".join(f"{k}={v}" for k, v in params.items())
    url = f"{OURA_BASE}{endpoint}?{query}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code} on {endpoint}: {e.reason}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Error fetching {endpoint}: {e}", file=sys.stderr)
        return None

def today_str():
    return date.today().isoformat()

def yesterday_str():
    return (date.today() - timedelta(days=1)).isoformat()

def load_json(path, default):
    try:
        with open(path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default

def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

def sync():
    token = load_token()
    today = today_str()
    yesterday = yesterday_str()

    # Oura data is typically available for the previous night
    # Use yesterday for sleep/temp (last night), today for readiness
    params_today = {"start_date": today, "end_date": today}
    params_yesterday = {"start_date": yesterday, "end_date": today}

    # --- Readiness ---
    readiness_raw = fetch("/usercollection/daily_readiness", params_today, token)
    readiness = None
    if readiness_raw and readiness_raw.get("data"):
        r = readiness_raw["data"][0]
        readiness = {
            "date": r.get("day"),
            "score": r.get("score"),
            "hrv_balance": r.get("contributors", {}).get("hrv_balance"),
            "body_temperature": r.get("contributors", {}).get("body_temperature"),
            "recovery_index": r.get("contributors", {}).get("recovery_index"),
            "resting_heart_rate": r.get("contributors", {}).get("resting_heart_rate"),
            "temperature_deviation": r.get("temperature_deviation"),
            "temperature_trend_deviation": r.get("temperature_trend_deviation"),
        }

    # --- Sleep (detailed, for HRV + skin temp) ---
    sleep_raw = fetch("/usercollection/sleep", params_yesterday, token)
    sleep = None
    avg_hrv = None
    skin_temp = None
    if sleep_raw and sleep_raw.get("data"):
        # Pick the longest session (main sleep)
        sessions = sleep_raw["data"]
        main = max(sessions, key=lambda s: s.get("total_sleep_duration", 0), default=None)
        if main:
            avg_hrv = main.get("average_hrv")
            skin_temp = main.get("average_skin_temperature")
            sleep = {
                "date": main.get("day"),
                "session_type": main.get("type"),
                "total_sleep_duration_min": round(main.get("total_sleep_duration", 0) / 60),
                "efficiency": main.get("efficiency"),
                "deep_sleep_min": round(main.get("deep_sleep_duration", 0) / 60),
                "rem_sleep_min": round(main.get("rem_sleep_duration", 0) / 60),
                "average_hrv": avg_hrv,
                "average_skin_temperature": skin_temp,
                "lowest_heart_rate": main.get("lowest_heart_rate"),
                "average_heart_rate": main.get("average_heart_rate"),
            }

    # --- Daily sleep score ---
    daily_sleep_raw = fetch("/usercollection/daily_sleep", params_today, token)
    sleep_score = None
    if daily_sleep_raw and daily_sleep_raw.get("data"):
        ds = daily_sleep_raw["data"][0]
        sleep_score = ds.get("score")

    # --- Build output record ---
    record = {
        "date": today,
        "fetched_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "readiness": readiness,
        "sleep": sleep,
        "sleep_score": sleep_score,
    }

    # --- Append to oura_log.json ---
    oura_log_path = DATA_DIR / "oura_log.json"
    oura_log = load_json(oura_log_path, {"entries": []})
    # Remove any existing entry for today
    oura_log["entries"] = [e for e in oura_log["entries"] if e.get("date") != today]
    oura_log["entries"].append(record)
    save_json(oura_log_path, oura_log)

    # --- Append to bbt_log.json (skin temperature as BBT proxy) ---
    if skin_temp is not None or (readiness and readiness.get("temperature_deviation") is not None):
        bbt_log_path = DATA_DIR / "bbt_log.json"
        bbt_log = load_json(bbt_log_path, {"readings": []})
        # Remove existing entry for today
        bbt_log["readings"] = [e for e in bbt_log["readings"] if e.get("date") != today]
        bbt_entry = {
            "date": today,
            "source": "oura_ring",
            "avg_skin_temp_c": skin_temp,
            "temp_deviation": readiness.get("temperature_deviation") if readiness else None,
            "temp_trend_deviation": readiness.get("temperature_trend_deviation") if readiness else None,
            "note": "Skin temp + deviation from Oura ring. Use deviation trend for ovulation detection (sustained rise = ovulation confirmed).",
        }
        bbt_log["readings"].append(bbt_entry)
        save_json(bbt_log_path, bbt_log)

    # --- Print summary for agent log ---
    print(f"[Oura Sync] {today}")
    if readiness:
        print(f"  Readiness: {readiness.get('score')} | Temp deviation: {readiness.get('temperature_deviation')} | Temp trend: {readiness.get('temperature_trend_deviation')}")
    if sleep:
        print(f"  Sleep: {sleep.get('total_sleep_duration_min')}min | HRV: {avg_hrv} | Skin temp: {skin_temp}°C")
    if sleep_score:
        print(f"  Sleep score: {sleep_score}")

    return record

if __name__ == "__main__":
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    result = sync()
    print(json.dumps(result, indent=2))
