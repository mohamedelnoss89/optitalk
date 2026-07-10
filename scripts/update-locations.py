#!/usr/bin/env python3
"""
تحديث كل الـ locations في data.ts و areas-data.ts
من ملفات التكست الأصلية اللي رفعها المستخدم
"""
import os
import re
from pathlib import Path

# ===== مسار المجلدات الأصلية =====
SECTIONS_DIR = Path("/home/z/my-project/upload/سكشانات")
AREAS_DIR = Path("/home/z/my-project/upload/مناطق/مناطق")

# ===== ملفات الـ TypeScript =====
DATA_TS = Path("/home/z/al-mashi/src/lib/data.ts")
AREAS_TS = Path("/home/z/al-mashi/src/lib/areas-data.ts")


def parse_text_file(filepath: Path) -> dict:
    """قراءة ملف التكست واستخراج العنوان واللوكيشن."""
    try:
        content = filepath.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        content = filepath.read_text(encoding="cp1256", errors="ignore")
    
    # تنظيف النص
    content = content.replace("\u200f", "").replace("\u202a", "").replace("\u202b", "").replace("\u202c", "")
    
    address = ""
    location = ""
    
    lines = [l.strip() for l in content.split("\n") if l.strip()]
    current_section = None
    
    for line in lines:
        if "العنوان" in line:
            current_section = "address"
            continue
        elif "اللوكيشن" in line or "الлокشن" in line:
            current_section = "location"
            continue
        
        if current_section == "address":
            if not address:
                address = line
        elif current_section == "location":
            if not location:
                location = line
    
    return {
        "address": address.strip(),
        "location": location.strip() or address.strip(),
    }


def collect_places_from_sections():
    """جمع كل الأماكن من مجلدات السكشنات."""
    places = {}  # name -> {address, location}
    
    for section_dir in SECTIONS_DIR.iterdir():
        if not section_dir.is_dir():
            continue
        for place_dir in section_dir.iterdir():
            if not place_dir.is_dir():
                continue
            txt_file = place_dir / "New Text Document.txt"
            if not txt_file.exists():
                txt_files = list(place_dir.glob("*.txt"))
                if txt_files:
                    txt_file = txt_files[0]
                else:
                    continue
            data = parse_text_file(txt_file)
            places[place_dir.name] = data
    
    return places


def collect_places_from_areas():
    """جمع كل الأماكن من مجلدات المناطق الجديدة."""
    places = {}  # name -> {address, location, areaName}
    
    for area_dir in AREAS_DIR.iterdir():
        if not area_dir.is_dir():
            continue
        for place_dir in area_dir.iterdir():
            if not place_dir.is_dir():
                continue
            txt_file = place_dir / "New Text Document.txt"
            if not txt_file.exists():
                txt_files = list(place_dir.glob("*.txt"))
                if txt_files:
                    txt_file = txt_files[0]
                else:
                    continue
            data = parse_text_file(txt_file)
            data["areaName"] = area_dir.name
            places[place_dir.name] = data
    
    return places


def update_file(filepath: Path, places_map: dict, is_areas: bool = False):
    """تحديث ملف TypeScript بالـ locations الجديدة."""
    content = filepath.read_text(encoding="utf-8")
    
    # Pattern: نلاقي كل بلوك place ونحدث الـ location
    # "name": "...", ... "location": "..."
    def replace_location(match):
        full_block = match.group(0)
        # استخراج الاسم
        name_match = re.search(r'"name":\s*"([^"]+)"', full_block)
        if not name_match:
            return full_block
        name = name_match.group(1)
        
        if name not in places_map:
            print(f"  ⚠️  {name} - مش موجود في التكستات")
            return full_block
        
        data = places_map[name]
        new_location = data["location"]
        if not new_location:
            print(f"  ⚠️  {name} - اللوكيشن فاضي في التكست")
            return full_block
        
        # استبدال الـ location
        updated = re.sub(
            r'"location":\s*"[^"]*"',
            f'"location": "{new_location}"',
            full_block
        )
        
        # تحديث الـ address كمان لو موجود
        if data["address"]:
            updated = re.sub(
                r'"address":\s*"[^"]*"',
                f'"address": "{data["address"]}"',
                updated
            )
        
        print(f"  ✅ {name}")
        return updated
    
    # Pattern: من "name" لحد "tags" (بما فيها الـ address و location)
    # بس عشان نكون دقيقين، نطبّق على كل بلوك place
    # هنستخدم pattern أبسط: نلاقي كل "name" ونحدث الـ location اللي بعده
    
    # أولاً: استخراج كل الـ blocks
    # Pattern: "name": "..." حتى نصل لـ "tags" أو "image" أو نهاية الـ object
    
    # أسلوب أبسط: نلاقي كل سطر "location": "..." ونحدثه لو الـ name اللي قبله موجود
    lines = content.split("\n")
    last_name = None
    updated_lines = []
    
    for line in lines:
        # تتبع الاسم
        name_match = re.search(r'"name":\s*"([^"]+)"', line)
        if name_match:
            last_name = name_match.group(1)
        
        # تحديث الـ location
        if '"location":' in line and last_name:
            if last_name in places_map:
                new_loc = places_map[last_name]["location"]
                if new_loc:
                    # الحفاظ على indentation
                    indent = re.match(r'^(\s*)', line).group(1)
                    new_line = f'{indent}"location": "{new_loc}",'
                    updated_lines.append(new_line)
                    continue
        
        # تحديث الـ address
        if '"address":' in line and last_name:
            if last_name in places_map:
                new_addr = places_map[last_name]["address"]
                if new_addr:
                    indent = re.match(r'^(\s*)', line).group(1)
                    new_line = f'{indent}"address": "{new_addr}",'
                    updated_lines.append(new_line)
                    continue
        
        updated_lines.append(line)
    
    new_content = "\n".join(updated_lines)
    filepath.write_text(new_content, encoding="utf-8")


def main():
    print("=== جمع الأماكن من السكشنات ===")
    sections_places = collect_places_from_sections()
    print(f"  {len(sections_places)} مكان")
    
    print("\n=== جمع الأماكن من المناطق الجديدة ===")
    areas_places = collect_places_from_areas()
    print(f"  {len(areas_places)} مكان")
    
    print("\n=== تحديث data.ts ===")
    update_file(DATA_TS, sections_places)
    
    print("\n=== تحديث areas-data.ts ===")
    update_file(AREAS_TS, areas_places, is_areas=True)
    
    print("\n✅ تم التحديث!")


if __name__ == "__main__":
    main()
