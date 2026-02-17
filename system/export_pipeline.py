#!/usr/bin/env python3
"""
Job Pipeline CSV Exporter
Reads job_pipeline.json and exports roles to CSV for tracking and analysis.
"""

import json
import csv
import os
from datetime import datetime

PIPELINE_PATH = os.path.join(os.path.dirname(__file__), "job_pipeline.json")
EXPORT_DIR = os.path.join(os.path.dirname(__file__), "..", "exports")

CSV_COLUMNS = [
    "id", "company", "title", "compensation_range", "location", "industry",
    "seniority", "priority_score", "interview_probability", "composite_score",
    "tier", "resume_version", "status", "stage", "date_identified",
    "posting_url", "notes"
]


def load_pipeline():
    with open(PIPELINE_PATH, "r") as f:
        return json.load(f)


def export_to_csv(pipeline_data, output_path=None):
    if output_path is None:
        os.makedirs(EXPORT_DIR, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(EXPORT_DIR, f"pipeline_export_{timestamp}.csv")

    roles = pipeline_data.get("roles", [])

    with open(output_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS, extrasaction="ignore")
        writer.writeheader()
        for role in roles:
            writer.writerow(role)

    print(f"Exported {len(roles)} roles to {output_path}")
    return output_path


def print_summary(pipeline_data):
    analytics = pipeline_data.get("analytics", {})
    roles = pipeline_data.get("roles", [])

    print("\n=== PIPELINE SUMMARY ===")
    print(f"Total roles tracked: {len(roles)}")

    if roles:
        tier_counts = {}
        for role in roles:
            tier = role.get("tier", "unknown")
            tier_counts[tier] = tier_counts.get(tier, 0) + 1

        print("\nBy Tier:")
        for tier in sorted(tier_counts.keys()):
            print(f"  Tier {tier}: {tier_counts[tier]} roles")

        scores = [r.get("composite_score", 0) for r in roles]
        print(f"\nComposite Score Range: {min(scores):.1f} – {max(scores):.1f}")
        print(f"Average Composite: {sum(scores)/len(scores):.1f}")

        probs = [r.get("interview_probability", 0) for r in roles]
        print(f"Average Interview Probability: {sum(probs)/len(probs):.1f}%")

        status_counts = {}
        for role in roles:
            status = role.get("status", "unknown")
            status_counts[status] = status_counts.get(status, 0) + 1

        print("\nBy Status:")
        for status, count in sorted(status_counts.items()):
            print(f"  {status}: {count}")


if __name__ == "__main__":
    pipeline = load_pipeline()
    print_summary(pipeline)
    if pipeline.get("roles"):
        export_to_csv(pipeline)
    else:
        print("\nNo roles in pipeline yet. Add roles to export.")
