import asyncio
import os
import edge_tts

# Audio Script for Placement Test Section 2 (Listening)
# Advisor: en-US-ChristopherNeural
# Woman (Student): en-GB-SoniaNeural

SCRIPT = [
    ("en-US-ChristopherNeural", "Good morning! Community College Arts Centre, how can I help you today?"),
    ("en-GB-SoniaNeural", "Hello! I'm interested in taking one of your creative courses this autumn. I was considering either the Saturday morning photography workshop or the digital graphic design class on Thursday afternoons."),
    ("en-US-ChristopherNeural", "Well, the photography workshop is currently fully booked, but we still have a few seats available for the digital graphic design class on Thursday afternoons from two to four PM."),
    ("en-GB-SoniaNeural", "That sounds ideal! I will definitely take the Thursday afternoon digital graphic design class then."),
    ("en-US-ChristopherNeural", "Excellent choice! And just so you know, our standard tuition fee is two hundred dollars, but if you complete your registration before the 15th of this month, you will receive an early bird discount of twenty percent."),
    ("en-GB-SoniaNeural", "Twenty percent off? That is fantastic value. I will sign up online right away. Thank you so much for your help!"),
    ("en-US-ChristopherNeural", "You are very welcome. Have a wonderful day!")
]

async def generate():
    temp_files = []
    for idx, (voice, text) in enumerate(SCRIPT):
        temp_file = f"temp_pt_{idx}.mp3"
        temp_files.append(temp_file)
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(temp_file)
        print(f"Generated line {idx+1}/{len(SCRIPT)}")

    # Combine mp3 segments
    out_paths = [
        os.path.abspath("english-learning-platform/public/audio/placement-test-dialogue.mp3"),
        os.path.abspath("data/media/audio/placement-test-dialogue.mp3")
    ]

    for p in out_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)

    with open(out_paths[0], "wb") as outfile:
        for tf in temp_files:
            with open(tf, "rb") as infile:
                outfile.write(infile.read())
            if os.path.exists(tf):
                os.remove(tf)

    # Copy to second path
    import shutil
    shutil.copyfile(out_paths[0], out_paths[1])

    print(f"SUCCESS: Generated placement test audio at:")
    print(f" - {out_paths[0]} ({os.path.getsize(out_paths[0])} bytes)")
    print(f" - {out_paths[1]} ({os.path.getsize(out_paths[1])} bytes)")

if __name__ == "__main__":
    asyncio.run(generate())
