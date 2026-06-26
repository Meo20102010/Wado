'use client';
import { useState, useEffect, useRef } from 'react';
import { adsenseAPI } from '@/lib/api';

export default function AdSense({ position, className = '' }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const insRef = useRef(null);

  useEffect(() => {
    adsenseAPI.getSettings()
      .then(res => setSettings(res.data.adsense))
      .catch(() => setSettings(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!settings?.is_active || !settings?.client_id) return;
    if (settings.position !== position) return;
    const timer = setTimeout(() => {
      try {
        (adsbygoogle = window.adsbygoogle || []).push({});
      } catch {}
    }, 200);
    return () => clearTimeout(timer);
  }, [settings, position]);

  if (loading) return null;
  if (!settings?.is_active || !settings?.client_id || settings.position !== position) return null;

  return (
    <div className={`adsense-container ${className}`}>
      <ins ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={settings.client_id}
        data-ad-slot={settings.ad_code || 'xxxxxxxxxx'}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
