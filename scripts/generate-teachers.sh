#!/bin/bash
# توليد 6 صور مدرسين احترافية بـ z-ai CLI
# صور بورتريه عمودية (768x1344) - شكل اجتماع زوم

set -e
OUT=/home/z/my-project/public/teachers
mkdir -p "$OUT"

echo "=== 1/6 Mr. James - male adult, patient teacher ==="
z-ai image -p "Professional portrait photo of a friendly male teacher in his 30s with short dark hair and light beard, wearing a smart navy blue shirt, sitting in front of a clean blurred bookshelf background in a study room, warm soft lighting, looking directly at camera with a gentle encouraging smile, head and upper shoulders visible, vertical portrait orientation, photorealistic, high quality, zoom call style" -o "$OUT/mr-james.png" -s 768x1344

echo "=== 2/6 Ms. Sarah - young female, cheerful ==="
z-ai image -p "Professional portrait photo of a cheerful young female teacher in her late 20s with shoulder-length brown hair, wearing a teal blouse, sitting in front of a clean blurred classroom background with subtle plants, bright natural lighting, looking directly at camera with a warm energetic smile, head and upper shoulders visible, vertical portrait orientation, photorealistic, high quality, zoom call style" -o "$OUT/ms-sarah.png" -s 768x1344

echo "=== 3/6 Professor David - senior male, academic ==="
z-ai image -p "Professional portrait photo of a distinguished senior male professor in his 60s with gray hair and well-groomed gray beard, wearing a tweed jacket with elbow patches over a white shirt, sitting in front of a blurred library background with old books, warm amber lighting, looking directly at camera with a wise kind expression, head and upper shoulders visible, vertical portrait orientation, photorealistic, high quality, zoom call style" -o "$OUT/professor-david.png" -s 768x1344

echo "=== 4/6 Miss Emma - adult female, warm ==="
z-ai image -p "Professional portrait photo of a warm friendly female teacher in her 30s with long wavy auburn hair, wearing a pink cardigan over a white top, sitting in front of a clean blurred cozy home office background, soft warm lighting, looking directly at camera with a reassuring smile, head and upper shoulders visible, vertical portrait orientation, photorealistic, high quality, zoom call style" -o "$OUT/miss-emma.png" -s 768x1344

echo "=== 5/6 Coach Mike - young male, athletic ==="
z-ai image -p "Professional portrait photo of an energetic young male coach in his late 20s with short black hair and clean shaven, wearing a red athletic polo shirt, sitting in front of a clean blurred gym background with subtle equipment, bright energetic lighting, looking directly at camera with a confident motivational smile, head and upper shoulders visible, vertical portrait orientation, photorealistic, high quality, zoom call style" -o "$OUT/coach-mike.png" -s 768x1344

echo "=== 6/6 Dr. Lisa - senior female, professional ==="
z-ai image -p "Professional portrait photo of an elegant senior female professor in her 50s with stylish silver-gray bob hair, wearing a lavender blouse with a thin gold necklace, sitting in front of a clean blurred modern office background, soft professional lighting, looking directly at camera with a composed confident expression, head and upper shoulders visible, vertical portrait orientation, photorealistic, high quality, zoom call style" -o "$OUT/dr-lisa.png" -s 768x1344

echo ""
echo "=== Done! Files: ==="
ls -la "$OUT"
