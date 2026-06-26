'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiSave, HiEye } from 'react-icons/hi';

export default function AdminAdSensePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    client_id: '',
    ad_code: '',
    position: 'home_top',
    is_active: false,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    try {
      const res = await adminAPI.getAdSense();
      if (res.data.adsense) setForm(res.data.adsense);
    } catch (err) {
      toast.error('Ayarlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.updateAdSense(form);
      toast.success('AdSense ayarları kaydedildi');
    } catch (err) {
      toast.error('Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Google AdSense Ayarları</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">AdSense Yapılandırması</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">AdSense Client ID</label>
            <input type="text" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} placeholder="ca-pub-XXXXXXXXXXXXXXXX" className="input-field" />
            <p className="text-xs text-gray-500 mt-1">Google AdSense hesabınızdan alınan yayıncı kimliği</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ad Slot ID</label>
            <input type="text" value={form.ad_code} onChange={(e) => setForm({ ...form, ad_code: e.target.value })} placeholder="XXXXXXXXXX" className="input-field" />
            <p className="text-xs text-gray-500 mt-1">Google AdSense hesabınızdan alınan reklam birimi kimliği</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Reklam Konumu</label>
            <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="input-field">
              <option value="home_top">Ana Sayfa Üst</option>
              <option value="home_mid">Ana Sayfa Orta</option>
              <option value="sidebar">Kenar Çubuğu</option>
              <option value="project_sidebar">Proje Sayfası Kenar</option>
              <option value="project_bottom">Proje Sayfası Alt</option>
              <option value="footer">Alt Bilgi</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
            <div>
              <p className="text-white font-medium">Reklamları Etkinleştir</p>
              <p className="text-sm text-gray-400">Aktif edildiğinde AdSense reklamları sitede görüntülenir</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Önizleme</h2>
          {form.client_id ? (
            <div className="p-4 rounded-xl bg-gray-800/30 border border-dashed border-gray-600/50 text-center text-sm text-gray-400">
              <HiEye className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
              <p>AdSense Reklamı</p>
              <p className="text-xs text-gray-500 mt-1">Yayıncı: {form.client_id} | Slot: {form.ad_code || '—'}</p>
              <p className="text-xs text-gray-500">Konum: {form.position}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4 text-sm">Client ID girildiğinde önizleme görüntülenir</p>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiSave className="w-5 h-5" />}
          Ayarları Kaydet
        </button>
      </form>
    </div>
  );
}
