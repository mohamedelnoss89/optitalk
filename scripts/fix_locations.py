#!/usr/bin/env python3
"""يحدّث كل اللوكيشنز في data.ts من ملفات الـ txt الأصلية"""
import os
import re
import json

BASE = "/home/z/my-project/upload/سكشانات"
DATA_FILE = "/home/z/my-project/src/lib/data.ts"

# قراءة كل اللوكيشنز من الـ txt
locations = {}

for section_name in os.listdir(BASE):
    section_path = os.path.join(BASE, section_name)
    if not os.path.isdir(section_path):
        continue
    
    for place_name in os.listdir(section_path):
        place_path = os.path.join(section_path, place_name)
        if not os.path.isdir(place_path) or place_name.startswith("New folder"):
            continue
        
        # نقرا الـ txt
        txt_files = [f for f in os.listdir(place_path) if f.endswith('.txt')]
        if not txt_files:
            continue
        
        txt_path = os.path.join(place_path, txt_files[0])
        with open(txt_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        # نستخرج اللوكيشن
        loc_match = re.search(r'اللوكيشن\s*\n(.+?)(?=\nالعنوان|\nالمقدم|\Z)', content, re.DOTALL)
        if loc_match:
            loc = loc_match.group(1).strip()
            if loc:
                locations[place_name.strip()] = loc

# قراءة data.ts
with open(DATA_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# نلاقي الـ places array
start = content.index('export const places')
start = content.index('[', start)
# نلاقي نهاية الـ array بشكل آمن
bracket_count = 0
end = start
for i, c in enumerate(content[start:], start):
    if c == '[':
        bracket_count += 1
    elif c == ']':
        bracket_count -= 1
        if bracket_count == 0:
            end = i + 1
            break

places_str = content[start:end]
places = json.loads(places_str)

# تحديث كل مكان
updated = 0
for place in places:
    name = place['name']
    if name in locations:
        old_loc = place.get('location', '')
        new_loc = locations[name]
        if old_loc != new_loc:
            place['location'] = new_loc
            updated += 1
            print(f"✅ {name}: {new_loc}")
        else:
            print(f"⏭️ {name}: نفس اللوكيشن")
    else:
        print(f"⚠️ {name}: مش موجود في الـ txt")

# إعادة كتابة data.ts
new_places_str = json.dumps(places, ensure_ascii=False, indent=2)
new_content = content[:start] + new_places_str + content[end:]

with open(DATA_FILE, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"\n📊 تم تحديث {updated} لوكيشن من أصل {len(places)} مكان")
