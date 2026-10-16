import re

with open("english-learning-platform/src/lib/mockData.ts", "r", encoding="utf-8") as f:
    text = f.read()

lessons_match = re.search(r'export const initialLessons: Lesson\[\] = \[(.*?)\];\s*export const initialClassrooms', text, re.DOTALL)
if lessons_match:
    block = lessons_match.group(1)
    # Find all top-level lesson objects in the array
    # A top-level object starts with { and has an id like g6-, g7-, g8-, g9-, lesson-
    les_ids = re.findall(r'\{\s*["\']id["\']:\s*["\']([a-zA-Z0-9_\-]+)["\']', block)
    print(f"Total top-level lesson objects: {len(les_ids)}")
    for lid in les_ids:
        print(" -", lid)
