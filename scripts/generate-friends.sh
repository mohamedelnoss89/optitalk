#!/bin/bash
# توليد 6 صور أصدقاء بأسلوب 3D Pixar/Realistic render
set -e
OUT=/home/z/my-project/public/friends
mkdir -p "$OUT"

echo "=== 1/6 Alex - male young, casual ==="
z-ai image -p "3D Pixar-style realistic character render of a friendly casual young man in his 20s with short dark hair, wearing a blue hoodie and white t-shirt. Relaxed smile, brown eyes looking at camera. Studio lighting, blurred city street background. Vertical portrait, head and upper shoulders. Pixar quality, professional character design" -o "$OUT/friend-alex.png" -s 768x1344

echo "=== 2/6 Layla - female young, warm ==="
z-ai image -p "3D Pixar-style realistic character render of a warm friendly young woman in her 20s with long dark brown hair, wearing a pink cardigan. Gentle smile, green eyes looking at camera. Studio lighting, blurred cozy cafe background with books. Vertical portrait, head and upper shoulders. Pixar quality, professional character design" -o "$OUT/friend-layla.png" -s 768x1344

echo "=== 3/6 Omar - male adult, tech ==="
z-ai image -p "3D Pixar-style realistic character render of a chill easy-going man in his 30s with short black hair and light stubble, wearing a teal casual shirt. Relaxed expression, brown eyes looking at camera. Studio lighting, blurred modern tech office background. Vertical portrait, head and upper shoulders. Pixar quality, professional character design" -o "$OUT/friend-omar.png" -s 768x1344

echo "=== 4/6 Sara - female adult, energetic ==="
z-ai image -p "3D Pixar-style realistic character render of an energetic enthusiastic woman in her 30s with curly red hair, wearing an orange athletic top. Big excited smile, blue eyes looking at camera. Studio lighting, blurred gym fitness background. Vertical portrait, head and upper shoulders. Pixar quality, professional character design" -o "$OUT/friend-sara.png" -s 768x1344

echo "=== 5/6 Karim - male young, creative ==="
z-ai image -p "3D Pixar-style realistic character render of a creative artsy young man in his 20s with messy dark hair, wearing a purple casual jacket. Thoughtful artistic expression, dark eyes looking at camera. Studio lighting, blurred art studio background with paintings. Vertical portrait, head and upper shoulders. Pixar quality, professional character design" -o "$OUT/friend-karim.png" -s 768x1344

echo "=== 6/6 Nora - female young, foodie ==="
z-ai image -p "3D Pixar-style realistic character render of a warm nurturing young woman in her 20s with brown hair in a bun, wearing a green apron over a white top. Warm motherly smile, hazel eyes looking at camera. Studio lighting, blurred kitchen background with fresh ingredients. Vertical portrait, head and upper shoulders. Pixar quality, professional character design" -o "$OUT/friend-nora.png" -s 768x1344

echo ""
echo "=== Done! ==="
ls -la "$OUT"
