import os
import sys
import shutil
import subprocess
import imageio_ffmpeg

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

ROOT_DIR = r"c:\Users\Administrator\Documents\Codespace\Adaptive Learning"
SOURCE_MASTER = os.path.join(ROOT_DIR, "Adaptive English", "AdaptiveMath_Huong_Dan_Su_Dung_Toan_Dien.mp4")
VIDEO_DIR = os.path.join(ROOT_DIR, "video hướng dẫn")
ARTIFACT_DIR = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\877af67c-b472-4fca-b64b-e74ef98e3009"

FULL_VOICE_MP4 = os.path.join(VIDEO_DIR, "AdaptiveLearning_Workflow_Full_Voice_Animation.mp4")
SILENT_MP4 = os.path.join(VIDEO_DIR, "AdaptiveLearning_Workflow_Walkthrough_Silent.mp4")

# Role time ranges
SEGMENTS = {
    "student": {"ss": "00:00:00.00", "to": "00:01:38.76"},
    "teacher": {"ss": "00:01:38.76", "to": "00:01:55.16"},
    "admin":   {"ss": "00:01:55.16", "to": "00:02:29.00"}
}

def slice_video(src, dst, ss, to):
    cmd = [
        FFMPEG, "-y",
        "-ss", ss,
        "-to", to,
        "-i", src,
        "-c:v", "libx264",
        "-preset", "faster",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        dst
    ] if "-an" not in src else [
        FFMPEG, "-y",
        "-ss", ss,
        "-to", to,
        "-i", src,
        "-c:v", "libx264",
        "-preset", "faster",
        "-crf", "18",
        "-an",
        dst
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def slice_silent(src, dst, ss, to):
    cmd = [
        FFMPEG, "-y",
        "-ss", ss,
        "-to", to,
        "-i", src,
        "-c:v", "libx264",
        "-preset", "faster",
        "-crf", "18",
        "-an",
        dst
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def main():
    print("1. Preparing Bản 1: Full Voice & Animation...")
    shutil.copy2(SOURCE_MASTER, FULL_VOICE_MP4)
    print(f"  Saved to: {FULL_VOICE_MP4}")

    print("\n2. Slicing role videos for student, teacher, admin...")
    for role, timing in SEGMENTS.items():
        role_dir = os.path.join(VIDEO_DIR, role)
        os.makedirs(role_dir, exist_ok=True)

        voice_out = os.path.join(role_dir, f"{role.capitalize()}_Workflow_Voice_Animation.mp4")
        silent_out = os.path.join(role_dir, f"{role.capitalize()}_Workflow_Walkthrough_Silent.mp4")

        print(f"  [{role.upper()}] Slicing {timing['ss']} -> {timing['to']}...")
        slice_video(FULL_VOICE_MP4, voice_out, timing['ss'], timing['to'])
        print(f"    -> Voice & Animation: {voice_out} ({os.path.getsize(voice_out):,} bytes)")

        slice_silent(SILENT_MP4, silent_out, timing['ss'], timing['to'])
        print(f"    -> Silent Walkthrough: {silent_out} ({os.path.getsize(silent_out):,} bytes)")

    print("\n3. Copying master videos to Workspace Root...")
    shutil.copy2(FULL_VOICE_MP4, os.path.join(ROOT_DIR, "AdaptiveLearning_Workflow_Full_Voice_Animation.mp4"))
    shutil.copy2(SILENT_MP4, os.path.join(ROOT_DIR, "AdaptiveLearning_Workflow_Walkthrough_Silent.mp4"))

    print("\n4. Copying master videos to Brain Artifacts directory for UI preview...")
    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    shutil.copy2(FULL_VOICE_MP4, os.path.join(ARTIFACT_DIR, "AdaptiveLearning_Workflow_Full_Voice_Animation.mp4"))
    shutil.copy2(SILENT_MP4, os.path.join(ARTIFACT_DIR, "AdaptiveLearning_Workflow_Walkthrough_Silent.mp4"))
    print("  Copied to artifacts successfully.")

    print("\n✓ ALL VIDEO DISTRIBUTIONS SUCCESSFULLY COMPLETED!")

if __name__ == '__main__':
    main()
