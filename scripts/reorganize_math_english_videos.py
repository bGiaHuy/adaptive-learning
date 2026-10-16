import os
import sys
import shutil
import subprocess
import json
import imageio_ffmpeg
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

ROOT_DIR = r"c:\Users\Administrator\Documents\Codespace\Adaptive Learning"
SOURCE_MASTER_VOICE = os.path.join(ROOT_DIR, "Adaptive English", "AdaptiveMath_Huong_Dan_Su_Dung_Toan_Dien.mp4")
VIDEO_BASE = os.path.join(ROOT_DIR, "video hướng dẫn")
MANIFEST_PATH = os.path.join(ROOT_DIR, "Adaptive English", "video_assets", "audio", "scenes_manifest.json")
ASSETS_BASE = os.path.join(ROOT_DIR, "Adaptive English")

WIDTH = 1920
HEIGHT = 1080
FPS = 30
BG_PAPER = (244, 240, 231)

def create_clean_base_slide(image_path):
    full_path = os.path.join(ASSETS_BASE, image_path) if not os.path.isabs(image_path) else image_path
    if not os.path.exists(full_path):
        return Image.new("RGB", (WIDTH, HEIGHT), BG_PAPER)

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

def generate_silent_walkthrough(scenes_subset, out_path):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    cmd = [
        FFMPEG, "-y",
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
        "-an",
        out_path
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for s in scenes_subset:
        duration = s["duration"]
        num_frames = int(duration * FPS)
        clean_img = create_clean_base_slide(s["image"])
        raw_bytes = clean_img.tobytes()
        for _ in range(num_frames):
            proc.stdin.write(raw_bytes)
    proc.stdin.close()
    proc.wait()

def slice_voice_video(start_sec, duration_sec, out_path):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    cmd = [
        FFMPEG, "-y",
        "-ss", str(start_sec),
        "-i", SOURCE_MASTER_VOICE,
        "-t", str(duration_sec),
        "-c:v", "libx264",
        "-preset", "faster",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        out_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def concat_voice_segments(seg_list, out_path):
    """Slice multiple segments from master voice video and concatenate them"""
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    temp_dir = os.path.join(ROOT_DIR, "video_temp_parts")
    os.makedirs(temp_dir, exist_ok=True)

    part_files = []
    for idx, (ss, dur) in enumerate(seg_list):
        part_path = os.path.join(temp_dir, f"part_{idx}.mp4")
        slice_voice_video(ss, dur, part_path)
        part_files.append(part_path)

    # Concat demuxer
    concat_txt = os.path.join(temp_dir, "concat.txt")
    with open(concat_txt, "w", encoding="utf-8") as f:
        for p in part_files:
            f.write(f"file '{p.replace('\\', '/')}'\n")

    cmd = [
        FFMPEG, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_txt,
        "-c", "copy",
        out_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    shutil.rmtree(temp_dir, ignore_errors=True)

def main():
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        all_scenes = json.load(f)

    # Clean existing role folders in VIDEO_BASE
    for old in ["student", "teacher", "admin"]:
        old_path = os.path.join(VIDEO_BASE, old)
        if os.path.exists(old_path):
            shutil.rmtree(old_path, ignore_errors=True)

    # Define Scenes for English and Math
    # Scenes in manifest:
    # 0: scene_01 (Intro)
    # 1: scene_02 (Register)
    # 2: scene_03 (Login)
    # 3: scene_04 (English Hub)
    # 4: scene_05 (English Listening)
    # 5: scene_06 (English Placement)
    # 6: scene_07 (English Progress)
    # 7: scene_08 (English/Classroom)
    # 8: scene_09 (Math CAT)
    # 9: scene_10 (Math Radar)
    # 10: scene_11 (Math Mistakes)
    # 11: scene_12 (Session)
    # 12: scene_13 (Teacher Pending)
    # 13: scene_14 (Teacher Classes)
    # 14: scene_15 (Admin Overview)
    # 15: scene_16 (Admin Teacher Review)
    # 16: scene_17 (Admin Questions)
    # 17: scene_18 (Admin Audit)

    targets = [
        # ENGLISH
        {
            "subject": "english",
            "role": "student",
            "scenes": all_scenes[0:8] + [all_scenes[11]], # Scenes 1-8 + 12 (Intro, Reg, Login, Hub, Listening, Placement, Progress, Classroom, Session)
            "voice_segs": [(0.00, 60.69), (83.86, 7.70)],
            "voice_name": "English_Student_Workflow_Voice_Animation.mp4",
            "silent_name": "English_Student_Workflow_Walkthrough_Silent.mp4"
        },
        {
            "subject": "english",
            "role": "teacher",
            "scenes": all_scenes[12:14], # Scenes 13-14 (Teacher Pending, Classes & Invites)
            "voice_segs": [(91.56, 15.20)],
            "voice_name": "English_Teacher_Workflow_Voice_Animation.mp4",
            "silent_name": "English_Teacher_Workflow_Walkthrough_Silent.mp4"
        },
        {
            "subject": "english",
            "role": "admin",
            "scenes": all_scenes[14:18], # Scenes 15-18 (Overview, Review Teacher, Questions, Audit)
            "voice_segs": [(106.76, 31.49)],
            "voice_name": "English_Admin_Workflow_Voice_Animation.mp4",
            "silent_name": "English_Admin_Workflow_Walkthrough_Silent.mp4"
        },

        # MATH
        {
            "subject": "math",
            "role": "student",
            "scenes": all_scenes[0:3] + all_scenes[8:12], # Scenes 1-3 (Intro, Reg, Login) + Scenes 9-12 (Math CAT, Radar, Mistakes, Session)
            "voice_segs": [(0.00, 24.05), (60.69, 30.87)],
            "voice_name": "Math_Student_Workflow_Voice_Animation.mp4",
            "silent_name": "Math_Student_Workflow_Walkthrough_Silent.mp4"
        },
        {
            "subject": "math",
            "role": "teacher",
            "scenes": all_scenes[12:14], # Scenes 13-14 (Teacher Pending, Classes & Invites)
            "voice_segs": [(91.56, 15.20)],
            "voice_name": "Math_Teacher_Workflow_Voice_Animation.mp4",
            "silent_name": "Math_Teacher_Workflow_Walkthrough_Silent.mp4"
        },
        {
            "subject": "math",
            "role": "admin",
            "scenes": all_scenes[14:18], # Scenes 15-18 (Overview, Review Teacher, Questions Maker-Checker, Audit)
            "voice_segs": [(106.76, 31.49)],
            "voice_name": "Math_Admin_Workflow_Voice_Animation.mp4",
            "silent_name": "Math_Admin_Workflow_Walkthrough_Silent.mp4"
        }
    ]

    for item in targets:
        subj = item["subject"]
        role = item["role"]
        
        # Folder: video hướng dẫn/<subject>/<role>/voice animation/ and ko voice/
        role_base = os.path.join(VIDEO_BASE, subj, role)
        voice_dir = os.path.join(role_base, "voice animation")
        silent_dir = os.path.join(role_base, "ko voice")
        os.makedirs(voice_dir, exist_ok=True)
        os.makedirs(silent_dir, exist_ok=True)

        voice_file = os.path.join(voice_dir, item["voice_name"])
        silent_file = os.path.join(silent_dir, item["silent_name"])

        print(f"\nProcessing [{subj.upper()} / {role.upper()}]:")
        
        # 1. Voice & Animation
        if len(item["voice_segs"]) == 1:
            slice_voice_video(item["voice_segs"][0][0], item["voice_segs"][0][1], voice_file)
        else:
            concat_voice_segments(item["voice_segs"], voice_file)
        print(f"  ✓ Voice & Animation: {voice_file} ({os.path.getsize(voice_file):,} bytes)")

        # 2. Silent Walkthrough
        generate_silent_walkthrough(item["scenes"], silent_file)
        print(f"  ✓ Silent Walkthrough: {silent_file} ({os.path.getsize(silent_file):,} bytes)")

    print("\n✓ ALL REORGANIZATION COMPLETED CLEANLY!")

if __name__ == '__main__':
    main()
