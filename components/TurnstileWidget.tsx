'use client';

import React, { useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export default function TurnstileWidget({ onVerify, onError, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    // If no site key is configured or dummy placeholder in dev mode, skip widget
    if (!siteKey || siteKey.includes('your-turnstile-site-key')) return;

    const scriptId = 'cf-turnstile-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted) return;
      if ((window as any).turnstile && containerRef.current) {
        try {
          containerRef.current.innerHTML = '';
          (window as any).turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              if (isMounted) onVerify(token);
            },
            'error-callback': () => {
              if (isMounted) onError?.();
            },
            'expired-callback': () => {
              if (isMounted) onExpire?.();
            },
            theme: 'light',
          });
        } catch (e) {
          console.warn('Turnstile render notice:', e);
        }
      } else {
        setTimeout(renderWidget, 150);
      }
    };

    renderWidget();

    return () => {
      isMounted = false;
    };
  }, [siteKey, onVerify, onError, onExpire]);

  if (!siteKey || siteKey.includes('your-turnstile-site-key')) {
    return null;
  }

  return (
    <div className="flex justify-center my-3">
      <div ref={containerRef} />
    </div>
  );
}
