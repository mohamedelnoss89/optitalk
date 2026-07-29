'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[OptiTalk Global Error]', error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, background: '#0a0e1a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😵</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              في مشكلة بسيطة
            </h2>
            <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '24px' }}>
              حصل خطأ أثناء تحميل الصفحة. حاول تاني.
            </p>
            <button
              onClick={() => {
                // امسح cache
                try { localStorage.clear(); } catch {}
                try { sessionStorage.clear(); } catch {}
                reset();
                window.location.href = '/';
              }}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: 'linear-gradient(to right, #6366f1, #a855f7)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              إعادة المحاولة (مسح cache)
            </button>
            {error?.message && (
              <details style={{ marginTop: '16px', fontSize: '12px', opacity: 0.5, textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer' }}>تفاصيل الخطأ</summary>
                <pre style={{
                  marginTop: '8px',
                  padding: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  fontSize: '10px',
                  overflow: 'auto',
                  maxHeight: '128px',
                }}>
                  {error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
