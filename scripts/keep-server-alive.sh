#!/bin/bash
# Keep Next.js dev server alive — يفحص كل 30 ثانية ويعيد التشغيل لو وقع
cd /home/z/my-project

while true; do
  # تحقق هل السيرفر شغال
  if ! pgrep -f "next-server" > /dev/null 2>&1; then
    echo "[$(date)] Server down — restarting..." >> /tmp/keep-alive.log
    pkill -9 -f "next dev" 2>/dev/null
    pkill -9 -f "npm run dev" 2>/dev/null
    sleep 2
    setsid nohup npm run dev > /tmp/next-dev.log 2>&1 &
    disown
    sleep 15
    echo "[$(date)] Server restarted — PID: $(pgrep -f 'next-server')" >> /tmp/keep-alive.log
  fi
  sleep 30
done
