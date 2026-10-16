import os
import sys
import json
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

ROOT_DIR = r"c:\Users\Administrator\Documents\Codespace\Adaptive Learning"
MANIFEST_PATH = os.path.join(ROOT_DIR, "Adaptive English", "video_assets", "audio", "scenes_manifest.json")
BASE_DIR = os.path.join(ROOT_DIR, "Adaptive English")

with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
    scenes = json.load(f)

print(f"Total scenes to inspect: {len(scenes)}")
for idx, s in enumerate(scenes):
    img_path = os.path.join(BASE_DIR, s["image"])
    exists = os.path.exists(img_path)
    size = os.path.getsize(img_path) if exists else 0
    w, h = 0, 0
    if exists:
        im = Image.open(img_path)
        w, h = im.size
    print(f"Scene {idx+1:02d} [{s['id']}]: {s['image']} ({w}x{h}, {size:,} bytes) - {s['title']}")
