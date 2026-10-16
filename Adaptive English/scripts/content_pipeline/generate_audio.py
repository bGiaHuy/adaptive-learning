#!/usr/bin/env python3
"""
generate_audio.py - Authentic Neural Audio Generator for Adaptive Study Platform

Generates pristine studio-quality audio dialogue files using Microsoft Edge Neural TTS voices:
- /audio/study-room-dialogue.mp3 (Listening workspace campus dialogue)
- /audio/library-appointment.mp3 (Academic Listening B1 Foundation)
- /audio/g6-u1-school-clubs.mp3 (Grade 6 Unit 1 Listening)
- /audio/g7-u1-unusual-hobbies.mp3 (Grade 7 Unit 1 Listening)
- /audio/g8-u1-leisure-habits.mp3 (Grade 8 Unit 1 Listening)
- /audio/g9-u1-craft-villages.mp3 (Grade 9 Unit 1 Listening)

Outputs to:
- data/media/audio/
- english-learning-platform/public/audio/
"""

import os
import sys
import asyncio
import edge_tts

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_AUDIO_DIR = os.path.join(ROOT_DIR, "data", "media", "audio")
PUBLIC_AUDIO_DIR = os.path.join(ROOT_DIR, "english-learning-platform", "public", "audio")

os.makedirs(DATA_AUDIO_DIR, exist_ok=True)
os.makedirs(PUBLIC_AUDIO_DIR, exist_ok=True)

# Dialogue Scripts with assigned neural voice talents
AUDIO_TRACKS = [
    {
        "filename": "study-room-dialogue.mp3",
        "title": "Student Support Dialogue: Reserving a Study Room",
        "dialogue": [
            ("en-US-JennyNeural", "Good afternoon, welcome to Student Academic Support. How can I help you today?"),
            ("en-US-GuyNeural", "Hi, I'm hoping to reserve a group study room for our economics project this Thursday."),
            ("en-US-JennyNeural", "Certainly. We have collaborative pods on the third floor equipped with whiteboards and digital screens. What time would suit your group best?"),
            ("en-US-GuyNeural", "Around 2:00 PM would be ideal, for about two hours."),
            ("en-US-JennyNeural", "Let me check... Room 304 is available from 2:00 to 4:00 PM. Just bring your student ID card to activate the electronic door lock."),
            ("en-US-GuyNeural", "That sounds great. Thank you so much for your help!"),
            ("en-US-JennyNeural", "You're very welcome. Have a productive study session!")
        ]
    },
    {
        "filename": "library-appointment.mp3",
        "title": "Campus Library Orientation Appointment",
        "dialogue": [
            ("en-GB-SoniaNeural", "Good morning! Welcome to the University Central Library. Are you here to schedule your library orientation session?"),
            ("en-US-ChristopherNeural", "Yes, I am. Are there any time slots available this coming week?"),
            ("en-GB-SoniaNeural", "Let's see. We have a slot open on Monday morning at 9:00 AM."),
            ("en-US-ChristopherNeural", "Unfortunately, I have an advanced chemistry laboratory on Monday mornings. Do you have anything later in the week?"),
            ("en-GB-SoniaNeural", "Yes, we do! We have Wednesday afternoon at 2:30 PM. That orientation session covers the ground floor circulation and book loans desk, second floor collaborative study pods, and the fourth floor quiet archive."),
            ("en-US-ChristopherNeural", "Wednesday at 2:30 PM is perfect for me. Please book that slot!"),
            ("en-GB-SoniaNeural", "Done! I've booked your appointment. Remember to bring a notebook, and we will see you on Wednesday at 2:30.")
        ]
    },
    {
        "filename": "g6-u1-school-clubs.mp3",
        "title": "Grade 6 Unit 1: School Clubs and Timetable",
        "dialogue": [
            ("en-US-GuyNeural", "Hi Vy, what are you doing?"),
            ("en-US-JennyNeural", "Hi An, I'm filling out the registration form for the art club. I love drawing pictures."),
            ("en-US-GuyNeural", "That sounds fun! I want to join the judo club with Duy on Tuesday afternoons."),
            ("en-US-JennyNeural", "Great! Do we have English lessons tomorrow morning?"),
            ("en-US-GuyNeural", "Yes, we have English, Maths, and Science.")
        ]
    },
    {
        "filename": "g7-u1-unusual-hobbies.mp3",
        "title": "Grade 7 Unit 1: Unusual Hobbies Discussion",
        "dialogue": [
            ("en-US-JennyNeural", "Hi Mark, do you play computer games in your free time?"),
            ("en-US-ChristopherNeural", "No, Lan. I think playing computer games is boring. My hobby is horse riding. My uncle has a horse farm in Da Lat."),
            ("en-US-JennyNeural", "Wow, that sounds unusual and exciting! Isn't it dangerous?"),
            ("en-US-ChristopherNeural", "It can be challenging, but an instructor teaches me carefully. It helps me stay healthy and love animals.")
        ]
    },
    {
        "filename": "g8-u1-leisure-habits.mp3",
        "title": "Grade 8 Unit 1: Healthy Leisure Habits",
        "dialogue": [
            ("en-GB-SoniaNeural", "Welcome back to Teen Life Forum. Today we are discussing leisure habits and lifestyle balance."),
            ("en-US-GuyNeural", "Today, teenagers spend their leisure time in various ways. While some teens enjoy surfing social media or playing online games, many others adore doing DIY projects. Making origami, knitting scarves, or building wooden bookshelves gives them a great sense of satisfaction. Psychologists emphasize that creating things by hand reduces study pressure and boosts essential practical life skills.")
        ]
    },
    {
        "filename": "g9-u1-craft-villages.mp3",
        "title": "Grade 9 Unit 1: Traditional Craft Villages & Young Artisans",
        "dialogue": [
            ("en-US-JennyNeural", "Today we are visiting Bat Trang pottery village on the bank of the Red River in Hanoi. We are joined by Minh, a young ceramic artisan."),
            ("en-US-ChristopherNeural", "Welcome to our village! For centuries, artisans have passed down their pottery-making secrets from generation to generation. Nowadays, young artisans not only keep the authentic craftsmanship but also combine modern artistic designs. We organise hands-on workshops for tourists and sell handcrafted ceramic products worldwide via e-commerce platforms, helping our local community thrive economically.")
        ]
    }
]

async def synthesize_track(track: dict):
    filename = track["filename"]
    print(f"[*] Generating: {filename} ({track['title']})...")
    combined_audio = b""

    for voice, text in track["dialogue"]:
        communicate = edge_tts.Communicate(text, voice)
        chunk_bytes = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                chunk_bytes += chunk["data"]
        combined_audio += chunk_bytes

    # Write to data/media/audio
    data_dest = os.path.join(DATA_AUDIO_DIR, filename)
    with open(data_dest, "wb") as f:
        f.write(combined_audio)

    # Write to public/audio
    public_dest = os.path.join(PUBLIC_AUDIO_DIR, filename)
    with open(public_dest, "wb") as f:
        f.write(combined_audio)

    print(f"  [OK] Saved {len(combined_audio):,} bytes -> {public_dest}")

async def main():
    print("=== Generating Neural Audio Files for Adaptive Study ===")
    for track in AUDIO_TRACKS:
        await synthesize_track(track)
    print("=== All Audio Files Generated Successfully ===")

if __name__ == "__main__":
    asyncio.run(main())
