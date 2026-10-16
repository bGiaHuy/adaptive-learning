import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

manifest = r"c:\Users\Administrator\Documents\Codespace\Adaptive Learning\Adaptive English\video_assets\audio\scenes_manifest.json"
with open(manifest, "r", encoding="utf-8") as f:
    scenes = json.load(f)

cum = 0.0
for idx, s in enumerate(scenes):
    sid = s["id"]
    dur = s["duration"]
    start = cum
    end = cum + dur
    cum = end
    print(f"{idx+1:02d} | {sid:8} | {start:6.2f}s -> {end:6.2f}s | dur={dur:5.2f}s | {s['image']}")
print(f"Total: {cum:.2f}s")
