import asyncio
import os
import edge_tts

async def generate_audio():
    out_dir = r"c:\Users\Administrator\Documents\Codespace\Adaptive Learning\adaptiveenglish\english-learning-platform\public\audio"
    os.makedirs(out_dir, exist_ok=True)
    
    # 1. Track 1: Grade 7 Unit 2 - Healthy Living Habits (Dialogue between Doctor Jones and Minh)
    text1 = """
    Doctor Jones: Good morning, Minh. How are you feeling today?
    Minh: Good morning, Doctor. I feel a bit tired, and I often have a headache in the afternoons.
    Doctor Jones: I see. Tell me about your daily routine. What do you eat for breakfast?
    Minh: Well, I usually skip breakfast because I wake up late. I just grab a sugary soft drink on the way to school.
    Doctor Jones: Skipping breakfast is very bad for your health. Your body needs energy in the morning. And soft drinks contain too much sugar, which makes you feel tired later. You should eat nutritious food like eggs, bread, and fresh fruit.
    Minh: I understand. What about physical exercise? I spend about four hours every evening playing computer games.
    Doctor Jones: You must reduce your screen time! Staring at screens causes eye strain and headaches. Instead of sitting inside, you should cycle, jog, or play badminton for at least thirty minutes each day. Regular exercise strengthens your heart and muscles.
    Minh: Thank you very much, Doctor Jones. I will start eating breakfast and exercising tomorrow!
    Doctor Jones: Good boy! Remember: a healthy lifestyle is the best medicine.
    """
    
    file1 = os.path.join(out_dir, "g7-u2-healthy-habits.mp3")
    comm1 = edge_tts.Communicate(text1.strip(), "en-US-JennyNeural")
    await comm1.save(file1)
    print(f"Generated: {file1} (size: {os.path.getsize(file1)} bytes)")
    
    # 2. Track 2: Grade 7 Unit 2 - Skin Care & Sunburn Prevention (Presentation by Nurse Linda)
    text2 = """
    Nurse Linda: Hello everyone. Welcome to our school health talk about skin care and outdoor wellness. 
    During the summer, many teenagers suffer from sunburn and acne. Today, I will share three essential tips to protect your skin.
    First, always protect yourself from the sun. The sun is strongest between 10 a.m. and 4 p.m. If you go outside or go boating, wear a wide-brimmed hat, sunglasses, and apply suncream with SPF 30 or higher. Suncream prevents painful sunburn and skin damage.
    Second, drink plenty of fresh water every day. Water keeps your skin hydrated and flushes out harmful toxins. When weather gets dry or windy, use lip balm to prevent chapped lips.
    Third, keep your face clean to prevent acne. Wash your face twice a day with warm water and mild soap. Avoid touching your face with dirty hands, and never squeeze red spots or pimples.
    Finally, remember to eat plenty of green vegetables, tofu, and fruits like oranges and tomatoes. Nutritious food gives your skin a healthy glow!
    Thank you for listening. Stay healthy and enjoy your summer!
    """
    
    file2 = os.path.join(out_dir, "g7-u2-skin-care-tips.mp3")
    comm2 = edge_tts.Communicate(text2.strip(), "en-GB-SoniaNeural")
    await comm2.save(file2)
    print(f"Generated: {file2} (size: {os.path.getsize(file2)} bytes)")

if __name__ == "__main__":
    asyncio.run(generate_audio())
