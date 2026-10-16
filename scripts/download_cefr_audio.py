import urllib.request
import os

MEDIA_DIR = r"c:\Users\Administrator\Documents\Codespace\Adaptive Learning\Adaptive English\public\media\cefr"
os.makedirs(MEDIA_DIR, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

audio_downloads = [
    {
        'filename': 'cefr_a1_welcome.mp3',
        'url': 'https://voa-audio.voanews.eu/vle/2016/02/08/49485bf8-4277-47f6-9abe-617ee2473f8c.mp3'
    },
    {
        'filename': 'cefr_a2_budget_cuts.mp3',
        'url': 'https://voa-audio.voanews.eu/vle/2017/08/31/3bf697ff-3ef5-4d59-8dcd-52613e2e7e9d.mp3'
    },
    {
        'filename': 'cefr_b1_knitting_culture.mp3',
        'url': 'https://voa-audio.voanews.eu/vle/2025/03/04/ee1178e0-0fd3-4de4-a510-08dd5afe0892.mp3'
    },
    {
        'filename': 'cefr_b2_wright_brothers.mp3',
        'url': 'https://voa-audio.voanews.eu/vle/2025/03/05/e897fcf6-3ce1-4da9-a5cf-08dd5afe0892_hq.mp3'
    },
    {
        'filename': 'cefr_c1_asteroid_defense.mp3',
        'url': 'https://voa-audio.voanews.eu/vle/2025/02/26/f1280f11-54e8-4c21-eab3-08dd4a81f35f_hq.mp3'
    },
    {
        'filename': 'cefr_c2_etymology_linguistics.mp3',
        'url': 'https://voa-audio.voanews.eu/vle/2017/11/13/2076bbf6-5e0a-4cda-a674-f75c6ce8bfb9.mp3'
    }
]

for item in audio_downloads:
    dest_path = os.path.join(MEDIA_DIR, item['filename'])
    print(f"Downloading {item['filename']}...")
    req = urllib.request.Request(item['url'], headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp, open(dest_path, 'wb') as f:
        data = resp.read()
        f.write(data)
    print(f"  -> Saved {item['filename']} ({len(data)} bytes)")

print("\nAll 6 CEFR audio files successfully downloaded!")
