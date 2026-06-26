'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiSave, HiUpload } from 'react-icons/hi';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    siteName: 'Wado',
    siteDescription: 'APK, EXE ve Yazılım Dünyası',
    siteKeywords: 'wado, apk, exe, yazılım',
    siteUrl: 'http://localhost:3000',
    contactEmail: '',
    maintenanceMode: false,
    allowRegistration: true,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    try {
      const res = await adminAPI.getSettings();
      if (res.data.settings) setForm(prev => ({ ...prev, ...res.data.settings }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.updateSettings(form);
      toast.success('Ayarlar kaydedildi');
    } catch (err) {
      toast.error('Ayarlar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await adminAPI.uploadLogo(file);
      toast.success('Logo güncellendi');
    } catch (err) {
      toast.error('Logo yüklenemedi');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Site Ayarları</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Genel Ayarlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Site Adı</label>
              <input type="text" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Site URL</label>
              <input type="url" value={form.siteUrl} onChange={(e) => setForm({ ...form, siteUrl: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Site Açıklaması</label>
            <textarea value={form.siteDescription} onChange={(e) => setForm({ ...form, siteDescription: e.target.value })} className="input-field" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Anahtar Kelimeler</label>
            <input type="text" value={form.siteKeywords} onChange={(e) => setForm({ ...form, siteKeywords: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">İletişim E-postası</label>
            <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="input-field" />
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Logo</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">W</div>
            <label className="btn-secondary cursor-pointer flex items-center gap-2">
              <HiUpload className="w-5 h-5" /> Logo Yükle
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Site Durumu</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Bakım Modu</p>
              <p className="text-sm text-gray-400">Aktif edildiğinde site geçici olarak kapatılır</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.maintenanceMode} onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Kayıt</p>
              <p className="text-sm text-gray-400">Yeni kullanıcı kayıtlarına izin ver</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.allowRegistration} onChange={(e) => setForm({ ...form, allowRegistration: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiSave className="w-5 h-5" />}
          Ayarları Kaydet
        </button>
      </form>
    </div>
  );
}
