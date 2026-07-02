#!/bin/bash
# توليد 6 صور مدرسين بأسلوب 3D Pixar/Realistic render
# شخصيات 3D واقعية مع عمق وإضاءة سينمائية

set -e
OUT=/home/z/my-project/public/teachers-3d
mkdir -p "$OUT"

echo "=== 1/6 Mr. James ==="
z-ai image -p "3D Pixar-style realistic character render of a friendly male teacher in his 30s with short dark brown hair, light beard stubble, wearing rectangular glasses and a navy blue button-up shirt. Warm brown eyes looking directly at camera. Subtle smile. Studio lighting with soft shadows, cinematic depth of field, blurred cozy library background with bookshelves. Vertical portrait, head and upper shoulders visible. Highly detailed 3D render, Pixar animation movie quality, professional character design" -o "$OUT/mr-james.png" -s 768x1344

echo "=== 2/6 Ms. Sarah ==="
z-ai image -p "3D Pixar-style realistic character render of a cheerful young female teacher in her late 20s with shoulder-length wavy brown hair, wearing a teal blouse. Bright green eyes looking directly at camera with a warm energetic smile. Studio lighting with soft shadows, cinematic depth of field, blurred modern classroom background with plants. Vertical portrait, head and upper shoulders visible. Highly detailed 3D render, Pixar animation movie quality, professional character design" -o "$OUT/ms-sarah.png" -s 768x1344

echo "=== 3/6 Professor David ==="
z-ai image -p "3D Pixar-style realistic character render of a distinguished senior male professor in his 60s with neat gray hair and well-groomed gray beard, wearing round glasses and a brown tweed jacket with elbow patches over a white shirt. Wise kind expression, warm hazel eyes looking directly at camera. Studio lighting with soft amber tones, cinematic depth of field, blurred classic library background with old books. Vertical portrait, head and upper shoulders visible. Highly detailed 3D render, Pixar animation movie quality, professional character design" -o "$OUT/professor-david.png" -s 768x1344

echo "=== 4/6 Miss Emma ==="
z-ai image -p "3D Pixar-style realistic character render of a warm friendly female teacher in her 30s with long wavy auburn hair, wearing a pink cardigan over a white top. Soft brown eyes looking directly at camera with a reassuring gentle smile. Studio lighting with warm soft tones, cinematic depth of field, blurred cozy home office background. Vertical portrait, head and upper shoulders visible. Highly detailed 3D render, Pixar animation movie quality, professional character design" -o "$OUT/miss-emma.png" -s 768x1344

echo "=== 5/6 Coach Mike ==="
z-ai image -p "3D Pixar-style realistic character render of an energetic young male coach in his late 20s with short black hair, clean shaven, athletic build, wearing a red athletic polo shirt. Confident brown eyes looking directly at camera with a motivational smile. Studio lighting with bright energetic tones, cinematic depth of field, blurred modern gym background. Vertical portrait, head and upper shoulders visible. Highly detailed 3D render, Pixar animation movie quality, professional character design" -o "$OUT/coach-mike.png" -s 768x1344

echo "=== 6/6 Dr. Lisa ==="
z-ai image -p "3D Pixar-style realistic character render of an elegant senior female professor in her 50s with stylish silver-gray bob haircut, wearing a lavender blouse with a thin gold necklace. Composed confident expression, sharp blue eyes looking directly at camera. Studio lighting with soft professional tones, cinematic depth of field, blurred modern office background. Vertical portrait, head and upper shoulders visible. Highly detailed 3D render, Pixar animation movie quality, professional character design" -o "$OUT/dr-lisa.png" -s 768x1344

echo ""
echo "=== Done! Files: ==="
ls -la "$OUT"
