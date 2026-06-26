#!/usr/bin/env python3
"""
سكريبت يقرا مجلدات السكشنات ويولّد:
1. ملف data.ts بكل الأماكن
2. ينسخ الصور لـ public/places/
"""
import os
import re
import json
import shutil

BASE = "/home/z/my-project/upload/سكشانات"
DEST_IMAGES = "/home/z/my-project/public/places"
OUTPUT_TS = "/home/z/my-project/src/lib/data.ts"

SECTION_MAP = {
    "سكشن المشويات": ("mashawat", "المشويات", "#C0623B", "🔥"),
    "سكشن الكبده والسجق": ("kabda", "الكبده والسجق", "#D4A03C", "🥪"),
    "سكشن القهوه": ("qahwa", "القهوه", "#5D4037", "☕"),
    "سكشن الحلويات": ("halawiyat", "حلويات", "#B8862E", "🍮"),
    "سكشن  الجوامع والسياحه": ("gawame3", "الجوامع والسياحه", "#2A9D8F", "🕌"),
    "سكشن الاسماك": ("asmak", "الاسماك", "#1565C0", "🐟"),
    "سكشن الفول والطعميه": ("fool", "الفول والطعميه", "#8D6E63", "🫘"),
    "سكشن الكشرى": ("koshari", "الكشرى", "#F57C00", "🍛"),
    "سكشن فواكه اللحوم": ("lahm", "فواكه اللحوم", "#E65100", "🥩"),
    "سكشن مستشفايات": ("mustashfayat", "مستشفايات", "#C62828", "🏥"),
    "سكشن براندات": ("brandat", "براندات", "#6A1B9A", "🏪"),
    "سكشن شريكات الاتصالات": ("ittisalat", "شريكات الاتصالات", "#1565C0", "📡"),
}

os.makedirs(DEST_IMAGES, exist_ok=True)

def parse_txt(txt_path):
    if not txt_path or not os.path.exists(txt_path):
        return "", "", ""
    with open(txt_path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    intro = ""
    address = ""
    location = ""
    intro_match = re.search(r'المقدم[هة]\s*\n(.+?)(?=\nالعنوان|\nاللوكيشن|\Z)', content, re.DOTALL)
    if intro_match:
        intro = intro_match.group(1).strip()
    addr_match = re.search(r'العنوان\s*\n(.+?)(?=\nاللوكيشن|\nالمقدم|\Z)', content, re.DOTALL)
    if addr_match:
        address = addr_match.group(1).strip()
    loc_match = re.search(r'اللوكيشن\s*\n(.+?)(?=\nالعنوان|\nالمقدم|\Z)', content, re.DOTALL)
    if loc_match:
        location = loc_match.group(1).strip()
    return intro, address, location

def copy_image(src_path, place_id):
    if not src_path:
        return ""
    ext = os.path.splitext(src_path)[1].lower()
    dest_name = f"{place_id}{ext}"
    dest_path = os.path.join(DEST_IMAGES, dest_name)
    try:
        shutil.copy2(src_path, dest_path)
        return f"/places/{dest_name}"
    except Exception as e:
        print(f"  ⚠️ فشل نسخ الصورة: {e}")
        return ""

categories = []
places = []
place_counter = 0

for section_name in sorted(os.listdir(BASE)):
    section_path = os.path.join(BASE, section_name)
    if not os.path.isdir(section_path):
        continue
    if section_name not in SECTION_MAP:
        print(f"⚠️ سكشن غير معروف: {section_name}")
        continue
    cat_id, cat_name, cat_color, cat_emoji = SECTION_MAP[section_name]
    section_places = []
    for place_name in sorted(os.listdir(section_path)):
        place_path = os.path.join(section_path, place_name)
        if not os.path.isdir(place_path):
            continue
        if place_name.startswith("New folder"):
            continue
        place_counter += 1
        place_id = f"p{place_counter:03d}"
        image_path = ""
        for f in os.listdir(place_path):
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                image_path = os.path.join(place_path, f)
                break
        txt_path = ""
        for f in os.listdir(place_path):
            if f.endswith('.txt'):
                txt_path = os.path.join(place_path, f)
                break
        intro, address, location = parse_txt(txt_path)
        image_url = copy_image(image_path, place_id)
        price_map = {
            "mashawat": "$$", "kabda": "$", "qahwa": "$", "halawiyat": "$",
            "gawame3": "—", "asmak": "$$$", "fool": "$", "koshari": "$",
            "lahm": "$$", "mustashfayat": "—", "brandat": "$$", "ittisalat": "$$",
        }
        price_range = price_map.get(cat_id, "$")
        hours_map = {
            "gawame3": "مفتوح يومياً",
            "mustashfayat": "طوارئ 24 ساعة",
            "qahwa": "يومياً 6ص - 2ص",
        }
        hours = hours_map.get(cat_id, "يومياً 11ص - 12م")
        place = {
            "id": place_id,
            "name": place_name.strip(),
            "category": cat_id,
            "description": intro if intro else f"{place_name.strip()} - من أماكن {cat_name} في السيدة زينب",
            "address": address if address else "السيدة زينب، القاهرة",
            "location": location if location else "",
            "image": image_url,
            "emoji": cat_emoji,
            "priceRange": price_range,
            "hours": hours,
            "rating": round(3.8 + (place_counter % 12) * 0.1, 1),
            "phone": "",
            "tags": [cat_name],
        }
        section_places.append(place)
        places.append(place)
        print(f"✅ {place_id}: {place_name} ({cat_name}) - صورة: {'✓' if image_url else '✗'}")
    categories.append({
        "id": cat_id,
        "name": cat_name,
        "color": cat_color,
        "emoji": cat_emoji,
        "count": len(section_places),
    })

print(f"\n📊 إجمالي: {len(places)} مكان في {len(categories)} تصنيف")

ts_content = """// =============================================
// الماشي - دليل السيدة زينب بالقاهرة
// تم توليد هذا الملف تلقائياً من بيانات المستخدم
// =============================================

export interface Place {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  location: string;
  image: string;
  emoji: string;
  priceRange: string;
  hours: string;
  rating: number;
  phone: string;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  emoji: string;
  count: number;
}

export const categories: Category[] = """ + json.dumps(categories, ensure_ascii=False, indent=2) + """;

export const places: Place[] = """ + json.dumps(places, ensure_ascii=False, indent=2) + """;

export function getPlacesByCategory(categoryId: string): Place[] {
  return places.filter((p) => p.category === categoryId);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function searchPlaces(query: string): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return places.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function getPlaceById(id: string): Place | undefined {
  return places.find((p) => p.id === id);
}
"""

with open(OUTPUT_TS, 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"\n✅ تم توليد {OUTPUT_TS}")
print(f"✅ تم نسخ الصور لـ {DEST_IMAGES}")
print(f"📊 {len(places)} مكان، {len(categories)} تصنيف")
