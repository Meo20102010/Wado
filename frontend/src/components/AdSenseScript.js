'use client';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import { adsenseAPI } from '@/lib/api';

export default function AdSenseScript() {
  const [clientId, setClientId] = useState('');
  const [active, setActive] = useState(false);

  useEffect(() => {
    adsenseAPI.getSettings()
      .then(res => {
        const s = res.data.adsense;
        if (s?.is_active && s?.client_id) {
          setClientId(s.client_id);
          setActive(true);
        }
      })
      .catch(() => {});
  }, []);

  if (!active || !clientId) return null;

  return (
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
