import hashlib
import json
import re
import subprocess
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
APP = ROOT / 'english-learning-platform'
VIDEO = APP / 'artifacts/tutorials'
FFBIN = Path('C:/Users/Administrator/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin')
results = {'videos': [], 'archive': {}}
for name in ['student-guide', 'teacher-guide']:
    movie = VIDEO / (name + '.mp4')
    probe = subprocess.run([str(FFBIN/'ffprobe.exe'), '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(movie)], capture_output=True, text=True)
    meta = json.loads(probe.stdout)
    decode = subprocess.run([str(FFBIN/'ffmpeg.exe'), '-v', 'error', '-i', str(movie), '-f', 'null', '-'], capture_output=True, text=True)
    (OUT/(name+'-decode.log')).write_text(decode.stderr, encoding='utf-8')
    diagnostic = subprocess.run([str(FFBIN/'ffmpeg.exe'), '-hide_banner', '-i', str(movie), '-vf', 'blackdetect=d=0.15:pix_th=0.10,freezedetect=n=-50dB:d=3', '-an', '-f', 'null', '-'], capture_output=True, text=True)
    (OUT/(name+'-scan.log')).write_text(diagnostic.stderr, encoding='utf-8')
    subs = (VIDEO/(name+'.srt')).read_text(encoding='utf-8-sig')
    times = re.findall(r'(\d\d):(\d\d):(\d\d),(\d\d\d) --> (\d\d):(\d\d):(\d\d),(\d\d\d)', subs)
    end = times[-1][4:]
    sub_end = int(end[0])*3600 + int(end[1])*60 + int(end[2]) + int(end[3])/1000
    streams = [{k: s.get(k) for k in ['codec_type','codec_name','width','height','r_frame_rate','nb_frames']} for s in meta['streams']]
    results['videos'].append(dict(name=name, duration=float(meta['format']['duration']), streams=streams,
        decode_exit=decode.returncode, sha256=hashlib.sha256(movie.read_bytes()).hexdigest(),
        subtitle_entries=len(times), subtitles_end_at=sub_end,
        black_events=re.findall(r'black_start:[^\r\n]+',diagnostic.stderr),
        freeze_events=re.findall(r'lavfi.freezedetect[^\r\n]+',diagnostic.stderr)))
    for sec in ([20,60,100,140] if name == 'student-guide' else [20,60,120,160]):
        subprocess.run([str(FFBIN/'ffmpeg.exe'), '-v', 'error', '-ss', str(sec), '-i', str(movie), '-frames:v', '1', '-y', str(OUT/f'{name}-{sec}s.png')], check=True, capture_output=True)
with ZipFile(APP/'adaptive-english-clean-delivery.zip') as z:
    names = z.namelist()
    (OUT/'archive-inventory.txt').write_text('\n'.join(names), encoding='utf-8')
    results['archive'] = dict(files=len([n for n in names if not n.endswith('/')]),
        root_names=sorted(set(n.split('/')[0] for n in names)),
        environment_files=[n for n in names if Path(n).name.startswith('.env')],
        databases=[n for n in names if n.endswith(('.db','.sqlite','.sqlite3'))],
        migrations=[n for n in names if 'migration' in n],
        doc_files=[n for n in names if '/docs/release/' in n or n.startswith('docs/release/')],
        dictionary_files=[n for n in names if 'dictionary.db' in n],
        catalogs=[n for n in names if '/data/catalog/' in n or n.startswith('data/catalog/')],
        damaged_member=z.testzip())
(OUT/'artifact-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(results, ensure_ascii=True, indent=2))
