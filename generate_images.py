#!/usr/bin/env python3
"""
Etsy Digital Product Production Engine — generate_images.py
Reads image_queue.json and batch-renders all images via OpenAI gpt-image-1.
"""

import os
import json
import time
import base64
import sys
from dotenv import load_dotenv
from tqdm import tqdm
from openai import OpenAI

load_dotenv()

BASE_DIR = "images"
MODEL = "gpt-image-1"
RETRY_LIMIT = 3
QUEUE_PATH = "image_queue.json"


def ensure_folder(path):
    if not os.path.exists(path):
        os.makedirs(path)


def main():
    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY not found.")
        print("Create a .env file with: OPENAI_API_KEY=sk-...")
        sys.exit(1)

    # Check for queue file
    if not os.path.exists(QUEUE_PATH):
        print(f"ERROR: {QUEUE_PATH} not found.")
        print("Run process_listings.py first to generate the image queue.")
        sys.exit(1)

    client = OpenAI()

    with open(QUEUE_PATH, "r", encoding="utf-8") as f:
        image_queue = json.load(f)

    # Handle --dry-run flag
    if "--dry-run" in sys.argv:
        print(f"DRY RUN: {len(image_queue)} images would be generated.")
        for item in image_queue:
            listing = item["listing"]
            num = item["image_number"]
            output_path = os.path.join(BASE_DIR, listing, f"image_{num}.png")
            exists = "SKIP (exists)" if os.path.exists(output_path) else "GENERATE"
            print(f"  [{exists}] {output_path}")
        return

    print(f"Generating {len(image_queue)} images...")
    print(f"Model: {MODEL}")
    print(f"Size: 2048x1536 (4:3)")
    print()

    generated = 0
    skipped = 0
    failed = 0

    for item in tqdm(image_queue, desc="Rendering"):
        listing = item["listing"]
        image_number = item["image_number"]
        prompt = item["prompt"]

        folder_path = os.path.join(BASE_DIR, listing)
        ensure_folder(folder_path)

        output_path = os.path.join(folder_path, f"image_{image_number}.png")

        if os.path.exists(output_path):
            skipped += 1
            continue

        attempt = 0
        success = False
        while attempt < RETRY_LIMIT:
            try:
                result = client.images.generate(
                    model=MODEL,
                    prompt=prompt,
                    size="2048x1536",
                )

                image_base64 = result.data[0].b64_json

                with open(output_path, "wb") as img_file:
                    img_file.write(base64.b64decode(image_base64))

                generated += 1
                success = True
                break

            except Exception as e:
                attempt += 1
                wait_time = 3 * attempt
                tqdm.write(f"  Retry {attempt}/{RETRY_LIMIT} for {output_path}: {e}")
                time.sleep(wait_time)

        if not success:
            failed += 1
            tqdm.write(f"  FAILED: {output_path}")

        time.sleep(1)

    print()
    print("=" * 40)
    print(f"Generated: {generated}")
    print(f"Skipped (existing): {skipped}")
    print(f"Failed: {failed}")
    print(f"Total: {len(image_queue)}")
    print("=" * 40)


if __name__ == "__main__":
    main()
