'use client';

import { useState, useRef, useEffect } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // تحقق من دعم المتصفح
    setStatus(prev => ({
      ...prev,
      browser: navigator.userAgent.substring(0, 100),
      speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition) ? 'مدعوم ✅' : 'غير مدعوم ❌',
      audioPlay: 'pending',
      videoPlay: 'pending',
      mic: 'pending',
    }));

    // unlock بأول تفاعل
    const unlock = () => {
      // 1. AudioContext
      try {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (AC) {
          const ctx = new AC();
          ctx.resume().then(() => {
            setStatus(prev => ({ ...prev, audioContext: 'مفتوح ✅' }));
          }).catch(() => {
            setStatus(prev => ({ ...prev, audioContext: 'فشل ❌' }));
          });
        }
      } catch {}

      // 2. Audio element
      if (audioRef.current) {
        audioRef.current.muted = true;
        audioRef.current.play().then(() => {
          audioRef.current!.pause();
          audioRef.current!.muted = false;
          setStatus(prev => ({ ...prev, audioPlay: 'مفتوح ✅' }));
        }).catch(() => {
          setStatus(prev => ({ ...prev, audioPlay: 'فشل ❌' }));
        });
      }

      // 3. Video element
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.play().then(() => {
          videoRef.current!.pause();
          videoRef.current!.muted = false;
          setStatus(prev => ({ ...prev, videoPlay: 'مفتوح ✅' }));
        }).catch(() => {
          setStatus(prev => ({ ...prev, videoPlay: 'فشل ❌' }));
        });
      }

      // 4. Mic
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(stream => {
          stream.getTracks().forEach(t => t.stop());
          setStatus(prev => ({ ...prev, mic: 'مسموح ✅' }));
        })
        .catch(() => {
          setStatus(prev => ({ ...prev, mic: 'مرفوض ❌' }));
        });
    };

    document.addEventListener('touchstart', unlock);
    document.addEventListener('click', unlock);

    return () => {
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-6 text-white">
      <h1 className="mb-6 text-2xl font-bold">🔍 اختبار الموبايل</h1>
      <p className="mb-6 text-sm text-white/60">اضغط أي حاجة في الصفحة عشان نبدأ الاختبار</p>

      <div className="space-y-3">
        <div className="rounded-xl bg-white/5 p-4">
          <div className="text-xs text-white/40">المتصفح</div>
          <div className="text-sm">{status.browser || 'جارٍ...'}</div>
        </div>

        <div className="rounded-xl bg-white/5 p-4">
          <div className="text-xs text-white/40">المايك (SpeechRecognition)</div>
          <div className="text-sm">{status.speechRecognition || 'جارٍ...'}</div>
        </div>

        <div className="rounded-xl bg-white/5 p-4">
          <div className="text-xs text-white/40">AudioContext</div>
          <div className="text-sm">{status.audioContext || 'اضغط للاختبار'}</div>
        </div>

        <div className="rounded-xl bg-white/5 p-4">
          <div className="text-xs text-white/40">Audio Play</div>
          <div className="text-sm">{status.audioPlay || 'اضغط للاختبار'}</div>
        </div>

        <div className="rounded-xl bg-white/5 p-4">
          <div className="text-xs text-white/40">Video Play</div>
          <div className="text-sm">{status.videoPlay || 'اضغط للاختبار'}</div>
        </div>

        <div className="rounded-xl bg-white/5 p-4">
          <div className="text-xs text-white/40">إذن المايك</div>
          <div className="text-sm">{status.mic || 'اضغط للاختبار'}</div>
        </div>
      </div>

      {/* عناصر مخفية */}
      <audio ref={audioRef} src="/videos/mr-james.mp4" style={{ display: 'none' }} />
      <video ref={videoRef} src="/videos/mr-james.mp4" muted playsInline style={{ display: 'none' }} />

      <button
        onClick={() => {
          // اختبر TTS
          fetch('/api/tts-arabic?text=مرحبا&gender=male')
            .then(r => r.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              const audio = new Audio(url);
              audio.play().then(() => {
                setStatus(prev => ({ ...prev, tts: 'شغال ✅' }));
              }).catch(() => {
                setStatus(prev => ({ ...prev, tts: 'فشل ❌' }));
              });
            });
        }}
        className="mt-6 w-full rounded-xl bg-blue-500/20 py-3 text-sm font-bold text-blue-400"
      >
        🔊 اختبر الصوت (TTS)
      </button>

      <div className="mt-3 rounded-xl bg-white/5 p-4">
        <div className="text-xs text-white/40">TTS</div>
        <div className="text-sm">{status.tts || 'اضغط الزرار'}</div>
      </div>
    </div>
  );
}
