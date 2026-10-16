import os
import subprocess
import imageio_ffmpeg
import re

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
audio_dir = r"c:\Users\Administrator\Documents\Codespace\Adaptive Learning\Adaptive English\video_assets\audio"

durations = []
for i in range(1, 19):
    fn = f"scene_{i:02d}.mp3"
    fp = os.path.join(audio_dir, fn)
    cmd = [FFMPEG, "-i", fp]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    m = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", res.stderr)
    if m:
        sec = int(m.group(1))*3600 + int(m.group(2))*60 + float(m.group(3))
        durations.append(sec)

cum = 0.0
for i, dur in enumerate(durations):
    start = cum
    end = cum + dur
    cum = end
    print(f"Scene {i+1:02d}: start={start:6.2f}s, end={end:6.2f}s, dur={dur:5.2f}s")
print(f"Total: {cum:.2f}s")
