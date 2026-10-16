import os
import sys
import json
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

manifest_path = r"c:\Users\Administrator\Documents\Codespace\Adaptive Learning\Adaptive English\video_assets\audio\scenes_manifest.json"
base_dir = r"c:\Users\Administrator\Documents\Codespace\Adaptive Learning\Adaptive English"

with open(manifest_path, "r", encoding="utf-8") as f:
    scenes = json.load(f)

print("=== MANIFEST SCENES ===")
for s in scenes:
    img_rel = s['image']
    full_path = os.path.join(base_dir, img_rel)
    exists = os.path.exists(full_path)
    size = os.path.getsize(full_path) if exists else 0
    img = Image.open(full_path) if exists else None
    dims = img.size if img else "N/A"
    print(f"{s['id']:8} | {s['role']:10} | {s['title'][:32]:32} | {os.path.basename(img_rel):30} | {dims} | {size:,} bytes")
