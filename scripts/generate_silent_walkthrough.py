import os
import sys
import json
import subprocess
import imageio_ffmpeg
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

ROOT_DIR = r"c:\Users\Administrator\Documents\Codespace\Adaptive Learning\Adaptive English"
OUTPUT_DIR = r"c:\Users\Administrator\Documents\Codespace\Adaptive Learning\video hướng dẫn"
MANIFEST_PATH = os.path.join(ROOT_DIR, "video_assets", "audio", "scenes_manifest.json")

WIDTH = 1920
HEIGHT = 1080
FPS = 30
BG_PAPER = (244, 240, 231)

def create_clean_base_slide(image_path):
    full_path = os.path.join(ROOT_DIR, image_path) if not os.path.isabs(image_path) else image_path
    if not os.path.exists(full_path):
        canvas = Image.new("RGB", (WIDTH, HEIGHT), BG_PAPER)
        return canvas

    img = Image.open(full_path).convert("RGB")
    if img.size == (WIDTH, HEIGHT):
        return img

    img_w, img_h = img.size
    ratio = min(WIDTH / img_w, HEIGHT / img_h)
    new_w = int(img_w * ratio)
    new_h = int(img_h * ratio)
    img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGB", (WIDTH, HEIGHT), BG_PAPER)
    offset_x = (WIDTH - new_w) // 2
    offset_y = (HEIGHT - new_h) // 2
    canvas.paste(img_resized, (offset_x, offset_y))
    return canvas

def main():
    with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
        scenes = json.load(f)

    ffmpeg_bin = imageio_ffmpeg.get_ffmpeg_exe()
    out_mp4 = os.path.join(OUTPUT_DIR, "AdaptiveLearning_Workflow_Walkthrough_Silent.mp4")

    print(f"Generating Silent Walkthrough (No voice, No animation) to:\n  {out_mp4}")
    
    # We pipe rawvideo RGB frames to ffmpeg without audio
    cmd = [
        ffmpeg_bin, "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "faster",
        "-crf", "18",
        "-an", # No audio
        out_mp4
    ]

    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)

    total_frames = sum(int(s["duration"] * FPS) for s in scenes)
    print(f"Total frames: {total_frames}")

    frame_counter = 0
    for idx, s in enumerate(scenes):
        duration = s["duration"]
        num_frames = int(duration * FPS)
        clean_img = create_clean_base_slide(s["image"])
        raw_bytes = clean_img.tobytes()

        print(f"Rendering scene [{idx+1}/{len(scenes)}]: {s['title']} ({num_frames} frames)...")
        for _ in range(num_frames):
            proc.stdin.write(raw_bytes)
            frame_counter += 1

    proc.stdin.close()
    proc.wait()
    print(f"✓ Bản 2 Walkthrough Silent MP4 created: {out_mp4} ({os.path.getsize(out_mp4):,} bytes)")

if __name__ == '__main__':
    main()
