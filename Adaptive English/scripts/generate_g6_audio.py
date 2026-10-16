import asyncio
import os
import edge_tts

async def generate_g6_audio():
    out_dir = r"c:\Users\Administrator\Documents\Codespace\Adaptive Learning\adaptiveenglish\english-learning-platform\public\audio"
    os.makedirs(out_dir, exist_ok=True)

    # 1. Grade 6 Unit 2 - Skills 2: Mai talking about her house
    # From SGK Tiếng Anh 6 Tập 1, p. 23
    text_u2 = """
    Hello, I'm Mai. I live in a town house in Da Nang with my family.
    There are four people in my family: my parents, my younger brother, and me.
    Our house has six rooms: a living room, a kitchen, three bedrooms, and two bathrooms.
    The living room is on the first floor, next to the kitchen.
    My bedroom is on the second floor. It is small but very cosy.
    There is a bed, a study desk, a chair, and a wardrobe in my bedroom.
    On the wall, there is a big picture of my family, but there is no clock.
    I love my bedroom the most because I can do my homework and listen to music there after school.
    """
    file_u2 = os.path.join(out_dir, "g6-u2-mai-house.mp3")
    comm_u2 = edge_tts.Communicate(text_u2.strip(), "en-US-JennyNeural")
    await comm_u2.save(file_u2)
    print(f"Generated: {file_u2} ({os.path.getsize(file_u2)} bytes)")

    # 2. Grade 6 Unit 7 - Skills 2: TV Programmes
    # From SGK Tiếng Anh 6 Tập 2, p. 13
    text_u7 = """
    Welcome to What's On Today! Here are some great TV programmes for you this evening.
    First, on Channel 1 at seven o'clock, we have Green Summer. It is a fantastic music programme with songs performed by famous young singers.
    Next, on Channel 2 at eight o'clock, don't miss the movie My Childhood. It is a touching story about a lovely girl and her faithful dog in a peaceful village.
    If you love magic and adventure, tune in to Channel 3 at eight thirty for Harry Potter. Children and teenagers all over the world love this magical movie series.
    Finally, on Channel 1 at five o'clock tomorrow afternoon, watch English and Fun. This educational programme helps you learn English vocabulary and songs. Enjoy your viewing!
    """
    file_u7 = os.path.join(out_dir, "g6-u7-tv-programmes.mp3")
    comm_u7 = edge_tts.Communicate(text_u7.strip(), "en-GB-SoniaNeural")
    await comm_u7.save(file_u7)
    print(f"Generated: {file_u7} ({os.path.getsize(file_u7)} bytes)")

if __name__ == "__main__":
    asyncio.run(generate_g6_audio())
