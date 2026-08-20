'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export default function TurnstileWidget({ onVerify, onError, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
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
            size: 'normal',
          });
          if (isMounted) setIsLoaded(true);
        } catch (e) {
          console.warn('Turnstile render notice:', e);
        }
      } else {
        setTimeout(renderWidget, 100);
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
    <div className="w-full min-h-[68px] h-[68px] my-2 rounded-2xl bg-rose-50/30 border border-rose-200/60 flex items-center justify-center relative overflow-hidden transition-all duration-300 shadow-inner">
      {/* Smooth loading skeleton loader until Cloudflare script initializes */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-xs font-medium text-obsidian-800/60 bg-cream-50/80 animate-pulse">
          <ShieldCheck className="w-4 h-4 text-rose-500 animate-bounce" />
          <span>Initializing Security Verification...</span>
        </div>
      )}

      {/* Cloudflare Turnstile Target Container */}
      <div
        ref={containerRef}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
